export function generateWorldState() {
  const themes = [
    "補給季節",
    "孤獨陰影蔓延",
    "資源暴增期",
    "城市異變",
    "休閒模式"
  ];

  return {
    theme: themes[Math.floor(Math.random() * themes.length)],
    expMultiplier: 1 + Math.random() * 0.5,
    rarityBoost: Math.random() > 0.5
  };
}