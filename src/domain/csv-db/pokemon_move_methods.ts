import { AbstractCSVDB } from "./index";

export type TPokemonMoveMethod = {
    id: number;
    identifier: string;
}

export class PokemonMoveMethodDB extends AbstractCSVDB<TPokemonMoveMethod> {
    constructor() {
        super('pokemon_move_methods.csv');
    }
}