import { AbstractCSVDB } from "./index";

export type TShapeCsv = {
    id: number;
    identifier: string;
}

export class PokemonShapeDB extends AbstractCSVDB<TShapeCsv> {
    constructor() {
        super('pokemon_shapes.csv');
    }
}