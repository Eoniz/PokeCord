import { ICommand } from "../../../infrastructure/types/commands/commands.types";
import { capitalize } from "../../../infrastructure/utils/string";
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

        if (!ALLOWED_POKEMONS.includes(args[0].toLowerCase())) {
            message.reply("You can't choose this pokémon as starter ! Either Bulbasaur, Charmender, or Squirtle. Use p!pick <pokemon>");
            return;
        }

        const starter = args[0].toLowerCase() as "bulbasaur" | "charmander" | "squirtle";

        const [inserted, user] = await UserService.registerUser(message.author.id, starter);
        if (!inserted) {
            message.reply("You already chose your starter !");
            return;
        }

        message.channel.send(`Congratulations! \`${capitalize(args[0])}\` is your first pokémon!`);
    }
}

export default pick;
