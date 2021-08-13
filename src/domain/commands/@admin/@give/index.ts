import { PokemonFactory } from '../../../factories/pokemon/index';
import config from '../../../../infrastructure/config';
import { ICommand } from '../../../../infrastructure/types/commands/commands.types';
import UserService from '../../../services/users';

const give: ICommand = {
    name: "give",
    description: `Give specified pokemon to user(s). Usage \`${config.discord.prefix}admin give <pokemon id> @USER1 @USER2\``,
    execute: async (message, args) => {
        const isAdmin = await UserService.isUserAdmin(message.author.id);

        if (isAdmin === null) {
            return;
        } else if (isAdmin === false) {
            message.reply("Are you really admin ? :smirk: ");
            return;
        }

        let pokemonIds: number[] = [];
        for (const arg of args) {
            try {
                const pokemonId = Number.parseInt(arg, 10);
                pokemonIds.push(pokemonId);
            } catch (e) { 
                continue;
            }
        }

        const pokemons = pokemonIds.filter(a => !Number.isNaN(a))
            .map((pokemonId) => PokemonFactory.generatePokemon({
                pokemon_id: pokemonId
            }))
            .filter(a => a !== null);

        for (const user of message.mentions.users.values()) {
            if (!await UserService.getFbUserById(user.id)) {
                continue;
            }

            for (const pokemon of pokemons) {
                await UserService.addPokemon(user.id, pokemon);
            }
        }

        message.reply("Done :blush: ");
    }
}

export default give;
