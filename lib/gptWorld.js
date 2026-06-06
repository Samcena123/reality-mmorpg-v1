export async function generateWorldFromGPT() {
  // 如果你沒接 API，可以直接 return 靜態版本
  return {
    theme: "補給季節開始",
    bonusExpMultiplier: 1.2,
    bossModifier: "enhanced"
  };
}