"use client";

import { useEffect, useState } from "react";
import useGPS from "../components/useGPS";
import EventCard from "../components/EventCard";
import { locations } from "../lib/locations";
import { checkTrigger } from "../lib/engine";

// 1. 定義 GPS 位置的型態
interface GPSPosition {
  lat: number;
  lng: number;
}

// 2. 定義遊戲事件（地點）的型態
interface GameEvent {
  name: string;
  lat: number;
  lng: number;
  radius: number;
  [key: string]: any; // 允許其他可能存在的自訂欄位
}

export default function Home() {
  // 將型態賦予給 useState，解除 TypeScript 的 never 限制
  const pos = useGPS() as GPSPosition | null;
  const [event, setEvent] = useState<GameEvent | null>(null);
  const [exp, setExp] = useState<number>(0);
  const [log, setLog] = useState<string[]>([]); // 宣告為字串陣列

  useEffect(() => {
    // 這裡同樣將 checkTrigger 的回傳結果斷言為 GameEvent 或 null
    const triggered = checkTrigger(pos, locations) as GameEvent | null;

    if (triggered) {
      setEvent(triggered);
    }
  }, [pos]);

  const completeEvent = () => {
    // 加上安全保護檢查，確保 event 存在時才讀取 name
    if (event) {
      setExp(exp + 200);
      setLog([
        ...log,
        `擊敗 ${event.name} +200 EXP`
      ]);
      setEvent(null);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>🌍 Reality MMORPG</h1>

      <h3>EXP：{exp}</h3>

      <p>
        GPS：
        {pos ? `${pos.lat}, ${pos.lng}` : "定位中..."}
      </p>

      {/* 這裡也加上安全保護檢查 */}
      {event && <EventCard event={event} onComplete={completeEvent} />}

      <h3>戰鬥紀錄</h3>
      <ul>
        {log.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </div>
  );
}
