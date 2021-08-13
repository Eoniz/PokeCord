import LRU_CACHE from 'lru-cache';
import fb from "../../../infrastructure/firebase"

export type DiscordSettings = {
    channel: string | null;
}

class SettingsService {
    private static _cache = new LRU_CACHE<string, DiscordSettings>({
        max: 150,
        maxAge: 1000*60*60
    });

    static async setDiscordChannelOutput (id: string): Promise<boolean> {
        const discordSettings = await fb.settingsCollections.doc("discord").get();

        if (!discordSettings.exists) {
            const data: DiscordSettings = {
                channel: null
            };

            await fb.settingsCollections.doc("discord").set(data);
        }

        SettingsService._cache.del("discord");
        await fb.settingsCollections.doc("discord").update({ channel: id });
        
        return true;
    }

    static async getDiscordChannelOutput (): Promise<string | null> {
        const cachedSettings = SettingsService._cache.get("discord");

        if (cachedSettings !== undefined) {
            return cachedSettings.channel;
        }

        const discordSettings = await fb.settingsCollections.doc("discord").get();

        if (!discordSettings.exists) {
            return null;
        }

        SettingsService._cache.set("discord", discordSettings.data() as DiscordSettings);
        return (discordSettings.data() as DiscordSettings).channel;
    }
}

export default SettingsService;
