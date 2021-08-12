import { ICommand } from '../../../../infrastructure/types/commands/commands.types';
import SettingsService from '../../../services/settings';
import UserService from '../../../services/users';

const setChannel: ICommand = {
    name: "set-channel",
    description: "Set the channel where PokéCord will spam",
    execute: async (message, args) => {
        const isAdmin = await UserService.isUserAdmin(message.author.id);

        if (isAdmin === null) {
            return;
        } else if (isAdmin === false) {
            message.reply("Are you really admin ? :smirk: ");
            return;
        }

        await SettingsService.setDiscordChannelOutput(args[0]);

        message.reply("Done :blush: ");
    }
}

export default setChannel;
