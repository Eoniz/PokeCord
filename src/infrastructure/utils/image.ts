import Canvas from "canvas";
import LRU_CACHE from 'lru-cache';
import { MAX_POKEMON_ID } from "../../domain/factories/pokemon/index";

const _imgCache = new LRU_CACHE<string, Canvas.Image>({
    max: MAX_POKEMON_ID,
    maxAge: 1000*60*60
});

const getNormalizedId = (id: number): string => {
    if (id < 10) {
        return `00${id}`;
    } else if (id >= 10 && id < 100) {
        return `0${id}`;
    }

    return id.toString();
}

export const getPokedexImgPathById = (id: number): string => {
    const normalizedId = getNormalizedId(id);
    return `./build/img/pokedex/${normalizedId}.png`;
}

export const getPokemonImgPathById = (id: number): string => {
    const normalizedId = getNormalizedId(id);
    return `./build/img/sprites/${normalizedId}.png`;
}


export const getPokedexImgById = async (id: number): Promise<Canvas.Image> => {
    const normalizedId = getNormalizedId(id);
    return await getOrLoadImg(`./build/img/pokedex/${normalizedId}.png`);
}

export const getPokemonImgById = async (id: number): Promise<Canvas.Image> => {
    const normalizedId = getNormalizedId(id);
    return await getOrLoadImg(`./build/img/sprites/${normalizedId}.png`);
}

const getOrLoadImg = async (path: string): Promise<Canvas.Image> => {
    const cachedImg = _imgCache.get(path);
    if (cachedImg !== undefined) {
        return cachedImg;
    }

    const img = await Canvas.loadImage(path);
    _imgCache.set(path, img);

    return img;
}

export const generateTeamImg = async (urls: string[]) => {
    if (urls.length > 6) {
        urls = urls.slice(0, 6);
    }

    const IMG_WIDTH = 120;
    const IMG_HEIGHT = 120;

    const COLUMNS = 3;
    const ROWS = 2;

    const WIDTH = IMG_WIDTH * COLUMNS;
    const HEIGHT = IMG_HEIGHT * ROWS;

    const canvas = Canvas.createCanvas(WIDTH, HEIGHT);
    const context = canvas.getContext('2d');

    context.fillStyle = "#383838"
    context.fillRect(0, 0, canvas.width, canvas.height);

    const pokemonUrlsPromises: Promise<Canvas.Image>[] = urls.map((_url) => {
        return getOrLoadImg(_url);
    });

    const pokemonImgs = await Promise.all(pokemonUrlsPromises);
    
    for (let i = 0; i < urls.length; i++) {
        const x = i % 3;
        const y = Math.floor(i / 3);

        const img = pokemonImgs[i];
        context.drawImage(img, x * IMG_WIDTH, y * IMG_HEIGHT, IMG_WIDTH, IMG_HEIGHT);
    }

    return canvas;
}

export const generateEvolutionImg = async (urls: string[]) => {
    if (urls.length > 6) {
        urls = urls.slice(0, 6);
    }

    const IMG_WIDTH = 120;
    const IMG_HEIGHT = 120;

    const COLUMNS = 2;
    const ROWS = 1;

    const WIDTH = IMG_WIDTH * COLUMNS;
    const HEIGHT = IMG_HEIGHT * ROWS;

    const canvas = Canvas.createCanvas(WIDTH, HEIGHT);
    const context = canvas.getContext('2d');

    context.fillStyle = "#383838"
    context.fillRect(0, 0, canvas.width, canvas.height);

    const pokemonUrlsPromises: Promise<Canvas.Image>[] = urls.map((_url) => {
        return getOrLoadImg(_url);
    });

    const pokemonImgs = await Promise.all(pokemonUrlsPromises);
    
    for (let i = 0; i < urls.length; i++) {
        const x = i * IMG_WIDTH;
        const y = 0

        const img = pokemonImgs[i];
        context.drawImage(img, x, y, IMG_WIDTH, IMG_HEIGHT);
    }

    return canvas;
}

export const generatePCImg = async (pcInfos: Array<{url: string, id: number}>) => {
    if (pcInfos.length > 25) {
        pcInfos = pcInfos.slice(0, 25);
    }

    // IMG WIDTH = IMG HEIGHT = 32
    const GIF_WIDTH = 32;
    const GIF_HEIGHT = GIF_WIDTH;

    const MAX_PER_ROW = 5;
    const SCALE = 2;

    const WIDTH = MAX_PER_ROW * GIF_WIDTH;
    const HEIGHT = Math.ceil(pcInfos.length / MAX_PER_ROW) * GIF_HEIGHT;

    const canvas = Canvas.createCanvas(WIDTH * SCALE, HEIGHT * SCALE);
    const context = canvas.getContext('2d');

    context.fillStyle = "#383838"
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = false;
    context.scale(SCALE, SCALE);

    const pokemonUrlsPromises: Promise<Canvas.Image>[] = pcInfos.map((meta) => {
        return getOrLoadImg(meta.url);
    });

    const pokemonImgs = await Promise.all(pokemonUrlsPromises);
    
    context.fillStyle = "#FFFFFF"
    context.font = "12px arial"
    for (let i = 0; i < pcInfos.length; i++) {
        const x = i % MAX_PER_ROW;
        const y = Math.floor(i / MAX_PER_ROW);

        const meta = pcInfos[i];
        const img = pokemonImgs[i];
        context.drawImage(img, x * GIF_WIDTH, y * GIF_HEIGHT, GIF_WIDTH, GIF_HEIGHT);
        context.fillText(meta.id.toString(), x * GIF_WIDTH, (y + 1) * GIF_HEIGHT);
    }

    return canvas;
}

export const generateInfoImg = async (activePokemonId: number) => {
    // IMG WIDTH = IMG HEIGHT = 32
    const IMG_WIDTH = 120;
    const IMG_HEIGHT = 120;

    const SCALE = 1.0;

    const WIDTH = IMG_WIDTH;
    const HEIGHT = IMG_HEIGHT;

    const canvas = Canvas.createCanvas(WIDTH * SCALE, HEIGHT * SCALE);
    const context = canvas.getContext('2d');

    context.fillStyle = "#383838"
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.scale(SCALE, SCALE);

    const img = await getOrLoadImg(getPokemonImgPathById(activePokemonId));

    context.drawImage(img, 0, 0, IMG_WIDTH, IMG_HEIGHT);

    return canvas;
}

export const generatePokemonImg = async (id: number) => {
    // IMG WIDTH = IMG HEIGHT = 32
    const IMG_WIDTH = 120;
    const IMG_HEIGHT = 120;

    const SCALE = 1.0;

    const WIDTH = IMG_WIDTH;
    const HEIGHT = IMG_HEIGHT;

    const canvas = Canvas.createCanvas(WIDTH * SCALE, HEIGHT * SCALE);
    const context = canvas.getContext('2d');

    context.fillStyle = "#383838"
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.scale(SCALE, SCALE);

    const img = await getOrLoadImg(getPokemonImgPathById(id));

    context.drawImage(img, 0, 0, IMG_WIDTH, IMG_HEIGHT);

    return canvas;
}