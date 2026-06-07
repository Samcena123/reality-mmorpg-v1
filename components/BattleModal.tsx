"use client";

import React, { useEffect, useState } from "react";
import { useGameStore } from "../lib/useGameStore";
import { calculateDamageToBoss } from "../lib/bossEngine"; 
import { generateRandomEquipment } from "../lib/lootTable";
import type { LootItem } from "../lib/types";

export default function BattleModal() {
  const isOpen = useGameStore((state) => state.isBattleOpen);
  const toggleOpen = useGameStore((state) => state.toggleBattle);
  const boss = useGameStore((state) => state.boss);
  const updateBossHp = useGameStore((state) => state.updateBossHp);
  const addGold = useGameStore((state) => state.addGold);
  const addExp = useGameStore((state) => state.addExp);
  const addItem = useGameStore((state) => state.addItem);

  const [damageTexts, setDamageTexts] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  const [droppedItem, setDroppedItem] = useState<LootItem | null>(null);

  useEffect(() => {
    if (damageTexts.length === 0) return;
    const timer = setTimeout(() => setDamageTexts((prev) => prev.slice(1)), 800);
    return () => clearTimeout(timer);
  }, [damageTexts]);

  if (!isOpen || !boss) return null;

  const isDead = boss.hp <= 0;
  const hpPercentage = (boss.hp / boss.maxHp) * 100;

  const handleAttack = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDead) return;

    const { damage: dmg } = calculateDamageToBoss(15, 0, 0, boss.mood);
    updateBossHp(dmg);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + (Math.random() * 40 - 20);
    const y = e.clientY - rect.top - 20;
    setDamageTexts((prev) => [...prev, { id: Date.now() + Math.random(), text: `-${dmg}`, x, y }]);

    if (boss.hp - dmg <= 0) {
      addGold(500);
      addExp(200);

      const randomRarity = Math.random() > 0.4 ? "epic" : "rare";
      const finalItem = generateRandomEquipment(randomRarity);
      const success = addItem(finalItem);
      
      if (success) {
        setDroppedItem(finalItem);
      }
    }
  };


  const handleClose = () => {
    setDroppedItem(null);
    toggleOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950/95 p-6 text-white select-none">
      
      {/* 頂部資訊 */}
      <div className="w-full max-w-md text-center mt-8">
        <div className="text-xs text-rose-500 font-black tracking-widest uppercase animate-pulse mb-1">
          ⚠️ BOSS ENCOUNTER ⚠️
        </div>
        <h2 className="text-2xl font-black text-slate-100 tracking-wide">{boss.name}</h2>
        <p className="text-xs text-slate-400 mt-1">LV.{boss.level} · {boss.status || "強大的區域守護者"}</p>

        <div className="w-full bg-slate-900 h-6 rounded-full border-2 border-slate-700 mt-4 overflow-hidden relative flex items-center justify-center">
          <div 
            className="bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 h-full absolute left-0 top-0 transition-all duration-150"
            style={{ width: `${hpPercentage}%` }}
          />
          <span className="z-10 font-mono text-xs font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            {boss.hp} / {boss.maxHp}
          </span>
        </div>
      </div>

      {/* 中部形象 */}
      <div className="relative flex-1 w-full max-w-md flex items-center justify-center">
        <div className={`text-8xl p-8 rounded-full bg-slate-900/50 border-4 border-slate-800/80 shadow-2xl relative ${
          isDead ? "opacity-30 grayscale scale-95 transition-all duration-700" : "animate-bounce"
        }`}>
          {"👹"}
          
          {damageTexts.map((t) => (
            <span
              key={t.id}
              className="absolute font-black text-2xl text-amber-400 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,1)] font-mono"
              style={{ left: t.x, top: t.y }}
            >
              {t.text}
            </span>
          ))}
        </div>

        {/* 勝利面板 */}
        {isDead && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md rounded-3xl p-6 text-center border border-amber-500/30">
            <span className="text-5xl mb-2 animate-pulse">🎉</span>
            <h3 className="text-3xl font-black text-amber-400 tracking-widest">VICTORY</h3>
            <p className="text-xs text-slate-400 mt-1">成功討伐區域首領！</p>
            
            <div className="my-4 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2 text-sm text-emerald-400 font-bold">
              🪙 +500 Gold  |  ✨ +200 EXP
            </div>

            {/* 移除 description，只顯示隨機產生的名字 */}
            {droppedItem ? (
              <div className="w-full bg-gradient-to-b from-purple-950/40 to-slate-900 border border-purple-500/40 rounded-xl p-4 animate-scale-up">
                <div className="text-[10px] text-purple-400 font-black tracking-widest uppercase mb-1">⭐ 獲得隨機戰利品 ⭐</div>
                <div className="text-md font-black text-slate-100">{droppedItem.name}</div>
                <div className="text-xs text-amber-400 mt-1">稀有度: {droppedItem.rarity.toUpperCase()}</div>
              </div>
            ) : (
              <div className="text-xs text-rose-400">（背包空間不足，無法獲得裝備獎勵）</div>
            )}

            <button 
              onClick={handleClose}
              className="mt-6 px-8 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-xl shadow-lg active:scale-95 transition-all"
            >
              收下戰利品並離開
            </button>
          </div>
        )}
      </div>

      {/* 底部按鈕 */}
      {!isDead && (
        <div className="w-full max-w-md mb-8 flex flex-col gap-4 items-center">
          <button
            onClick={handleAttack}
            className="w-full py-5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xl rounded-2xl shadow-xl border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 transition-all"
          >
            ⚔️ 揮劍攻擊 !!
          </button>

          <button 
            onClick={handleClose}
            className="text-xs text-slate-500 hover:text-slate-300 font-bold tracking-wider underline p-2"
          >
            撤退 (逃離戰鬥)
          </button>
        </div>
      )}
    </div>
  );
}