import dotenv from "dotenv";

const loadConfig = () => {
    dotenv.config();

    return {
        discord: {
            "token": process.env.DISCORD_TOKEN,
            "prefix": process.env.DISCORD_PREFIX
        },
        fb: {
            apiKey: process.env["FIREBASE_API_KEY"],
            authDomain: process.env["FIREBASE_AUTH_DOMAIN"],
            databaseURL: process.env["FIREBASE_DATABASE_URL"],
            projectId: process.env["FIREBASE_PROJECT_ID"],
            storageBucket: process.env["FIREBASE_STORAGE_BUCKET"],
            messagingSenderId: process.env["FIREBASE_MESSAGING_SENDER_ID"],
            appId: process.env["FIREBASE_APP_ID"],
            measurementId: process.env["FIREBASE_MEASUREMENT_ID"]
        },
        game: {
            timeBetweenXp: Number.parseInt(process.env["GAME_TIME_BETWEEN_XP"], 10) || 60,
            resetWildFightAfter: Number.parseInt(process.env["GAME_RESET_WILD_FIGHT_AFTER"], 10) || 600,
            chanceToSpawnWildPokemon: Number.parseFloat(process.env["GAME_CHANCE_TO_SPAWN_WILD_POKEMON"]) || 50.0,
        }
    }
};

const config = loadConfig();
export default config;
