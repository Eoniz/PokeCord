import Discord from 'discord.js';
import config from '../../../../infrastructure/config';
import { ICommand } from '../../../../infrastructure/types/commands/commands.types';
import PokedexService from '../../../services/pokedex';
import UserService from '../../../services/users';

const levelup: ICommand = {
    name: "levelup",
    description: `Level up the user's active pokemon. Usage \`${config.discord.prefix}admin levelup @USER1 @USER2 (opt: --set-level <lvl> ; --give-levels <lvl>)\``,
    execute: async (message, args, kwargs) => {
        const isAdmin = await UserService.isUserAdmin(message.author.id);

        if (isAdmin === null) {
            return;
        } else if (isAdmin === false) {
            message.reply("Are you really admin ? :smirk: ");
            return;
        }
        
        for (const user of message.mentions.users.values()) {
            if (!await UserService.getUserById(user.id)) {
                continue;
            }

            const [lvlUp, pokemon] = await UserService.lvlUpActivePokemon(
                user.id,
            );
            if (!lvlUp) {
                continue;
            }

            const embed = new Discord.MessageEmbed()
                .setTitle(`Congratulations ${message.author.username}, your pokemon leveled up!`)
                .setAuthor("Professor Oak", "https://cdn.costumewall.com/wp-content/uploads/2017/02/professor-oak.jpg")
                .setColor("#ff0000")
                .setDescription(`Your pokémon is now level ${pokemon.level}`)
                .setImage(pokemon.img);
            
            message.channel.send({ embed: embed });
        }
    }
}

export default levelup;
