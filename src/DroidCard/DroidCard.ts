import { DroidBanchoUser, DroidRXUser, DroidUser } from "miko-modules";
import { PathHelper } from "~/utils/PathHelper";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import { mt, filepath, bg_color } from "~/constants";
import { CanvasHelper, ColorHelper, DroidHelper, NumberHelper, TimeHelper } from "~/utils";
import { MapInfo } from "@rian8337/osu-base";
export abstract class DroidCard {

    public static async create(user: DroidUser) {
        // As DroidUser is the base class for iBancho and RX users, 
        // we check the type of the user to determine behaviour
        const rx = user instanceof DroidRXUser;
        return await this.getCardBuffer(user, rx);
    }

    private static async getCardBuffer(user: DroidUser, rx: boolean): Promise<Buffer> {
        // import paths and font
        const font_dir = PathHelper.getFontsDir();
        const img_dir = PathHelper.getImagesDir();
        GlobalFonts.registerFromPath(font_dir + `/SF-Pro-Display-Bold.otf`, "SFBold");


        const server = {
            name: rx ? "osudroid!rx" : "osu!droid",
            url: rx ? img_dir + "/rx.png" : img_dir + "/ibancho.png"
        }

        // create canvas, get context and clip everything
        // to the rounded rect for cool rounded corners
        const canvas = createCanvas(mt.w, mt.h);
        const ctx = canvas.getContext("2d");
        ctx.roundRect(0, 0, mt.w, mt.h, mt.rad * 3);
        ctx.clip();

        // get color accent
        let accent = user.color;
        while (ColorHelper.isDark(accent)) {
            accent = ColorHelper.adjustBrightness(accent, 5);
        }
        const scores = await (rx ? user as DroidRXUser : user as DroidBanchoUser).scores.top();

        // draw bg
        let bg = CanvasHelper.resizeImageToWidth(await loadImage(filepath.bg), mt.w);
        ctx.drawImage(bg, 0, 0);
        const bg_gradient = ctx.createLinearGradient(0, 0, 0, mt.h);
        bg_gradient.addColorStop(0.6, accent + "44");
        bg_gradient.addColorStop(0, "transparent");
        ctx.fillStyle = bg_gradient;
        ctx.fillRect(0, 0, mt.w, mt.h);
        // draw avatar
        const avatar = await loadImage(user.avatar_url);
        ctx.shadowBlur = 13;
        ctx.shadowColor = "rgba(0,0,0,0.75)";
        CanvasHelper.drawRoundedImage(ctx, avatar, mt.pfp.x, mt.pfp.y, mt.pfp.size, mt.pfp.size, mt.rad * 1.5);


        // draw flag
        const flag_URL = DroidHelper.getUserFlagURL(user);
        const flag = await loadImage(flag_URL);
        ctx.drawImage(flag, mt.name.x, mt.name.y - flag.height / 2, flag.width, flag.height);
        mt.name.x += flag.width + 20;

        // draw server logo
        const server_logo = CanvasHelper.resizeImageToWidth(await loadImage(server.url), 72);
        CanvasHelper.drawRoundedImage(ctx, server_logo, mt.server.x, mt.server.y - server_logo.height / 2, server_logo.width, server_logo.height, 100);
        mt.server.x += server_logo.width + 20;

        // draw name and server
        ctx.fillStyle = accent;
        ctx.font = "56px SFBold";
        ctx.textBaseline = "middle";
        ctx.fillText(user.username, mt.name.x, mt.name.y);
        ctx.fillStyle = "#dedede";
        ctx.font = "48px SFBold";
        ctx.fillText(server.name, mt.server.x, mt.server.y);

        // place blurry rect
        ctx.shadowBlur = 0;
        CanvasHelper.blurRoundedRegion(ctx, mt.rect.x, mt.rect.y, mt.rect.width, mt.rect.height, mt.rad * 3, 10);
        CanvasHelper.roundFillRect(ctx, mt.rect.x, mt.rect.y, mt.rect.width, mt.rect.height, mt.rad * 3, "#11111160");

        ctx.shadowBlur = 13;
        // draw global and country rank
        ctx.shadowColor = accent + "40";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        CanvasHelper.roundFillRect(ctx, mt.rank.x, mt.rank.y, mt.rank.w, mt.rank.h, mt.rad, bg_color);
        const globalRank = user.stats.rank.global;
        const countryRank = user.stats.rank.country;
        const pp = NumberHelper.to2Decimal(user.stats.pp);
        const ppString = `    ${pp}${rx ? "pp" : "dpp"}`;
        let grString = `#${NumberHelper.toInt(globalRank)}`;
        ctx.font = "54px SFBold";
        let globalWidth = ctx.measureText(grString).width;
        let countryWidth = 0;
        let crString = "";
        const hasCRank = user.stats.rank.country ? true : false;
        if (user.stats.rank.country) {
            grString += "  • ";
            crString = countryRank ? `#${NumberHelper.toInt(countryRank)}` : "";
            countryWidth = ctx.measureText(crString).width;
        }
        // yeah
        let ppWidth = ctx.measureText(ppString).width;
        const gap = 10;
        let size = 54;
        const mini_flag = CanvasHelper.resizeImageToWidth(flag, flag.width / 2);

        let totalWidth = globalWidth + countryWidth + ppWidth + (hasCRank ? mini_flag.width : 0) + gap * 3;
        while (totalWidth > 480) {
            ctx.font = `${size -= 2}px SFBold`;
            globalWidth = ctx.measureText(grString).width;
            countryWidth = ctx.measureText(crString).width;
            ppWidth = ctx.measureText(ppString).width;
            totalWidth = globalWidth + countryWidth + ppWidth + (hasCRank ? mini_flag.width : 0) + gap * 3;
        }
        let x = 350 - totalWidth / 2;
        let ranks_y = 396;
        ctx.fillText(grString, x, ranks_y);
        x += globalWidth + gap;
        if (user.stats.rank.country) {
            ctx.drawImage(mini_flag, x, ranks_y - mini_flag.height / 2);
            x += mini_flag.width + gap;

            ctx.fillText(crString, x, ranks_y);
            x += countryWidth + gap;
        }

        ctx.fillStyle = accent;
        ctx.fillText(ppString, x, ranks_y);
        // draw separator
        ctx.fillStyle = accent;
        CanvasHelper.roundFillRect(ctx, 271, 481, 160, 10, mt.rad);

        // draw level
        ctx.fillStyle = accent;
        ctx.font = "22px SFBold";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        const total_score = rx ? user.stats.total_score : (user as DroidBanchoUser).stats.total_score;
        const level = DroidHelper.calculateProfileLevel(total_score);
        const level_string = `LEVEL ${Math.floor(level)}`;
        ctx.fillText(level_string, mt.level.x, mt.level.y);
        ctx.shadowColor = "rgba(0,0,0,0.75)";
        ctx.shadowBlur = 0;
        CanvasHelper.roundFillRect(ctx, mt.level.x - mt.level.w / 2, mt.level.y + 17, mt.level.w, mt.level.h, mt.rad, "#22222275");
        const fill_width = mt.level.w * (level - Math.floor(level));
        ctx.fillStyle = accent;
        ctx.shadowColor = accent + "80";
        CanvasHelper.roundFillRect(ctx, mt.level.x - mt.level.w / 2, mt.level.y + 17, fill_width, mt.level.h, mt.rad, accent);

        // draw mods container
        ctx.shadowBlur = 0;
        const mods = DroidHelper.getMostFrequentMods(scores);
        if (mods.length > 3) mods.length = 3;
        ctx.fillStyle = bg_color;
        ctx.shadowColor = "rgba(0,0,0,0.75)";
        if (mods.length < 3) mt.mods.w -= 50;
        CanvasHelper.roundFillRect(ctx, mt.mods.x - mt.mods.w / 2, mt.mods.y, mt.mods.w, mt.mods.h, mt.rad / 1.5);
        const start_y = 613;
        let start_x = 133;
        if (mods.length == 2) start_x = 126;
        else if (mods.length == 3) start_x = 96;

        for (let i = 0; i < mods.length; i++) {
            const modPath = PathHelper.getModPath(mods[i]);
            const mod = CanvasHelper.resizeImageToWidth(await loadImage(modPath), mt.mods.icon.w);
            ctx.drawImage(mod, start_x + i * 60, start_y, mod.width, mod.height);
        }

        // draw stats
        ctx.fillStyle = accent;
        ctx.shadowBlur = 13;
        const labels = ["PLAYING SINCE", "PLAYCOUNT", "TOTAL SCORE", "ACCURACY"]
        const stats: string[] = [];
        stats.push(rx ? "-" : TimeHelper.toMonthYear(new Date((user as DroidBanchoUser).registered)));
        stats.push(NumberHelper.toInt(user.stats.playcount));
        stats.push(NumberHelper.toShort(total_score));
        stats.push(NumberHelper.to2Decimal(user.stats.accuracy * 100) + "%");
        let i = 0
        for (i = 0; i < labels.length; i++) {
            ctx.shadowBlur = 13;
            ctx.fillStyle = accent;
            ctx.textAlign = "left";
            const offset = 40 * i;
            ctx.fillText(labels[i], mt.stats.x, mt.stats.y - offset);
            ctx.textAlign = "right";
            ctx.fillStyle = "#ffffff";
            ctx.shadowBlur = 0;
            ctx.fillText(stats[i], mt.w / 2 - mt.outerMargin, mt.stats.y - offset);
        }

        // draw top plays
        if (scores.length > 3) scores.length = 3;
        let y = mt.score.y;

        let title_y = 373;
        let rank_y = mt.score.rank.y;
        for (const score of scores) {
            if (!score.beatmap) score.beatmap = (await MapInfo.getInformation(score.hash))!;
            const bg_url = `https://assets.ppy.sh/beatmaps/${score.beatmap.beatmapSetId}/covers/cover.jpg`
            let bg;
            try {
                bg = await loadImage(bg_url);
            } catch {
                bg = await loadImage(filepath.bg);
            }
            const r = mt.rad
            let radius = [r, r, r, r];
            if (scores.length > 1) {
                const isFirst = score === scores[0];
                const isSecond = score === scores[1];
                if (isFirst) {
                    radius = [r, r, r / 2, r / 2];
                } else if (isSecond) {
                    if (scores.length == 2) radius = [r / 2, r / 2, r, r];
                    else radius = [r / 2, r / 2, r / 2, r / 2];
                } else {
                    radius = [r / 2, r / 2, r, r];
                }
            }
            bg = CanvasHelper.resizeImageToWidth(bg, mt.score.w);
            bg = CanvasHelper.cropImage(bg, 0, 0, mt.score.w, mt.score.h);
            bg = CanvasHelper.blurImage(bg, 4);

            let map_accent = (await ColorHelper.getAccentColor(bg.toDataURL())).hex;
            while (ColorHelper.isDark(map_accent)) {
                map_accent = ColorHelper.adjustBrightness(map_accent, 75);
            }

            ctx.save();
            ctx.filter = "saturate(75%) brightness(35%)";
            ctx.shadowColor = "rgba(0,0,0,0.34)";
            ctx.shadowBlur = 7;
            CanvasHelper.drawRoundedImage(ctx, bg, mt.score.x, y, mt.score.w, mt.score.h, radius);
            ctx.restore();
            y += mt.score.h + 7;
            // draw score details
            const rank = await loadImage(PathHelper.getRankPath(score.rank));
            ctx.drawImage(rank, mt.score.rank.x, rank_y, rank.width, rank.height);

            // draw pp
            ctx.save();
            ctx.fillStyle = map_accent;
            ctx.shadowColor = "rgba(0,0,0,0.34)";
            ctx.shadowBlur = 7;
            const pp = NumberHelper.toInt(score.pp!) + (rx ? "pp" : "dpp");
            const ppWidth = ctx.measureText(pp).width;

            // shrink font size if needed
            ctx.textAlign = "right";
            ctx.textBaseline = "top";
            ctx.fillText(pp, 1210, title_y);
            const title = score.beatmap.title;
            let size = 24
            ctx.font = "24px SFBold";
            while (758 + ctx.measureText(title).width > 1210 - ppWidth) {
                ctx.font = `${size -= 1}px SFBold`;
            }

            // draw title
            ctx.textAlign = "left";
            ctx.fillText(score.beatmap.title, 758, title_y);
            ctx.restore();

            // draw mods
            ctx.save()
            const mods = score.mods.serializeMods().reverse();
            let acc_start_x = 0;
            let mods_start_x = 1210;
            if (!mods.length) mods.push({ acronym: "NM" });
            for (const mod of mods) {
                const m = await loadImage(PathHelper.getModPath(mod.acronym));
                const mod_image = CanvasHelper.resizeImageToWidth(m, 31);
                if (mod.acronym == "CS") {
                    ctx.font = "16px SFBold";
                    ctx.textAlign = "right";
                    ctx.textBaseline = "middle";
                    const speed = score.getCustomSpeed()!;
                    const speed_string = `${speed}x`;
                    const speed_width = ctx.measureText(speed_string).width;
                    ctx.fillText(speed_string, mods_start_x, title_y + 38);
                    mods_start_x -= speed_width + 5;
                }
                else {
                    const y = title_y + 28;
                    ctx.drawImage(mod_image, mods_start_x - mod_image.width, y);
                    mods_start_x -= 33;
                    acc_start_x = mods_start_x - 5;
                }
            }
            ctx.restore();

            // draw acc
            ctx.save();
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.font = "16px SFBold";
            const acc = NumberHelper.to2Decimal(score.accuracy * 100) + "%";
            ctx.fillText(acc, acc_start_x, title_y + 38);
            acc_start_x -= ctx.measureText(acc).width;
            ctx.restore();

            // draw diff name
            ctx.save();
            const diff = score.beatmap.version;
            ctx.textAlign = "left";
            ctx.textBaseline = "bottom";
            let diff_size = 20;
            ctx.font = "20px SFBold";
            while (758 + ctx.measureText(diff).width > acc_start_x - 20) {
                ctx.font = `${diff_size -= 1}px SFBold`;
            }
            ctx.fillText(diff, 758, title_y + 50);
            ctx.restore();

            rank_y += mt.score.h + 7;
            title_y += mt.score.h + 7;

        }

        // return buffer
        const buffer = canvas.toBuffer("image/png");
        return buffer;
    }
}