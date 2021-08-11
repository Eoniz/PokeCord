import Discord from 'discord.js';
import { ICommand } from "../../../infrastructure/types/commands/commands.types";
import { capitalize } from '../../../infrastructure/utils/string';
import UserService from '../../services/users';

const select: ICommand = {
    name: "select",
    description: "Select active pokemon.",
    execute: async (message, args) => {
        const user = await UserService.getUserById(message.author.id);
        if (!user) {
            message.reply("You haven't started yet. Type `p!start` !");
            return;
        }

        if (args.length !== 1) {
            try {
            } catch (e) { console.error(e); };
        }
        
        try {
            const pokemonIdToSelect = Number.parseInt(args[0], 10);

            const pokemon = user.pokemons.find((pok) => pok.id === pokemonIdToSelect);
            if (!pokemon) {
                message.reply("This pokemon does not exist. Type p!pokemon to show your pokemons.");
                return;
            }

            await UserService.changeActivePokemonIdTo(message.author.id, pokemonIdToSelect);
            
            const embed = new Discord.MessageEmbed()
                .setTitle("Your new friend!")
                .setAuthor("Professor Oak", "https://cdn.costumewall.com/wp-content/uploads/2017/02/professor-oak.jpg","https://yagami.xyz")
                .setColor("#ff0000")
                .setDescription(`${capitalize(pokemon.name)} is now your active pokemon`)
                .setImage(pokemon.img);

            message.channel.send({ embed: embed });
        } catch (e) {
            message.reply("Usage p!select <pokemon number>");
            return;
        }
    }
}

export default select;
