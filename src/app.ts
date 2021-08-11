import * as Discord from 'discord.js';
import initCommands, { Commands } from './domain/commands';
import config from './infrastructure/config';
import minimist from 'minimist-string';
import fb from './infrastructure/firebase';
import { pokedex } from './temp';
import PokedexService from './domain/services/pokedex';
import UserService from './domain/services/users';
import WildService from './domain/services/wild';

const client = new Discord.Client();

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
                .setTitle(`Your pokemon leveled up!`)
                .setAuthor("Professor Oak", "https://cdn.costumewall.com/wp-content/uploads/2017/02/professor-oak.jpg")
                .setColor("#ff0000")
                .setDescription(`Your pokémon is now level ${leveledUpPokemon.level}`)
                .setImage(leveledUpPokemon.img);
            
            message.channel.send({ embed: embed });
        }
        
        const pokemon = await WildService.tryToSpawnWildPokemon(message.author.id);
        if (pokemon) {
            const embed = new Discord.MessageEmbed()
                .setTitle(`A wild pokémon has appeared! (tip: ${pokemon.name})`)
                .setAuthor("Professor Oak", "https://cdn.costumewall.com/wp-content/uploads/2017/02/professor-oak.jpg")
                .setColor("#ff0000")
                .setDescription("Guess the pokémon and type p!catch <pokémon> to catch it!")
                .setImage(pokemon.img);
            
            await message.reply("A wild pokémon has appeared!");
            await message.reply({ embed: embed });
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
                (newArgs as string[]).filter(v => v.length > 0),
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
