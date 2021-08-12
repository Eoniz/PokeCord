import { AbstractCSVDB } from "./index";

export type TStatsCsv = {
    id: number;
    damage_class_id: number;
    identifier: string;
    is_battle_only: number;
    game_index?: number;
}

export class StatsDB extends AbstractCSVDB<TStatsCsv> {
    constructor() {
        super('stats.csv');
    }
}