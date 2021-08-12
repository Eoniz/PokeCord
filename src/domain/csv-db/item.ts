import { AbstractCSVDB } from "./index";

export type TItemCsv = {
    id: number;
    identifier: string;
    category_id: number;
    cost: number;
    fling_power: number;
    fling_effect_id: number;
}

export class ItemDB extends AbstractCSVDB<TItemCsv> {
    constructor() {
        super('items.csv');
    }
}