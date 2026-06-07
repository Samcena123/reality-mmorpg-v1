import type { GPSPosition } from "./types";

export interface OSMPOI {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
}

// =====================================
// 🧠 Memory Cache（避免 API 爆炸）
// =====================================

const cache = new Map<string, { time: number; data: OSMPOI[] }>();
const CACHE_TTL = 1000 * 60 * 10; // 10分鐘

function getCacheKey(center: GPSPosition, radius: number) {
  return `${center.lat.toFixed(3)}_${center.lng.toFixed(3)}_${radius}`;
}

// =====================================
// 🌍 OSM Fetch
// =====================================

export async function fetchOSMPOI(
  center: GPSPosition,
  radius = 500
): Promise<OSMPOI[]> {
  const key = getCacheKey(center, radius);

  const cached = cache.get(key);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data;
  }

  const query = `
  [out:json];
  (
    node["amenity"="cafe"](around:${radius},${center.lat},${center.lng});
    node["amenity"="restaurant"](around:${radius},${center.lat},${center.lng});
    node["shop"](around:${radius},${center.lat},${center.lng});
    node["leisure"="park"](around:${radius},${center.lat},${center.lng});
    node["amenity"="place_of_worship"](around:${radius},${center.lat},${center.lng});
  );
  out;
  `;

  try {
    const res = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        body: query,
      }
    );

    const data = await res.json();

    const pois: OSMPOI[] = (data.elements || [])
      .filter((e: any) => e.lat && e.lon)
      .map((e: any) => ({
        id: `osm_${e.id}`,
        name: e.tags?.name || "Unknown POI",
        type: mapType(e.tags),
        lat: e.lat,
        lng: e.lon,
      }));

    cache.set(key, { time: Date.now(), data: pois });

    return pois;
  } catch (e) {
    console.error("OSM fetch failed:", e);
    return [];
  }
}

// =====================================
// 🧠 OSM → Game type mapping
// =====================================

function mapType(tags: any): string {
  if (!tags) return "exploration";

  if (tags.amenity === "cafe") return "food";
  if (tags.amenity === "restaurant") return "food";
  if (tags.shop) return "food";

  if (tags.leisure === "park") return "exploration";

  if (tags.amenity === "place_of_worship") return "rare";

  return "exploration";
}