import { WorldState } from "./types";

const WORLD_THEMES = [
  "風暴前線遠征",
  "商隊慶典",
  "裂隙湧動",
  "公會總動員",
  "遺物綻放",
];

export function generateWorldBrain(): WorldState {
  const chosenTheme = WORLD_THEMES[Math.floor(Math.random() * WORLD_THEMES.length)];
  const rarityBoost = chosenTheme === "遺物綻放" || chosenTheme === "裂隙湧動";

  return {
    theme: chosenTheme,
    expMultiplier: Number((1 + Math.random() * 1.25).toFixed(2)),
    rarityBoost,
    rareRate: rarityBoost ? 0.18 : 0.07,
    bossChance: chosenTheme === "裂隙湧動" ? 0.22 : 0.1,
    seed: Date.now(),
  };
}
