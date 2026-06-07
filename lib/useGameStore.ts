import { create } from 'zustand';
import type { Boss, LootItem, ActiveQuest, GameLocation } from './types';

// 定義玩家狀態型別
export interface PlayerStats {
  level: number;
  exp: number;
  gold: number;
  lat: number;
  lng: number;
}

interface GameState {
  player: PlayerStats;
  setPlayerLocation: (lat: number, lng: number) => void;
  addGold: (amount: number) => void;
  addExp: (amount: number) => void;

  isCharacterOpen: boolean;
  toggleCharacter: (open?: boolean) => void;

  // 記錄四個部位目前裝備的道具 (LootItem)
  equipped: {
    head: LootItem | null;
    body: LootItem | null;
    weapon: LootItem | null;
    offhand: LootItem | null;
  };
  equipItem: (item: LootItem, slot: "head" | "body" | "weapon" | "offhand") => void;
  unequipItem: (slot: "head" | "body" | "weapon" | "offhand") => void;
  
  inventory: LootItem[];
  isInventoryOpen: boolean;
  toggleInventory: (open?: boolean) => void;
  useItem: (itemId: number) => void;
  addItem: (item: LootItem) => boolean;

  boss: Boss | null;
  isBattleOpen: boolean;
  toggleBattle: (open?: boolean) => void;
  setBossState: (boss: Boss | null) => void;
  updateBossHp: (damage: number) => void;

  dailyQuests: ActiveQuest[];
  isQuestOpen: boolean;
  toggleQuest: (open?: boolean) => void;
  setDailyQuests: (quests: ActiveQuest[]) => void;
  
  currentZone: "SAFE" | "NORMAL" | "DANGER";
  setCurrentZone: (zone: "SAFE" | "NORMAL" | "DANGER") => void;
  nearbyEvents: GameLocation[];
  setNearbyEvents: (events: GameLocation[]) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  player: { level: 1, exp: 0, gold: 50, lat: 25.0339, lng: 121.5644 },
  setPlayerLocation: (lat, lng) => set((state) => ({ player: { ...state.player, lat, lng } })),
  addGold: (amount) => set((state) => ({ player: { ...state.player, gold: state.player.gold + amount } })),
  addExp: (amount) => set((state) => {
    let newExp = state.player.exp + amount;
    let newLevel = state.player.level;
    while (newExp >= 100) { newExp -= 100; newLevel += 1; }
    return { player: { ...state.player, level: newLevel, exp: newExp } };
  }),

  isCharacterOpen: false,
  toggleCharacter: (open) => set((state) => ({ isCharacterOpen: open !== undefined ? open : !state.isCharacterOpen })),

  inventory: [],
  isInventoryOpen: false,
  toggleInventory: (open) => set((state) => ({ isInventoryOpen: open !== undefined ? open : !state.isInventoryOpen })),
  addItem: (item) => {
    const { inventory } = get();
    if (inventory.length >= 16) return false;
    set((state) => ({ inventory: [...state.inventory, item] }));
    return true;
  },
  useItem: (itemId) => set((state) => ({ inventory: state.inventory.filter((item) => item.id !== itemId) })),

  equipped: { head: null, body: null, weapon: null, offhand: null },
  
  equipItem: (item, slot) => set((state) => {
    // 1. 先抓出該部位原本穿的舊裝備
    const oldItem = state.equipped[slot];
    // 2. 從背包移除新裝備，並把舊裝備（如果有的話）放回背包
    const filteredInventory = state.inventory.filter((i) => i.id !== item.id);
    const newInventory = oldItem ? [...filteredInventory, oldItem] : filteredInventory;

    return {
      equipped: { ...state.equipped, [slot]: item },
      inventory: newInventory
    };
  }),

  unequipItem: (slot) => set((state) => {
    const item = state.equipped[slot];
    if (!item) return {};
    if (state.inventory.length >= 16) return {}; // 背包滿了不能脫

    return {
      equipped: { ...state.equipped, [slot]: null },
      inventory: [...state.inventory, item]
    };
  }),

  boss: null,
  isBattleOpen: false,
  toggleBattle: (open) => set((state) => ({ isBattleOpen: open !== undefined ? open : !state.isBattleOpen })),
  setBossState: (boss) => set(() => ({ boss })),
  updateBossHp: (damage) => set((state) => {
    if (!state.boss) return {};
    return { boss: { ...state.boss, hp: Math.max(0, state.boss.hp - damage) } };
  }),

  dailyQuests: [],
  isQuestOpen: false,
  toggleQuest: (open) => set((state) => ({ isQuestOpen: open !== undefined ? open : !state.isQuestOpen })),
  setDailyQuests: (quests) => set(() => ({ dailyQuests: quests })),

  currentZone: "SAFE",
  setCurrentZone: (zone) => set(() => ({ currentZone: zone })),
  nearbyEvents: [],
  setNearbyEvents: (events) => set(() => ({ nearbyEvents: events })),
}));