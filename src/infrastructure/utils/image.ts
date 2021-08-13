import Canvas from "canvas";

export const generateTeamImg = async (urls: string[]) => {
    if (urls.length > 6) {
        urls = urls.slice(0, 6);
    }

    const canvas = Canvas.createCanvas(600, 400);
    const context = canvas.getContext('2d');

    context.fillStyle = "#0E0E0E"
    context.fillRect(0, 0, canvas.width, canvas.height);

    const pokemonUrlsPromises: Promise<Canvas.Image>[] = urls.map((_url) => {
        return Canvas.loadImage(_url);
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
        return Canvas.loadImage(_url);
    });

    const pokemonImgs = await Promise.all(pokemonUrlsPromises);
    
    for (let i = 0; i < urls.length; i++) {
        const x = i * 200;
        const y = 0

        const img = pokemonImgs[i];
        context.drawImage(img, x, y, 300, 300);
    }

    return canvas;
}