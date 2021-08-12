import config from "../../../infrastructure/config";
import { ICommand } from "../../../infrastructure/types/commands/commands.types";

const admin: ICommand = {
    name: "admin",
    description: "Admin commands",
    execute: async (message, args, kwargs) => {
        message.reply(`Type \`${config.discord.prefix}help\` for relative commands.`);
    }
}

export default admin;