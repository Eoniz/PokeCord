import { AbstractCSVDB } from "./index";
import { TRegionCsv } from "./region";

export type TLocationCsv = {
    id: number;
    region_id: number;
    identifier: string;

    region?: TRegionCsv;
}

export class LocationDB extends AbstractCSVDB<TLocationCsv> {
    constructor() {
        super('locations.csv');

        this.bindOneToOne("region", "region_id", "id", "regions");
    }
}