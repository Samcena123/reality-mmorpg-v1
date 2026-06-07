"use client";

import React from "react";
import { useGameStore } from "../lib/useGameStore";

export default function InventoryModal() {
  const isOpen = useGameStore((state) => state.isInventoryOpen);
  const toggleOpen = useGameStore((state) => state.toggleInventory);
  const inventory = useGameStore((state) => state.inventory);
  const useItem = useGameStore((state) => state.useItem);

  if (!isOpen) return null; // 關閉時不渲染，極致省效能

  // 固定的 16 格 MMORPG 背包網格
  const maxSlots = 16;
  const displaySlots = Array.from({ length: maxSlots }, (_, i) => inventory[i] || null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* 點擊背景可以關閉視窗 */}
      <div className="absolute inset-0" onClick={() => toggleOpen(false)} />

      {/* 背包主體 */}
      <div className="relative bg-slate-900 border-2 border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-scale-up">
        {/* 視窗頭部 */}
        <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-amber-400 flex items-center gap-2">
            <span>🎒</span> 冒險者背包 ({inventory.length} / {maxSlots})
          </h3>
          <button 
            onClick={() => toggleOpen(false)}
            className="text-slate-400 hover:text-white text-lg font-mono p-1"
          >
            ✕
          </button>
        </div>

        {/* 16 格經典網格區域 */}
        <div className="p-4 overflow-y-auto bg-slate-950/40 flex-1">
          <div className="grid grid-cols-4 gap-3">
            {displaySlots.map((item, index) => (
              <div 
                key={index}
                className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative transition-all duration-200 ${
                  item 
                    ? "bg-slate-800/90 border-slate-600 hover:border-amber-400 cursor-pointer shadow-md active:scale-95" 
                    : "bg-slate-900/30 border-dashed border-slate-800"
                }`}
                onClick={() => {
                  if (!item) return;
                  // 🧙‍♂️ 根據你道具的名稱或屬性自動判斷該穿在哪個部位
                  let slot: "head" | "body" | "weapon" | "offhand" = "weapon";
                  const name = item.name.toLowerCase();
                  
                  if (name.includes("帽") || name.includes("盔") || name.includes("冠")) slot = "head";
                  else if (name.includes("甲") || name.includes("袍") || name.includes("衣")) slot = "body";
                  else if (name.includes("盾") || name.includes("副手")) slot = "offhand";
                  else slot = "weapon"; // 預設為武器

                  // 執行穿戴
                  useGameStore.getState().equipItem(item, slot);
                }}
              >
                {item ? (
                  <>
                    <span className="text-2xl">{"⚔️"}</span> {/* 移除 item.icon，統一用預設圖示 */}
                    <span className="absolute bottom-1 right-1 text-[10px] bg-slate-950/80 px-1 rounded text-slate-300 font-mono">
                      x1
                    </span>
                    {/* 修正大小寫：改為小寫的 "epic" 與 "rare" */}
                    <div className={`absolute inset-0 rounded-xl opacity-20 pointer-events-none ${
                      item.rarity === "epic" ? "bg-purple-500 shadow-[0_0_10px_#a855f7]" : 
                      item.rarity === "rare" ? "bg-blue-500 shadow-[0_0_10px_#3b82f6]" : 
                      "bg-slate-500"
                    }`} />
                  </>
                ) : (
                  <span className="text-slate-800 text-xs font-mono">{index + 1}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 視窗底部說明 */}
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          提示：點擊背包中的道具即可進行裝備或使用。
        </div>
      </div>
    </div>
  );
}