import LRU_CACHE from 'lru-cache';
import { LocalDB } from '../../csv-db/localdb';
import { TPokemonCsv } from '../../csv-db/pokemon';
import config from "../../../infrastructure/config";
import fb from "../../../infrastructure/firebase"
import { Pokemon, PokemonFactory, PokemonLevel, PokemonMove, PokemonStats } from "../../factories/pokemon";
import MessagesService from '../message';

export type AbstractUser = {
    id: string;
    last_msg_timestamp: number;
    is_admin: boolean;
    last_inventory_id: number;
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
    team: Array<number>;
}

export type PokemonInInventory = Pokemon & { inventory_id: number };

export type User = AbstractUser & {
    pokemons: Array<PokemonInInventory>;
    active_pokemon: Pokemon;
    team: Array<PokemonInInventory>;
}


class UserService {
    private static _cache = new LRU_CACHE<string, FbUser>({
        max: 150,
        maxAge: 1000*60*60
    });

    private static async _clearInventoryIds (userId: string) {
        const user = await UserService.getFbUserById(userId);

        if (!user) {
            return false;
        }

        const nextPokemons = [...user.pokemons];
        const nextTeam = [...user.team];

        let inventoryId = 0;
        for (let i = 0; i < user.pokemons.length; i++) {
            inventoryId += 1;

            const pokemon = user.pokemons[i];

            const lastId = pokemon.inventory_id;
            const nextInventoryId = inventoryId;
            
            nextPokemons[i] = {
                ...pokemon,
                inventory_id: nextInventoryId
            };

            for (let j = 0; j < user.team.length; j++) {
                const teamItem = user.team[j];
                if (teamItem === lastId) {
                    nextTeam[j] = nextInventoryId;
                }
            }
        }

        UserService._cache.set(userId, {
            ...user,
            team: nextTeam,
            pokemons: nextPokemons,
            last_inventory_id: inventoryId
        });

        await fb.usersCollections.doc(userId).update({
            team: nextTeam,
            pokemons: nextPokemons,
            last_inventory_id: inventoryId
        });
    } 

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

        const team = user.team
            .map((pokId) => pokemons.find((_pok) => _pok.inventory_id === pokId))
            .filter((_pok) => _pok !== undefined);
        
        const activePokemon = team[0];

        return {
            id: user.id,
            pokemons: pokemons,
            active_pokemon: activePokemon,
            is_admin: user.is_admin,
            last_msg_timestamp: user.last_msg_timestamp,
            team: team,
            last_inventory_id: user.last_inventory_id
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
            id: userId,
            is_admin: false,
            last_msg_timestamp: Date.now(),
            last_inventory_id: 0,
            pokemons: [
                {
                    id: pokemon.id,
                    level: pokemon.level,
                    stats: pokemon.stats,
                    available_moves: pokemon.availableMoves,
                    inventory_id: 0
                }
            ],
            team: [0]
        };

        await fb.usersCollections.doc(userId).set(newFbUser);
        UserService._cache.set(userId, newFbUser);

