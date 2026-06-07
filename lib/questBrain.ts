import type { GPSPosition, QuestType, WorldState } from "./types";

export interface GeneratedQuest {
  type: QuestType;
  name: string;
  reward: number;
  position?: GPSPosition;
}

export function generateQuest(pos: GPSPosition | null, world: WorldState): GeneratedQuest {
  const roll = Math.random();
  const position = pos ?? undefined;

  if (roll < (world.bossChance ?? 0.1)) {
    return {
      type: "boss",
      name: "裂隙入侵",
      reward: 500,
      position,
    };
  }

  if (roll < (world.rareRate ?? 0.08)) {
    return {
      type: "rare",
      name: "遺物蹤跡",
      reward: 220,
      position,
    };
  }

  return {
    type: "normal",
    name: "在地野外委託",
    reward: 100,
    position,
  };
}
