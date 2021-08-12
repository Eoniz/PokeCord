import { AbstractCSVDB } from "./index";
import { TPokemonEvolutionCsv } from "./pokemon_evolution";
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
    
    species: TSpeciesCsv;
    evolution: TPokemonEvolutionCsv;
}

export class PokemonDB extends AbstractCSVDB<TPokemonCsv> {
    constructor() {
        super('pokemon.csv');

        // Only get the 1st gen
        this.data = this.data.slice(0, 151);
        this.bindOneToOne("species", "species_id", "id", "species");
        this.bindOneToOne("evolution", "id", "id", "pokemonEvolution");
    }
}