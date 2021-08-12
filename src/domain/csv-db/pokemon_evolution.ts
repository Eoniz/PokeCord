import { TEvolutionTriggerCsv } from "./evolution_triggers";
import { TGenderCsv } from "./gender";
import { AbstractCSVDB } from "./index";
import { TItemCsv } from "./item";
import { TLocationCsv } from "./location";
import { TSpeciesCsv } from "./species";

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

    evolution_trigger?: TEvolutionTriggerCsv;
    evolved_species?: TSpeciesCsv;
    item_trigger?: TItemCsv;
    gender?: TGenderCsv;
    location?: TLocationCsv;
}

export class PokemonEvolutionDB extends AbstractCSVDB<TPokemonEvolutionCsv> {
    constructor() {
        super('pokemon_evolution.csv');

        this.bindOneToOne("evolved_species", "evolved_species_id", "id", "species");
        this.bindOneToOne("evolution_trigger", "evolution_trigger_id", "id", "evolutionTrigger");
        this.bindOneToOne("item_trigger", "trigger_item_id", "id", "items");
        this.bindOneToOne("gender", "gender_id", "id", "genders");
        this.bindOneToOne("location", "location_id", "id", "locations");
    }
}