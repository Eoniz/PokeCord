import { AbstractCSVDB } from "./index";

export type TEvolutionTriggerCsv = {
    id: number;
    identifier: (
        "level-up"
        | "trade"
        | "use-item"
        | "shed"
        | "spin"
        | "tower-of-darkness"
        | "tower-of-waters"
        | "three-critical-hits"
        | "take-damage"
    );
}

export class EvolutionTriggerDB extends AbstractCSVDB<TEvolutionTriggerCsv> {
    constructor() {
        super('evolution_triggers.csv');
    }
}