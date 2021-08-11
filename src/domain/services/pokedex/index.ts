import fb from "../../../infrastructure/firebase"

export type Evolution = {
    num: string;
    name: string;
}

export type Pokemon = {
    id: number;
    num: string;
    name: string;
    img: string;
    type: string[];
    height: string;
    weight: string;
    candy: string;
    candy_count: number;
    egg: string;
    spawn_chance: number;
    avg_spawn: number;
    spawn_time: number;
    multipliers: number[];
    weaknesses: string[];
    next_evolution: Evolution[];
    prev_evolution: Evolution[];
}

export type CaughtPokemonMeta = {
    level: number;
    next_level_xp_needed: number;
    current_xp: number;
};

export type CaughtPokemon = Pokemon & CaughtPokemonMeta;

class PokedexService {
    static async getById(id: number | string): Promise<Pokemon | null> {
        const pokemon = await fb.pokemonsCollections.doc(id.toString()).get();
        
        if (pokemon.exists) {
            return pokemon.data() as Pokemon;
        }

        return null;
    }

    static async getByName(name: string): Promise<Pokemon | null> {
        const pokemons = await fb.pokemonsCollections.where("name", "==", name).get();
        
        if (pokemons.empty) {
            return null;
        }

        return pokemons.docs[0].data() as Pokemon;
    }

    static async getRandomPokemon(allowEvolvedPokemons: boolean = true): Promise<Pokemon> {
        const pokemonsDocs = await fb.pokemonsCollections.get();
        const pokemons: Array<Pokemon> = [];

        
        for (const pokemon of pokemonsDocs.docs) {
            const p: Pokemon = pokemon.data() as Pokemon;
            if (!allowEvolvedPokemons && p.prev_evolution.length > 0) {
                continue;
            }

            pokemons.push(p);
        }

        const idx = Math.max(0, Math.floor(Math.random() * (pokemons.length - 1)));
        return pokemons[idx];
    }
}

export default PokedexService;
