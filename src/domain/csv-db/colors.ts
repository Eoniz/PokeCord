import { AbstractCSVDB } from "./index";

export type TColorCsv = {
    id: number;
    identifier: string;
}

export class PokemonColorsDB extends AbstractCSVDB<TColorCsv> {
    constructor() {
        super('pokemon_colors.csv');
    }
}