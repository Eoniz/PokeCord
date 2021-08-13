import LRU_CACHE from 'lru-cache';
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
    private static _cache = new LRU_CACHE<string, FbEncounter>({
        max: 150,
        maxAge: 1000*60*10
    });

    public static async getById (userId: string): Promise<FbEncounter | null> {
        const cachedEncounter = EncountersService._cache.get(userId);

        if (cachedEncounter !== undefined) {
            return cachedEncounter;
        }

        const encounter = await fb.encountersCollections.doc(userId).get();
        const encounterData = encounter.exists ? (encounter.data() as FbEncounter) : null;
        EncountersService._cache.set(userId, encounterData);
        return encounterData;
    }

    public static async isUserAllowedToCatch (userId: string): Promise<boolean> {
        const encounter = await EncountersService.getById(userId);

        return encounter !== null;
    }

    public static async tryToSpawnWildPokemon(userId: string): Promise<Pokemon> {
        const user = await UserService.getFbUserById(userId);
        if (!user) {
            return null;
        }

        const activeEncounter = await EncountersService.getById(userId);
        if (activeEncounter) {
            if (Date.now() >= (activeEncounter.timestamp + (config.game.resetWildFightAfter * 1000))) {
                EncountersService.delById(userId);
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

        EncountersService._cache.set(userId, data);
        await fb.encountersCollections.doc(userId).set(data);

        return pokemon;
    }

    public static async delById (userId: string) {
        EncountersService._cache.del(userId);
        await fb.encountersCollections.doc(userId).delete();
    }

    public static async attemptToCatch (userId: string, pokemonName: string): Promise<AttemptToCatchResults> {
        const encounter = await EncountersService.getById(userId);

        const results: AttemptToCatchResults = {
            attempts_left: -1,
            current_attempt: -1,
            max_attempt: -1,
            caught: false,
            pokemon: null,
            released: false
        };

        if (!encounter) {
            return results;
        }

        
        const pokemon = PokemonFactory.generatePokemon({
            pokemon_id: encounter.pokemon_id,
            level: encounter.pokemon_meta.level
        });

        results.max_attempt = encounter.max_attemps;
        results.current_attempt = encounter.attempt;
        results.attempts_left = encounter.max_attemps - encounter.attempt;

        if (!pokemon) {
            return results;
        }

        results.current_attempt = encounter.attempt + 1;
        results.attempts_left = encounter.max_attemps - encounter.attempt;
        results.pokemon = pokemon;

        if (pokemonName.toLocaleLowerCase() === pokemon.meta.identifier.toLocaleLowerCase()) {
            EncountersService.delById(userId);

            results.caught = true;

            return results;
        }

        if (results.attempts_left >= 0) {
            EncountersService.delById(userId);
            results.released = true;

            return results;
        }

        const nextData: FbEncounter = {
            ...encounter,
            attempt: results.current_attempt
        };

        EncountersService._cache.set(userId, nextData);
        await fb.encountersCollections.doc(userId).update({
            "attempt": results.current_attempt
        });

        return results;
    }
}

export default EncountersService;
