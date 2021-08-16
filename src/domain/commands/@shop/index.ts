import Discord from 'discord.js';
import { ICommand } from "../../../infrastructure/types/commands/commands.types";
import UserService from '../../services/users';
import InventoryService from '../../services/inventory';
import config from '../../../infrastructure/config/index';
import { formatToFinance } from '../../../infrastructure/utils/math';

const Shop: ICommand = {
    name: "shop",
    description: "Print shop informations",
    execute: async (message, args) => {
        const user = await UserService.getById(message.author.id);
        if (!user) {
            message.reply("You haven't started yet. Type `p!start` !");
            return;
        }

        const inventory = await InventoryService.getById(message.author.id);

        const lines: string[] = [];

        lines.push(`**${message.author.username}'s PokeDollars:** ${formatToFinance(inventory.pokedollars)}$`);
        lines.push("");
        
        lines.push("**═════════ Balls ═════════**");
        lines.push("`1` <:pokeball:876900179125608478> `Pokeball--------------200$`");
        lines.push("`1` <:greatball:876900686619607101> `Greatball-------------500$`");
        lines.push("`1` <:ultraball:876900686674145321> `Ultraball-----------1,500$`");
        lines.push("`1` <:masterball:876900687039066112> `Masterball--------100,000$`");
        lines.push("");

        lines.push("**═════════ Items ═════════**");
        lines.push("`no items yet.`");
        lines.push("");

        lines.push("**══════ To Buy an Item ══════**");
        lines.push(`\`${config.discord.prefix}buy <item name> <amount>\``)
        

        const embed = new Discord.MessageEmbed()
            .setTitle("Shop")
            .setAuthor("Professor Oak", "https://cdn.costumewall.com/wp-content/uploads/2017/02/professor-oak.jpg")
            .setColor("#ff0000")
            .setDescription(lines.join('\n'));

        message.channel.send({ embed: embed });
    }
}

export default Shop;
