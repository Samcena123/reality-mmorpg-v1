export function randomEncounter() {
  const roll = Math.random();

  if (roll < 0.005) {
    return {
      type: "boss",
      name: "孤獨陰影（變異體）",
      hp: 250,
      reward: 500
    };
  }

  if (roll < 0.03) {
    return {
      type: "rare",
      name: "時間裂縫",
      reward: 300
    };
  }

  if (roll < 0.1) {
    return {
      type: "common",
      name: "隱藏補給點",
      reward: 80
    };
  }

  return null;
}