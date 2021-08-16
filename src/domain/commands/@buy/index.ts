import { ICommand } from "../../../infrastructure/types/commands/commands.types";
import UserService from '../../services/users';
import InventoryService, { Item } from '../../services/inventory';
import config from '../../../infrastructure/config/index';
import { capitalize } from '../../../infrastructure/utils/string';
import { formatToFinance } from '../../../infrastructure/utils/math';

const Buy: ICommand = {
    name: "buy",
    description: "Buy shop items",
    execute: async (message, args) => {
        const user = await UserService.getById(message.author.id);
        if (!user) {
            message.reply("You haven't started yet. Type `p!start` !");
            return;
        }

        if (args.length !== 2) {
            message.reply(`Bad usage: \`${config.discord.prefix}buy <item name> <amount>\``);
            return;
        }

        const itemName = args[0];
        let amount = 0;
        try {
            amount = Number.parseInt(args[1], 10);
        } catch (e) {
            message.reply(`Bad usage: \`${config.discord.prefix}buy <item name> <amount>\``);
            return;
        }

        const item = Item.getByName(itemName);
        if (!item) {
            message.reply(`Item with name \`${itemName}\` does not exist.`);
            return;
        }

        const inventory = await InventoryService.getById(message.author.id);

        const totalPrice = item.price * amount;

        if (inventory.pokedollars < totalPrice) {
            message.reply(`Not enough PokeDollars to buy ${amount > 1 ? "these" : "this"} item${amount > 1 ? "s" : ""} : **${formatToFinance(inventory.pokedollars)}/${formatToFinance(totalPrice)}$** required.`);
            return;
        }

        const success = await InventoryService.buyItem(message.author.id, item.id, amount);

        if (!success) {
            message.reply("Unexpected error. Try again later.");
            return;
        }

        message.reply(`You bought ${amount} ${capitalize(item.name)} ${item.emoji}.`);

        /*
        const lines: string[] = [];

        lines.push(`**${message.author.username}'s PokeCoins:** ${inventory.pokedollars}$`);
        lines.push("");
        
        lines.push("**═════════ Balls ═════════**");
        lines.push("`1` <:pokeball:876900179125608478> `Pokeball--------------200$`");
        lines.push("`1` <:greatball:876900686619607101> `Greatball-------------200$`");
        lines.push("`1` <:ultraball:876900686674145321> `Ultraball-------------200$`");
        lines.push("`1` <:masterball:876900687039066112> `Masterball------------200$`");
        lines.push("");

        lines.push("**═════════ Items ═════════**");
        lines.push("`no items yet.`");
        lines.push("");

        lines.push("**══════ To Buy an Item ══════**");
        lines.push(`\`${config.discord.prefix}buy <item name> <amount>\``)
        

        const embed = new Discord.MessageEmbed()
            .setTitle("Test")
            .setAuthor("Professor Oak", "https://cdn.costumewall.com/wp-content/uploads/2017/02/professor-oak.jpg")
            .setColor("#ff0000")
            .setDescription(lines.join('\n'));

        message.channel.send({ embed: embed });
        */
    }
}

export default Buy;
