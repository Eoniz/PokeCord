import { AbstractCSVDB } from "./index";

export type TRegionCsv = {
    id: number;
    identifier: string;
}

export class RegionDB extends AbstractCSVDB<TRegionCsv> {
    constructor() {
        super('regions.csv');
    }
}