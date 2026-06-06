export const foodTypes = [
  "牛肉湯",
  "拉麵",
  "咖啡",
  "早餐店",
  "火鍋",
  "甜點"
];

export function generateFoodQuest(center: { lat: number; lng: number }) {
  // 🎲 隨機抽一個食物類型
  const randomFood = foodTypes[Math.floor(Math.random() * foodTypes.length)];

  return {
    id: "food_" + Date.now(),
    type: "food",
    title: `🍜 美食獵人：尋找${randomFood}`, // 讓標題也更生動一點！
    foodType: randomFood,                 // 🔍 補上這個關鍵欄位！
    reward: 250,
    lat: center.lat + (Math.random() - 0.5) * 0.01,
    lng: center.lng + (Math.random() - 0.5) * 0.01
  };
}