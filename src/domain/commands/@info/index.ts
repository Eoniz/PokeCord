import Discord from 'discord.js';
import { ICommand } from "../../../infrastructure/types/commands/commands.types";
import { capitalize } from '../../../infrastructure/utils/string';
import MessagesService from '../../services/message';
import UserService from '../../services/users';

const generateXpBar = (currentXp: number, nextLevelXp: number) => {
    const LENGTH = 10;
    const nbFilled = Math.floor(currentXp * LENGTH / nextLevelXp);

    return `[${":green_square:".repeat(nbFilled)}${":black_large_square:".repeat(LENGTH - nbFilled)}]`;
}

const info: ICommand = {
    name: "info",
    description: "Informations about your active pokemon.",
    execute: async (message, args) => {
        const user = await UserService.getById(message.author.id);
        if (!user) {
            message.reply("You haven't started yet. Type `p!start` !");
            return;
        }


        const lvl = `${user.active_pokemon.level.current_xp}/${user.active_pokemon.level.next_lvl_xp}XP`;
        const xpBar = generateXpBar(user.active_pokemon.level.current_xp, user.active_pokemon.level.next_lvl_xp);
        const weight = `**Weight:**${user.active_pokemon.meta.weight}`;
        const height = `**Height:** ${user.active_pokemon.meta.height}`;
        const moves: string[] = ["**Moves:**"];
        user.active_pokemon.moves.forEach((_move) => {
            moves.push(` - **${capitalize(_move.move.identifier.replace('-', ' '))}**\n-- Type: ${_move.move.type.identifier} | PP: ${_move.move.pp}/${_move.move.pp}`);
        });

        for (let i = moves.length; i <= 4; i++) {
            moves.push("-\n");
        }

        const embed = new Discord.MessageEmbed()
            .setTitle(`${capitalize(user.active_pokemon.meta.identifier)}`)
            .setAuthor("Professor Oak", "https://cdn.costumewall.com/wp-content/uploads/2017/02/professor-oak.jpg")
            .setColor("#ff0000")
            .setDescription(`${xpBar}\n**Level ${user.active_pokemon.level.level}**\n${lvl}\n\n${weight}\n${height}\n\n${moves.join('\n')}\n`)
            .setImage(user.active_pokemon.meta.img);
        
        MessagesService.send({ embed: embed });
    }
}

export default info;
