import { AbstractCSVDB } from "./index";

export type MoveDamageClass = (
    "status"
    | "physical"
    | "special"
    | string
)

export type TMoveDamageClassCsv = {
    id: number;
    identifier: MoveDamageClass
}

export class MoveDamageClassDB extends AbstractCSVDB<TMoveDamageClassCsv> {
    constructor() {
        super('move_damage_classes.csv');
    }
}