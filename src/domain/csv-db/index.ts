import parseCSV from 'csv-parse/lib/sync';
import fs from 'fs';
import path from 'path';
import { LocalDB } from './localdb';

const CURRENT_DIR = path.dirname(__filename);

type Bind = {
    propertyName: string;
    otherTable: string;
    col: string;
    otherTableCol: string;
    type: "oneToMany" | "oneToOne"
}

export class AbstractCSVDB<T extends { id: number }> {

    protected filename: string;

    protected data: Array<T>;
    protected binds: Array<Bind>;

    constructor (filepath: string) {
        this.binds = [];
        this.filename = filepath;

        this._loadDb(path.join(CURRENT_DIR, "../../csvs", filepath));
    }

    private _loadDb(filepath: string) {
        const rawFile = fs.readFileSync(filepath);
        this.data = parseCSV(rawFile, { 
            columns: true, 
            skipEmptyLines: true,
            cast: true 
        }) as T[];
    }

    protected bindOneToMany<K extends { id: number }>(propertyName: string, col: string, otherTableCol: string, otherTable: string) {
        this.binds.push({
            propertyName,
            col,
            otherTableCol,
            otherTable,
            type: "oneToMany"
        });
    };
    protected bindOneToOne<K extends { id: number }>(propertyName: string, col: string, otherTableCol: string, otherTable: string) {
        this.binds.push({
            propertyName,
            col,
            otherTableCol,
            otherTable,
            type: "oneToOne"
        });
    };

    public getById(id: number, depth: number = 0): T {
        const item = this.data.find((row) => row.id === id);

        if (depth >= 3) {
            return item;
        }

        for (const bind of this.binds) {
            if (!item) {
                continue;
            }

            const table = LocalDB[bind.otherTable] as AbstractCSVDB<any>;

            if (bind.type === "oneToMany") {
                const founds = table.data.filter((row) => row[bind.otherTableCol] === item[bind.col]);
                item[bind.propertyName] = founds.map((row) => table.getById(row.id, depth + 1));
            } else if (bind.type === "oneToOne") {
                const found = table.data.find((row) => row[bind.otherTableCol] === item[bind.col]);
                if (found) {
                    item[bind.propertyName] = table.getById(found.id, depth + 1);
                }
            }
        }

        return item;
    }
}
