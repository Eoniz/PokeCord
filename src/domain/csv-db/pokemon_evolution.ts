import { AbstractCSVDB } from "./index";
import { TPokemonCsv } from "./pokemon";

export type TPokemonEvolutionCsv = {
    id: number;
    evolved_species_id: number;
    evolution_trigger_id: number;
    trigger_item_id: number;
    minimum_level: number;
    gender_id: number;
    location_id: number;
    held_item_id: number;
    time_of_day: number;
    known_move_id: number;
    minimum_hapiness: number;
    minimum_beauty: number;
    minimum_affection: number;
    relative_physical_stats: number;
    party_species_id: number;
    party_type_id: number;
    trade_species_id: number;
    needs_overworld_rain: number;
    turn_upside_down: number;
    evolved_species: TPokemonCsv;
}

export class PokemonEvolutionDB extends AbstractCSVDB<TPokemonEvolutionCsv> {
    constructor() {
        super('pokemon_evolution.csv');

        this.bindOneToOne("evolved_species", "evolved_species_id", "id", "pokemons");
    }
}