"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GameEvent } from "../lib/types";

// 宣告一個用於當地圖中心點（GPS）改變時，自動平滑平移地圖的子元件
function MapRecenter({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 16, { animate: true });
    }
  }, [center, map]);
  return null;
}

interface GameMapProps {
  center: { lat: number; lng: number };
  events: GameEvent[];
}

export default function GameMap({ center, events }: GameMapProps) {
  
  // 1. 建立「玩家自己」的像素頭像圖標（經典小冒險者）
  const playerIcon = L.divIcon({
    className: "custom-pixel-marker",
    html: `
      <div class="relative flex flex-col items-center">
        <!-- 冒險者名字標籤 (仿楓之谷經典黃字藍底標籤) -->
        <div class="absolute -top-7 bg-[#050b18]/90 text-[#ffd700] text-[9px] font-black px-1.5 py-0.5 border border-[#5ba4e5] rounded whitespace-nowrap shadow-md tracking-wider">
          新手冒險者
        </div>
        <!-- 像素角色本體 (利用 Emoji 結合點陣陰影模擬) -->
        <div class="text-3xl animate-pulse filter drop-shadow-[0_2px_0_#000000]">🧑‍🎤</div>
        <!-- 腳底下的定位像素光圈 -->
        <div class="w-5 h-1.5 bg-[#5ba4e5]/40 rounded-full blur-[1px] mt-0.5 animate-ping absolute -bottom-1"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  // 2. 動態建立「遊戲事件地標」的復古像素圖標
  const createEventIcon = (type: string) => {
    let iconEmoji = "📜"; // 預設普通探索
    let glowColor = "rgba(91, 164, 229, 0.6)"; // 藍光
    let tagText = "任務點";

    if (type === "food") {
      iconEmoji = "🍜"; // 美食獵人
      glowColor = "rgba(255, 170, 0, 0.7)"; // 橘黃光
      tagText = "美食奇遇";
    } else if (type === "rare") {
      iconEmoji = "🎁"; // 稀有寶箱
      glowColor = "rgba(170, 85, 255, 0.8)"; // 紫光
      tagText = "秘寶！";
    }

    return L.divIcon({
      className: "custom-pixel-marker",
      html: `
        <div class="relative flex flex-col items-center group animate-[bounce_1.5s_infinite]">
          <!-- 楓之谷風任務提示標籤 -->
          <div class="absolute -top-7 bg-[#0c1a30] text-[#ffffff] text-[8px] font-bold px-1.5 py-0.5 border border-[#ffffff] rounded whitespace-nowrap shadow-md">
            ${tagText}
          </div>
          <!-- 像素大地標 -->
          <div class="text-3xl filter drop-shadow-[0_2px_0_#111111]">${iconEmoji}</div>
          <!-- 地標發光底座 -->
          <div class="w-6 h-2 rounded-full absolute -bottom-1 blur-[2px]" style="background: ${glowColor}; box-shadow: 0 0 8px ${glowColor}"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={16}
        scrollWheelZoom={false}
        zoomControl={false} // 關閉現代放大縮小按鈕，維持純粹畫面
        className="w-full h-full"
      >
        {/* 使用 CartoDB Dark Matter 復古暗色系地圖圖磚，讓真實馬路完美化身為夜間遊戲關卡背景 */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* 自動平移地圖中心 */}
        <MapRecenter center={center} />

        {/* 玩家當前 GPS 點陣 Marker */}
        <Marker position={[center.lat, center.lng]} icon={playerIcon}>
          <Popup closeButton={false}>
            <div className="font-mono text-[11px] text-[#224488] p-0.5 font-bold">
              📍 你目前所在的真實座標位置
            </div>
          </Popup>
        </Marker>

        {/* 週邊觸發的楓之谷風像素地標 */}
        {events.map((evt, idx) => (
          <Marker
            key={idx}
            position={[evt.lat, evt.lng]}
            icon={createEventIcon(evt.type)}
          >
            <Popup closeButton={false}>
              <div className="font-mono text-xs p-1">
                <p className="font-black text-[#2964b4]">{evt.name}</p>
                <p className="text-[10px] text-[#666666] mt-0.5">回報可獲得 +{evt.reward} EXP</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}