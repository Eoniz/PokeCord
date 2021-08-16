import Discord from 'discord.js';
import { ICommand } from "../../../infrastructure/types/commands/commands.types";
import UserService from '../../services/users';
import InventoryService from '../../services/inventory';
import { formatToFinance} from '../../../infrastructure/utils/math';

const Inventory: ICommand = {
    name: "inventory",
    description: "Show your inventory",
    execute: async (message, args) => {
        const user = await UserService.getById(message.author.id);
        if (!user) {
            message.reply("You haven't started yet. Type `p!start` !");
            return;
        }

        const inventory = await InventoryService.getById(message.author.id);
        const balls = inventory.countBalls();

        const lines: string[] = [];

        lines.push(`**${message.author.username}'s PokeDollars:** ${formatToFinance(inventory.pokedollars)}$`);
        lines.push("");
        
        lines.push("**═════════ Balls ═════════**");
        lines.push(`\`${balls.pokeball}\` <:pokeball:876900179125608478> \`Pokeball\``);
        lines.push(`\`${balls.greatball}\` <:greatball:876900686619607101> \`Greatball\``);
        lines.push(`\`${balls.ultraball}\` <:ultraball:876900686674145321> \`Ultraball\``);
        lines.push(`\`${balls.masterball}\` <:masterball:876900687039066112> \`Masterball\``);
        lines.push("");

        lines.push("**═════════ Items ═════════**");
        lines.push("`no items yet.`");
        lines.push("");

        const embed = new Discord.MessageEmbed()
            .setTitle("Inventory")
            .setAuthor("Professor Oak", "https://cdn.costumewall.com/wp-content/uploads/2017/02/professor-oak.jpg")
            .setColor("#ff0000")
            .setDescription(lines.join('\n'));

        message.channel.send({ embed: embed });
    }
}

export default Inventory;
