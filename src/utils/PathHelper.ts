import path from "path";
import { fileURLToPath } from "url";
export abstract class PathHelper {

    public static getRootDir(): string {
        let dir: string;
        try {
            // CommonJS way
            dir = __dirname;
        } catch (e) {
            // nope, using ESM way
            dir = path.dirname(fileURLToPath(import.meta.url));
        }
        // we need to go up one level
        // because we are at /root/dist/
        return path.join(dir, "../");
    }

    public static getAssetsDir(): string {
        const root = this.getRootDir();
        return path.join(root, "./assets");
    }

    public static getImagesDir(): string {
        const root = this.getRootDir();
        return path.join(root, "./assets/images");
    }

    public static getFontsDir(): string {
        const root = this.getRootDir();
        return path.join(root, "./assets/fonts");
    }

    public static getModPath(mod: string): string {
        return path.join(this.getImagesDir(), "mods", `${mod}.png`);
    }

    public static getRankPath(rank: string): string {
        return path.join(this.getImagesDir(), "ranks", `${rank}.png`);
    }


}