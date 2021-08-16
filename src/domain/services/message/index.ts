import Discord from 'discord.js';
import { TPokemonCsv } from '../../csv-db/pokemon';
import { generateEvolutionImg, generatePokemonImg } from '../../../infrastructure/utils/image';
import { capitalize } from '../../../infrastructure/utils/string';
import { client } from '../../../app';
import SettingsService from '../settings';

class MessagesService {
    static async sendPokemonEvolvedToUserByUserId (userId: string, pokemonMeta: TPokemonCsv, nextPokemonMeta: TPokemonCsv) {
        const user = client.users.cache.get(userId);
        if (!user) {
            return;
        }

        const channelId = await SettingsService.getDiscordChannelOutput();
        if (!channelId) {
            return;
        }

        const canvas = await generateEvolutionImg([pokemonMeta.img, nextPokemonMeta.img]);
        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'team.png');

        const embed = new Discord.MessageEmbed()
            .setTitle(`${capitalize(pokemonMeta.identifier)} wants to evolve !`)
            .setAuthor("Professor Oak", "https://cdn.costumewall.com/wp-content/uploads/2017/02/professor-oak.jpg")
            .setColor("#ff0000")
            .setDescription(`What ?\n**${pokemonMeta.identifier.toUpperCase()}** is evolving !`)
            .attachFiles([attachment])
            .setImage("attachment://team.png");

        await MessagesService.send({ embed: embed });

        const evolutionCanvas = await generatePokemonImg(nextPokemonMeta.id);
        const evolutionAttachment = new Discord.MessageAttachment(evolutionCanvas.toBuffer(), 'team.png');
        const embedEvolved = new Discord.MessageEmbed()
            .setTitle(`${capitalize(pokemonMeta.identifier)} is now ${nextPokemonMeta.identifier.toUpperCase()} !`)
            .setAuthor("Professor Oak", "https://cdn.costumewall.com/wp-content/uploads/2017/02/professor-oak.jpg")
            .setColor("#ff0000")
            .setDescription(`Congratulations!`)
            .attachFiles([evolutionAttachment])
            .setImage("attachment://team.png");
        
        await MessagesService.send({ embed: embedEvolved });
    }

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

    static getUserFromMention(mention: string) {
        if (!mention) return null;
    
        if (mention.startsWith('<@') && mention.endsWith('>')) {
            mention = mention.slice(2, -1);
    
            if (mention.startsWith('!')) {
                mention = mention.slice(1);
            }
    
            return mention;
        }

        return null;
    }
}

export default MessagesService;
