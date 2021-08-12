import Discord from 'discord.js';
import config from '../../../infrastructure/config';
import { ICommand } from "../../../infrastructure/types/commands/commands.types";
import MessagesService from '../../services/message';

const timeLeftStr = (to: number) => {
    const future = new Date(to);
    const now = new Date();
    
    const duration = Math.abs((future.getTime() - now.getTime()) / 1000);

    const mins = ~~((duration % 3600) / 60);
    const secs = ~~duration % 60;

    return `${mins}:${(secs < 10 ? "0" : "")}${secs}`;
}

const catchCommand: ICommand = {
    name: "wild",
    description: "Get informations about your wild battle !",
    execute: async (message, args) => {
        // const { meta, pokemon } = await WildService.getWildInformations(message.author.id);
        // if (!meta) {
        //     message.reply("There is no active pokemon catchable yet for you !");
        //     return;
        // }

        // const endTime = (meta.timestamp + (config.game.resetWildFightAfter * 1000));
        // const embed = new Discord.MessageEmbed()
        //     .setTitle(`Your active wild fight`)
        //     .setAuthor("Professor Oak", "https://cdn.costumewall.com/wp-content/uploads/2017/02/professor-oak.jpg")
        //     .setColor("#ff0000")
        //     .setDescription(`Guess the pokémon and type p!catch <pokémon> to catch it!\n\n**Type(s):** ${pokemon.type.join(' / ')}\n**Weaknesses:** ${pokemon.weaknesses.join(' / ')}\n**Weight:** ${pokemon.weight}\n**Height:** ${pokemon.height}\n`)
        //     .setImage(pokemon.img)
        //     .setFooter(`Time left: ${timeLeftStr(endTime)}`)
    
        // MessagesService.send({ embed: embed });
    }
}

export default catchCommand;
