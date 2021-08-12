import { AbstractCSVDB } from "./index";

export type THabitatCsv = {
    id: number;
    identifier: string;
}

export class HabitatDB extends AbstractCSVDB<THabitatCsv> {
    constructor() {
        super('pokemon_habitats.csv');
    }
}