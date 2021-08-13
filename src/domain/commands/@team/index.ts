import Discord from 'discord.js';
import { ICommand } from "../../../infrastructure/types/commands/commands.types";
import UserService from '../../services/users';
import MessagesService from '../../services/message';
import { generateTeamImg } from '../../../infrastructure/utils/image';
import { capitalize } from '../../../infrastructure/utils/string';
import { getPercent } from '../../../infrastructure/utils/math';

const team: ICommand = {
    name: "team",
    description: "Show your team",
    execute: async (message, args) => {
        let userId = message.author.id;

        if (args.length > 0) {
            const userMentionnedId = MessagesService.getUserFromMention(args[0]);
            if (userMentionnedId !== null) {
                userId = userMentionnedId;
            }
        }

        const user = await UserService.getById(userId);
        
        if (!user) {
            message.reply("This user does not exist !");
            return;
        }

        const desc: string[] = [];
        for (const pok of user.team) {
            const lvl = `Level ${pok.level.level} [ ${pok.level.current_xp}/${pok.level.next_lvl_xp}XP (${getPercent(pok.level.current_xp, pok.level.next_lvl_xp)}%) ]`;
            desc.push(`**${capitalize(pok.meta.identifier)}:** ${lvl}`);
        }

        const canvas = await generateTeamImg(user.team.map(pok => pok.meta.img));
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

export default team;