# PokéCord

My own implementation of https://pokecord.xyz/

## Getting Started

Create a .venv file containing all of these informations

```
DISCORD_TOKEN="<your token>"
DISCORD_PREFIX="<your prefix>"

FIREBASE_API_KEY="<your firebase api key>"
FIREBASE_AUTH_DOMAIN="<your firebase auth domain>"
FIREBASE_DATABASE_URL="<your firebase database url>"
FIREBASE_PROJECT_ID="<your firebase project id>"
FIREBASE_STORAGE_BUCKET="<your firebase storage bucket>"
FIREBASE_MESSAGING_SENDER_ID="<your firebase message sender id>"
FIREBASE_APP_ID="<your firebase app id>"
FIREBASE_MEASUREMENT_ID="<your firebase measurement id>"

GAME_TIME_BETWEEN_XP=<int ; in seconds ; default 60>
GAME_CHANCE_TO_SPAWN_WILD_POKEMON="<float ; between 0 and 100 ; default 5.0>"
GAME_RESET_WILD_FIGHT_AFTER=<int ; in seconds ; default 600>
GAME_XP_MIN_PER_MESSAGE=<int ; default 10>
GAME_XP_MAX_PER_MESSAGE=<int ; default 30>
```

Then, you can type
```shell
npm i
```

Finally
```shell
npm start
```

And voila, you're done !
