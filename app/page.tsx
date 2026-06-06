"use client";

import { useEffect, useState, useRef } from "react";
import useGPS from "../components/useGPS";
import dynamic from "next/dynamic";
import { locations } from "../lib/locations";
import { checkTrigger } from "../lib/engine";
import { generateFoodQuest } from "../lib/foodQuest";
import { generateWorldState } from "../lib/worldState";
import { createBoss, updateBossState } from "../lib/bossEngine";
import { rollLoot } from "../lib/lootTable";
import type { GameEvent, Boss, LootItem, WorldState } from "../lib/types";

const GameMap = dynamic(() => import("../components/GameMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[#0a142c] flex flex-col items-center justify-center">
      <p className="text-xs font-bold text-[#5ba4e5] tracking-widest animate-pulse">🗺️ MAP LOADING...</p>
    </div>
  )
});

interface GPSPosition {
  lat: number;
  lng: number;
}

interface DamageText {
  id: number;
  damage: number;
  isCrit: boolean;
  x: number;
  y: number;
}

// 📜 任務資料型態
interface ActiveQuest {
  id: string;
  name: string;
  type: string;
  reward: number;
  status: "ACTIVE" | "READY";
  description: string;
}

export default function Home() {
  const pos = useGPS() as GPSPosition | null;
  const [world, setWorld] = useState<WorldState | null>(null);
  const [boss, setBoss] = useState<Boss | null>(null);
  const [loot, setLoot] = useState<LootItem | null>(null);
  
  // 🎒 RPG 核心狀態
  const [exp, setExp] = useState<number>(0);
  const [inventory, setInventory] = useState<LootItem[]>([]);
  const [isInvOpen, setIsInvOpen] = useState<boolean>(false);
  const [log, setLog] = useState<string[]>([]);

  // 🛡️ 角色穿戴裝備欄狀態 (獨立格位)
  const [equippedWeapon, setEquippedWeapon] = useState<LootItem | null>(null);
  const [equippedArmor, setEquippedArmor] = useState<LootItem | null>(null);
  // 選中的背包道具（用於顯示裝備/丟棄操作）
  const [selectedItem, setSelectedItem] = useState<LootItem | null>(null);

  // 📜 任務欄狀態
  const [quests, setQuests] = useState<ActiveQuest[]>([]);
  const [isQuestOpen, setIsQuestOpen] = useState<boolean>(false);

  // ⚔️ 戰鬥舞台核心狀態
  const [isBattleMode, setIsBattleMode] = useState<boolean>(false);
  const [damageTexts, setDamageTexts] = useState<DamageText[]>([]);
  const [isBossHurt, setIsBossHurt] = useState<boolean>(false);

  const lock = useRef<boolean>(false);

  // 1. 初始化與讀取存檔
  useEffect(() => {
    setWorld(generateWorldState());
    
    if (typeof window !== "undefined") {
      const savedExp = localStorage.getItem("maple_rpg_exp");
      const savedInv = localStorage.getItem("maple_rpg_inv");
      const savedBossHp = localStorage.getItem("maple_rpg_boss_hp");
      const savedWep = localStorage.getItem("maple_rpg_wep");
      const savedArm = localStorage.getItem("maple_rpg_arm");
      const savedQuests = localStorage.getItem("maple_rpg_quests");

      if (savedExp) setExp(parseInt(savedExp, 10));
      if (savedInv) setInventory(JSON.parse(savedInv));
      if (savedWep) setEquippedWeapon(JSON.parse(savedWep));
      if (savedArm) setEquippedArmor(JSON.parse(savedArm));
      if (savedQuests) setQuests(JSON.parse(savedQuests));
      
      const baseBoss = createBoss();
      const maxHp = 500;
      const currentHp = savedBossHp ? Math.max(0, parseInt(savedBossHp, 10)) : maxHp;
      
      setBoss({ 
        ...baseBoss, 
        maxHp: maxHp, 
        hp: currentHp,
        name: currentHp <= 0 ? "✨ 已擊殺 (等待重生)" : "皮卡丘的怨念 (遠古隱王)" 
      });

      setLog(["[系統] 冒險世界載入成功！穿上最強裝備，去追蹤任務吧！"]);
    }
  }, []);

  // 2. 自動存檔監聽
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("maple_rpg_exp", exp.toString());
      localStorage.setItem("maple_rpg_inv", JSON.stringify(inventory));
      localStorage.setItem("maple_rpg_wep", JSON.stringify(equippedWeapon));
      localStorage.setItem("maple_rpg_arm", JSON.stringify(equippedArmor));
      localStorage.setItem("maple_rpg_quests", JSON.stringify(quests));
      if (boss) localStorage.setItem("maple_rpg_boss_hp", boss.hp.toString());
    }
  }, [exp, inventory, equippedWeapon, equippedArmor, quests, boss]);

  // GPS 觸發事件自動接取並寫入【任務欄】
  useEffect(() => {
    if (!pos || !world || lock.current) return;
    const base = checkTrigger(pos, locations);
    if (!base) return;

    // 檢查是否已經有同名任務在列表中，避免重複接取
    const isAlreadyAccepted = quests.some(q => q.name.includes(base.name));
    if (isAlreadyAccepted) return;

    const r = Math.random();
    let questName = `📍 探索：${base.name}`;
    let qDesc = `前往真實地標 [${base.name}] 進行空間共鳴調查。`;
    let qReward = 100;
    let qType = base.type || "exploration";

    if (r < 0.06) {
      questName = "✨ 秘寶：虛空稀有補給";
      qDesc = "追蹤到轉瞬即逝的時空裂縫補給點，請立即回報。";
      qReward = 150;
      qType = "rare";
    } else if (r < 0.15) {
      const food = generateFoodQuest(pos);
      questName = `🍜 美食：${food.title}`;
      qDesc = `尋找特區隱藏美食【${food.foodType}】，填飽冒險者的肚子！`;
      qReward = food.reward;
      qType = "food";
    }

    const newQuest: ActiveQuest = {
      id: Date.now().toString(),
      name: questName,
      type: qType,
      reward: qReward,
      status: "READY", // 直接觸發代表已在定位點，呈現可交付狀態
      description: qDesc
    };

    setQuests((prev) => [...prev, newQuest]);
    setLog((p) => [`[📜 任務] 觸發全新奇遇任務！【${questName}】已加入任務日誌！`, ...p]);
    lock.current = true;
  }, [pos, world, quests]);

