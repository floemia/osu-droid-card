import { getAverageColor } from "fast-average-color-node";

export abstract class ColorHelper {
    static async getAccentColor(url: string | Buffer) {
        try {
            return (await getAverageColor(url)).hex;
        } catch (error) {
            return "#ffffff"
        }
    }

    static toReadableColor(color: string, intensity: number = 0.75): string {
        let hex = color.replace(/^#/, '');
        intensity = Math.max(0, Math.min(1, intensity));

        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }

        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const mix = (c: number) => Math.round(255 - (255 - c) * (1 - intensity));
        const r2 = mix(r);
        const g2 = mix(g);
        const b2 = mix(b);

        return `#${[r2, g2, b2].map(x => x.toString(16).padStart(2, '0')).join('')}`;
    }

    static isDark(hex: string): boolean {
        hex = hex.replace(/^#/, '');
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return luminance < 150;
    }

    static adjustBrightness(hex: string, amount: number): string {
        let red = parseInt(hex.substring(1, 3), 16);
        let green = parseInt(hex.substring(3, 5), 16);
        let blue = parseInt(hex.substring(5, 7), 16);

        let r = Math.min(255, red + amount);
        let g = Math.min(255, green + amount);
        let b = Math.min(255, blue + amount);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}