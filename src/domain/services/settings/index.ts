import fb from "../../../infrastructure/firebase"

export type DiscordSettings = {
    channel: string | null;
}

class SettingsService {
    static async setDiscordChannelOutput (id: string): Promise<boolean> {
        const discordSettings = await fb.settingsCollections.doc("discord").get();

        if (!discordSettings.exists) {
            const data: DiscordSettings = {
                channel: null
            };

            await fb.settingsCollections.doc("discord").set(data);
        }

        await fb.settingsCollections.doc("discord").update({ channel: id });
        
        return true;
    }

    static async getDiscordChannelOutput (): Promise<string | null> {
        const discordSettings = await fb.settingsCollections.doc("discord").get();

        if (!discordSettings.exists) {
            return null;
        }

        return (discordSettings.data() as DiscordSettings).channel;
    }
}

export default SettingsService;
