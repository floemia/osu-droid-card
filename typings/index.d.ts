import { DroidScore, DroidUser } from "osu-droid-scraping"

interface APIBeatmap {
	beatmapset_id: number | string,
	beatmap_id: number | string,
	approved: number | string,
	total_length: number | string,
	hit_length: number | string,
	version: string,
	file_md5: string,
	diff_size: number | string,
	diff_overall: number | string,
	diff_approach: number | string,
	diff_drain: number | string,
	mode: number | string,
	count_normal: number | string,
	count_slider: number | string,
	count_spinner: number | string,
	submit_date: string,
	approved_date: string,
	last_update: string,
	artist: string,
	artist_unicode: string,
	title: string,
	title_unicode: string,
	creator: string,
	creator_id: number | string,
	bpm: number | string,
	source: string,
	tags: string,
	genre_id: number | string,
	language_id: number | string,
	favourite_count: number | string,
	rating: number | string,
	storyboard: number | string,
	video: number | string,
	download_unavailable: number | string,
	audio_unavailable: number | string,
	playcount: number | string,
	passcount: number | string,
	packs: string,
	max_combo: number | string,
	diff_aim: number | string,
	diff_speed: number | string,
	difficultyrating: number | string
}
/**
 * Parameters for osu!droid profile card generation.
 */
interface DroidCardParameters {
	/**
	 * An osu!droid user, obtained via the module `osu-droid-scraping`.
	 *	 
	 * * https://github.com/floemia/osu-droid-scraping
	 */
	user?: DroidUser,
	/**
	 * An array of `DroidScore`, obtained via the module `osu-droid-scraping`.
	 * 
	 * https://github.com/floemia/osu-droid-scraping
	 */
	scores?: DroidScore[],

	/**
	 * The uid of the osu!droid account. If passed, all of the other parameters will be discarded.
	 *
	 */
	uid?: number
}
export { type APIBeatmap, type DroidCardParameters }