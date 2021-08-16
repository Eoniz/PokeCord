import fb from "../../../infrastructure/firebase/index";

type Pokeball = (
    "pokeball"
    | "greatball"
    | "ultraball"
    | "masterball"
);

export type FbItem = {
    id: number;
    amount: number;
}

export type FbInventory = {
    pokedollars: number;
    items: FbItem[];
}

export class Item {
    protected static items: Item[] = [];

    public id: number;
    public name: string;
    public emoji: string;
    public price: number;

    constructor (id: number) {
        this.id = id;

        this._register();
    }

    private _register() {
        Item.items.push(this);
    }

    public setName (name: string): Item {
        this.name = name;
        return this;
    }

    public setEmoji (emoji: string): Item {
        this.emoji = emoji;
        return this;
    }

    public setPrice (price: number): Item {
        this.price = price;
        return this;
    }

    public static getById (id: number): Item | null {
        return Item.items.find((_item) => _item.id === id);
    }

    public static getByName (name: string): Item | null {
        return Item.items.find((_item) => _item.name.toLowerCase() === name.toLowerCase());
    }

    protected static pokeball = new Item(1).setName("Pokeball").setEmoji("<:pokeball:876900179125608478>").setPrice(200);
    protected static greatball = new Item(2).setName("Greatball").setEmoji("<:greatball:876900686619607101>").setPrice(500);
    protected static ultreaball = new Item(3).setName("Ultraball").setEmoji("<:ultraball:876900686674145321>").setPrice(1500);
    protected static masterball = new Item(4).setName("Masterball").setEmoji("<:masterball:876900687039066112>").setPrice(100000);
}

export type InventoryItem = {
    item: Item;
    amount: number;
}

export class Inventory {
    public pokedollars: number;
    public items: InventoryItem[];

    constructor (pokedollars: number, items: InventoryItem[]) {
        this.pokedollars = pokedollars;
        this.items = [...items];
    }

    public countBalls (): Record<Pokeball, number> {
        const counter: Record<Pokeball, number> = {
            "greatball": 0,
            "masterball": 0,
            "pokeball": 0,
            "ultraball": 0
        };

        const names: Array<Pokeball | string> = ["greatball", "masterball", "pokeball", "ultraball"];

        for (const item of this.items) {
            if (names.includes(item.item.name.toLowerCase())) {
                counter[item.item.name.toLowerCase() as Pokeball] = item.amount;
            }
        }

        return counter;
    }
}

class InventoryService {
    private static _generateDefaultInventory(): FbInventory {
        return {
            items: [],
            pokedollars: 500
        }
    }

    private static _generateFromFbDTO (inventory: FbInventory): Inventory {
        const inv = new Inventory(
            inventory.pokedollars,
            inventory.items
                .map((_item) => {
                    const item = Item.getById(_item.id);
                    if (!item) {
                        return undefined;
                    }

                    return {
                        amount: _item.amount,
                        item: item
                    };
                })
                .filter((_item) => _item !== undefined)
        );

        return inv;
    }

    public static async getFbInventoryById (userId: string): Promise<FbInventory> {
        const inventory = await fb.inventoriesCollections.doc(userId).get();

        if (!inventory.exists) {
            const newInventory: FbInventory = InventoryService._generateDefaultInventory();
            await fb.inventoriesCollections.doc(userId).set(newInventory);
            return newInventory;
        }

        return inventory.data() as FbInventory;
    }

    public static async getById(userId: string): Promise<Inventory> {
        const inventory = await InventoryService.getFbInventoryById(userId);

        return InventoryService._generateFromFbDTO(inventory);
    }

    public static async buyItem (userId: string, itemId: number, amount: number): Promise<boolean> {
        const inventory = await InventoryService.getFbInventoryById(userId);
        
        const item = Item.getById(itemId);
        if (!item) {
            return false;
        }

        const nextInventory: FbInventory = {
            items: [...inventory.items],
            pokedollars: inventory.pokedollars
        };

        const itemIdx = inventory.items.findIndex((_item) => _item.id === itemId);
        if (itemIdx !== -1) {
            nextInventory.items[itemIdx] = {
                ...nextInventory.items[itemIdx],
                amount: nextInventory.items[itemIdx].amount += amount
            };
        } else {
            nextInventory.items.push({
                id: itemId,
                amount: amount
            });
        }

        nextInventory.pokedollars = nextInventory.pokedollars - (item.price * amount);

        await fb.inventoriesCollections.doc(userId).update(nextInventory);

        return true;
    }
}

export default InventoryService;
