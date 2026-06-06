export interface GameEvent {
  name: string;
  type: "exploration" | "food" | "rare" | "boss";
  reward: number;
  lat: number;
  lng: number;
  foodType?: string;
  sprite?: string; // 預留：未來對應的像素地圖圖示/怪物外觀
}

export interface Boss {
  name: string;
  hp: number;
  maxHp: number; // 新增：用於精準渲染復古血條
  level: number;
  status?: string;
}

export interface LootItem {
  id: number;
  name: string;
  rarity: "common" | "rare" | "epic";
  atk?: number;
  def?: number;
  energy?: number;
  magic?: number;
}

export interface WorldState {
  theme: string;
  expMultiplier: number;
  rarityBoost: boolean;
}