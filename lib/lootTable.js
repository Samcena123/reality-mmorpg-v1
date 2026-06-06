export function rollLoot(type = "street") {
  const foodLoot = [
    { name: "🍜 拉麵之劍", rarity: "rare", atk: 12 },
    { name: "🍔 漢堡護盾", rarity: "common", def: 5 },
    { name: "☕ 咖啡戒指", rarity: "epic", energy: 20 },
    { name: "🍣 壽司匕首", rarity: "rare", atk: 10 },
    { name: "🍰 甜點法杖", rarity: "epic", magic: 18 }
  ];

  const streetLoot = [
    { name: "🪙 舊硬幣", rarity: "common" },
    { name: "🧭 迷你羅盤", rarity: "rare" },
    { name: "📦 神秘包裹", rarity: "epic" },
    { name: "🔧 生鏽工具", rarity: "common" },
    { name: "📱 遺失訊號器", rarity: "rare" }
  ];

  const pool = type === "food" ? foodLoot : streetLoot;

  const item = pool[Math.floor(Math.random() * pool.length)];

  return {
    ...item,
    id: Date.now()
  };
}