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

class WildService {
    static async tryToSpawnWildPokemon (user_id: string): Promise<Pokemon | null> {
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
        
        const pokemon = await PokedexService.getRandomPokemon();
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
}

export default WildService;