// 📜 任務欄手動交付任務機制
  const handInQuest = (id: string) => {
    // 優先判定，防止重複呼叫
    const targetQuest = quests.find(q => q.id === id);
    if (!targetQuest) return;

    // 1. 立刻移除任務
    setQuests((prev) => prev.filter(q => q.id !== id));

    const drop = rollLoot(targetQuest.type) as LootItem;
    const uniqueNumberId = Date.now() + Math.floor(Math.random() * 1000000);
    const finalDrop: LootItem = { ...drop, id: uniqueNumberId };

    setExp((p) => p + targetQuest.reward);
    
    // 2. 寫入背包
    setInventory((prevInv) => {
      if (prevInv.some(item => item.id === finalDrop.id)) return prevInv;
      if (prevInv.length >= 16) return prevInv; 
      return [...prevInv, finalDrop];
    });
    
    setLoot(finalDrop);

    setLog((p) => [
      `[${new Date().toLocaleTimeString()}] 成功回報任務【${targetQuest.name}】，獲得 +${targetQuest.reward} EXP！`,
      `[🎰 掉落] 取得：【${finalDrop.name}】(${finalDrop.rarity})`,
      ...p
    ]);

    lock.current = false;
  };
  
  const handleExplore = () => {
    lock.current = false;
    setLog((p) => [`[${new Date().toLocaleTimeString()}] 📡 使用雷達掃描週邊真實特區...`, ...p]);
  };

  const handleEnterBattle = () => {
    if (!boss) return;
    if (boss.hp <= 0) {
      if (confirm("💀 Boss 目前已被擊殺！要消耗 200 EXP 召喚下一隻遠古 Boss 重生嗎？")) {
        if (exp >= 200) {
          setExp((p) => p - 200);
          setBoss((b) => b ? { ...b, hp: b.maxHp, name: "黑肥肥之王 (遠古隱王)" } : b);
          setLog((p) => [`[${new Date().toLocaleTimeString()}] 🔮 消耗 200 EXP，全新的遠古 Boss 已在異次元降臨！`, ...p]);
        } else {
          alert("❌ 你的 EXP 不足 200，無法召喚隱王重生！快去周邊探索解任務吧！");
        }
      }
      return;
    }
    setIsBattleMode(true);
  };

