import type { GameLocation, QuestType, GPSPosition } from "./types";

export interface SpawnContext {
  center: GPSPosition;
  radius: number;
  worldLevel: number;
  intensity: "low" | "normal" | "high";
}

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

// =====================================
// 🎯 Type weight
// =====================================

function pickType(r: number): QuestType {
  if (r < 0.55) return "exploration";
  if (r < 0.75) return "food";
  if (r < 0.9) return "social";
  if (r < 0.98) return "rare";
  return "boss";
}

// =====================================
// 🌍 Noise Field
// =====================================

function noise(x: number, y: number, seed: number) {
  let n = x * 374761393 + y * 668265263 + seed * 1442695041;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

// =====================================
// 🌍 Spawn Engine v4
// =====================================

export function generateSpawns(context: SpawnContext): GameLocation[] {
  const spawns: GameLocation[] = [];

  const timeSeed = Math.floor(Date.now() / (1000 * 60 * 60 * 2));

  const worldSeed =
    context.worldLevel * 99991 + timeSeed * 131;

  const step = 0.002;

  const radiusSteps = Math.ceil(context.radius / step);

  const densityThreshold =
    context.intensity === "low"
      ? 0.65
      : context.intensity === "normal"
      ? 0.55
      : 0.45;

  let count = 0;

  for (let dx = -radiusSteps; dx <= radiusSteps; dx++) {
    for (let dy = -radiusSteps; dy <= radiusSteps; dy++) {
      const lat = context.center.lat + dx * step;
      const lng = context.center.lng + dy * step;

      const n = noise(dx, dy, worldSeed);

      if (n < densityThreshold) continue;

      const rng = mulberry32(
        Math.floor(n * 100000 + worldSeed + dx * 31 + dy * 17)
      );

      if (rng() < n * 0.35) {
        const type = pickType(rng());

        const id = `spawn_${lat.toFixed(4)}_${lng.toFixed(4)}_${timeSeed}`;

        spawns.push({
          id,
          name:
            type === "boss"
              ? "世界異常點"
              : type === "rare"
              ? "遺跡殘響"
              : type === "food"
              ? "補給點"
              : type === "social"
              ? "人群聚集"
              : "未知探索",

          type,

          position: { lat, lng },

          radius:
            type === "boss"
              ? 160
              : type === "rare"
              ? 100
              : 70,

          rewardExp:
            type === "boss"
              ? 220
              : type === "rare"
              ? 120
              : 30,

          description: "世界能量波動形成的臨時事件",

          worldSeed,

          questSeed: Math.floor(rng() * 1e9),

          lootSeed: Math.floor(rng() * 1e9),

          expiresAt: Date.now() + 1000 * 60 * 60 * 2,
        });

        count++;
      }

      if (count > 40) return spawns;
    }
  }

  return spawns;
}