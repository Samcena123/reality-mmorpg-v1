// ================================================
// 🌍 基礎型別
// ================================================

export type Rarity = "common" | "rare" | "epic";

export type QuestStatus = "ACTIVE" | "READY";

// ================================================
// 📜 Quest 系統
// ================================================

export type QuestType =
  | "food"
  | "exploration"
  | "boss"
  | "rare"
  | "social";

// ================================================
// 📍 GPS
// ================================================

export interface GPSPosition {
  lat: number;
  lng: number;
}

// ================================================
// 🌍 GameLocation（v2統一版本）
// ================================================

export interface GameLocation {
  id: string;
  name: string;

  type: QuestType;

  position: GPSPosition;

  radius: number;

  rewardExp: number;

  description: string;

  worldSeed?: number;
  questSeed?: number;
  lootSeed?: number;

  biome?: string;

  expiresAt?: number;
}

// ================================================
// 🎁 Loot
// ================================================

export interface LootItem {
  id: number;
  name: string;
  rarity: Rarity;

  atk?: number;
  def?: number;
  energy?: number;
  magic?: number;
}

// ================================================
// 📜 Quest
// ================================================

export interface ActiveQuest {
  id: string;
  name: string;
  type: QuestType;
  reward: number;
  status: QuestStatus;
  description: string;

  startTime?: string;
  endTime?: string;

  locationName?: string;
  lat?: number;
  lng?: number;
}

// ================================================
// 👹 Boss
// ================================================

export interface Boss {
  name: string;
  hp: number;
  maxHp: number;
  level: number;
  mood: "neutral" | "angry" | "weak";
  lastUpdated: number;
}

// ================================================
// 🌍 世界狀態
// ================================================

export interface WorldState {
  theme: string;
  expMultiplier: number;
  rarityBoost: boolean;

  rareRate?: number;
  bossChance?: number;
  seed?: number;
}

// ================================================
// 💥 Damage
// ================================================

export interface DamageText {
  id: number;
  damage: number;
  isCrit: boolean;
  x: number;
  y: number;
}

// ================================================
// 🧍 Player
// ================================================

export interface PlayerActions {
  movedToday?: boolean;
  social?: boolean;
  defeatedEvent?: boolean;
  defeatedEventReward?: number;
}