import { Canvas, createCanvas, Image, SKRSContext2D } from "@napi-rs/canvas";

export abstract class CanvasHelper {
    static drawRoundedImage(ctx: SKRSContext2D, image: Image | Canvas, x: number, y: number, width: number, height: number, radius: number | DOMPointInit | (number | DOMPointInit)[]) {
        ctx.save();
        ctx.fillStyle = "transparent";
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
        ctx.fill();
        ctx.clip();
        ctx.drawImage(image, x, y, width, height);
        ctx.restore();
    }

    static blurRoundedRegion(ctx: SKRSContext2D, x: number, y: number, width: number, height: number, radius: number | DOMPointInit | (number | DOMPointInit)[], blur: number) {
        const offCanvas = createCanvas(width, height);
        const offCtx = offCanvas.getContext('2d');

        const imageData = ctx.getImageData(x, y, width, height);
        offCtx.putImageData(imageData, 0, 0);
        offCtx.filter = `blur(${blur}px)`;

        const blurredCanvas = createCanvas(width, height);
        const blurredCtx = blurredCanvas.getContext('2d')!;
        blurredCtx.filter = `blur(${blur}px)`;
        blurredCtx.drawImage(offCanvas, 0, 0);

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
        ctx.clip();
        ctx.drawImage(blurredCanvas, x, y);
        ctx.restore();
    }
    static getFlagURL(countryCode: string): string {
        const codePoints = countryCode
            .toLowerCase()
            .split('')
            .map(char => 0x1F1E6 + char.charCodeAt(0) - 97);

        const file_name = codePoints.map(cp => cp.toString(16)).join('-');
        return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/${file_name}.png`
    }

    static resizeImageToWidth(image: Image | Canvas, targetWidth: number): Canvas {
        const aspectRatio = image.width / image.height;
        const targetHeight = targetWidth / aspectRatio;

        let currentCanvas = createCanvas(image.width, image.height);
        let ctx = currentCanvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        // we do it like that because the image gets too
        // aliased when downscaling without steps
        while (currentCanvas.width * 0.8 > targetWidth) {
            const tempCanvas = createCanvas(currentCanvas.width * 0.5, currentCanvas.height * 0.5);
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = 'high';
            tempCtx.drawImage(currentCanvas, 0, 0, tempCanvas.width, tempCanvas.height);
            currentCanvas = tempCanvas;
        }

        const finalCanvas = createCanvas(targetWidth, targetHeight);
        const finalCtx = finalCanvas.getContext('2d');
        finalCtx.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight);

        return finalCanvas;
    }


    static blurImage(image: Image | Canvas, radius: number): Canvas {
        const width = image.width;
        const height = image.height;
        const canvas = createCanvas(width - radius * 2, height - radius * 2);
        const ctx = canvas.getContext("2d");

        const temp_canvas = createCanvas(width, height);
        const temp_ctx = temp_canvas.getContext("2d");
        temp_ctx.filter = `blur(${radius}px)`;
        temp_ctx.drawImage(image, 0, 0, width, height);
        ctx.drawImage(temp_canvas, radius, radius, width - radius * 2, height - radius * 2, 0, 0, width - radius * 2, height - radius * 2);

        return canvas;
    }

    static roundFillRect(ctx: SKRSContext2D, x: number, y: number, width: number, height: number, radius: number | DOMPointInit | (number | DOMPointInit)[], fillStyle?: string | CanvasGradient | CanvasPattern) {
        ctx.save();
        ctx.beginPath();
        if (fillStyle) ctx.fillStyle = fillStyle;
        ctx.roundRect(x, y, width, height, radius);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    static cropImage(image: Image | Canvas, x: number, y: number, width: number, height: number): Canvas {
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
        return canvas;
    }

    static tintImage(image: Image | Canvas, fillStyle: string): Canvas {
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, image.width, image.height);
        ctx.fillStyle = fillStyle;
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillRect(0, 0, image.width, image.height);
        ctx.globalCompositeOperation = "source-over";
        return canvas;
    }
}