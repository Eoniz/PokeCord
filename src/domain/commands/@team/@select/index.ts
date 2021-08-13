import Discord from 'discord.js';
import UserService from '../../../services/users';
import { ICommand } from '../../../../infrastructure/types/commands/commands.types';
import config from '../../../../infrastructure/config';
import { capitalize } from '../../../../infrastructure/utils/string';
import { getPercent } from '../../../../infrastructure/utils/math';
import { generateTeamImg } from '../../../../infrastructure/utils/image';

const select: ICommand = {
    name: "select",
    description: `Select team's pokemons. Usage ${config.discord.prefix}team select <pokemon inventory id> <pokemon inventory id> (...)`,
    execute: async (message, args) => {
        const user = await UserService.getById(message.author.id);
        if (!user) {
            message.reply("You haven't started yet. Type `p!start` !");
            return;
        }

        if (args.length < 1) {
            message.reply(`Bad usage, type \`${config.discord.prefix}help team select\`.`);
            return;
        }

        const nextTeam: number[] = [];
        for (const id of args) {
            if (nextTeam.length === 6) {
                break;
            }

            try {
                const parsed = Number.parseInt(id, 10);
                
                if (user.pokemons.find((_p) => _p.inventory_id === parsed)) {
                    if (parsed >= 0 && !nextTeam.includes(parsed)) {
                        nextTeam.push(parsed);
                    }
                }
            } catch (e) { continue; };
        }
        
        await UserService.changeActiveTeam(message.author.id, nextTeam);

        const updatedUser = await UserService.getById(message.author.id);
        
        const desc: string[] = [];
        for (const pok of updatedUser.team) {
            const lvl = `Level ${pok.level.level} [ ${pok.level.current_xp}/${pok.level.next_lvl_xp}XP (${getPercent(pok.level.current_xp, pok.level.next_lvl_xp)}%) ]`;
            desc.push(`**${capitalize(pok.meta.identifier)}:** ${lvl}`);
        }

        const canvas = await generateTeamImg(updatedUser.team.map(pok => pok.meta.img));
        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'team.png');

        const embed = new Discord.MessageEmbed()
            .setTitle(`${message.author.username}'s new team!`)
            .setAuthor("Professor Oak", "https://cdn.costumewall.com/wp-content/uploads/2017/02/professor-oak.jpg")
            .setColor("#ff0000")
            .setDescription(desc.join('\n'))
            .attachFiles([attachment])
            .setImage("attachment://team.png");

        message.channel.send({ embed: embed });
    }
}

export default select;
