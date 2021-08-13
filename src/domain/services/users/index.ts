import LRU_CACHE from 'lru-cache';
import config from "../../../infrastructure/config";
import fb from "../../../infrastructure/firebase"
import { Pokemon, PokemonFactory, PokemonLevel, PokemonMove, PokemonStats } from "../../factories/pokemon";

export type AbstractUser = {
    id: string;
    last_msg_timestamp: number;
    is_admin: boolean;
}

export type FbPokemon = {
    id: number;
    inventory_id: number;
    stats: PokemonStats;
    level: PokemonLevel;
    available_moves: PokemonMove[];
}

export type FbUser = AbstractUser & {
    pokemons: Array<FbPokemon>;
    active_pokemon: number;
}

export type PokemonInInventory = Pokemon & { inventory_id: number };

export type User = AbstractUser & {
    pokemons: Array<PokemonInInventory>;
    active_pokemon: Pokemon ;
}


class UserService {
    private static _cache = new LRU_CACHE<string, FbUser>({
        max: 150,
        maxAge: 1000*60*10
    });

    private static _fromFbPokemonToPokemon(meta: FbPokemon): PokemonInInventory {
        const pokemon: Pokemon = PokemonFactory.generatePokemon({
            level: meta.level,
            stats: meta.stats,
            pokemon_id: meta.id ,
            moves: meta.available_moves,
        });

        return ({
            inventory_id: meta.inventory_id,
            ...pokemon
        } as PokemonInInventory);
    }

    private static _fromPokemonToFbPokemon (pokemon: Pokemon, inventory_id: number): FbPokemon {
        return {
            available_moves: pokemon.availableMoves,
            id: pokemon.id,
            level: pokemon.level,
            stats: pokemon.stats,
            inventory_id: inventory_id
        };
    }

    private static _generatePokemonsFromLocalDb (user: FbUser): User {
        const pokemons = user.pokemons
            .map((pokemonMeta) => UserService._fromFbPokemonToPokemon(pokemonMeta));

        const activePokemon = pokemons[user.active_pokemon];

        return {
            id: user.id,
            pokemons: pokemons,
            active_pokemon: activePokemon,
            is_admin: user.is_admin,
            last_msg_timestamp: user.last_msg_timestamp
        };
    }

    public static async getById (userId: string): Promise<User | null> {
        const user = await UserService.getFbUserById(userId);

        if (!user) {
            return null;
        }

        return UserService._generatePokemonsFromLocalDb(user);
    }

    public static async getFbUserById (userId: string): Promise<FbUser | null> {
        const cachedUsed = UserService._cache.get(userId);

        if (cachedUsed !== undefined) {
            return cachedUsed;
        }

        console.log("Calling Firebase for getting user informations");
        const user = await fb.usersCollections.doc(userId).get();

        if (!user.exists) {
            UserService._cache.set(userId, null);
            return null;
        }

        UserService._cache.set(userId, user.data() as FbUser);
        return user.data() as FbUser;
    }

    public static async userExists (userId: string) {
        const exists = await UserService.getFbUserById(userId);
        return exists !== null;
    }

    public static async registerUser(userId: string, starter: "bulbasaur" | "charmander" | "squirtle"): Promise<[boolean, FbUser]> {
        const STARTER_IDS = {
            "bulbasaur": 1,
            "charmander": 4,
            "squirtle": 7,
        };

        if (await UserService.userExists(userId)) {
            return [false, null];
        }

        const pokemon = PokemonFactory.generatePokemon({ pokemon_id: STARTER_IDS[starter] });
        const newFbUser: FbUser = {
            active_pokemon: 0,
            id: userId,
            is_admin: false,
            last_msg_timestamp: Date.now(),
            pokemons: [
                {
                    id: pokemon.id,
                    level: pokemon.level,
                    stats: pokemon.stats,
                    available_moves: pokemon.availableMoves,
                    inventory_id: 0
                }
            ]
        };

        await fb.usersCollections.doc(userId).set(newFbUser);
        UserService._cache.set(userId, newFbUser);

        return [true, newFbUser];
    }

    public static async xpActivePokemon (userId: string): Promise<[boolean, Pokemon]> {
        const user = await UserService.getFbUserById(userId);

        if (!user) {
            return [false, null];
        }

        const timeBetweenXpInMs = config.game.timeBetweenXp * 1000;
        if (Date.now() < (user.last_msg_timestamp + timeBetweenXpInMs)) {
        // if (Date.now() < 0) {
            return [false, null];
        }

        const xpWon = Math.ceil(config.game.xpMinPerMessage + (Math.random() * (config.game.xpMaxPerMessage - config.game.xpMinPerMessage)));
        const updatedUser = {...user};
        updatedUser.pokemons[user.active_pokemon].level.current_xp += xpWon;
        updatedUser.last_msg_timestamp = Date.now();

        let leveledUp = false;
        if (updatedUser.pokemons[user.active_pokemon].level.current_xp >= updatedUser.pokemons[user.active_pokemon].level.next_lvl_xp) {
            updatedUser.pokemons[user.active_pokemon].level.level = updatedUser.pokemons[user.active_pokemon].level.level + 1;
            updatedUser.pokemons[user.active_pokemon].level.current_xp = updatedUser.pokemons[user.active_pokemon].level.current_xp % updatedUser.pokemons[user.active_pokemon].level.next_lvl_xp;
            updatedUser.pokemons[user.active_pokemon].level.next_lvl_xp = 100 + (25 * (updatedUser.pokemons[user.active_pokemon].level.level - 1));
            leveledUp = true;
        }

        await fb.usersCollections.doc(userId).update(updatedUser);
        UserService._cache.set(userId, updatedUser);

        if (leveledUp) {
            const caughtPokemon = PokemonFactory.generatePokemon({
                pokemon_id: updatedUser.pokemons[user.active_pokemon].id,
                level: updatedUser.pokemons[user.active_pokemon].level,
                stats: updatedUser.pokemons[user.active_pokemon].stats
            });
            return [leveledUp, caughtPokemon];
        }

        return [false, null];
    }

    public static async addPokemon (userId: string, pokemon: Pokemon): Promise<boolean> {
        const user = await UserService.getFbUserById(userId);

        if (!user) {
            return false;
        }

        const nextPokemons: FbPokemon[] = [
            ...user.pokemons, 
            UserService._fromPokemonToFbPokemon(pokemon, user.pokemons.length)
        ];

        const nextUser: FbUser = {
            ...user,
            pokemons: nextPokemons
        };

        UserService._cache.set(userId, nextUser);
        await fb.usersCollections.doc(userId).update({
            pokemons: nextPokemons
        });
    }

    public static async changeActivePokemonIdTo (userId: string, id: number) {
        const user = await UserService.getFbUserById(userId);
        if (!user) {
            return false;
        }

        const nextUser: FbUser = {
            ...user,
            active_pokemon: id
        };

        UserService._cache.set(userId, nextUser);
        await fb.usersCollections.doc(userId).update({
            active_pokemon: id
        });

        return true;
    }

    public static async isUserAdmin (userId: string) {
        const user = await UserService.getFbUserById(userId);
        console.log(user);
        return user.is_admin;
    }
}

export default UserService;
