import Discord from 'discord.js';
import config from '../../../../infrastructure/config';
import { ICommand } from '../../../../infrastructure/types/commands/commands.types';
import UserService from '../../../services/users';

const give: ICommand = {
    name: "give",
    description: `Give specified pokemon to user(s). Usage \`${config.discord.prefix}admin give <pokemon id> @USER1 @USER2\``,
    execute: async (message, args) => {
        // const isAdmin = await UserService.isUserAdmin(message.author.id);

        // if (isAdmin === null) {
        //     return;
        // } else if (isAdmin === false) {
        //     message.reply("Are you really admin ? :smirk: ");
        //     return;
        // }

        // let pokemonId = 1;
        // try {
        //     pokemonId = Number.parseInt(args[0], 10);
        // } catch (e) { 
        //     console.error(e); 
        //     message.reply("Bad usage !");
        //     return; 
        // }

        // const pokemon = await PokedexService.getById(pokemonId);
        // if (!pokemon) {
        //     message.reply("This pokemon does not exist !");
        //     return;
        // }

        // for (const user of message.mentions.users.values()) {
        //     if (!await UserService.getUserById(user.id)) {
        //         continue;
        //     }

        //     await UserService.addPokemonToPokedex(user.id, pokemon);
        // }

        message.reply("Done :blush: ");
    }
}

export default give;
