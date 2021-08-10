import config from "../../../infrastructure/config";
import fb from "../../../infrastructure/firebase"
import PokedexService, { CaughtPokemon, CaughtPokemonMeta, Pokemon } from "../pokedex";

export type AbstractUser = {
    discord_id: string;
    last_msg_timestamp: number;
    inventory: Array<any>;
}

export type UserDB = AbstractUser & {
    pokemons: Array<CaughtPokemonMeta & { id: number; pokemon_id: number; }>;
    active_pokemon: number;
}

export type User = AbstractUser & {
    pokemons: Array<CaughtPokemon>;
    active_pokemon: CaughtPokemon;
}

class UserService {
    private static async _fromDbToDTO (user: UserDB): Promise<User> {
        const pokemons: Array<CaughtPokemon> = [];
        let activePokemon: CaughtPokemon | null = null;

        for (const pokemonMeta of user.pokemons) {
            const pokemon = await PokedexService.getById(pokemonMeta.pokemon_id);
            if (pokemon !== null) {
                const pokemonData: CaughtPokemon = {
                    ...pokemon,
                    level: pokemonMeta.level,
                    next_level_xp_needed: pokemonMeta.next_level_xp_needed,
                    current_xp: pokemonMeta.current_xp
                };

                pokemons.push(pokemonData);
                if (pokemonMeta.id === user.active_pokemon) {
                    activePokemon = pokemonData;
                }
            }
        }

        return {
            ...user, 
            pokemons: pokemons,
            active_pokemon: activePokemon
        } as User;
    }

    static async getUserDBById(id: string): Promise<UserDB | null> {
        const user = await fb.usersCollections.doc(id).get();
        
        if (user.exists) {
            return user.data() as UserDB;
        }

        return null;
    }

    static async getUserById(id: string): Promise<User | null> {
        const user = await fb.usersCollections.doc(id).get();
        
        if (user.exists) {
            return UserService._fromDbToDTO(user.data() as UserDB);
        }

        return null;
    }

    static async registerUser (id: string, pokemon: Pokemon): Promise<[boolean, UserDB]> {
        const user = await fb.usersCollections.doc(id).get();
        
        if (user.exists) {
            return [false, user.data() as UserDB];
        }

        const data: UserDB = {
            discord_id: id,
            inventory: [],
            last_msg_timestamp: Date.now(),
            pokemons: [{
                pokemon_id: pokemon.id,
                id: 0,
                level: 1,
                next_level_xp_needed: 100,
                current_xp: 0
            }],
            active_pokemon: 0
        }
        await fb.usersCollections.doc(id).set(data);
        return [true, data];
    }

    static async xpActivePokemon(id: string): Promise<UserDB> {
        const userDB = await fb.usersCollections.doc(id).get();
        
        if (!userDB.exists) {
            return;
        }

        const data = userDB.data() as UserDB;

        const timeBetweenXpInMs = config.game.timeBetweenXp * 1000;
        if (Date.now() < (data.last_msg_timestamp + timeBetweenXpInMs)) {
            return;
        }

        const nextData = {...data};
        nextData.pokemons[data.active_pokemon].current_xp += 1;
        nextData.last_msg_timestamp = Date.now();

        await fb.usersCollections.doc(id).update(nextData);
    }
}

export default UserService;
