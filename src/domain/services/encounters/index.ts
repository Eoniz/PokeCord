import config from "../../../infrastructure/config";
import fb from "../../../infrastructure/firebase"
import { median } from "../../../infrastructure/utils/math";
import { Pokemon, PokemonFactory, PokemonLevel, PokemonMove } from "../../factories/pokemon";
import UserService from "../users";

export type FbEncounter = {
    timestamp: number;
    user_id: string;
    pokemon_id: number;
    attempt: number;
    max_attemps: number;
    pokemon_meta: {
        level: PokemonLevel,
        moves: PokemonMove[]
    }
}

export type AttemptToCatchResults = {
    caught: boolean;
    released: boolean;
    pokemon: Pokemon | null;
    current_attempt: number;
    max_attempt: number;
    attempts_left: number;
}

class EncountersService {
    public static async isUserAllowedToCatch (userId: string): Promise<boolean> {
        const encounter = await fb.encountersCollections.doc(userId).get();

        return encounter.exists;
    }

    public static async tryToSpawnWildPokemon(userId: string): Promise<Pokemon> {
        const user = await UserService.getFbUserById(userId);
        if (!user) {
            return null;
        }

        const activeEncounter = await fb.encountersCollections.doc(userId).get();
        if (activeEncounter.exists) {
            const data = activeEncounter.data() as FbEncounter;

            if (Date.now() >= (data.timestamp + (config.game.resetWildFightAfter * 1000))) {
                await fb.encountersCollections.doc(userId).delete();
            } else {
                return;
            }
        }

        if ((Math.random() * 100) > config.game.chanceToSpawnWildPokemon) {
            return null;
        }

        const meanLvl = median(...user.pokemons.map((_pok) => _pok.level.level));

        const pokemon = PokemonFactory.getRandomPokemon(meanLvl);
        const data: FbEncounter = {
            user_id: userId,
            pokemon_id: pokemon.id,
            attempt: 0,
            max_attemps: 3,
            timestamp: Date.now(),
            pokemon_meta: {
                level: pokemon.level,
                moves: pokemon.availableMoves
            }
        };
        await fb.encountersCollections.doc(userId).set(data);

        return pokemon;
    }

    public static async attemptToCatch (userId: string, pokemonName: string): Promise<AttemptToCatchResults> {
        const encounter = await fb.encountersCollections.doc(userId).get();

        const results: AttemptToCatchResults = {
            attempts_left: -1,
            current_attempt: -1,
            max_attempt: -1,
            caught: false,
            pokemon: null,
            released: false
        };

        if (!encounter.exists) {
            return results;
        }

        
        const encounterData = encounter.data() as FbEncounter;
        
        const pokemon = PokemonFactory.generatePokemon({
            pokemon_id: encounterData.pokemon_id,
            level: encounterData.pokemon_meta.level
        });

        results.max_attempt = encounterData.max_attemps;
        results.current_attempt = encounterData.attempt;
        results.attempts_left = encounterData.max_attemps - encounterData.attempt;

        if (!pokemon) {
            return results;
        }

        results.current_attempt = encounterData.attempt + 1;
        results.attempts_left = encounterData.max_attemps - encounterData.attempt;
        results.pokemon = pokemon;

        if (pokemonName.toLocaleLowerCase() === pokemon.meta.identifier.toLocaleLowerCase()) {
            await fb.encountersCollections.doc(userId).delete();

            results.caught = true;

            return results;
        }

        if (results.attempts_left >= 0) {
            await fb.encountersCollections.doc(userId).delete();
            results.released = true;

            return results;
        }

        await fb.encountersCollections.doc(userId).update({
            "attempt": results.current_attempt
        });

        return results;
    }
}

export default EncountersService;
