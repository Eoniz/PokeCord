import Discord from 'discord.js';
import { ICommand } from "../../../infrastructure/types/commands/commands.types";
import PokedexService from '../../services/pokedex';
import UserService from '../../services/users';

const pick: ICommand = {
    name: "pick",
    description: "Pick your starter !",
    execute: async (message, args) => {
        const ALLOWED_POKEMONS = [
            "bulbasaur", 
            "charmander", 
            "squirtle"
        ];

        if (args.length !== 1) {
            message.reply("You should choose your pokémon ! Either Bulbasaur, Charmender, or Squirtle. Use p!pick <pokemon>");
            return;
        }

        const pokemon = await PokedexService.getByName(args[0].toLowerCase());
        if (!ALLOWED_POKEMONS.includes(args[0].toLowerCase())) {
            message.reply("You can't choose this pokémon as starter ! Either Bulbasaur, Charmender, or Squirtle. Use p!pick <pokemon>");
            return;
        }

        if (!pokemon) {
            message.reply("You can't choose this pokémon as starter ! Either Bulbasaur, Charmender, or Squirtle. Use p!pick <pokemon>");
            return;
        }

        const [inserted, user] = await UserService.registerUser(message.author.id, pokemon);
        if (!inserted) {
            message.reply("You already chose your starter !");
            return;
        }

        message.channel.send(`Congratulations! \`${args[0].slice(0, 1).toUpperCase()}${args[0].slice(1).toLowerCase()}\` is your first pokémon!`);
    }
}

export default pick;
