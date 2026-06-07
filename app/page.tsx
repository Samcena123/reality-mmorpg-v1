"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic"; // 1. 引入 dynamic
import { useGameStore } from "../lib/useGameStore";
import { useGPS } from "../components/useGPS";
import { useWorldEngine } from "../lib/useWorldEngine";
import { getZoneLevel } from "../lib/worldMap";

// 2. 使用 dynamic 進行動態載入，並關閉 SSR
const GameMap = dynamic(() => import("../components/GameMap"), {
  ssr: false, 
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
      地圖載入中...
    </div>
  ),
});
import GameHUD from "../components/GameHUD";
import InventoryModal from "../components/InventoryModal";
import QuestModal from "../components/QuestModal";
import BattleModal from "../components/BattleModal";
import CharacterModal from "../components/CharacterModal";

// 🌐 數學公式：計算兩個 GPS 座標之間的實際距離 (單位：公尺)
function getDistanceInMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371e3; // 地球半徑
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lng2 - lng1) * Math.PI) / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; 
}

export default function GamePage() {
  const setPlayerLocation = useGameStore((state) => state.setPlayerLocation);
  const setCurrentZone = useGameStore((state) => state.setCurrentZone);
  const setBossState = useGameStore((state) => state.setBossState);
  const toggleBattle = useGameStore((state) => state.toggleBattle);

  // 🔔 1. 取得真實 GPS 座標
  const { position: realPosition } = useGPS();
  
  // 🕹️ 2. 建立虛擬位置狀態 (預設為台北101，讓你在房間也能模擬)
  const [mockPosition, setMockPosition] = useState({ lat: 25.0339, lng: 121.5644 });
  
  // 🌍 3. 丟給世界引擎，生成附近的地標、Boss與寶箱
  const locations = useWorldEngine(mockPosition);

  // 🎯 4. 觸發奇遇狀態：記錄目前有沒有「在玩家身邊 50 公尺內」的 Boss
  const [nearbyBoss, setNearbyBoss] = useState<any>(null);

  // 監聽真實 GPS (如果真能抓到，就同步給虛擬位置，抓不到就用虛擬位置)
  useEffect(() => {
    if (realPosition?.lat && realPosition?.lng) {
      setMockPosition({ lat: realPosition.lat, lng: realPosition.lng });
    }
  }, [realPosition]);

  // 每當 mockPosition (玩家移動) 改變時，檢查有沒有撞到 Boss
  useEffect(() => {
    if (!mockPosition.lat || !mockPosition.lng) return;

    // A. 更新全域 Store
    setPlayerLocation(mockPosition.lat, mockPosition.lng);
    const zone = getZoneLevel(mockPosition.lat, mockPosition.lng);
    setCurrentZone(zone as "SAFE" | "NORMAL" | "DANGER");

    // B. 距離偵測：過濾出方圓 50 公尺內的 Boss
    const foundBoss = locations.find((loc: any) => {
      // 檢查是否為 boss 類型
      if (loc.type !== "boss") return false; 
      
      // 計算距離 (注意：這裡從 loc.position 讀取)
      const dist = getDistanceInMeters(
        mockPosition.lat, 
        mockPosition.lng, 
        loc.position.lat, 
        loc.position.lng
      );
      return dist <= loc.radius; // 直接使用該地點設定的 radius 作為判定範圍
    });

    if (foundBoss) {
      setNearbyBoss(foundBoss);
    } else {
      setNearbyBoss(null);
    }
  }, [mockPosition, locations, setPlayerLocation, setCurrentZone]);

// 點擊「進入戰鬥」按鈕
  const handleStartBattle = () => {
    if (!nearbyBoss) return;
    
    // 初始化 Boss 的戰鬥資料
    setBossState({
      name: nearbyBoss.name,
      level: 50,
      hp: 500,
      maxHp: 500,
      status: nearbyBoss.status || "憤怒",
      mood: "angry",
      lastUpdated: Date.now() // ⬅️ 加上這一行，補齊缺少的必填屬性
    });

    // 打開戰鬥彈窗
    toggleBattle(true);
  };

  // 模擬走路 (改變座標)
  const movePlayer = (direction: "N" | "S" | "E" | "W") => {
    const step = 0.0003; // 移動微小的經緯度，大約等於現實走路 30 公尺
    setMockPosition(prev => {
      switch (direction) {
        case "N": return { ...prev, lat: prev.lat + step };
        case "S": return { ...prev, lat: prev.lat - step };
        case "E": return { ...prev, lng: prev.lng + step };
        case "W": return { ...prev, lng: prev.lng - step };
      }
    });
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 text-white select-none antialiased">
      
      {/* 地圖層 */}
      <div className="absolute inset-0 w-full h-full z-0">
        <GameMap userPosition={mockPosition} locations={locations} />
      </div>

      {/* ⚠️ 核心動態奇遇通知 (當玩家走進 Boss 50公尺內時跳出) */}
      {nearbyBoss && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-sm bg-slate-900/95 border-2 border-red-500 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-bounce text-center">
          <div className="text-xs text-red-500 font-black tracking-widest animate-pulse">⚠️ 偵測到強大氣場 ⚠️</div>
          <div className="text-sm font-bold text-slate-100 mt-1">方圓 50m 內出現了【{nearbyBoss.name}】</div>
          <button 
            onClick={handleStartBattle}
            className="mt-3 px-6 py-2 bg-gradient-to-r from-red-600 to-amber-500 text-white font-black text-xs rounded-xl shadow-lg border-b-4 border-red-800 active:border-b-0 active:translate-y-0.5 transition-all"
          >
            ⚔️ 立即進入討伐戰 ⚔️
          </button>
        </div>
      )}

      {/* 🕹️ 開發者虛擬遙控器 (放在畫面右下角、HUD上方) */}
      <div className="absolute bottom-28 right-4 z-40 bg-slate-900/90 border border-slate-700 p-3 rounded-2xl shadow-2xl flex flex-col items-center gap-1.5 backdrop-blur-sm">
        <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1">Dev Controller</div>
        
        <button onClick={() => movePlayer("N")} className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-xl text-md active:scale-95 border border-slate-600">▲</button>
        <div className="flex gap-1.5">
          <button onClick={() => movePlayer("W")} className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-xl text-md active:scale-95 border border-slate-600">◀</button>
          <div className="w-10 h-10 flex items-center justify-center text-xs text-slate-500 font-bold font-mono">GPS</div>
          <button onClick={() => movePlayer("E")} className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-xl text-md active:scale-95 border border-slate-600">▶</button>
        </div>
        <button onClick={() => movePlayer("S")} className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-xl text-md active:scale-95 border border-slate-600">▼</button>
      </div>

      {/* 各大視窗組件 */}
      <GameHUD />
      <CharacterModal />
      <InventoryModal />
      <QuestModal />
      <BattleModal />

    </main>
  );
}