// 🛡️ 穿戴裝備邏輯（修正版：確保深拷貝，徹底解決數量靈異 Bug）
  const equipItem = (item: LootItem) => {
    const isWeapon = item.name.includes("劍") || item.name.includes("刀") || item.name.includes("杖");
    
    // 1. 使用全新陣列過濾掉目前要穿上的這件裝備
    let updatedInv = [...inventory.filter(i => i.id !== item.id)];
    
    if (isWeapon) {
      // 2. 如果原本身上有舊武器，把舊武器安全地推回背包
      if (equippedWeapon) {
        updatedInv = [...updatedInv, equippedWeapon];
      }
      // 3. 嚴格限制背包上限 16 格
      if (updatedInv.length > 16) {
        alert("❌ 背包空間不足，無法更換裝備！");
        return;
      }
      setInventory(updatedInv);
      setEquippedWeapon(item);
      setLog((p) => [`[🛡️ 裝備] 成功裝備武器：【${item.name}】(ATK +${item.atk || 0})`, ...p]);
    } else {
      // 防具/盾牌邏輯
      if (equippedArmor) {
        updatedInv = [...updatedInv, equippedArmor];
      }
      if (updatedInv.length > 16) {
        alert("❌ 背包空間不足，無法更換裝備！");
        return;
      }
      setInventory(updatedInv);
      setEquippedArmor(item);
      setLog((p) => [`[🛡️ 裝備] 成功裝備防具：【${item.name}】(DEF +${item.def || 0})`, ...p]);
    }
    
    // 4. 裝備後清除選取狀態，關閉下方的操作面板
    setSelectedItem(null);
  };

  // 🛡️ 脫下裝備邏輯（修正版）
  const unequipItem = (type: "weapon" | "armor") => {
    if (inventory.length >= 16) {
      alert("❌ 背包空間已滿（16/16），請先清出格子才能脫下裝備！");
      return;
    }
    
    if (type === "weapon" && equippedWeapon) {
      const target = equippedWeapon;
      setEquippedWeapon(null);
      // 強迫使用新陣列結構寫入，防止 React 快取錯誤
      setInventory(p => [...p, target]);
      setLog((p) => [`[🛡️ 裝備] 卸下了武器：【${target.name}】並放回背包。`, ...p]);
    } else if (type === "armor" && equippedArmor) {
      const target = equippedArmor;
      setEquippedArmor(null);
      setInventory(p => [...p, target]);
      setLog((p) => [`[🛡️ 裝備] 卸下了防具：【${target.name}】並放回背包。`, ...p]);
    }
  };
  
