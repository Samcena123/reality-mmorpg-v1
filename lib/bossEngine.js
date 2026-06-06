export function createBoss() {
  return {
    name: "孤獨陰影",
    hp: 200,
    maxHp: 200,
    level: 1,
    mood: "neutral", // neutral / angry / weak
    lastUpdated: Date.now(),
  };
}

export function updateBossState(boss, playerActions = {}) {
  let newBoss = { ...boss };

  // 🧍 玩家沒有移動 → Boss變強（懲罰機制）
  if (!playerActions.movedToday) {
    newBoss.hp += 25;
  }

  // 🤝 玩家有社交 / 食物任務 → Boss變弱（獎勵機制）
  if (playerActions.social) {
    newBoss.hp -= 40;
  }

  // ⚔️ 完成戰鬥事件 → 小幅削弱 Boss
  if (playerActions.defeatedEvent) {
    newBoss.hp -= playerActions.defeatedEventReward || 20;
  }

  // 🧠 HP 邊界控制
  if (newBoss.hp < 80) newBoss.hp = 80;
  if (newBoss.hp > 500) newBoss.hp = 500;

  // 📊 等級系統
  newBoss.level = Math.floor(newBoss.hp / 100) + 1;

  // ❤️ 情緒系統（v5核心）
  if (newBoss.hp > 300) newBoss.mood = "angry";
  else if (newBoss.hp < 150) newBoss.mood = "weak";
  else newBoss.mood = "neutral";

  newBoss.lastUpdated = Date.now();

  return newBoss;
}