// ================================================
// FILE: lib/randomEngine.ts (TypeScript 權重優化版)
// ================================================

/**
 * 🎲 通用權重隨機選擇器
 * @param items 選項陣列 (例如：["common", "rare", "epic"])
 * @param weights 權重陣列 (例如：[70, 25, 5])，必須與 items 等長
 * @returns 隨機選出的項目
 */
export function weightedChoose<T>(items: T[], weights: number[]): T {
  if (items.length !== weights.length || items.length === 0) {
    return items[0];
  }

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let randomNum = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    if (randomNum < weights[i]) {
      return items[i];
    }
    randomNum -= weights[i];
  }

  return items[items.length - 1];
}

/**
 * ⚡ 判定是否觸發特定機率（如暴擊、閃避、特殊奇遇）
 * @param chance 機率值 (0.0 到 1.0)
 */
export function rollChance(chance: number): boolean {
  return Math.random() < chance;
}

/**
 * 🔢 取得指定範圍內的隨機整數（包含邊界）
 */
export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}