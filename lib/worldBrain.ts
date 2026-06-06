export function generateWorldBrain() {
  const themes = [
    "霧之都市",
    "飢餓週期",
    "商人暴動日",
    "隱藏任務解放日",
    "Boss 覺醒期"
  ];

  return {
    theme: themes[Math.floor(Math.random() * themes.length)],
    expMultiplier: 1 + Math.random() * 1.5,
    rareRate: Math.random() * 0.2,
    bossChance: Math.random() * 0.1,
    seed: Date.now()
  };
}