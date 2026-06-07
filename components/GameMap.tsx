"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GameLocation, GPSPosition, QuestType } from "../lib/types";

// =====================================
// 🧭 Icon
// =====================================

const DefaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// =====================================
// 📍 Recenter（優化版）
// =====================================

function MapRecenter({ center }: { center: GPSPosition }) {
  const map = useMap();

  useEffect(() => {
    const c = map.getCenter();

    const dist =
      Math.abs(c.lat - center.lat) +
      Math.abs(c.lng - center.lng);

    if (dist > 0.00025) {
      map.setView([center.lat, center.lng], map.getZoom(), {
        animate: true,
      });
    }
  }, [center, map]);

  return null;
}

// =====================================
// 🎯 Type UI
// =====================================

const TYPE_META: Record<
  QuestType,
  { label: string; color: string; icon: string }
> = {
  exploration: { label: "探索", color: "#38bdf8", icon: "E" },
  boss: { label: "Boss", color: "#ef4444", icon: "B" },
  rare: { label: "稀有", color: "#a855f7", icon: "R" },
  food: { label: "補給", color: "#f59e0b", icon: "F" },
  social: { label: "社交", color: "#34d399", icon: "S" },
};

// =====================================
// 🎨 Marker Factory
// =====================================

function createIcon(meta: any) {
  return L.divIcon({
    className: "game-marker",
    html: `
      <div style="
        background:${meta.color};
        width:26px;
        height:26px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-weight:bold;
        border:2px solid white;
        box-shadow:0 0 8px rgba(0,0,0,0.3);
      ">
        ${meta.icon}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

// =====================================
// 🎮 Props
// =====================================

interface GameMapProps {
  userPosition: GPSPosition | null;
  locations: GameLocation[];
}

// =====================================
// 🌍 Main Map
// =====================================

export default function GameMap({
  userPosition,
  locations,
}: GameMapProps) {
  const center =
    userPosition ?? { lat: 23.1235, lng: 120.2546 };

  // icon cache（避免重建）
  const icons = useMemo(() => {
    return Object.fromEntries(
      Object.entries(TYPE_META).map(([k, v]) => [
        k,
        createIcon(v),
      ])
    );
  }, []);

  // 🚀 分層（核心 upgrade）
  const {
    poiLayer,
    spawnLayer,
  } = useMemo(() => {
    return {
      poiLayer: locations.filter((l) =>
        l.id.startsWith("poi_")
      ),
      spawnLayer: locations.filter(
        (l) => !l.id.startsWith("poi_")
      ),
    };
  }, [locations]);

  // marker memo（避免 rerender）
  const spawnMarkers = useMemo(
    () =>
      spawnLayer.map((loc) => (
        <Marker
          key={loc.id}
          position={[
            loc.position.lat,
            loc.position.lng,
          ]}
          icon={icons[loc.type]}
        >
          <Popup>
            <strong>{loc.name}</strong>
            <div>{TYPE_META[loc.type].label}</div>
            <div>{loc.rewardExp} EXP</div>
          </Popup>
        </Marker>
      )),
    [spawnLayer, icons]
  );

  const poiMarkers = useMemo(
    () =>
      poiLayer.map((loc) => (
        <Marker
          key={loc.id}
          position={[
            loc.position.lat,
            loc.position.lng,
          ]}
          icon={icons[loc.type]}
        >
          <Popup>
            <strong>🏙 {loc.name}</strong>
            <div>Real World POI</div>
          </Popup>
        </Marker>
      )),
    [poiLayer, icons]
  );

  return (
    <div className="h-full w-full rounded-md overflow-hidden">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={16}
        className="h-full w-full"
        zoomControl={false}
      >
        {/* 🌑 深色真實地圖 */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapRecenter center={center} />

        {/* 👤 Player */}
        <Marker position={[center.lat, center.lng]}>
          <Popup>你的位置</Popup>
        </Marker>

        {/* 🌍 POI layer（真實世界） */}
        {poiMarkers}

        {/* ⚔️ Spawn layer（遊戲世界） */}
        {spawnMarkers}
      </MapContainer>
    </div>
  );
}