import { AbstractCSVDB } from "./index";

export type TTypeCsv = {
    id: number;
    identifier: number;
    generation_id: number;
    damage_class_id: number;
}

export class TypeDB extends AbstractCSVDB<TTypeCsv> {
    constructor() {
        super('types.csv');
    }
}