export function generateQuest(pos: any, world: any) {
  const roll = Math.random();

  if (roll < world.bossChance) {
    return {
      type: "boss",
      name: "⚠️ Boss 追蹤事件",
      reward: 500
    };
  }

  if (roll < world.rareRate) {
    return {
      type: "rare",
      name: "✨ 稀有補給點",
      reward: 200
    };
  }

  return {
    type: "normal",
    name: "📍 日常探索任務",
    reward: 100
  };
}