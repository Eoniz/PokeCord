import Discord from 'discord.js';
import config from '../../../infrastructure/config';
import { ICommand } from "../../../infrastructure/types/commands/commands.types";
import { capitalize } from '../../../infrastructure/utils/string';
import MessagesService from '../../services/message';
import UserService from '../../services/users';

const give: ICommand = {
    name: "give",
    description: `Give pokemon(s) to someone. Usage \`${config.discord.prefix}give @USER <id> <id> <id>\``,
    execute: async (message, args) => {
        const user = await UserService.getFbUserById(message.author.id);
        if (!user) {
            message.reply("You haven't started yet. Type `p!start` !");
            return;
        }

        if (args.length < 2) {
            message.reply("Bad usage");
            return;
        }

        const targetUserId = MessagesService.getUserFromMention(args[0]);
        if (!targetUserId) {
            message.reply("Bad user given. See usage !");
            return;
        }

        const targetUser = await UserService.getFbUserById(targetUserId);
        if (!targetUser) {
            message.reply("The specified user does not exist.");
            return;
        }

        const ids: number[] = [];
        for (const arg of args.slice(1)) {
            try {
                const id = Number.parseInt(arg);
                ids.push(id);
            } catch (e) { continue; }
        }

        await UserService.givePokemonsTo(message.author.id, targetUser.id, ids);

        MessagesService.replyTo(message.author, "Done :blush: !");
    }
}

export default give;
