import type { LootItem } from "./types";

// 1. 定義名字的組成素材
const ADJECTIVES = {
  common: ["破舊的", "生鏽的", "普通的", "冒險者的", "制式的", "鐵製的"],
  rare: ["鋒利的", "精緻的", "受祝福的", "百鍊的", "附魔的", "夜光的", "守護者的"],
  epic: ["雷霆的", "不滅的", "毀滅之尊", "聖者的", "龍紋的", "狂暴的", "幻影的", "弒神之"]
};

const WEAPONS = ["長劍", "巨斧", "短刀", "法杖", "長槍", "弓箭"];
const HELMETS = ["鐵盔", "便帽", "面具", "兜帽", "皇冠"];
const ARMORS = ["重甲", "胸甲", "皮衣", "法袍", "斗篷"];
const SHIELDS = ["巨盾", "圓盾", "副手符文", "護臂"];

// 2. 隨機工廠核心函式
export function generateRandomEquipment(forcedRarity?: "common" | "rare" | "epic"): LootItem {
  // 如果沒有指定稀有度，就依機率抽樣
  let rarity: "common" | "rare" | "epic" = "common";
  if (forcedRarity) {
    rarity = forcedRarity;
  } else {
    const roll = Math.random();
    if (roll > 0.9) rarity = "epic";
    else if (roll > 0.6) rarity = "rare";
  }

  // 隨機決定裝備種類 (部位)
  const slots = ["head", "body", "weapon", "offhand"];
  const randomSlot = slots[Math.floor(Math.random() * slots.length)];

  // 根據部位選取名詞
  let noun = "";
  if (randomSlot === "head") noun = HELMETS[Math.floor(Math.random() * HELMETS.length)];
  else if (randomSlot === "body") noun = ARMORS[Math.floor(Math.random() * ARMORS.length)];
  else if (randomSlot === "offhand") noun = SHIELDS[Math.floor(Math.random() * SHIELDS.length)];
  else noun = WEAPONS[Math.floor(Math.random() * WEAPONS.length)];

  // 根據稀有度選取形容詞
  const adjList = ADJECTIVES[rarity];
  const adj = adjList[Math.floor(Math.random() * adjList.length)];
  
  // 🎲 隨機數值直接塞進名字裡！例如：「雷霆的長劍 (+45)」
  let statBonus = 5;
  if (rarity === "rare") statBonus = 15 + Math.floor(Math.random() * 15);
  else if (rarity === "epic") statBonus = 40 + Math.floor(Math.random() * 30);
  else statBonus = 2 + Math.floor(Math.random() * 6);

  const name = `${adj}${noun} (+${statBonus})`;

  // 只回傳你的 LootItem 真正擁有的屬性
  return {
    id: Date.now() + Math.random(),
    name,
    rarity
  };
}