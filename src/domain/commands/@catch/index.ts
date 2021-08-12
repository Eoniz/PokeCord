import Discord from 'discord.js';
import { ICommand } from "../../../infrastructure/types/commands/commands.types";
import { capitalize } from '../../../infrastructure/utils/string';
import MessagesService from '../../services/message';
import UserService from '../../services/users';
import WildService from '../../services/wild';

const catchCommand: ICommand = {
    name: "catch",
    description: "Catch the pokemon by guessing its name !",
    execute: async (message, args) => {
        if (!await WildService.isUserAllowedToCatch(message.author.id)) {
            message.reply("There is not pokemon to catch yet for you !");
            return;
        }

        if (args.length !== 1) {
            message.reply("Usage: p!pick <pokémon>");
            return;
        }

        const { 
            attempts_left, 
            released, 
            pokemon, 
            max_attempt, 
            caught,
            current_attempt 
        } = await WildService.attemptToCatch(message.author.id, args[0]);
        
        if (caught) {
            const embed = new Discord.MessageEmbed()
                .setTitle("Congratulations!")
                .setAuthor("Professor Oak", "https://cdn.costumewall.com/wp-content/uploads/2017/02/professor-oak.jpg")
                .setColor("#ff0000")
                .setDescription(`You caught a ${capitalize(pokemon.name)}!\n\n**Added to your Pokédex**`)
                .setImage(pokemon.img);
            
            await MessagesService.send({ embed: embed });

            await UserService.addPokemonToPokedex(message.author.id, pokemon);

            return;
        }

        if (released) {
            await MessagesService.send("Oh no... The pokémon has run away...");
            return;
        }

        await MessagesService.replyTo(message.author, `This is the wrong pokémon! ${attempts_left} tries left (${current_attempt}/${max_attempt})`);
    }
}

export default catchCommand;