        return [true, newFbUser];
    }

    public static async xpActivePokemon (userId: string): Promise<[boolean, Pokemon, TPokemonCsv]> {
        const user = await UserService.getFbUserById(userId);

        if (!user) {
            return [false, null, null];
        }

        const timeBetweenXpInMs = config.game.timeBetweenXp * 1000;
        if (Date.now() < (user.last_msg_timestamp + timeBetweenXpInMs)) {
        // if (Date.now() < 0) {
            return [false, null, null];
        }

        const xpWon = Math.ceil(config.game.xpMinPerMessage + (Math.random() * (config.game.xpMaxPerMessage - config.game.xpMinPerMessage)));
        const updatedUser = {...user};
        const activePokemonIdx = user.pokemons.findIndex((_pok) => _pok.inventory_id === user.team[0]);
        if (activePokemonIdx === -1) {
            return [false, null, null];
        }

        updatedUser.pokemons[activePokemonIdx].level.current_xp += xpWon;
        updatedUser.last_msg_timestamp = Date.now();

        let leveledUp = false;
        let nxtEvolution: TPokemonCsv = null;
        if (updatedUser.pokemons[activePokemonIdx].level.current_xp >= updatedUser.pokemons[activePokemonIdx].level.next_lvl_xp) {
            const nextLvl = Math.floor(updatedUser.pokemons[activePokemonIdx].level.level + 1);
            updatedUser.pokemons[activePokemonIdx].level.level = nextLvl;
            updatedUser.pokemons[activePokemonIdx].level.current_xp = updatedUser.pokemons[activePokemonIdx].level.current_xp % updatedUser.pokemons[activePokemonIdx].level.next_lvl_xp;
            updatedUser.pokemons[activePokemonIdx].level.next_lvl_xp = 100 + (25 * (updatedUser.pokemons[activePokemonIdx].level.level - 1));
            
            const pokemonMeta = LocalDB.pokemons.getFirstById(updatedUser.pokemons[activePokemonIdx].id);
            if (
                pokemonMeta.evolution
                && nextLvl >= pokemonMeta.evolution.evolution_meta.minimum_level 
                && pokemonMeta.evolution.evolution_meta.evolution_trigger
                && pokemonMeta.evolution.evolution_meta.evolution_trigger.identifier === "level-up"
            ) {
                nxtEvolution = LocalDB.pokemons.getFirstById(pokemonMeta.evolution.id);
            }
            
            leveledUp = true;
        }

        await fb.usersCollections.doc(userId).update(updatedUser);
        UserService._cache.set(userId, updatedUser);

        if (leveledUp) {
            const caughtPokemon = PokemonFactory.generatePokemon({
                pokemon_id: updatedUser.pokemons[activePokemonIdx].id,
                level: updatedUser.pokemons[activePokemonIdx].level,
                stats: updatedUser.pokemons[activePokemonIdx].stats
            });
            return [leveledUp, caughtPokemon, nxtEvolution];
        }

        return [false, null, null];
    }

    public static async addPokemon (userId: string, pokemon: Pokemon): Promise<FbPokemon> {
        const user = await UserService.getFbUserById(userId);

        if (!user) {
            return null;
        }

        let idx = user.last_inventory_id + 1;
        const beingAddedFbPokemon = UserService._fromPokemonToFbPokemon(pokemon, idx);
        const nextPokemons: FbPokemon[] = [
            ...user.pokemons, 
            beingAddedFbPokemon
        ];

        const nextUser: FbUser = {
            ...user,
            pokemons: nextPokemons,
            last_inventory_id: idx
        };

        UserService._cache.set(userId, nextUser);
        await fb.usersCollections.doc(userId).update({
            pokemons: nextPokemons,
            last_inventory_id: idx
        });

        return beingAddedFbPokemon;
    }

    public static async reSync (userId: string) {
        UserService._cache.del(userId);
    }

    public static async removePokemon (userId: string, pokemonId: number): Promise<boolean> {
        return await UserService.releasePokemons(userId, [pokemonId]);
    }

    public static async releasePokemons (userId: string, inventoryIds: number[]) {
        const user = await UserService.getFbUserById(userId);

        if (!user) {
            return false;
        }

        const nextPokemons: FbPokemon[] = user.pokemons
            .filter((_pok) => !inventoryIds.includes(_pok.inventory_id));

        if (nextPokemons.length === 0) {
            nextPokemons.push(user.pokemons[0]);
        }

        const nextTeam = user.team
            .filter((_pokId) => !inventoryIds.includes(_pokId));

        if (nextTeam.length === 0) {
            nextTeam.push(nextPokemons[0].inventory_id);
        }

        const nextUser: FbUser = {
            ...user,
            pokemons: nextPokemons,
            team: nextTeam
        };

        UserService._cache.set(userId, nextUser);
        await fb.usersCollections.doc(userId).update({
            pokemons: nextPokemons
        });

        await UserService._clearInventoryIds(userId);

        return true;
    }

    public static async givePokemonsTo(userId: string, targetUserId: string, inventoryIds: number[]) {
        const user = await UserService.getFbUserById(userId);
        const targetUser = await UserService.getFbUserById(targetUserId);
        if (!user || !targetUser) {
            return false;
        }

        const pokemons = user.pokemons.filter((_pok) => inventoryIds.includes(_pok.inventory_id));
        const givenPokemons: FbPokemon[] = [];

        let nextTargetUserLastInventoryId = targetUser.last_inventory_id;
        for (const pok of pokemons) {
            nextTargetUserLastInventoryId += 1;
            givenPokemons.push({
                ...pok,
                inventory_id: nextTargetUserLastInventoryId
            });
        }

        const nextTargetPokemons = [
            ...targetUser.pokemons,
            ...givenPokemons
        ];
        UserService._cache.set(targetUserId, {
            ...targetUser,
            pokemons: nextTargetPokemons,
            last_inventory_id: nextTargetUserLastInventoryId
        });
        await fb.usersCollections.doc(targetUserId).update({
            pokemons: nextTargetPokemons,
            last_inventory_id: nextTargetUserLastInventoryId
        });

        await UserService.releasePokemons(userId, inventoryIds);
    }

    public static async changeActivePokemonIdTo (userId: string, id: number) {
        const user = await UserService.getFbUserById(userId);
        if (!user) {
            return false;
        }

        const nextUser: FbUser = {
            ...user
        };

        UserService._cache.set(userId, nextUser);
        await fb.usersCollections.doc(userId).update({
            active_pokemon: id
        });

        return true;
    }

    public static async isUserAdmin (userId: string) {
        const user = await UserService.getFbUserById(userId);
        return user.is_admin;
    }

    public static async changeActiveTeam (userId: string, team: number[]): Promise<boolean> {
        const user = await UserService.getFbUserById(userId);

        if (!user) {
            return false;
        }

        if (team.length === 0) {
            return false;
        }

        const nextData = {
            ...user,
            team: team
        };

        UserService._cache.set(userId, nextData);
        await fb.usersCollections.doc(userId).update({
            team: team
        });

        return true;
    }

    public static async evolveActivePokemon (userId: string) {
        const user = await UserService.getFbUserById(userId);

        if (!user) {
            return false;
        }

        const activePokemonId = user.team[0];
        const activePokemonIdx = user.pokemons.findIndex((_pok) => _pok.inventory_id === activePokemonId);

        if (activePokemonIdx === -1) {
            return false;
        }

        const activePokemon = user.pokemons[activePokemonIdx];
        const meta = LocalDB.pokemons.getFirstById(activePokemon.id);
        const nextPokemons = [...user.pokemons];

        if (!meta.evolution) {
            return false;
        }

        nextPokemons[activePokemonIdx] = {
            ...activePokemon,
            id: meta.evolution.id
        };

        UserService._cache.set(userId, {
            ...user,
            pokemons: nextPokemons
        });
        await fb.usersCollections.doc(userId).update({
            pokemons: nextPokemons
        });

        return true;
    }

    public static async evolvePokemon (userId: string, inventoryId: number) {
        const user = await UserService.getFbUserById(userId);

        if (!user) {
            return false;
        }

        const pokemonIdx = user.pokemons.findIndex((_pok) => _pok.inventory_id === inventoryId);

        if (pokemonIdx === -1) {
            return false;
        }

        const activePokemon = user.pokemons[pokemonIdx];
        const meta = LocalDB.pokemons.getFirstById(activePokemon.id);
        const nextPokemons = [...user.pokemons];

        if (!meta.evolution) {
            return false;
        }

        nextPokemons[pokemonIdx] = {
            ...activePokemon,
            id: meta.evolution.id
        };

        UserService._cache.set(userId, {
            ...user,
            pokemons: nextPokemons
        });
        await fb.usersCollections.doc(userId).update({
            pokemons: nextPokemons
        });

        return true;
    }

    public static async xpActiveTeam (userId: string): Promise<boolean> {
        const user = await UserService.getFbUserById(userId);

        if (!user) {
            return false;
        }

        const timeBetweenXpInMs = config.game.timeBetweenXp * 1000;
        if (Date.now() < (user.last_msg_timestamp + timeBetweenXpInMs)) {
        // if (Date.now() < 0) {
            return false;
        }

        
        const updatedUser = {...user};
        const activePokemonsIdx = user.team.map((_id) => {
            return user.pokemons.findIndex((_pok) => _pok.inventory_id === _id)
        }).filter((_id) => _id !== -1);

        updatedUser.last_msg_timestamp = Date.now();
        for (const pokemonIdx of activePokemonsIdx) {
            const xpWon = Math.ceil(config.game.xpMinPerMessage + (Math.random() * (config.game.xpMaxPerMessage - config.game.xpMinPerMessage)));
            updatedUser.pokemons[pokemonIdx].level.current_xp += xpWon;

            let nxtEvolution: TPokemonCsv = null;
            if (updatedUser.pokemons[pokemonIdx].level.current_xp >= updatedUser.pokemons[pokemonIdx].level.next_lvl_xp) {
                const nextLvl = Math.floor(updatedUser.pokemons[pokemonIdx].level.level + 1);
                updatedUser.pokemons[pokemonIdx].level.level = nextLvl;
                updatedUser.pokemons[pokemonIdx].level.current_xp = updatedUser.pokemons[pokemonIdx].level.current_xp % updatedUser.pokemons[pokemonIdx].level.next_lvl_xp;
                updatedUser.pokemons[pokemonIdx].level.next_lvl_xp = 100 + (25 * (updatedUser.pokemons[pokemonIdx].level.level - 1));
                
                const pokemonMeta = LocalDB.pokemons.getFirstById(updatedUser.pokemons[pokemonIdx].id);
                if (
                    pokemonMeta.evolution
                    && nextLvl >= pokemonMeta.evolution.evolution_meta.minimum_level 
                    && pokemonMeta.evolution.evolution_meta.evolution_trigger
                    && pokemonMeta.evolution.evolution_meta.evolution_trigger.identifier === "level-up"
                ) {
                    nxtEvolution = LocalDB.pokemons.getFirstById(pokemonMeta.evolution.id);
                    await UserService.evolvePokemon(userId, updatedUser.pokemons[pokemonIdx].inventory_id);
                    await MessagesService.sendPokemonEvolvedToUserByUserId(userId, pokemonMeta, nxtEvolution);
                }
            }
        }

        await fb.usersCollections.doc(userId).update(updatedUser);
        UserService._cache.set(userId, updatedUser);

        return true;
    }
}

export default UserService;
