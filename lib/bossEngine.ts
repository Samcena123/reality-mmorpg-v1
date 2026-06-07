import { Boss, PlayerActions } from "./types";

export function createBoss(): Boss {
  return {
    name: "時隙守門者",
    hp: 500,
    maxHp: 500,
    level: 1,
    mood: "neutral",
    lastUpdated: Date.now(),
    status: "守在城市與每日裂隙之間，等待玩家壓制。",
  };
}

export function updateBossState(boss: Boss, playerActions: PlayerActions = {}): Boss {
  const nextBoss = { ...boss };

  if (!playerActions.movedToday) nextBoss.hp += 25;
  if (playerActions.social) nextBoss.hp -= 40;
  if (playerActions.defeatedEvent) {
    nextBoss.hp -= playerActions.defeatedEventReward ?? 20;
  }

  nextBoss.hp = Math.min(nextBoss.maxHp, Math.max(0, nextBoss.hp));

  const hpPercent = nextBoss.hp / nextBoss.maxHp;
  if (hpPercent <= 0.3) {
    nextBoss.mood = "weak";
    nextBoss.status = "護甲破裂，爆擊機率上升。";
  } else if (!playerActions.movedToday && hpPercent >= 0.7) {
    nextBoss.mood = "angry";
    nextBoss.status = "因玩家停滯而強化，受到的傷害降低。";
  } else {
    nextBoss.mood = "neutral";
    nextBoss.status = "威脅穩定，持續對裂隙施壓。";
  }

  nextBoss.lastUpdated = Date.now();
  return nextBoss;
}

export function calculateDamageToBoss(
  baseAtk: number,
  weaponAtk: number,
  armorAtk: number,
  bossMood: "neutral" | "angry" | "weak"
): { damage: number; isCrit: boolean } {
  const totalAtk = baseAtk + weaponAtk + armorAtk;
  let critChance = 0.35;
  if (bossMood === "weak") critChance = 0.62;
  if (bossMood === "angry") critChance = 0.14;

  const isCrit = Math.random() < critChance;
  const critMultiplier = isCrit ? 2.4 : 1;
  const randomFactor = 0.85 + Math.random() * 0.35;
  const moodMultiplier = bossMood === "weak" ? 1.35 : bossMood === "angry" ? 0.82 : 1;
  const damage = Math.floor(totalAtk * critMultiplier * randomFactor * moodMultiplier);

  return { damage: Math.max(1, damage), isCrit };
}
