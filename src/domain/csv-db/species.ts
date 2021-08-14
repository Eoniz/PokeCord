import { TColorCsv } from "./colors";
import { THabitatCsv } from "./habitat";
import { AbstractCSVDB } from "./index";
import { TShapeCsv } from "./shape";

export type TSpeciesCsv = {
    id: number;
    identifier: string;
    generation_id: number;
    evolves_from_species_id: number;
    evolution_chain_id: number;
    color_id: number;
    shape_id: number;
    habitat_id: number;
    gender_rate: number;
    capture_rate: number;
    base_happiness: number;
    is_baby: number;
    hatch_counter: number;
    has_gender_differences: number;
    growth_rate_id: number;
    forms_switchable: number;
    is_legendary: number;
    is_mythical: number;
    order: number;
    conquest_order: number;

    color?: TColorCsv;
    evolves_from_species: TSpeciesCsv;
    habitat?: THabitatCsv;
    shape?: TShapeCsv;
    // evolutions: TSpeciesCsv[];
}

export class SpeciesDB extends AbstractCSVDB<TSpeciesCsv> {
    constructor() {
        super('pokemon_species.csv');

        this.bindOneToOne("color", "color_id", "id", "pokemonColors");
        this.bindOneToOne("evolves_from_species", "evolves_from_species_id", "id", "species");
        this.bindOneToOne("evolves_from_species", "evolves_from_species_id", "id", "species");
        this.bindOneToOne("habitat", "habitat_id", "id", "habitats");
        this.bindOneToOne("shape", "shape_id", "id", "pokemonShapes");

        // this.bindOneToMany("evolutions", "evolution_chain_id", "evolution_chain_id", "species");
    }
}