"use client";

import React from "react";
import { useGameStore } from "../lib/useGameStore";

export default function CharacterModal() {
  const isOpen = useGameStore((state) => state.isCharacterOpen);
  const toggleOpen = useGameStore((state) => state.toggleCharacter);
  const player = useGameStore((state) => state.player);
  
  // 🔔 取得目前的裝備狀態與脫裝 Action
  const equipped = useGameStore((state) => state.equipped);
  const unequipItem = useGameStore((state) => state.unequipItem);

  if (!isOpen) return null;

  // 🎮 動態紙娃娃系統：根據裝備決定角色外觀 Emoji
  // 預設外觀：沒穿衣服的冒險者 🧑‍🎤
// 🎮 智慧動態紙娃娃：自動根據裝備名字匹配 Emoji 形象
  let avatarHead = "🧑‍🎤"; 
  let avatarBody = "👕";
  let avatarWeapon = "👊";
  let avatarOffhand = "";

  // 如果頭部裝備名字包含特定的字，就換上對應的外觀
  if (equipped.head) {
    if (equipped.head.name.includes("盔")) avatarHead = "🪖";
    else if (equipped.head.name.includes("帽")) avatarHead = "👒";
    else if (equipped.head.name.includes("冠")) avatarHead = "👑";
    else avatarHead = "🥽"; // 預設頭飾
  }

  // 身體部位匹配
  if (equipped.body) {
    if (equipped.body.name.includes("甲")) avatarBody = "🛡️";
    else if (equipped.body.name.includes("袍")) avatarBody = "👘";
    else avatarBody = "👚";
  }

  // 武器部位匹配
  if (equipped.weapon) {
    if (equipped.weapon.name.includes("斧")) avatarWeapon = "🪓";
    else if (equipped.weapon.name.includes("杖")) avatarWeapon = "🪄";
    else if (equipped.weapon.name.includes("弓")) avatarWeapon = "🏹";
    else avatarWeapon = "⚔️"; // 預設長劍短刀
  }

  // 副手部位匹配
  if (equipped.offhand) {
    if (equipped.offhand.name.includes("盾")) avatarOffhand = "🛡️";
    else avatarOffhand = "✨"; // 符文魔法副手
  }
  // 計算加成後的總屬性 (基礎值 + 裝備數值)
  // 假設你原本的 LootItem 有 stats 或是我們用 rarity 來算加成
  const weaponAtk = equipped.weapon ? 20 : 0;
  const bodyDef = equipped.body ? 15 : 0;
  const offhandDef = equipped.offhand ? 10 : 0;

  const totalAtk = 10 + player.level * 5 + weaponAtk;
  const totalDef = 5 + player.level * 3 + bodyDef + offhandDef;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={() => toggleOpen(false)} />

      <div className="relative bg-slate-900 border-2 border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-amber-400 flex items-center gap-2">
            <span>🧑‍🎤</span> 角色狀態與裝備
          </h3>
          <button onClick={() => toggleOpen(false)} className="text-slate-400 hover:text-white text-lg font-mono p-1">✕</button>
        </div>

        <div className="p-5 bg-slate-950/40 flex flex-col gap-5">
          
          {/* 👑 核心：RPG 紙娃娃裝備展示區 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-inner relative overflow-hidden">
            
            {/* 左側裝備欄：頭部、身體 */}
            <div className="flex flex-col gap-3 z-10">
              {/* 頭部格子 */}
              <div 
                onClick={() => unequipItem("head")}
                className={`w-12 h-12 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  equipped.head ? "bg-slate-800 border-amber-500 shadow-md scale-105" : "bg-slate-950/40 border-dashed border-slate-800 text-slate-700"
                }`}
                title={equipped.head ? `點擊脫下: ${equipped.head.name}` : "頭部裝備欄"}
              >
                {equipped.head ? <span className="text-xl">🪖</span> : <span className="text-xs font-mono">HEAD</span>}
              </div>
              {/* 身體格子 */}
              <div 
                onClick={() => unequipItem("body")}
                className={`w-12 h-12 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  equipped.body ? "bg-slate-800 border-amber-500 shadow-md scale-105" : "bg-slate-950/40 border-dashed border-slate-800 text-slate-700"
                }`}
                title={equipped.body ? `點擊脫下: ${equipped.body.name}` : "身體裝備欄"}
              >
                {equipped.body ? <span className="text-xl">👕</span> : <span className="text-xs font-mono">BODY</span>}
              </div>
            </div>

            {/* 🧍 中央：動態外觀合成紙娃娃 (Avatar Stage) */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-[140px] relative">
              {/* 魔法背景光圈 */}
              <div className="absolute w-28 h-28 bg-amber-500/10 blur-xl rounded-full pointer-events-none" />
              
              {/* 依據裝備組合出來的角色實體 */}
              <div className="relative flex flex-col items-center select-none scale-125">
                {/* 頭部外觀 */}
                <span className="text-5xl z-20">{avatarHead}</span>
                {/* 身體外觀 */}
                <span className="text-4xl -mt-2 z-10">{avatarBody}</span>
                
                {/* 左手武器外觀 */}
                <span className="text-2xl absolute -bottom-1 -left-4 animate-pulse">{avatarWeapon}</span>
                {/* 右手副手/盾牌外觀 */}
                {avatarOffhand && (
                  <span className="text-2xl absolute -bottom-1 -right-4">{avatarOffhand}</span>
                )}
              </div>
              
              <div className="mt-4 text-xs font-bold text-slate-300">LV.{player.level} 冒險者</div>
            </div>

            {/* 右側裝備欄：主手武器、副手/盾牌 */}
            <div className="flex flex-col gap-3 z-10">
              {/* 武器格子 */}
              <div 
                onClick={() => unequipItem("weapon")}
                className={`w-12 h-12 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  equipped.weapon ? "bg-slate-800 border-amber-500 shadow-md scale-105" : "bg-slate-950/40 border-dashed border-slate-800 text-slate-700"
                }`}
                title={equipped.weapon ? `點擊脫下: ${equipped.weapon.name}` : "武器欄位"}
              >
                {equipped.weapon ? <span className="text-xl">⚔️</span> : <span className="text-xs font-mono">WEAP</span>}
              </div>
              {/* 副手格子 */}
              <div 
                onClick={() => unequipItem("offhand")}
                className={`w-12 h-12 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  equipped.offhand ? "bg-slate-800 border-amber-500 shadow-md scale-105" : "bg-slate-950/40 border-dashed border-slate-800 text-slate-700"
                }`}
                title={equipped.offhand ? `點擊脫下: ${equipped.offhand.name}` : "副手欄位"}
              >
                {equipped.offhand ? <span className="text-xl">🛡️</span> : <span className="text-xs font-mono">OFFH</span>}
              </div>
            </div>

          </div>

          {/* 📊 實時戰鬥數力面板 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex justify-between items-center shadow-md">
              <span className="text-xs text-slate-400">⚔️ 總攻擊力:</span>
              <span className="text-md font-black text-rose-400 font-mono">{totalAtk}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex justify-between items-center shadow-md">
              <span className="text-xs text-slate-400">🛡️ 總防禦力:</span>
              <span className="text-md font-black text-emerald-400 font-mono">{totalDef}</span>
            </div>
          </div>

          {/* 🗺️ 地理座標與經驗進度 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-xs space-y-2 text-slate-400">
            <div className="flex justify-between">
              <span>當前經驗值 (EXP):</span>
              <span className="font-mono text-amber-400">{player.exp} / 100</span>
            </div>
            <div className="flex justify-between border-t border-slate-800/60 pt-2">
              <span>GPS 衛星定位點:</span>
              <span className="font-mono text-slate-500">{player.lat.toFixed(4)}, {player.lng.toFixed(4)}</span>
            </div>
          </div>

        </div>
        
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 text-[10px] text-slate-500 text-center">
          提示：在背包中點選裝備即可穿上；在面板上點選已穿戴裝備即可卸下。
        </div>
      </div>
    </div>
  );
}