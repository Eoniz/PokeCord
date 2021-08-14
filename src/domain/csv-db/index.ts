import parseCSV from 'csv-parse/lib/sync';
import fs from 'fs';
import path from 'path';
import { LocalDB } from './localdb';

const CURRENT_DIR = path.dirname(__filename);
const MAX_DEPTH = 10;

type Bind = {
    propertyName: string;
    otherTable: string;
    col: string;
    otherTableCol: string;
    type: "oneToMany" | "oneToOne"
}

type Compute<T> = {
    propertyName: string;
    computeMethod: (item: T) => any;
}

export class AbstractCSVDB<T> {

    protected filename: string;

    protected data: Array<T>;
    protected binds: Array<Bind>;
    protected computes: Array<Compute<T>>;

    constructor (filepath: string) {
        this.binds = [];
        this.filename = filepath;
        this.computes = [];

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

    protected compute (propertyName: string, cb: (v: T) => any) {
        this.computes.push({
            computeMethod: cb,
            propertyName: propertyName
        });
    }

    protected bindOneToMany(propertyName: string, col: string, otherTableCol: string, otherTable: string) {
        this.binds.push({
            propertyName,
            col,
            otherTableCol,
            otherTable,
            type: "oneToMany"
        });
    };
    protected bindOneToOne(propertyName: string, col: string, otherTableCol: string, otherTable: string) {
        this.binds.push({
            propertyName,
            col,
            otherTableCol,
            otherTable,
            type: "oneToOne"
        });
    };

    private _computes (item: T) {
        for (const c of this.computes) {
            const v = c.computeMethod(item);
            item[c.propertyName] = v;
        }

        return item;
    }

    public getByIdx (idx: number, maxDepth: number = MAX_DEPTH, depth: number = 0): T {
        const item = this.data[idx];

        if (depth >= maxDepth) {
            this._computes(item);
            return item;
        }

        for (const bind of this.binds) {
            if (!item) {
                continue;
            }

            const table = LocalDB[bind.otherTable] as AbstractCSVDB<any>;

            if (bind.type === "oneToMany") {

                const founds = table.data.filter((row) => item !== row && row[bind.otherTableCol] === item[bind.col]).map((row) => table.data.findIndex((_row) => _row === row));
                item[bind.propertyName] = founds.map((row) => table.getByIdx(row, maxDepth, depth + 1));


            } else if (bind.type === "oneToOne") {


                const found = table.data.findIndex((row) => row[bind.otherTableCol] === item[bind.col]);
                if (found !== -1) {
                    item[bind.propertyName] = table.getByIdx(found, maxDepth, depth + 1);
                }

            }
        }

        this._computes(item);
        return item;
    }

    public getById(id: number, maxDepth: number = MAX_DEPTH, depth: number = 0): T[] {
        return this.getByProperty("id", id, maxDepth, depth);
    }

    public getFirstById(id: number, maxDepth: number = MAX_DEPTH, depth: number = 0): T {
        return this.getFirstByProperty("id", id, maxDepth, depth);
    }

    public getByProperty(property: string, value: any, maxDepth: number = MAX_DEPTH, depth: number = 0): T[] {
        const items = this.data.filter((row) => {
            if (property in row) {
                return row[property] === value
            }

            return false;
        });

        if (depth >= maxDepth) {
            for (const item of items) {
                this._computes(item);
            }

            return items;
        }

        for (const item of items) {
            for (const bind of this.binds) {
                if (!item) {
                    continue;
                }
    
                const table = LocalDB[bind.otherTable] as AbstractCSVDB<any>;
    
                if (bind.type === "oneToMany") {

                    const founds = table.data.filter((row) => item !== row && row[bind.otherTableCol] === item[bind.col]).map((row) => table.data.findIndex(row));
                    item[bind.propertyName] = founds.map((row) => table.getByIdx(row, maxDepth, depth + 1));
    
                } else if (bind.type === "oneToOne") {
    
    
                    const found = table.data.findIndex((row) => row[bind.otherTableCol] === item[bind.col]);
                    if (found !== -1) {
                        item[bind.propertyName] = table.getByIdx(found, maxDepth, depth + 1);
                    }
    
                }
            }
        }

        for (const item of items) {
            this._computes(item);
        }

        return items;
    }

    public getFirstByProperty(property: string, value: any, maxDepth: number = MAX_DEPTH, depth: number = 0): T {
        const item = this.data.find((row) => {
            if (property in row) {
                return row[property] === value;
            }

            return false;
        });

        if (depth >= maxDepth) {
            this._computes(item);

            return item;
        }

        for (const bind of this.binds) {
            if (!item) {
                continue;
            }

            const otherTable = LocalDB[bind.otherTable] as AbstractCSVDB<any>;

            if (bind.type === "oneToMany") {

                const founds = otherTable.data
                    .reduce<Array<number>>((prev, curr, i) => {
                        if (curr === item) {
                            return prev;
                        }

                        if (curr[bind.otherTableCol] === item[bind.col]) {
                            return [...prev, i];
                        }

                        return prev;
                    }, []);

                item[bind.propertyName] = founds.map((row) => otherTable.getByIdx(row, maxDepth, depth + 1));

            } else if (bind.type === "oneToOne") {


                const found = otherTable.data.findIndex((row) => row[bind.otherTableCol] === item[bind.col]);
                if (found !== -1) {
                    item[bind.propertyName] = otherTable.getByIdx(found, maxDepth, depth + 1);
                }

            }
        }

        this._computes(item);
        return item;
    }
}
