import { AbstractCSVDB } from "./index";
import { TMoveDamageClassCsv } from "./move_damage_class";
import { TMoveTargetCSV } from "./move_target";
import { TTypeCsv } from "./type";

export type TMoveCsv = {
    id: number;
    identifier: string;
    type_id: number;
    power: number;
    pp: number;
    accuracy: number;
    priority: number;
    target_id: number;
    damage_class_id: number;
    effect_id: number;
    effect_chance: number;
    contest_type_id: number;
    contest_effect_id: number;
    super_contest_effect_id: number;

    type: TTypeCsv;
    target: TMoveTargetCSV;
    damage_class: TMoveDamageClassCsv;
}

export class MoveDB extends AbstractCSVDB<TMoveCsv> {
    constructor() {
        super('moves.csv');

        this.bindOneToOne("type", "type_id", "id", "types");
        this.bindOneToOne("target", "target_it", "id", "moveTargets");
        this.bindOneToOne("damage_class", "damage_class_id", "id", "moveDamageClasses");
    }
}