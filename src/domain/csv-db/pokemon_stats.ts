import { AbstractCSVDB } from "./index";
import { TStatsCsv } from "./stats";

export type TPokemonStatsCsv = {
    pokemon_id: number;
    stat_id: number;
    base_stat: number;
    effort: number;
    
    detail: TStatsCsv;
}

export class PokemonStatsDB extends AbstractCSVDB<TPokemonStatsCsv> {
    constructor() {
        super('pokemon_stats.csv');

        this.bindOneToOne("detail", "stat_id", "id", "stats");
    }
}