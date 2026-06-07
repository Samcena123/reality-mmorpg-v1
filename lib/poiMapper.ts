import type { GameLocation } from "./types";
import type { OSMPOI } from "./osmEngine";

// =====================================
// 🎲 RNG
// =====================================

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >> 7), t | 61);
    return ((t ^ (t >> 14)) >>> 0) / 4294967295;
  };
}

function rand(rng: () => number, min: number, max: number) {
  return Math.floor(min + rng() * (max - min));
}

// =====================================
// 🌍 Semantic Layer
// =====================================

const MAP: Record<string, any> = {
  food: {
    exp: [20, 70],
    radius: [50, 100],
    rarity: 0.1,
  },
  exploration: {
    exp: [10, 50],
    radius: [80, 140],
    rarity: 0.15,
  },
  rare: {
    exp: [80, 200],
    radius: [100, 180],
    rarity: 0.5,
  },
};

// =====================================
// 🌍 MAIN
// =====================================

export function poiToGameLocation(poi: OSMPOI): GameLocation {
  const seed = poi.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = mulberry32(seed);

  const meta = MAP[poi.type] ?? MAP.exploration;

  const isRare = rng() < meta.rarity;

  return {
    id: `poi_${poi.id}`,
    name: poi.name,

    type: isRare ? "rare" : (poi.type as any),

    position: {
      lat: poi.lat,
      lng: poi.lng,
    },

    radius: rand(rng, meta.radius[0], meta.radius[1]),

    rewardExp: rand(rng, meta.exp[0], meta.exp[1]),

    description: isRare
      ? "⚡ 異常能量聚集點"
      : "真實世界地標轉換事件",
  };
}