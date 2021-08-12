import Discord from 'discord.js';
import { client } from '../../../app';
import SettingsService from '../settings';

class MessagesService {
    static async replyTo (user: Discord.User, message: any): Promise<Discord.Message> {
        let channelId = await SettingsService.getDiscordChannelOutput();
        if (!channelId) {
            channelId = message.channel.id;
        }

        const msg = await (<Discord.TextChannel> client.channels.cache.get(channelId))
            .send(message, { reply: user,});

        return msg;
    }

    static async send (message: any): Promise<Discord.Message> {
        let channelId = await SettingsService.getDiscordChannelOutput();
        if (!channelId) {
            channelId = message.channel.id;
        }

        const msg = await (<Discord.TextChannel> client.channels.cache.get(channelId))
            .send(message);

        return msg;
    }
}

export default MessagesService;
