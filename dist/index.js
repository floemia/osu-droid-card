"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  DroidCard: () => DroidCard
});
module.exports = __toCommonJS(src_exports);

// src/DroidCard/DroidCard.ts
var import_miko_modules = require("miko-modules");

// src/utils/PathHelper.ts
var import_path = __toESM(require("path"));
var import_url = require("url");
var import_meta = {};
var PathHelper = class {
  static getRootDir() {
    let dir;
    try {
      dir = __dirname;
    } catch (e) {
      dir = import_path.default.dirname((0, import_url.fileURLToPath)(import_meta.url));
    }
    return import_path.default.join(dir, "../");
  }
  static getAssetsDir() {
    const root = this.getRootDir();
    return import_path.default.join(root, "./assets");
  }
  static getImagesDir() {
    const root = this.getRootDir();
    return import_path.default.join(root, "./assets/images");
  }
  static getFontsDir() {
    const root = this.getRootDir();
    return import_path.default.join(root, "./assets/fonts");
  }
  static getModPath(mod) {
    return import_path.default.join(this.getImagesDir(), "mods", `${mod}.png`);
  }
  static getRankPath(rank) {
    return import_path.default.join(this.getImagesDir(), "ranks", `${rank}.png`);
  }
};

// src/DroidCard/DroidCard.ts
var import_canvas2 = require("@napi-rs/canvas");

// src/utils/ColorHelper.ts
var import_fast_average_color_node = require("fast-average-color-node");
var ColorHelper = class {
  static async getAccentColor(url) {
    try {
      return await (0, import_fast_average_color_node.getAverageColor)(url, { algorithm: "sqrt" });
    } catch {
      return await (0, import_fast_average_color_node.getAverageColor)(PathHelper.getImagesDir() + "/background/default-bg.png");
    }
  }
  static toReadableColor(color, intensity = 0.75) {
    let hex = color.replace(/^#/, "");
    intensity = Math.max(0, Math.min(1, intensity));
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const mix = (c) => Math.round(255 - (255 - c) * (1 - intensity));
    const r2 = mix(r);
    const g2 = mix(g);
    const b2 = mix(b);
    return `#${[r2, g2, b2].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
  }
  static isDark(hex) {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    if (hex.length !== 6) throw new Error("Invalid hex color");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance < 128;
  }
  static adjustBrightness(hex, amount) {
    let red = parseInt(hex.substring(1, 3), 16);
    let green = parseInt(hex.substring(3, 5), 16);
    let blue = parseInt(hex.substring(5, 7), 16);
    let r = Math.min(255, red + amount);
    let g = Math.min(255, green + amount);
    let b = Math.min(255, blue + amount);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }
};

// src/utils/DroidHelper.ts
var DroidHelper = class {
  // https://github.com/Rian8337/Mahiru/blob/master/src/utils/helpers/ScoreHelper.ts#L124
  static calculateProfileLevel(score) {
    const calculateScoreRequirement = (level2) => {
      return Math.round(
        level2 <= 100 ? (5e3 / 3 * (4 * Math.pow(level2, 3) - 3 * Math.pow(level2, 2) - level2) + 1.25 * Math.pow(1.8, level2 - 60)) / 1.128 : 23875169174 + 15e9 * (level2 - 100)
      );
    };
    let level = 1;
    while (calculateScoreRequirement(level + 1) <= score) {
      ++level;
    }
    const nextLevelReq = calculateScoreRequirement(level + 1) - calculateScoreRequirement(level);
    const curLevelReq = score - calculateScoreRequirement(level);
    level += curLevelReq / nextLevelReq;
    return level;
  }
  static getMostFrequentMods(scores) {
    const modCounts = {};
    for (const score of scores) {
      let serializedMods;
      if (process.argv[2] == "file") {
        let mods = score.mods;
        serializedMods = mods;
      } else {
        serializedMods = score.mods.serializeMods();
      }
      const sortedMods = serializedMods.map((m) => m.acronym).filter((m) => m != "RX").join(",");
      modCounts[sortedMods] = (modCounts[sortedMods] || 0) + 1;
    }
    let mostFrequent = "";
    let maxCount = 0;
    for (const mods in modCounts) {
      if (modCounts[mods] > maxCount) {
        maxCount = modCounts[mods];
        mostFrequent = mods;
      }
    }
    return mostFrequent ? mostFrequent.split(",") : ["NM"];
  }
  static getUserFlagURL(user) {
    if (!user.country) return `${PathHelper.getImagesDir()}/fallback-flag.png`;
    const codePoints = user.country.toLowerCase().split("").map((char) => 127462 + char.charCodeAt(0) - 97);
    const file_name = codePoints.map((cp) => cp.toString(16)).join("-");
    return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/${file_name}.png`;
  }
};

// src/utils/TimeHelper.ts
var TimeHelper = class {
  static toMonthYear(date) {
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
  }
};

// src/utils/NumberHelper.ts
var NumberHelper = class {
  static toShort(number) {
    return new Intl.NumberFormat("en-US", { compactDisplay: "short", notation: "compact", maximumFractionDigits: 3 }).format(number);
  }
  static to2Decimal(number) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(number);
  }
  static toInt(number) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(number);
  }
};

