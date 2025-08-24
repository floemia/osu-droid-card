import { DroidScore, DroidUser } from "@floemia/osu-droid-utils";
import { PathHelper } from "./PathHelper";

export abstract class DroidHelper {
    // https://github.com/Rian8337/Mahiru/blob/master/src/utils/helpers/ScoreHelper.ts#L124
    static calculateProfileLevel(score: number) {
        const calculateScoreRequirement = (level: number): number => {
            return Math.round(
                level <= 100
                    ? ((5000 / 3) *
                        (4 * Math.pow(level, 3) -
                            3 * Math.pow(level, 2) -
                            level) +
                        1.25 * Math.pow(1.8, level - 60)) /
                    1.128
                    : 23875169174 + 15000000000 * (level - 100)
            );
        };

        let level = 1;

        while (calculateScoreRequirement(level + 1) <= score) {
            ++level;
        }

        const nextLevelReq =
            calculateScoreRequirement(level + 1) -
            calculateScoreRequirement(level);
        const curLevelReq = score - calculateScoreRequirement(level);
        level += curLevelReq / nextLevelReq;

        return level;
    }

    static getMostFrequentMods(scores: DroidScore[]) {
        const modCounts: Record<string, number> = {};
        for (const score of scores) {
            let serializedMods;
            if (process.argv[2] == "file") {
                let mods = score.mods as unknown;
                serializedMods = (mods as { acronym: string }[])
            } else {
                serializedMods = score.mods.serializeMods();
            }

            const sortedMods = serializedMods.map(m => m.acronym).filter(m => m != "RX" && m != "RV6").join(",");
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

    public static getUserFlagURL(user: DroidUser): string {
        if (!user.country) return `${PathHelper.getImagesDir()}/fallback-flag.png`;
        const codePoints = user.country.toLowerCase().split("").map((char) => 127462 + char.charCodeAt(0) - 97);
        const file_name = codePoints.map((cp) => cp.toString(16)).join("-");
        return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/${file_name}.png`;
    }
}