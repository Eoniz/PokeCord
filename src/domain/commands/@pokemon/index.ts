import Discord from 'discord.js';
import { ICommand } from "../../../infrastructure/types/commands/commands.types";
import { capitalize } from '../../../infrastructure/utils/string';
import UserService from '../../services/users';

const pokemon: ICommand = {
    name: "pokemon",
    description: "Informations about your pokemons.",
    execute: async (message, args) => {
        const MAX_PER_PAGE = 5;
        let page = 1;
        
        const user = await UserService.getUserById(message.author.id);
        if (!user) {
            message.reply("You haven't started yet. Type `p!start` !");
            return;
        }

        if (args.length === 1) {
            try {
                page = Number.parseInt(args[0]);
            } catch (e) { console.error(e); };
        }

        const maxPage = Math.ceil(user.pokemons.length / MAX_PER_PAGE);
        if (page > maxPage) {
            page = maxPage;
        } else if (page < 1) {
            page = 1;
        }
        
        const paginationStart = (page - 1) * MAX_PER_PAGE;
        const paginationEnd = page * MAX_PER_PAGE;

        const desc: string[] = [];
        const sorted = user.pokemons.slice(paginationStart, paginationEnd).sort((a, b) => a.id - b.id);
        for (const pokemon of sorted) {
            desc.push(`**${capitalize(pokemon.name)}** | Level ${pokemon.level} | Number: ${pokemon.id}`);
        }
        
        const embed = new Discord.MessageEmbed()
            .setTitle("Your Pokémons:")
            .setAuthor("Professor Oak", "https://cdn.costumewall.com/wp-content/uploads/2017/02/professor-oak.jpg","https://yagami.xyz")
            .setColor("#ff0000")
            .setDescription(desc.join('\n'))
            .setImage(user.active_pokemon.img)
            .setFooter(`Your active pokemon is: ${capitalize(user.active_pokemon.name)} (level ${user.active_pokemon.level})\nShowing ${((page - 1) * MAX_PER_PAGE) + 1}-${(page - 1) * MAX_PER_PAGE + desc.length} of ${user.pokemons.length} pokemons (page ${page}/${maxPage})\n\nType p!pokemon <page number> for showing the next ones\nType p!select <pokemon number> to select your active pokemon`)
        
        message.channel.send({ embed: embed });
    }
}

export default pokemon;