// ⚔️ 獨立戰鬥舞台：精準計算「已穿戴裝備」的攻擊力
  const executeAttack = () => {
    if (!boss || boss.hp <= 0) return;

    const baseAtk = 15;
    const weaponBonus = equippedWeapon ? (equippedWeapon.atk || 0) : 0;
    const armorBonus = equippedArmor ? (equippedArmor.atk || 0) : 0;
    const totalAtk = baseAtk + weaponBonus + armorBonus;

    const isCrit = Math.random() > 0.4;
    const damageMultiplier = isCrit ? 2.5 : 1.0;
    const randomFactor = 0.8 + Math.random() * 0.4;
    const finalDamage = Math.floor(totalAtk * damageMultiplier * randomFactor);

    setIsBossHurt(true);
    setTimeout(() => setIsBossHurt(false), 120);

    const newDmgText: DamageText = {
      id: Date.now() + Math.random(),
      damage: finalDamage,
      isCrit,
      x: -40 + Math.random() * 80,
      y: -20 + Math.random() * 40
    };

    setDamageTexts((prev) => [...prev, newDmgText]);

    setBoss((b) => {
      if (!b) return null;
      // 如果在這一幀之前，BOSS 已經被別的異步判定打死了，直接阻斷，防止重複掉寶
      if (b.hp <= 0) return b; 

      const nextHp = Math.max(0, b.hp - finalDamage);
      
      if (nextHp <= 0) {
        // 🔥 加上極端防撞 ID 隨機數，並且在 setInventory 做去重
        const uniqueBossLootId = Date.now() + Math.floor(Math.random() * 1000000);
        const bossLoot: LootItem = { id: uniqueBossLootId, name: "🍁 楓之谷輝煌神劍", rarity: "epic", atk: 88 };
        
        setExp((p) => p + 500);
        
        // 🛡️ 加上去重守衛：防止 Strict Mode 造成的雙倍推入
        setInventory((prevInv) => {
          if (prevInv.some(item => item.id === bossLoot.id)) return prevInv;
          if (prevInv.length >= 16) return prevInv;
          return [...prevInv, bossLoot];
        });

        setLoot(bossLoot);
        setIsBattleMode(false);
        return { ...b, hp: 0, name: "✨ 已擊殺 (等待重生)" };
      }
      return { ...b, hp: nextHp };
    });

    setTimeout(() => {
      setDamageTexts((prev) => prev.filter((t) => t.id !== newDmgText.id));
    }, 700);
  };

  const clearSave = () => {
    if (confirm("⚠️ 確定要重置所有轉生資料嗎？")) {
      localStorage.clear();
      setExp(0);
      setInventory([]);
      setQuests([]);
      setEquippedWeapon(null);
      setEquippedArmor(null);
      setIsBattleMode(false);
      if (boss) setBoss({ ...boss, hp: boss.maxHp, name: "皮卡丘的怨念 (遠古隱王)" });
      setLog(["[系統] 存檔已清除，角色重新轉生！"]);
    }
  };

  return (
    <div className="min-h-screen bg-[#111122] text-[#ffffff] flex flex-col antialiased select-none pb-24">
      
      {/* 頂部 HUD */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a1428]/90 border-b-2 border-[#ffffff] p-3 shadow-md font-mono">
        <div className="max-w-md mx-auto flex flex-col gap-1.5">
          {world && (
            <div className="text-[11px] text-[#ffd700] tracking-wider text-center bg-[#1a2c4c] py-0.5 border border-[#4466aa]/40 rounded font-bold">
              🍁 當前地圖狀態：【{world.theme}】(EXP 經驗加成 x{world.expMultiplier.toFixed(1)})
            </div>
          )}
          <div className="flex justify-between items-center mt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm bg-[#224488] px-1 rounded border border-[#ffffff]/30 font-black text-[#5ba4e5]">Lv.01</span>
              <span className="text-xs font-bold text-[#ffffff]/90">冒險者總攻擊力: <span className="text-[#ff5555]">ATK {15 + (equippedWeapon?.atk || 0) + (equippedArmor?.atk || 0)}</span></span>
            </div>
            <span className="text-xs font-bold text-[#5ba4e5]">{exp} EXP</span>
          </div>
          <div className="w-full bg-[#111111] h-3 border-2 border-[#ffffff] rounded relative overflow-hidden p-[1px]">
            <div className="h-full bg-gradient-to-r from-[#ffd700] to-[#ffaa00] transition-all duration-300" style={{ width: `${Math.min(100, (exp / 2000) * 100)}%` }} />
          </div>
        </div>
      </header>

      {/* 主要舞台 */}
      <main className="flex-1 mt-[110px] p-4 max-w-md w-full mx-auto flex flex-col gap-4">
        
        {/* 真實地圖區 */}
        <div className="w-full h-[35vh] border-4 border-[#ffffff] rounded relative overflow-hidden bg-[#223344]">
          {pos ? (
            <div className="w-full h-full pixelated relative">
              <GameMap center={pos} events={[]} />
              <div className="absolute top-2 right-2 z-[400] bg-[#0c1a30] text-[#ffffff] text-[10px] font-bold px-2 py-0.5 border border-[#ffffff] rounded">📍 台灣冒險特區</div>
            </div>
          ) : null}
        </div>

        {/* 👹 世界 BOSS 資訊卡 */}
        {boss && (
          <div onClick={handleEnterBattle} className="maple-box p-3 border-[#ffd700]/70! bg-[#151c2e]! font-mono cursor-pointer">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-[#ff7777] font-black">👾 WORLD BOSS: {boss.name}</span>
              <span className="text-[#ffd700] text-[11px] font-bold">{boss.hp} / {boss.maxHp} HP</span>
            </div>
            <div className="w-full bg-[#111111] h-2.5 border border-white/40 rounded p-[1px]">
              <div className="h-full bg-gradient-to-r from-[#990000] to-[#cc3333]" style={{ width: `${(boss.hp / boss.maxHp) * 100}%` }} />
            </div>
          </div>
        )}

        {/* 戰報日誌聊天框 */}
        <div className="bg-[#050b18]/80 rounded border-2 border-[#224488] font-mono text-[11px] text-[#8ec5fc] h-24 p-2 overflow-y-auto flex flex-col gap-0.5 flex-shrink-0">
          <div className="flex justify-between border-b border-[#224488]/50 pb-0.5 mb-1 text-xs font-bold sticky top-0 bg-[#050b18] z-10">
            <span className="text-[#ffd700]">【系統戰報對話框】</span>
            <span onClick={clearSave} className="text-[#ff5555] cursor-pointer hover:underline">[重置存檔]</span>
          </div>
          <div className="flex flex-col gap-0.5">
            {log.map((l, i) => (
              <div key={i} className="whitespace-pre-wrap break-all"><span className="text-[#aaaaaa]">[日誌]</span> {l}</div>
            ))}
          </div>
        </div>
      </main>

      {/* 🎒 🛠️ 經典楓之谷「角色欄 + 格子道具背包」大合體彈窗 */}
      {isInvOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="maple-box w-[340px] p-3 font-mono animate-maple-in relative flex flex-col gap-3">
            
            <div className="flex justify-between items-center border-b-2 border-[#ffffff]/30 pb-1">
              <span className="text-xs font-black text-[#ffd700]">👤 角色裝備與道具背包</span>
              <button onClick={() => { setIsInvOpen(false); setSelectedItem(null); }} className="text-xs font-bold text-[#ff5555]">[X]</button>
            </div>

            <div className="flex gap-3">
              {/* 左側：角色裝備紙娃娃欄 (Equipment Slots) */}
              <div className="w-24 flex flex-col gap-2 items-center justify-center border-r-2 border-white/20 pr-2">
                <p className="text-[10px] font-bold text-[#5ba4e5] text-center mb-1">EQUIP</p>
                
                {/* 武器格 */}
                <div onClick={() => unequipItem("weapon")} className="w-12 h-12 border-2 border-dashed border-[#ffd700] bg-black/40 rounded flex flex-col items-center justify-center cursor-pointer relative group">
                  {equippedWeapon ? (
                    <span className="text-2xl filter drop-shadow-[0_1px_0_#000000]">🗡️</span>
                  ) : (
                    <span className="text-[8px] text-[#aaa]">武器欄</span>
                  )}
                  {equippedWeapon && <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] px-0.5 rounded">E</div>}
                </div>

                {/* 防具格 */}
                <div onClick={() => unequipItem("armor")} className="w-12 h-12 border-2 border-dashed border-[#00ffff] bg-black/40 rounded flex flex-col items-center justify-center cursor-pointer relative group">
                  {equippedArmor ? (
                    <span className="text-2xl filter drop-shadow-[0_1px_0_#000000]">🛡️</span>
                  ) : (
                    <span className="text-[8px] text-[#aaa]">防具欄</span>
                  )}
                  {equippedArmor && <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] px-0.5 rounded">E</div>}
                </div>
                <p className="text-[7px] text-[#aaa] text-center mt-1">點擊可卸下</p>
              </div>

              {/* 右側：16格標準道具欄 */}
              <div className="flex-1">
              <div className="grid grid-cols-4 gap-1.5 bg-[#050b18]/60 p-1.5 border border-[#ffffff]/20 rounded">
                {Array.from({ length: 16 }).map((_, idx) => {
                  const item = inventory[idx];
                  // 確保選中狀態的判定絕對精準
                  const isSelected = item && selectedItem && selectedItem.id === item.id;
                  
                  return (
                    <div
                      // 🚨 關鍵：這裡的 key 必須用 idx，不能用 item.id，因為格子位置是固定的！
                      key={`inv-slot-${idx}`} 
                      onClick={() => item && setSelectedItem(item)}
                      className={`aspect-square border-2 rounded flex flex-col items-center justify-center relative cursor-pointer transition-all ${
                        item 
                          ? item.rarity === "epic" ? "border-[#ff00ff] bg-[#ff00ff]/10" : item.rarity === "rare" ? "border-[#00ffff] bg-[#00ffff]/10" : "border-[#ffffff] bg-[#ffffff]/5"
                          : "border-[#4466aa]/30 bg-[#112244]/10"
                      } ${isSelected ? "ring-2 ring-white scale-95" : ""}`}
                    >
                      {item ? (
                        <span className="text-xl filter drop-shadow-[0_1px_0_#000000]">
                          {item.name.includes("劍") || item.name.includes("刀") ? "🗡️" : item.name.includes("盾") ? "🛡️" : item.name.includes("杖") ? "🔮" : "💎"}
                        </span>
                      ) : (
                        <span className="text-[8px] text-[#4466aa]/30">{idx + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              </div>
            </div>

            {/* 底部：選中裝備後的詳細屬性資訊面板與「穿戴按鈕」 */}
            {selectedItem && (
              <div className="bg-[#122244]/90 border border-[#5ba4e5] p-2 rounded text-[10px] animate-maple-in flex justify-between items-center">
                <div>
                  <p className="font-black text-[#ffd700] truncate">{selectedItem.name}</p>
                  <p className="text-[9px] text-[#ff7777]">
                    {selectedItem.atk ? `⚔️ 攻擊力 +${selectedItem.atk}` : ""}
                    {selectedItem.def ? `🛡️ 防禦力 +${selectedItem.def}` : ""}
                  </p>
                </div>
                <button 
                  onClick={() => equipItem(selectedItem)} 
                  className="px-3 py-1 bg-[#22c55e] text-white text-[10px] font-black border border-white rounded shadow"
                >
                  [E] 穿上裝備
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📜 🛠️ 經典楓之谷「任務日誌（Quest Log）」彈窗 */}
      {isQuestOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="maple-box w-80 p-3 font-mono animate-maple-in relative flex flex-col h-[60vh]">
            
            <div className="flex justify-between items-center border-b-2 border-[#ffffff]/30 pb-1.5 flex-shrink-0">
              <span className="text-xs font-black text-[#ffd700] tracking-wider">📜 任務日誌 (QUEST LOG)</span>
              <button onClick={() => setIsQuestOpen(false)} className="text-xs font-bold text-[#ff5555]">[X]</button>
            </div>

            {/* 任務列表滾動區 */}
            <div className="flex-1 overflow-y-auto my-2 flex flex-col gap-2 pr-1">
              {quests.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-white/40 text-xs py-12">
                  <p>📡 目前沒有進行中的地區任務。</p>
                  <p className="text-[9px] mt-1">請移動你的真實位置，在雷達地圖中探索新奇遇！</p>
                </div>
              ) : (
                quests.map((q) => (
                  <div key={q.id} className="border border-white/20 bg-[#0f1b35] p-2 rounded flex flex-col gap-1 relative">
                    <div className="flex justify-between items-start">
                      <h5 className="text-[11px] font-black text-[#8ec5fc] truncate max-w-[180px]">{q.name}</h5>
                      <span className="text-[8px] bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40 px-1 rounded font-bold">可回報</span>
                    </div>
                    <p className="text-[9px] text-white/70">{q.description}</p>
                    <div className="flex justify-between items-center mt-1 border-t border-white/10 pt-1">
                      <span className="text-[8px] text-[#ffd700]">💰 獎勵: +{q.reward} EXP & 裝備隨機箱</span>
                      <button 
                        onClick={() => handInQuest(q.id)}
                        className="px-2 py-0.5 bg-[#be95ff] hover:bg-[#a855f7] text-black font-black text-[9px] border border-white rounded"
                      >
                        [交付任務]
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <p className="text-[8px] text-[#aaa] text-center flex-shrink-0">當前追蹤任務數: {quests.length}</p>
          </div>
        </div>
      )}

      {/* ⚔️ 🔥 獨立對戰畫面 */}
      {isBattleMode && boss && (
        <div className="fixed inset-0 z-[99999] bg-[#000511] flex flex-col items-center justify-between p-6 font-mono select-none animate-maple-in">
          <div className="w-full max-w-sm flex justify-between items-center text-xs">
            <span className="text-[#ffd700] font-bold animate-pulse">⚔️ BATTLE PHASE...</span>
            <button onClick={() => setIsBattleMode(false)} className="px-3 py-1 bg-[#ff3333] text-white border border-white rounded text-[10px] font-black">🏃 逃跑</button>
          </div>

          <div className="w-full max-w-sm flex flex-col items-center justify-center my-auto py-12 relative overflow-visible">
            {/* 💥 傷害跳字 */}
            <div className="absolute inset-x-0 -top-6 flex justify-center pointer-events-none z-30 h-16 overflow-visible">
              {damageTexts.map((txt) => (
                <div
                  key={txt.id}
                  style={{ transform: `translate(${txt.x}px, ${txt.y}px)` }}
                  className={`absolute font-black tracking-tighter text-4xl filter drop-shadow-[0_2px_0_#000000] animate-damage-float ${
                    txt.isCrit ? "italic text-gradient bg-clip-text text-transparent bg-gradient-to-b from-[#ffff00] via-[#ff4500] to-[#ff0000] scale-135 font-serif" : "text-[#ffffff]"
                  }`}
                >
                  {txt.isCrit ? `CRIT! ${txt.damage}` : txt.damage}
                </div>
              ))}
            </div>

            <div className={`relative transition-all duration-75 flex flex-col items-center ${isBossHurt ? "animate-shake filter saturate-200 contrast-120 drop-shadow-[0_0_15px_#ff0000]" : ""}`}>
              <div className="text-7xl filter drop-shadow-[0_4px_0_#111111] animate-bounce-short">🦖</div>
              <div className="w-20 h-3 bg-black/40 rounded-full blur-[2px] mt-2"></div>
            </div>

            <div className="w-full mt-8 bg-[#0a1428] border-2 border-[#ffd700] rounded p-2 shadow-xl">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#ff5555] font-black">👹 {boss.name}</span>
                <span className="text-[#ffd700] font-bold">{boss.hp} / {boss.maxHp} HP</span>
              </div>
              <div className="w-full bg-[#111111] h-4 border border-white/40 rounded overflow-hidden p-[1px]">
                <div className="h-full bg-gradient-to-r from-[#b30000] via-[#ff3333] to-[#ff7777]" style={{ width: `${(boss.hp / boss.maxHp) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm flex flex-col gap-2 pb-4">
            <button onClick={executeAttack} className="maple-btn w-full py-4 text-base font-black tracking-widest shadow-2xl">
              ⚔️ 施展攻擊 (ATTACK)
            </button>
            <p className="text-[9px] text-[#aaaaaa] text-center mt-1">目前已套用裝備欄中：{equippedWeapon ? equippedWeapon.name : "新手木刀"} 的攻擊加成！</p>
          </div>
        </div>
      )}

      {/* 主畫面底部導覽列 */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a1224] border-t-2 border-[#ffffff] p-2.5 shadow-[0_-4px_10px_rgba(0,0,0,0.5)]">
        <div className="max-w-md mx-auto flex gap-2">
          <button onClick={handleExplore} className="maple-btn flex-1 py-2 font-bold text-[11px]">[X] 雷達探測</button>
          <button onClick={handleEnterBattle} className="maple-btn maple-btn-danger flex-1 py-2 font-bold text-[11px] text-[#ffffff]">
            {boss && boss.hp <= 0 ? "[💀] 重生隱王" : "[⚔️] 進入對戰"}
          </button>
          <button onClick={() => setIsQuestOpen(true)} className="maple-btn flex-1 py-2 font-bold text-[11px] text-[#ffd700]">
            [Q] 任務日誌 {quests.length > 0 && <span className="bg-[#be95ff] text-black font-black text-[9px] px-1.5 rounded ml-1 animate-pulse">{quests.length}</span>}
          </button>
          <button onClick={() => setIsInvOpen(true)} className="maple-btn flex-1 py-2 font-bold text-[11px]">
            [I] 裝備道具
          </button>
        </div>
      </footer>

{/* 戰利品獲得彈窗：加上阻止冒泡與精準關閉 */}
      {loot && (
        <div className="fixed inset-0 z-[999999] bg-black/80 flex items-center justify-center p-4">
          <div className="maple-box border-[#ffd700]! bg-rgba(40,25,10,0.95)! p-5 w-64 text-center relative max-w-full animate-maple-in">
            <div className="text-3xl mb-1 animate-bounce">🎁</div>
            <p className="text-[10px] text-[#ffd700] font-black uppercase">ITEM ACQUIRED!</p>
            <h4 className="text-base font-black text-[#ffffff] mt-1.5 border-b border-[#ffd700]/30 pb-2">{loot.name}</h4>
            <div className="text-[10px] text-[#ff7777] my-2 text-left px-2">
              {loot.atk ? `⚔️ 物理攻擊力 +${loot.atk}` : ""}
              {loot.def ? `🛡️ 物理防禦力 +${loot.def}` : ""}
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation(); // 🛑 阻止事件向下傳遞，防止點擊穿透
                setLoot(null);       // 關閉視窗
              }} 
              className="maple-btn w-full py-1.5 text-xs font-black tracking-wider mt-2"
            >
              收下寶物
            </button>
          </div>
        </div>
      )}
    </div>
  );
}