import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas"
import { getAverageColor } from "fast-average-color-node"
import { APIBeatmap, DroidCardParameters } from "typings";
import { droid } from "osu-droid-scraping";
require('dotenv').config()
/**
 * Generates an osu!droid profile card with relevant data, statistics and top plays.
 * 
 * @param params Parameters for card generation.
 */
export const card = async (params: DroidCardParameters) => {
	if (!params.user) {
		if (!params.uid) return undefined
		const data = await droid.request(params.uid)
		if (!data) return undefined
		params.user = (await droid.user({ uid: params.uid, response: data }))!
		params.scores = (await droid.scores({ uid: params.uid, type: "top", response: data }))!
	}
	if (!params.scores) return undefined
	const canvas = createCanvas(1100, 650)
	const ctx = canvas.getContext("2d")

	GlobalFonts.registerFromPath("./assets/fonts/SF-Pro-Rounded-Bold.otf", "sftitle");
	GlobalFonts.registerFromPath("./assets/fonts/SF-Pro-Rounded-Medium.otf", "sfbody");

	ctx.beginPath(); ctx.roundRect(0, 0, 1100, 650, 60); ctx.closePath() // rounded corners for the card
	ctx.clip()	// clip everything to maintain rounded corners

	const background = await loadImage("./assets/images/background/bg.png")
	ctx.drawImage(background, 0, 0, background.width * 1.2, background.width * 1.2);
	const avatar = await loadImage(params.user.avatar_url)
	const accent = await getAverageColor(params.user.avatar_url)

	let color = increase_brightness(accent.hex, brightness_percent(accent.hex))
	ctx.fillStyle = color + `33`
	ctx.globalCompositeOperation = "source-atop"
	ctx.fillRect(0, 0, 1100, 650)
	ctx.globalCompositeOperation = "source-over"
	const bg_gradient = ctx.createLinearGradient(0, 0, 0, 650)
	bg_gradient.addColorStop(1, color + "34")
	bg_gradient.addColorStop(0, `rgba(0,0,0,0)`)
	ctx.fillStyle = bg_gradient
	ctx.fillRect(0, 0, 1100, 650)


	ctx.shadowColor = "rgba(0,0,0,0.7)";
	ctx.shadowBlur = 15;

	ctx.save()
	ctx.fillStyle = "white";
	ctx.beginPath(); ctx.roundRect(40, 40, 180, 180, 40); ctx.fill()
	ctx.clip();
	ctx.drawImage(avatar, 40, 40, 180, 180)

	ctx.restore()

	ctx.beginPath(); ctx.roundRect(0, 260, 1100, 500, 60)
	ctx.fillStyle = "rgba(0,0,0,0.5)"
	ctx.roundRect(650, 235, 310, 60, 20);
	ctx.fill()


	ctx.fillStyle = color
	ctx.font = "50px sftitle"
	ctx.fillText(params.user.username, 260, 110)

	const flag = await loadImage(flag_url(params.user.country))

	ctx.save()
	ctx.fillStyle = "white"
	ctx.drawImage(flag, 260, 140, flag.width * 1.5, flag.height * 1.5)
	ctx.restore()

	ctx.fillStyle = "rgb(255,255,255)"
	ctx.font = "40px sftitle"
	ctx.fillText(new Intl.DisplayNames([`en`], { type: "region" }).of(params.user.country) || `Nowhere`, 335, 180)

	let titles = ["DPP", "DPP RANK", "SCORE RANK"]
	let values = [params.user.dpp, params.user.rank.dpp, params.user.rank.score]
	for (let x = 40, index = 0; x <= 400; x += 176.66, index++) {
		ctx.fillStyle = color
		ctx.beginPath(); ctx.roundRect(x, 300, 136.66, 10, 20); ctx.fill()

		ctx.font = "15px sftitle"
		ctx.fillText(titles[index], x, 330)

		ctx.font = "30px sftitle";
		if (index > 0) {
			if (values[index] <= 150 && values[index] > 50) ctx.fillStyle = "rgb(255,228,100)"
			else if (values[index] <= 50) ctx.fillStyle = "rgb(133,211,255)"
			else ctx.fillStyle = "rgb(255,255,255)"
		} else ctx.fillStyle = "rgb(255,255,255)"
		ctx.fillText(`${index > 0 ? `#` : ""}${values[index].toLocaleString("en-US")}`, x, 360)
	}

	let stats_titles = ["RANKED SCORE", "HIT ACCURACY", "PLAYCOUNT"]
	let stats_values = [params.user.ranked_score, params.user.accuracy.toFixed(2), params.user.playcount]
	ctx.font = "28px sftitle";
	for (let y = 415, index = 0; y < 415 + 55 * 3; y += 55, index++, ctx.textAlign = "left") {

		ctx.fillStyle = color
		ctx.fillText(stats_titles[index], 40, y)
		ctx.fillStyle = `rgb(255,255,255)`
		ctx.textAlign = "right"
		ctx.fillText(stats_values[index].toLocaleString("en") + `${index == 1 ? "%" : ""}`, 530, y)
	}

	const logo = await loadImage("./assets/images/logo50px.png")
	ctx.drawImage(logo, 40, 560)
	ctx.fillText("osu!droid", 105, 593)

	ctx.beginPath(); ctx.roundRect(650, 235, 310, 60, 20);
	ctx.fillStyle = `rgba(0,0,0,0.01)`
	ctx.fill()
	ctx.fillStyle = color
	ctx.font = "30px sftitle";
	ctx.textAlign = "center"
	ctx.fillText("TOP PLAYS", 805, 275)

	let y = 300
	if (params.scores.length > 3) params.scores.length = 3
	for (const score of params.scores) {
		ctx.textAlign = "left"
		let radius = [30, 30, 30, 30]
		if (params.scores.length > 1) {
			if (score == params.scores[0]) radius = [30, 30, 10, 10]
			else if (score == params.scores[1]) {
				if (params.scores.length == 2) radius = [10, 10, 30, 30]
				else radius = [10, 10, 10, 10]
			}
			else radius = [10, 10, 30, 30]

		}
		const beatmap: APIBeatmap = await fetch_beatmap(score.hash)

		ctx.beginPath(); ctx.roundRect(570, y, 490, 100, radius)


		const mods_str = `${score.mods.acronyms ? `+${score.mods.acronyms.join("") || "NM"}` : ""}${score.mods.speed != 1 ? ` (${score.mods.speed.toFixed(2)}x)` : ""}, ${score.accuracy.toFixed(2)}%`
		if (beatmap) {
			const cover = `https://assets.ppy.sh/beatmaps/${beatmap.beatmapset_id}/covers/cover.jpg`
			ctx.save()
			ctx.clip()
			ctx.filter = "blur(1px) brightness(35%)"
			try {
				const bg = await loadImage(cover)
				ctx.drawImage(bg, 570, y, bg.width / 1.5, bg.height / 1.5)
			} catch {
				const bg = await loadImage("./assets/images/background/default-bg@2x.png")
				ctx.drawImage(bg, 570, y, bg.width / 1.5, bg.height / 1.5)
			}

			ctx.restore()

			ctx.font = "25px sftitle"
			let avg
			try {
				avg = await getAverageColor(cover)
			} catch {
				avg = await getAverageColor(`./assets/images/background/default-bg.png`)
			}
			avg.hex = increase_brightness(avg.hex, brightness_percent(avg.hex))

			ctx.save()
			const title_gradient = ctx.createLinearGradient(660, 45, 1030 - ctx.measureText(`${score.dpp}dpp`).width, 45)
			title_gradient.addColorStop(0, avg.hex)
			title_gradient.addColorStop(0.94, avg.hex)
			title_gradient.addColorStop(1, `rgba(0,0,0,0)`)
			ctx.fillStyle = title_gradient

			ctx.fillText(beatmap.title, 660, y + 45)
			ctx.restore()
			ctx.font = "13px sftitle"
			const version_gradient = ctx.createLinearGradient(660, 45, 1030 - ctx.measureText(mods_str).width, 45)
			version_gradient.addColorStop(0, "white")
			version_gradient.addColorStop(0.94, "white")
			version_gradient.addColorStop(1, `rgba(0,0,0,0)`)
			ctx.fillStyle = version_gradient
			ctx.font = "20px sftitle"
			ctx.fillText(`[${beatmap.version}]`, 660, y + 72)

		} else ctx.fill()

		ctx.fillStyle = "white"
		ctx.textAlign = "right"
		ctx.font = "25px sftitle"
		ctx.fillText(`${score.dpp.toLocaleString("en-US")}dpp`, 1030, y + 45)
		ctx.font = "13px sftitle"
		ctx.fillText(mods_str, 1030, y + 71)
		const rank = await loadImage(`./assets/images/ranks/${score.rank}55px.png`)
		ctx.drawImage(rank, 585, y + 10, 65, 81)
		y += 105
	}

	const buffer = await canvas.encode("png")
	return buffer
}

const fetch_beatmap = async (hash: string) => {
	if (process.env.OSU_API_KEY) {
		const key = process.env.OSU_API_KEY
		const response = await fetch(`https://osu.ppy.sh/api/get_beatmaps?k=${key}&h=${hash}`)
		if (!response.ok) {
			throw new Error(`Error: ${response.statusText}`);
		}
		const tojson = await response.json()
		if (tojson.length) return tojson[0]
	} else {
		throw new Error(`An osu! api key must be present in your .env file as OSU_API_KEY.`)
	}
}

const increase_brightness = (hex: string, percent: number) => {
	let r = parseInt(hex.slice(1, 3), 16);
	let g = parseInt(hex.slice(3, 5), 16);
	let b = parseInt(hex.slice(5, 7), 16);

	r = Math.min(255, Math.max(0, Math.round(r + (r * percent) / 100)));
	g = Math.min(255, Math.max(0, Math.round(g + (g * percent) / 100)));
	b = Math.min(255, Math.max(0, Math.round(b + (b * percent) / 100)));

	const toHex = (value: number) => value.toString(16).padStart(2, "0").toUpperCase();
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const brightness_percent = (hex: string) => {
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;

	const luminance = (channel: number) => {
		return channel <= 0.03928
			? channel / 12.92
			: Math.pow((channel + 0.055) / 1.055, 2.4);
	};
	const relativeLuminance = 0.2126 * luminance(r) + 0.7152 * luminance(g) + 0.0722 * luminance(b);

	if (relativeLuminance > 0.6) {
		return 0
	} else if (relativeLuminance > 0.4) {
		return 10
	} else if (relativeLuminance > 0.3) {
		return 20
	} else if (relativeLuminance > 0.2) {
		return 30
	} else if (relativeLuminance > 0.07) {
		return 70
	} else {
		return 190
	}
}

const flag_url = (countryCode: string) => {
	const codePoints = countryCode
		.toLowerCase()
		.split('')
		.map(char => 0x1F1E6 + char.charCodeAt(0) - 97)

	const base_url = 'https://osu.ppy.sh/assets/images/flags/';
	const file_name = codePoints.map(cp => cp.toString(16)).join('-') + '.svg';

	return base_url + file_name;
}