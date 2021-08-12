import express from "express";
import http from "http";
import * as Discord from 'discord.js';
import initCommands, { Commands } from './domain/commands';
import config from './infrastructure/config';
import minimist from 'minimist-string';
import fb from './infrastructure/firebase';
import { pokedex } from './temp';
import UserService from "./domain/services/users";
import MessagesService from "./domain/services/message";
import EncountersService from "./domain/services/encounters";


export const client = new Discord.Client();

client.once("ready", () => {
    console.log("I am ready !");
    client.user.setActivity({
        name: "p!help",
        url: "https://github.com/Eoniz/PokeCord"
    });
});

client.on('message', async (message) => {
    if (message.author.bot) {
        return;
    }

    if (!message.content.startsWith(config.discord.prefix)) {
        const [leveledUp, leveledUpPokemon] = await UserService.xpActivePokemon(message.author.id);
        if (leveledUp) {
            const embed = new Discord.MessageEmbed()
                .setTitle(`Congratulations ${message.author.username}, your pokemon just leveled up!`)
                .setAuthor("Professor Oak", "https://cdn.costumewall.com/wp-content/uploads/2017/02/professor-oak.jpg")
                .setColor("#ff0000")
                .setDescription(`Your pokémon is now level ${leveledUpPokemon.level.level}`)
                .setImage(leveledUpPokemon.meta.img);
            
                await MessagesService.send({ embed: embed });
        }
        
        const pokemon = await EncountersService.tryToSpawnWildPokemon(message.author.id);
        if (pokemon) {
            const embed = new Discord.MessageEmbed()
                .setTitle(`A wild pokémon (level ${pokemon.level.level}) has appeared! (tip: ${pokemon.meta.identifier})`)
                .setAuthor("Professor Oak", "https://cdn.costumewall.com/wp-content/uploads/2017/02/professor-oak.jpg")
                .setColor("#ff0000")
                .setDescription(`Guess the pokémon and type p!catch <pokémon> to catch it!`)
                .setImage(pokemon.meta.img)
                .setFooter("Time left: 10:00");
            
            await MessagesService.replyTo(message.author, "A wild pokémon has appeared!");
            await MessagesService.send({ embed: embed });
        }

        return;
    }

    const tempArgs = message.content.split(/\s+/);
    const command = tempArgs.shift().toLowerCase().slice(config.discord.prefix.length);
    
    const { _: args, ...kwargs } = minimist(tempArgs.join(' '));

    if (!(command in Commands)) {
        message.reply("this command does not exist !");
        return;
    }

    for (let i = args.length; i > 0; i--) {
        const commandName = `${command} ${args.slice(0, i).join(' ')}`
        
        if (commandName in Commands) {
             const newArgs = args.slice(i);
             await Commands[commandName].execute(
                message, 
                (newArgs as Array<string | number>).map(v => v.toString()).filter(v => v.toString().length > 0),
                kwargs
            );

            return;
        }
    }
    
    await Commands[command].execute(
        message, 
        (args as Array<string | number>).map(v => v.toString()).filter(v => v.toString().length > 0),
        kwargs
    );
});

const load = async () => {
    await initCommands();
    client.login(config.discord.token);
};

load();

const initPokedex = () => {
    pokedex.forEach((pokemon) => {
        fb.pokemonsCollections.doc(pokemon.id.toString())
            .set({
                ...pokemon,
                name: pokemon.name.toLowerCase(),
                prev_evolution: (pokemon.prev_evolution || []).map((p) => ({
                    num: p.num,
                    name: p.name.toLowerCase()
                })),
                next_evolution: (pokemon.next_evolution || []).map((p) => ({
                    num: p.num,
                    name: p.name.toLowerCase()
                }))
            });
    });
}


// initPokedex();

const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("App is up and running on port", PORT);
});

app.get('/', (req, res) => {
    console.log("Ping !");
    res.send('Pong !');
});

setInterval(function() {
    http.get("http://floating-hamlet-05414.herokuapp.com/")
}, 150000);

// const g = async function() {
//     const desc: string[] = ["id,img"];

//     for (let i = 1; i <= 151; i++) {
//         const pok = await PokedexService.getById(i);
//         desc.push(`${i},${pok.img}`);
//     }
    
//     console.log(desc.join('\n'));
// }();