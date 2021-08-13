import { MAX_POKEMON_ID, MIN_POKEMON_ID } from "../factories/pokemon";
import { AbstractCSVDB } from "./index";
import { TPokemonEvolutionCsv } from "./pokemon_evolution";
import { TPokemonMoveCsv } from "./pokemon_moves";
import { TPokemonStatsCsv } from "./pokemon_stats";
import { TSpeciesCsv } from "./species";

export type TPokemonCsv = {
    id: number;
    identifier: string;
    species_id: number;
    height: number;
    weight: number;
    base_experience: number;
    order: number;
    is_default: number;
    
    // computed
    img: string;

    // binds
    species: TSpeciesCsv;
    evolution: TPokemonEvolutionCsv;
    pokemonBaseStats: TPokemonStatsCsv[];
    moves: TPokemonMoveCsv[];
}

export class PokemonDB extends AbstractCSVDB<TPokemonCsv> {
    constructor() {
        super('pokemon.csv');

        this.data = this.data.slice(MIN_POKEMON_ID - 1, MAX_POKEMON_ID);
        
        this.compute("img", (pok: TPokemonCsv) => {
            if (pok.id < 10) {
                return `http://www.serebii.net/pokemongo/pokemon/00${pok.id}.png`;
            } else if (pok.id >= 10 && pok.id < 100) {
                return `http://www.serebii.net/pokemongo/pokemon/0${pok.id}.png`;
            }
            return `http://www.serebii.net/pokemongo/pokemon/${pok.id}.png`
        })

        this.bindOneToOne("species", "species_id", "id", "species");
        this.bindOneToOne("evolution", "id", "id", "pokemonEvolution");
        this.bindOneToMany("pokemonBaseStats", "id", "pokemon_id", "pokemonStats");
        this.bindOneToMany("moves", "id", "pokemon_id", "pokemonMoves");
    }
}