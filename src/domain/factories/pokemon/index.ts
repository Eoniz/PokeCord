import { LocalDB } from "../../csv-db/localdb";
import { TPokemonCsv } from "../../csv-db/pokemon";

export type PokemonStats = {
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
    accuracy: number;
    evasion: number;
};

type GeneratePokemonConfig = {
    pokemon_id: number;
    stats: PokemonStats;
    level: number;
}

export class Pokemon {
    public meta: TPokemonCsv;
    public stats: PokemonStats;
    public level: number;

    constructor (meta?: TPokemonCsv, stats?: PokemonStats, level?: number) {
        this.meta = meta;
        this.stats = stats;
        this.level = level;
    }

    public setMeta(meta: TPokemonCsv): Pokemon {
        this.meta = meta;
        return this;
    }

    public setStats(stats: PokemonStats): Pokemon {
        this.stats = stats;
        return this;
    }

    public setLevel(level: number): Pokemon {
        this.level = level;
        return this;
    }

    public getMeta() {
        return this.meta;
    }

    public getStats() {
        return this.stats;
    }

    public getLevel() {
        return this.level;
    }
}

export class PokemonFactory {
    public static generatePokemon (config: Partial<GeneratePokemonConfig>) {
        const pokemonMeta = LocalDB.pokemons.getFirstById(config.pokemon_id);
        const stats = config.stats || PokemonFactory.getBaseStatsFromPokemonMeta(pokemonMeta);

        const _config: GeneratePokemonConfig = {
            level: 1,
            pokemon_id: 1,
            stats: stats,
            ...config
        }

        const pokemon: Pokemon = new Pokemon(
            pokemonMeta,
            _config.stats,
            _config.level
        );

        return pokemon;
    }

    public static getBaseStatsFromPokemonMeta (meta: TPokemonCsv) {
        const { pokemonBaseStats } = meta;
        const stats: PokemonStats = {
            accuracy: 1,
            attack: 1,
            defense: 1,
            evasion: 1,
            hp: 1,
            special_attack: 1,
            special_defense: 1,
            speed: 1
        }

        for (const stat of pokemonBaseStats) {
            const name = stat.detail.identifier.replace('-', '_');
            if (name in stats) {
                stats[name] = stat.base_stat;
            }
        }

        return stats;
    }
}