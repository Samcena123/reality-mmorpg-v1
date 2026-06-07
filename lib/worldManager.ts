import { GameLocation } from "./types";
import { generateSpawns, SpawnContext } from "./spawnEngine";
import { fetchOSMPOI } from "./osmEngine";
import { poiToGameLocation } from "./poiMapper";
import { locations as staticLocations } from "./locations";

let dynamicSpawns: GameLocation[] = [];
let poiLayer: GameLocation[] = [];

// =====================================
// 🌍 World Getter
// =====================================

export function getWorld(): GameLocation[] {
  return [...staticLocations, ...poiLayer, ...dynamicSpawns];
}

// =====================================
// 🔄 Refresh World
// =====================================

export async function refreshWorld(context: SpawnContext) {
  // 🌍 1. 真實世界 POI
  const pois = await fetchOSMPOI(context.center, context.radius);
  poiLayer = pois.map(poiToGameLocation);

  // ⚔️ 2. 動態 spawn
  dynamicSpawns = generateSpawns(context);

  // 🌍 3. merge world
  return getWorld();
}