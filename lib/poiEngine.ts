import type { GPSPosition } from "./types";

// =====================================
// 🌍 POI Type
// =====================================

export type POIType =
  | "restaurant"
  | "cafe"
  | "park"
  | "temple"
  | "school"
  | "station"
  | "store";

export interface POI {
  id: string;
  name: string;
  type: POIType;
  position: GPSPosition;
  popularity: number; // 0~1
}

// =====================================
// 🧪 MOCK POI（未來可換 Overpass API）
// =====================================

export function getPOIs(center: GPSPosition): POI[] {
  return [
    {
      id: "poi_store_1",
      name: "便利商店",
      type: "store",
      position: {
        lat: center.lat + 0.0005,
        lng: center.lng + 0.0003,
      },
      popularity: 0.6,
    },
    {
      id: "poi_park_1",
      name: "公園",
      type: "park",
      position: {
        lat: center.lat - 0.0007,
        lng: center.lng + 0.0002,
      },
      popularity: 0.85,
    },
    {
      id: "poi_temple_1",
      name: "廟宇",
      type: "temple",
      position: {
        lat: center.lat + 0.0012,
        lng: center.lng - 0.0008,
      },
      popularity: 0.95,
    },
    {
      id: "poi_cafe_1",
      name: "咖啡廳",
      type: "cafe",
      position: {
        lat: center.lat - 0.0004,
        lng: center.lng - 0.0006,
      },
      popularity: 0.7,
    },
  ];
}