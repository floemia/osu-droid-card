import { PathHelper } from "~/utils";

const width = 1300;
const height = 720;
const baseStartx = 70;
const baseStarty = 40;
const pfp_size = 226;
const outerMargin = 20;
const rectStarty = height / 2.35;
const infoMidPoint = (baseStartx + width / 2) / 2 - outerMargin * 2.5;
export const mt = {
    outerMargin: outerMargin,
    rad: 30,
    w: width,
    h: height,
    pfp: {
        size: pfp_size,
        x: baseStartx,
        y: baseStarty
    },
    name: {
        x: baseStartx + pfp_size + 30,
        y: baseStarty + pfp_size / 4 + 10
    },
    server: {
        x: baseStartx + pfp_size + 30,
        y: baseStarty + pfp_size * (3 / 4) - 10
    },
    rank: {
        x: baseStartx,
        y: rectStarty + baseStarty,
        w: 561,
        h: 99,
        text: {
            x: baseStartx + pfp_size / 2,
            y: rectStarty + baseStarty + 93 / 2,
        }
    },
    rect: {
        x: outerMargin,
        y: rectStarty,
        height: height - rectStarty - outerMargin,
        width: width - outerMargin * 2,
    },
    pp: {
        x: (infoMidPoint + width / 2) / 2 - outerMargin / 2,
        y: rectStarty + baseStarty + 93 / 2
    },
    stats: {
        x: baseStartx + pfp_size + outerMargin,
        y: height - outerMargin - baseStarty + 5
    },
    level: {
        x: baseStartx + pfp_size / 2,
        y: height - outerMargin - baseStarty * 4 + 5,
        w: 200,
        h: 20
    },
    mods: {
        x: baseStartx + pfp_size / 2,
        y: height - outerMargin - baseStarty - 57,
        w: 200,
        h: 57,
        icon: {
            w: 56,
            y: height - outerMargin - baseStarty - 57 / 2 - 20,
        }
    },
    score: {
        x: width / 2 + outerMargin,
        y: rectStarty + baseStarty,
        w: 570,
        h: 100,
        rank: {
            x: 693,
            y: 362
        }
    }
}

export const filepath = {
    bg: PathHelper.getImagesDir() + "/background/bg.png",
    beatmap_bg: PathHelper.getImagesDir() + "/background/default-bg@2xpng",
    top_bg: PathHelper.getImagesDir() + "/background/top-bg.png",
    rx_logo: PathHelper.getImagesDir() + "/rx.png",
    ibancho_logo: PathHelper.getImagesDir() + "/ibancho.png",
    ranks: PathHelper.getImagesDir() + "/ranks",
}
export const bg_color = "#22222288";