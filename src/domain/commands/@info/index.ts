import Discord from 'discord.js';
import { ICommand } from "../../../infrastructure/types/commands/commands.types";
import { capitalize } from '../../../infrastructure/utils/string';
import UserService from '../../services/users';

const info: ICommand = {
    name: "info",
    description: "Informations about your active pokemon.",
    execute: async (message, args) => {
        const user = await UserService.getUserById(message.author.id);
        if (!user) {
            message.reply("You haven't started yet. Type `p!start` !");
            return;
        }

        const embed = new Discord.MessageEmbed()
            .setTitle(`Level ${user.active_pokemon.level} ${capitalize(user.active_pokemon.name)}`)
            .setAuthor("Professor Oak", "https://cdn.costumewall.com/wp-content/uploads/2017/02/professor-oak.jpg")
            .setColor("#ff0000")
            .setDescription(`${user.active_pokemon.current_xp}/${user.active_pokemon.next_level_xp_needed}XP\n\n**Type(s):** ${user.active_pokemon.type.join(' / ')}\n**Weaknesses:** ${user.active_pokemon.weaknesses.join(' / ')}\n**Weight:** ${user.active_pokemon.weight}\n**Height:** ${user.active_pokemon.height}\n`)
            .setImage(user.active_pokemon.img);
        
        message.channel.send({ embed: embed });
    }
}

export default info;
