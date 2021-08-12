import { AbstractCSVDB } from "./index";

export type TGenderCsv = {
    id: number;
    identifier: string;
}

export class GenderDB extends AbstractCSVDB<TGenderCsv> {
    constructor() {
        super('genders.csv');
    }
}