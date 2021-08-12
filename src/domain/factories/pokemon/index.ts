import { LocalDB } from "../../csv-db/localdb";
import { TPokemonCsv } from "../../csv-db/pokemon";
import { TPokemonMoveCsv } from "../../csv-db/pokemon_moves";

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

export type PokemonLevel = {
    level: number;
    current_xp: number;
    next_lvl_xp: number;
}

export type PokemonMove = {
    id: number;
}

type GeneratePokemonConfig = {
    pokemon_id: number;
    stats: PokemonStats;
    level: PokemonLevel;
    moves: PokemonMove[];
}

type GetRandomPokemonConfig = {
    allow_evolved: boolean;
}

export class Pokemon {
    public id: number;
    public meta: TPokemonCsv;
    public stats: PokemonStats;
    public level: PokemonLevel;
    public availableMoves: PokemonMove[];
    public moves: TPokemonMoveCsv[];

    constructor (meta?: TPokemonCsv, stats?: PokemonStats, level?: PokemonLevel, availableMoves?: PokemonMove[]) {
        this.id = meta.id;
        this.meta = meta;
        this.stats = stats;
        this.level = level;

        this.setAvailableMoves(availableMoves);
    }

    public setMeta(meta: TPokemonCsv): Pokemon {
        this.id = meta.id;
        this.meta = meta;
        return this;
    }

    public setStats(stats: Partial<PokemonStats>): Pokemon {
        this.stats = {...this.stats, ...stats};
        return this;
    }

    public setAvailableMoves(availableMoves: PokemonMove[]): Pokemon {
        this.availableMoves = availableMoves;
        const moves: TPokemonMoveCsv[] = [];

        if (this.meta.moves) {
            for (const availableMove of this.availableMoves) {
                const move = this.meta.moves.find((_move) => _move.move_id === availableMove.id);
                if (move) {
                    moves.push(move);
                }
            }
        }

        this.moves = moves;

        return this;
    }

    public setLevel(level: Partial<PokemonLevel>): Pokemon {
        this.level = { ...this.level, ...level };
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

        let moves: PokemonMove[] = [];

        const _levelConfig: PokemonLevel = {
            current_xp: 1,
            next_lvl_xp: 100,
            level: 1,
            ...config.level
        };

        if (pokemonMeta.moves) {
            for (const _move of pokemonMeta.moves) {
                if (moves.find((_m) => _m.id === _move.move_id)) {
                    continue;
                }

                if (_move.level <= _levelConfig.level && _move.move_method.identifier === "level-up") {
                    moves.push({ id: _move.move_id });
                }
            }
        }

        const _config: GeneratePokemonConfig = {
            level: _levelConfig,
            pokemon_id: config.pokemon_id,
            stats: stats,
            moves: moves.slice(0, 4),
            ...config
        }

        const pokemon: Pokemon = new Pokemon(
            pokemonMeta,
            _config.stats,
            _config.level,
            _config.moves
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

    public static getRandomPokemon (meanLvl: number, config?: GetRandomPokemonConfig): Pokemon {
        const _config: GetRandomPokemonConfig = {
            allow_evolved: false,
            ...config
        };

        let pokemon: Pokemon = null;
        while (!pokemon) {
            const MIN_ID = 1;
            const MAX_ID = 151;
            const id = MIN_ID + Math.floor(Math.random() * (MAX_ID - MIN_ID));
            const level = Math.max(1, meanLvl + (-5 + Math.floor(Math.random() * 10)));
    
            const _pok = PokemonFactory.generatePokemon({
                level: {
                    current_xp: 1,
                    level: level,
                    next_lvl_xp: 100 + (25 * (level - 1))
                },
                pokemon_id: id
            });

            if (_config.allow_evolved === false) {
                if (_pok.meta.species.evolves_from_species_id.toString().trim() !== "") {
                    continue;
                }
            }

            pokemon = _pok;
        }
        
        return pokemon;
    }
}