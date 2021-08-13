import config from '../../../../infrastructure/config';
import { ICommand } from '../../../../infrastructure/types/commands/commands.types';
import UserService from '../../../services/users';

const sync: ICommand = {
    name: "sync",
    description: `Sync. Usage \`${config.discord.prefix}admin sync @USER1 @USER2\``,
    execute: async (message, args) => {
        const isAdmin = await UserService.isUserAdmin(message.author.id);

        if (isAdmin === null) {
            return;
        } else if (isAdmin === false) {
            message.reply("Are you really admin ? :smirk: ");
            return;
        }

        for (const user of message.mentions.users.values()) {
            if (!await UserService.getFbUserById(user.id)) {
                continue;
            }

            await UserService.reSync(user.id);
        }

        message.reply("Done :blush: ");
    }
}

export default sync;
