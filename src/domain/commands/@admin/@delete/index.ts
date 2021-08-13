import config from '../../../../infrastructure/config';
import { ICommand } from '../../../../infrastructure/types/commands/commands.types';
import UserService from '../../../services/users';

const deletePokemon: ICommand = {
    name: "delete",
    description: `Delete specified pokemon to user(s). Usage \`${config.discord.prefix}admin delte <pokemon inventory id> @USER1 @USER2\``,
    execute: async (message, args) => {
        const isAdmin = await UserService.isUserAdmin(message.author.id);

        if (isAdmin === null) {
            return;
        } else if (isAdmin === false) {
            message.reply("Are you really admin ? :smirk: ");
            return;
        }

        let pokemonId = 1;
        try {
            pokemonId = Number.parseInt(args[0], 10);
        } catch (e) { 
            console.error(e); 
            message.reply("Bad usage !");
            return; 
        }

        for (const user of message.mentions.users.values()) {
            if (!await UserService.getFbUserById(user.id)) {
                continue;
            }

            await UserService.removePokemon(user.id, pokemonId);
        }

        message.reply("Done :blush: ");
    }
}

export default deletePokemon;
