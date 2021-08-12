import Discord from 'discord.js';
import { ICommand } from "../../../infrastructure/types/commands/commands.types";
import { capitalize } from '../../../infrastructure/utils/string';
import MessagesService from '../../services/message';
import UserService from '../../services/users';

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
        const weight = `**Weight:**${user.active_pokemon.meta.weight}`;
        const height = `**Height:** ${user.active_pokemon.meta.height}`;
        const moves = `**Moves:** ${user.active_pokemon.moves.map(m => m.move.identifier).join(' / ')}`;
        
        const embed = new Discord.MessageEmbed()
            .setTitle(`Level ${user.active_pokemon.level.level} ${capitalize(user.active_pokemon.meta.identifier)}`)
            .setAuthor("Professor Oak", "https://cdn.costumewall.com/wp-content/uploads/2017/02/professor-oak.jpg")
            .setColor("#ff0000")
            .setDescription(`${lvl}\n\n${weight}\n${height}\n\n${moves}\n`)
            .setImage(user.active_pokemon.meta.img);
        
        MessagesService.send({ embed: embed });
    }
}

export default info;
