import config from "../../../infrastructure/config";
import fb from "../../../infrastructure/firebase";
import PokedexService, { Pokemon } from "../pokedex";

export type Wild = {
    user_id: string;
    pokemon_id: number;
    attempt: number;
    max_attemps: number;
    timestamp: number;
}

export type AttemptToCatchResults = {
    caught: boolean;
    released: boolean;
    pokemon: Pokemon | null;
    current_attempt: number;
    max_attempt: number;
    attempts_left: number;
}

class WildService {
    static async tryToSpawnWildPokemon (user_id: string): Promise<Pokemon | null> {
        const user = await fb.usersCollections.doc(user_id).get();
        if (!user.exists) {
            return;
        }

        const activeWild = await fb.wildCollections.doc(user_id).get();

        if (activeWild.exists) {
            const data = activeWild.data() as Wild;

            if (Date.now() >= (data.timestamp + (config.game.resetWildFightAfter * 1000))) {
                await fb.wildCollections.doc(user_id).delete();
            } else {
                return;
            }
        }

        if ((Math.random() * 100) > config.game.chanceToSpawnWildPokemon) {
            return null;
        }
        
        const pokemon = await PokedexService.getRandomPokemon(false);
        const data: Wild = {
            user_id: user_id,
            pokemon_id: pokemon.id,
            attempt: 0,
            max_attemps: 3,
            timestamp: Date.now()
        };
        await fb.wildCollections.doc(user_id).set(data);

        return pokemon;
    }

    static async isUserAllowedToCatch (userId: string): Promise<boolean> {
        const wild = await fb.wildCollections.doc(userId).get();

        return wild.exists;
    }

    static async attemptToCatch (userId: string, pokemonName: string): Promise<AttemptToCatchResults> {
        const wild = await fb.wildCollections.doc(userId).get();

        if (!wild.exists) {
            return {
                attempts_left: -1,
                current_attempt: -1,
                max_attempt: -1,
                caught: false,
                pokemon: null,
                released: false
            };
        }

        const wildFight = wild.data() as Wild;
        const pokemon = await PokedexService.getById(wildFight.pokemon_id);
        if (!pokemon) {
            return {
                attempts_left: wildFight.max_attemps - wildFight.attempt,
                caught: false,
                current_attempt: wildFight.attempt,
                max_attempt: wildFight.max_attemps,
                pokemon: null,
                released: false,
            }
        }

        if (pokemonName.toLocaleLowerCase() === pokemon.name.toLocaleLowerCase()) {
            await fb.wildCollections.doc(userId).delete();
            return {
                attempts_left: wildFight.max_attemps - wildFight.attempt,
                caught: true,
                current_attempt: wildFight.attempt,
                max_attempt: wildFight.max_attemps,
                pokemon: pokemon,
                released: false,
            }
        }

        const nextAttemp = wildFight.attempt + 1;
        if (nextAttemp >= wildFight.max_attemps) {
            await fb.wildCollections.doc(userId).delete();
            return {
                attempts_left: wildFight.max_attemps - nextAttemp,
                caught: false,
                current_attempt: nextAttemp,
                max_attempt: wildFight.max_attemps,
                pokemon: pokemon,
                released: true,
            }
        }

        await fb.wildCollections.doc(userId).update({
            "attempt": nextAttemp
        });

        return {
            attempts_left: wildFight.max_attemps - nextAttemp,
            caught: false,
            current_attempt: nextAttemp,
            max_attempt: wildFight.max_attemps,
            pokemon: pokemon,
            released: false,
        };
    }
}

export default WildService;
