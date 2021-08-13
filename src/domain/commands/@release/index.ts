import { ICommand } from "../../../infrastructure/types/commands/commands.types";
import MessagesService from '../../services/message';
import UserService from '../../services/users';

const release: ICommand = {
    name: "release",
    description: "Release your pokemons(s). Usage `p!release <id> <id?> <id?>`",
    execute: async (message, args) => {
        const user = await UserService.getById(message.author.id);
        if (!user) {
            message.reply("You haven't started yet. Type `p!start` !");
            return;
        }

        const ids: number[] = [];
        for (const arg of args) {
            try {
                const id = Number.parseInt(arg);
                ids.push(id);
            } catch (e) { continue; }
        }

        await UserService.releasePokemons(message.author.id, ids);

        MessagesService.replyTo(message.author, "Your pokemons are now release :blush: !");
    }
}

export default release;
