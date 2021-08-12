import { AbstractCSVDB } from "./index";

export type MoveTarget = (
    "specific-move"
    | "selected-pokemon-me-first"
    | "ally"
    | "users-field"
    | "user-or-ally"
    | "opponents-field"
    | "user"
    | "random-opponent"
    | "all-other-pokemon"
    | "selected-pokemon"
    | "entier-field"
    | "user-and-allies"
    | "all-pokemon"
    | string
)

export type TMoveTargetCSV = {
    id: number;
    identifier: MoveTarget
}

export class MoveTargetDB extends AbstractCSVDB<TMoveTargetCSV> {
    constructor() {
        super('move_targets.csv');
    }
}