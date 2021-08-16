import Canvas from "canvas";
import LRU_CACHE from 'lru-cache';

const _imgCache = new LRU_CACHE<string, Canvas.Image>({
    max: 150,
    maxAge: 1000*60*60
});

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

    const canvas = Canvas.createCanvas(600, 400);
    const context = canvas.getContext('2d');

    context.fillStyle = "#0E0E0E"
    context.fillRect(0, 0, canvas.width, canvas.height);

    const pokemonUrlsPromises: Promise<Canvas.Image>[] = urls.map((_url) => {
        return getOrLoadImg(_url);
    });

    const pokemonImgs = await Promise.all(pokemonUrlsPromises);
    
    for (let i = 0; i < urls.length; i++) {
        const x = i % 3;
        const y = Math.floor(i / 3);

        const img = pokemonImgs[i];
        context.drawImage(img, x * 200, y * 200, 200, 200);
    }

    return canvas;
}

export const generateEvolutionImg = async (urls: string[]) => {
    if (urls.length > 6) {
        urls = urls.slice(0, 6);
    }

    const canvas = Canvas.createCanvas(600, 300);
    const context = canvas.getContext('2d');

    context.fillStyle = "#0E0E0E"
    context.fillRect(0, 0, canvas.width, canvas.height);

    const pokemonUrlsPromises: Promise<Canvas.Image>[] = urls.map((_url) => {
        return getOrLoadImg(_url);
    });

    const pokemonImgs = await Promise.all(pokemonUrlsPromises);
    
    for (let i = 0; i < urls.length; i++) {
        const x = i * 300;
        const y = 0

        const img = pokemonImgs[i];
        context.drawImage(img, x, y, 300, 300);
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