import { AbstractCSVDB } from "./index";

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
}

export class SpeciesDB extends AbstractCSVDB<TSpeciesCsv> {
    constructor() {
        super('pokemon_species.csv');
    }
}