import { AbstractCSVDB } from "./index";
import { TMoveCsv } from "./move";
import { TPokemonMoveMethod } from "./pokemon_move_methods";

export type TPokemonMoveCsv = {
    pokemon_id: number;
    version_group: number;
    move_id: number;
    pokemon_move_method_id: number;
    level: number;
    order: number;

    move: TMoveCsv;
    move_method: TPokemonMoveMethod;
}

export class PokemonMoveDB extends AbstractCSVDB<TPokemonMoveCsv> {
    constructor() {
        super('pokemon_moves.csv');

        this.bindOneToOne("move", "move_id", "id", "moves");
        this.bindOneToOne("move_method", "pokemon_move_method_id", "id", "pokemonMoveMethods");
    }
}