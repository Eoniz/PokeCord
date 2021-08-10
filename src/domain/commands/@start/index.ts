import Discord from 'discord.js';
import { ICommand } from "../../../infrastructure/types/commands/commands.types";

const start: ICommand = {
    name: "start",
    description: "Start playing pokebot !",
    execute: async (message, args) => {
        const embed = new Discord.MessageEmbed()
            .setTitle(`Hello ${message.author.username}!`)
            .setAuthor("Professor Oak", "https://cdn.costumewall.com/wp-content/uploads/2017/02/professor-oak.jpg","https://yagami.xyz")
            .setColor("#ff0000")
            .setDescription("Welcome to the world of pokémon! To begin play, choose one of these pokémon:\nBulbasaur / Charmander / Squirtle\n\n**Use p!pick <pokemon>**\n(for example `p!pick Squirtle`)\n\n**Your pokemon will gain XP as you talk to your friends in chat. Good luck!**\n")
            .setImage("https://i.imgur.com/vBx2fVU.jpg");

        message.channel.send({ embed: embed });
    }
}

export default start;