// src/utils/CanvasHelper.ts
var import_canvas = require("@napi-rs/canvas");
var CanvasHelper = class {
  static drawRoundedImage(ctx, image, x, y, width2, height2, radius) {
    ctx.save();
    ctx.fillStyle = "transparent";
    ctx.beginPath();
    ctx.roundRect(x, y, width2, height2, radius);
    ctx.fill();
    ctx.clip();
    ctx.drawImage(image, x, y, width2, height2);
    ctx.restore();
  }
  static blurRoundedRegion(ctx, x, y, width2, height2, radius, blur) {
    const offCanvas = (0, import_canvas.createCanvas)(width2, height2);
    const offCtx = offCanvas.getContext("2d");
    const imageData = ctx.getImageData(x, y, width2, height2);
    offCtx.putImageData(imageData, 0, 0);
    offCtx.filter = `blur(${blur}px)`;
    const blurredCanvas = (0, import_canvas.createCanvas)(width2, height2);
    const blurredCtx = blurredCanvas.getContext("2d");
    blurredCtx.filter = `blur(${blur}px)`;
    blurredCtx.drawImage(offCanvas, 0, 0);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, width2, height2, radius);
    ctx.clip();
    ctx.drawImage(blurredCanvas, x, y);
    ctx.restore();
  }
  static getFlagURL(countryCode) {
    const codePoints = countryCode.toLowerCase().split("").map((char) => 127462 + char.charCodeAt(0) - 97);
    const file_name = codePoints.map((cp) => cp.toString(16)).join("-");
    return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/${file_name}.png`;
  }
  static resizeImageToWidth(image, targetWidth) {
    const aspectRatio = image.width / image.height;
    const targetHeight = targetWidth / aspectRatio;
    let currentCanvas = (0, import_canvas.createCanvas)(image.width, image.height);
    let ctx = currentCanvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    while (currentCanvas.width * 0.8 > targetWidth) {
      const tempCanvas = (0, import_canvas.createCanvas)(currentCanvas.width * 0.5, currentCanvas.height * 0.5);
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.imageSmoothingEnabled = true;
      tempCtx.imageSmoothingQuality = "high";
      tempCtx.drawImage(currentCanvas, 0, 0, tempCanvas.width, tempCanvas.height);
      currentCanvas = tempCanvas;
    }
    const finalCanvas = (0, import_canvas.createCanvas)(targetWidth, targetHeight);
    const finalCtx = finalCanvas.getContext("2d");
    finalCtx.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight);
    return finalCanvas;
  }
  static blurImage(image, radius) {
    const width2 = image.width;
    const height2 = image.height;
    const canvas = (0, import_canvas.createCanvas)(width2 - radius * 2, height2 - radius * 2);
    const ctx = canvas.getContext("2d");
    const temp_canvas = (0, import_canvas.createCanvas)(width2, height2);
    const temp_ctx = temp_canvas.getContext("2d");
    temp_ctx.filter = `blur(${radius}px)`;
    temp_ctx.drawImage(image, 0, 0, width2, height2);
    ctx.drawImage(temp_canvas, radius, radius, width2 - radius * 2, height2 - radius * 2, 0, 0, width2 - radius * 2, height2 - radius * 2);
    return canvas;
  }
  static roundFillRect(ctx, x, y, width2, height2, radius, fillStyle) {
    ctx.save();
    ctx.beginPath();
    if (fillStyle) ctx.fillStyle = fillStyle;
    ctx.roundRect(x, y, width2, height2, radius);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  static cropImage(image, x, y, width2, height2) {
    const canvas = (0, import_canvas.createCanvas)(width2, height2);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, x, y, width2, height2, 0, 0, width2, height2);
    return canvas;
  }
  static tintImage(image, fillStyle) {
    const canvas = (0, import_canvas.createCanvas)(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, image.width, image.height);
    ctx.fillStyle = fillStyle;
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillRect(0, 0, image.width, image.height);
    ctx.globalCompositeOperation = "source-over";
    return canvas;
  }
};

// src/constants/constants.ts
var width = 1300;
var height = 720;
var baseStartx = 70;
var baseStarty = 40;
var pfp_size = 226;
var outerMargin = 20;
var rectStarty = height / 2.35;
var infoMidPoint = (baseStartx + width / 2) / 2 - outerMargin * 2.5;
var mt = {
  outerMargin,
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
      y: rectStarty + baseStarty + 93 / 2
    }
  },
  rect: {
    x: outerMargin,
    y: rectStarty,
    height: height - rectStarty - outerMargin,
    width: width - outerMargin * 2
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
      y: height - outerMargin - baseStarty - 57 / 2 - 20
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
};
var filepath = {
  bg: PathHelper.getImagesDir() + "/background/bg.png",
  beatmap_bg: PathHelper.getImagesDir() + "/background/default-bg@2xpng",
  top_bg: PathHelper.getImagesDir() + "/background/top-bg.png",
  rx_logo: PathHelper.getImagesDir() + "/rx.png",
  ibancho_logo: PathHelper.getImagesDir() + "/ibancho.png",
  ranks: PathHelper.getImagesDir() + "/ranks"
};
var bg_color = "#22222288";

// src/DroidCard/DroidCard.ts
var import_osu_base = require("@rian8337/osu-base");
var DroidCard = class {
  static async create(user) {
    const rx = user instanceof import_miko_modules.DroidRXUser;
    return await this.getCardBuffer(user, rx);
  }
  static async getCardBuffer(user, rx) {
    const font_dir = PathHelper.getFontsDir();
    const img_dir = PathHelper.getImagesDir();
    import_canvas2.GlobalFonts.registerFromPath(font_dir + `/SF-Pro-Display-Bold.otf`, "SFBold");
    const server = {
      name: rx ? "osudroid!rx" : "osu!droid",
      url: rx ? img_dir + "/rx.png" : img_dir + "/ibancho.png"
    };
    const canvas = (0, import_canvas2.createCanvas)(mt.w, mt.h);
    const ctx = canvas.getContext("2d");
    ctx.roundRect(0, 0, mt.w, mt.h, mt.rad * 3);
    ctx.clip();
    let accent = user.color;
    while (ColorHelper.isDark(accent)) {
      accent = ColorHelper.adjustBrightness(accent, 5);
    }
    const scores = await (rx ? user : user).scores.top();
    let bg = CanvasHelper.resizeImageToWidth(await (0, import_canvas2.loadImage)(filepath.bg), mt.w);
    ctx.drawImage(bg, 0, 0);
    const bg_gradient = ctx.createLinearGradient(0, 0, 0, mt.h);
    bg_gradient.addColorStop(0.6, accent + "44");
    bg_gradient.addColorStop(0, "transparent");
    ctx.fillStyle = bg_gradient;
    ctx.fillRect(0, 0, mt.w, mt.h);
    const avatar = await (0, import_canvas2.loadImage)(user.avatar_url);
    ctx.shadowBlur = 13;
    ctx.shadowColor = "rgba(0,0,0,0.75)";
    CanvasHelper.drawRoundedImage(ctx, avatar, mt.pfp.x, mt.pfp.y, mt.pfp.size, mt.pfp.size, mt.rad * 1.5);
    const flag_URL = DroidHelper.getUserFlagURL(user);
    const flag = await (0, import_canvas2.loadImage)(flag_URL);
    ctx.drawImage(flag, mt.name.x, mt.name.y - flag.height / 2, flag.width, flag.height);
    mt.name.x += flag.width + 20;
    const server_logo = CanvasHelper.resizeImageToWidth(await (0, import_canvas2.loadImage)(server.url), 72);
    CanvasHelper.drawRoundedImage(ctx, server_logo, mt.server.x, mt.server.y - server_logo.height / 2, server_logo.width, server_logo.height, 100);
    mt.server.x += server_logo.width + 20;
    ctx.fillStyle = accent;
    ctx.font = "56px SFBold";
    ctx.textBaseline = "middle";
    ctx.fillText(user.username, mt.name.x, mt.name.y);
    ctx.fillStyle = "#dedede";
    ctx.font = "48px SFBold";
    ctx.fillText(server.name, mt.server.x, mt.server.y);
    ctx.shadowBlur = 0;
    CanvasHelper.blurRoundedRegion(ctx, mt.rect.x, mt.rect.y, mt.rect.width, mt.rect.height, mt.rad * 3, 10);
    CanvasHelper.roundFillRect(ctx, mt.rect.x, mt.rect.y, mt.rect.width, mt.rect.height, mt.rad * 3, "#11111160");
    ctx.shadowBlur = 13;
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
      grString += "  \u2022 ";
      crString = countryRank ? `#${NumberHelper.toInt(countryRank)}` : "";
      countryWidth = ctx.measureText(crString).width;
    }
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
    ctx.fillStyle = accent;
    CanvasHelper.roundFillRect(ctx, 271, 481, 160, 10, mt.rad);
    ctx.fillStyle = accent;
    ctx.font = "22px SFBold";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    const total_score = rx ? user.stats.total_score : user.stats.total_score;
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
    for (let i2 = 0; i2 < mods.length; i2++) {
      const modPath = PathHelper.getModPath(mods[i2]);
      const mod = CanvasHelper.resizeImageToWidth(await (0, import_canvas2.loadImage)(modPath), mt.mods.icon.w);
      ctx.drawImage(mod, start_x + i2 * 60, start_y, mod.width, mod.height);
    }
    ctx.fillStyle = accent;
    ctx.shadowBlur = 13;
    const labels = ["PLAYING SINCE", "PLAYCOUNT", "TOTAL SCORE", "ACCURACY"];
    const stats = [];
    stats.push(rx ? "-" : TimeHelper.toMonthYear(new Date(user.registered)));
    stats.push(NumberHelper.toInt(user.stats.playcount));
    stats.push(NumberHelper.toShort(total_score));
    stats.push(NumberHelper.to2Decimal(user.stats.accuracy * 100) + "%");
    let i = 0;
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
    if (scores.length > 3) scores.length = 3;
    let y = mt.score.y;
    let title_y = 373;
    let rank_y = mt.score.rank.y;
    for (const score of scores) {
      if (!score.beatmap) score.beatmap = await import_osu_base.MapInfo.getInformation(score.hash);
      const bg_url = `https://assets.ppy.sh/beatmaps/${score.beatmap.beatmapSetId}/covers/cover.jpg`;
      let bg2;
      try {
        bg2 = await (0, import_canvas2.loadImage)(bg_url);
      } catch {
        bg2 = await (0, import_canvas2.loadImage)(filepath.bg);
      }
      const r = mt.rad;
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
      bg2 = CanvasHelper.resizeImageToWidth(bg2, mt.score.w);
      bg2 = CanvasHelper.cropImage(bg2, 0, 0, mt.score.w, mt.score.h);
      bg2 = CanvasHelper.blurImage(bg2, 4);
      let map_accent = (await ColorHelper.getAccentColor(bg2.toDataURL())).hex;
      while (ColorHelper.isDark(map_accent)) {
        map_accent = ColorHelper.adjustBrightness(map_accent, 75);
      }
      ctx.save();
      ctx.filter = "saturate(75%) brightness(35%)";
      ctx.shadowColor = "rgba(0,0,0,0.34)";
      ctx.shadowBlur = 7;
      CanvasHelper.drawRoundedImage(ctx, bg2, mt.score.x, y, mt.score.w, mt.score.h, radius);
      ctx.restore();
      y += mt.score.h + 7;
      const rank = await (0, import_canvas2.loadImage)(PathHelper.getRankPath(score.rank));
      ctx.drawImage(rank, mt.score.rank.x, rank_y, rank.width, rank.height);
      ctx.save();
      ctx.fillStyle = map_accent;
      ctx.shadowColor = "rgba(0,0,0,0.34)";
      ctx.shadowBlur = 7;
      const pp2 = NumberHelper.toInt(score.pp) + (rx ? "pp" : "dpp");
      const ppWidth2 = ctx.measureText(pp2).width;
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.fillText(pp2, 1210, title_y);
      const title = score.beatmap.title;
      let size2 = 24;
      ctx.font = "24px SFBold";
      while (758 + ctx.measureText(title).width > 1210 - ppWidth2) {
        ctx.font = `${size2 -= 1}px SFBold`;
      }
      ctx.textAlign = "left";
      ctx.fillText(score.beatmap.title, 758, title_y);
      ctx.restore();
      ctx.save();
      const mods2 = score.mods.serializeMods().reverse();
      let acc_start_x = 0;
      let mods_start_x = 1210;
      if (!mods2.length) mods2.push({ acronym: "NM" });
      for (const mod of mods2) {
        const m = await (0, import_canvas2.loadImage)(PathHelper.getModPath(mod.acronym));
        const mod_image = CanvasHelper.resizeImageToWidth(m, 31);
        if (mod.acronym == "CS") {
          ctx.font = "16px SFBold";
          ctx.textAlign = "right";
          ctx.textBaseline = "middle";
          const speed = score.getCustomSpeed();
          const speed_string = `${speed}x`;
          const speed_width = ctx.measureText(speed_string).width;
          ctx.fillText(speed_string, mods_start_x, title_y + 38);
          mods_start_x -= speed_width + 5;
        } else {
          const y2 = title_y + 28;
          ctx.drawImage(mod_image, mods_start_x - mod_image.width, y2);
          mods_start_x -= 33;
          acc_start_x = mods_start_x - 5;
        }
      }
      ctx.restore();
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.font = "16px SFBold";
      const acc = NumberHelper.to2Decimal(score.accuracy * 100) + "%";
      ctx.fillText(acc, acc_start_x, title_y + 38);
      acc_start_x -= ctx.measureText(acc).width;
      ctx.restore();
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
    const buffer = canvas.toBuffer("image/png");
    return buffer;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DroidCard
});
