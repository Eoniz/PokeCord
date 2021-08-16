import { MAX_POKEMON_ID, MIN_POKEMON_ID } from "../factories/pokemon";
import { AbstractCSVDB } from "./index";
import { LocalDB } from "./localdb";
import { TPokemonEvolutionCsv } from "./pokemon_evolution";
import { TPokemonMoveCsv } from "./pokemon_moves";
import { TPokemonStatsCsv } from "./pokemon_stats";
import { TSpeciesCsv } from "./species";
import { getPokedexImgPathById, getPokemonImgPathById } from "../../infrastructure/utils/image";

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
    mini_img: string;

    // binds
    species: TSpeciesCsv;
    evolution: TPokemonCsv;
    evolution_meta?: TPokemonEvolutionCsv;
    pokemonBaseStats: TPokemonStatsCsv[];
    moves: TPokemonMoveCsv[];
}

export class PokemonDB extends AbstractCSVDB<TPokemonCsv> {
    constructor() {
        super('pokemon.csv');

        this.data = this.data.slice(MIN_POKEMON_ID - 1, MAX_POKEMON_ID);
        
        this.compute("img", (pok: TPokemonCsv) => {
            return getPokemonImgPathById(pok.id);
        });

        this.compute("mini_img", (pok: TPokemonCsv) => {
            return getPokedexImgPathById(pok.id);
        });

        this.compute("evolution", (pok: TPokemonCsv) => {
            return this.findNextEvolution(pok.id);
        });

        this.bindOneToOne("species", "species_id", "id", "species");
        this.bindOneToOne("evolution_meta", "id", "evolved_species_id", "pokemonEvolution");
        this.bindOneToMany("pokemonBaseStats", "id", "pokemon_id", "pokemonStats");
        this.bindOneToMany("moves", "id", "pokemon_id", "pokemonMoves");
    }

    public findNextEvolution (pokId: number): TPokemonCsv | null {
        const species = LocalDB.species.getFirstByProperty("evolves_from_species_id", pokId);

        if (!species) {
            return null;
        }

        return LocalDB.pokemons.getFirstById(species.id);
    }
}