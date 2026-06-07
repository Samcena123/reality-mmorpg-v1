"use client";

import React from "react";
import { useGameStore } from "../lib/useGameStore";

export default function GameHUD() {
  // 從 Zustand 讀取玩家狀態與 UI 開關 Action
  const player = useGameStore((state) => state.player);
  const currentZone = useGameStore((state) => state.currentZone);
  
  const toggleInventory = useGameStore((state) => state.toggleInventory);
  const toggleQuest = useGameStore((state) => state.toggleQuest);
  const toggleCharacter = useGameStore((state) => state.toggleCharacter);

  // 計算經驗值百分比 (假設100升級)
  const expPercentage = Math.min(100, Math.max(0, player.exp));

  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between p-4">
      {/* 👑 頂部 HUD (Top Bar) */}
      <div className="flex justify-between items-start w-full pointer-events-auto">
        {/* 玩家資訊頭像 */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-3 rounded-xl flex items-center gap-3 shadow-lg min-w-[200px]">
          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center font-bold text-slate-950 border-2 border-amber-300 shadow-inner text-xl">
            {player.level}
          </div>
          <div className="flex-1">
            <div className="text-xs text-slate-400 font-semibold tracking-wider">LEVEL</div>
            <div className="text-sm font-bold text-amber-400">冒險者</div>
            {/* 經驗條 */}
            <div className="w-full bg-slate-800 h-2 rounded-full mt-1 overflow-hidden border border-slate-700">
              <div 
                className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${expPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* 區域與金幣 */}
        <div className="flex flex-col items-end gap-2">
          {/* 金幣 */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
            <span className="text-amber-400 font-bold">🪙</span>
            <span className="font-mono font-bold text-amber-300 text-lg">{player.gold}</span>
          </div>
          {/* 當前危險分區 */}
          <div className={`px-3 py-1 rounded-full text-xs font-black tracking-widest shadow-md border ${
            currentZone === "SAFE" ? "bg-emerald-950/80 border-emerald-500 text-emerald-400" :
            currentZone === "NORMAL" ? "bg-blue-950/80 border-blue-500 text-blue-400" :
            "bg-rose-950/80 border-rose-500 text-rose-400 animate-pulse"
          }`}>
            🛑 {currentZone} ZONE
          </div>
        </div>
      </div>

      {/* 🎒 底部功能快捷列 (Bottom Action Bar) */}
      <div className="w-full flex justify-center pointer-events-auto mb-2">
        <div className="bg-slate-900/90 backdrop-blur-lg border border-slate-700/80 px-6 py-3 rounded-2xl flex items-center gap-6 shadow-2xl max-w-md w-full justify-around">
          <button 
            onClick={() => toggleQuest()}
            className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-2xl group-hover:bg-slate-700 group-hover:border-amber-500 transition-colors shadow-md">
              📜
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-amber-400">任務日誌</span>
          </button>

          {/* 新增的角色面板按鈕 */}
          <button 
            onClick={() => toggleCharacter()}
            className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-2xl group-hover:bg-slate-700 group-hover:border-amber-500 transition-colors shadow-md">
              🧑‍🎤
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-amber-400">角色資訊</span>
          </button>

          <button 
            onClick={() => toggleInventory()}
            className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-2xl group-hover:bg-slate-700 group-hover:border-amber-500 transition-colors shadow-md">
              🎒
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-amber-400">個人背包</span>
          </button>
        </div>
      </div>
    </div>
  );
}