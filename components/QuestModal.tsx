"use client";

import React from "react";
import { useGameStore } from "../lib/useGameStore";

export default function QuestModal() {
  const isOpen = useGameStore((state) => state.isQuestOpen);
  const toggleOpen = useGameStore((state) => state.toggleQuest);
  const dailyQuests = useGameStore((state) => state.dailyQuests);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={() => toggleOpen(false)} />

      <div className="relative bg-slate-900 border-2 border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-amber-400 flex items-center gap-2">
            <span>📜</span> 冒險者任務日誌
          </h3>
          <button onClick={() => toggleOpen(false)} className="text-slate-400 hover:text-white font-mono">✕</button>
        </div>

        {/* 任務清單 */}
        <div className="p-4 overflow-y-auto space-y-3 bg-slate-950/40 flex-1">
          {dailyQuests.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              目前沒有進行中的任務。<br/>請移動到非安全區探索看看！
            </div>
          ) : (
            dailyQuests.map((quest) => {
              // 判定狀態是否為 READY (已達成)
              const isCompleted = quest.status === "READY";
              
              return (
                <div 
                  key={quest.id}
                  className={`p-3 rounded-xl border bg-slate-900/90 flex flex-col gap-2 transition-all ${
                    isCompleted ? "border-emerald-800 bg-emerald-950/10" : "border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      {/* title 改為 name */}
                      <h4 className={`font-bold text-sm ${isCompleted ? "text-emerald-400 line-through" : "text-slate-200"}`}>
                        {quest.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{quest.description}</p>
                    </div>
                    {isCompleted && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-black">
                        ✓ 可回報
                      </span>
                    )}
                  </div>

                  {/* 移除原本的進度條，改用文字顯示獎勵與狀態 */}
                  <div className="text-[11px] font-mono mt-1 flex justify-between text-slate-400">
                    <span>獎勵: {quest.reward} EXP</span>
                    <span>狀態: {quest.status}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}