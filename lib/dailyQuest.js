export function generateDailyQuest() {
  const quests = [
    {
      id: 1,
      title: "牛肉湯獵人",
      type: "food",
      reward: 200,
      description: "前往任一牛肉湯餐廳"
    },
    {
      id: 2,
      title: "城市探索者",
      type: "exploration",
      reward: 150,
      description: "前往一個新地點"
    },
    {
      id: 3,
      title: "社交任務",
      type: "social",
      reward: 180,
      description: "與朋友互動一次"
    }
  ];

  return quests.sort(() => Math.random() - 0.5).slice(0, 3);
}