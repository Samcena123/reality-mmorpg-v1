import { GameLocation, GPSPosition } from "./types";

export function distance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const earthRadiusMeters = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;

  return earthRadiusMeters * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function checkTrigger(
  userPos: GPSPosition | null,
  locations: GameLocation[]
): GameLocation | null {
  if (!userPos) return null;

  const { lat, lng } = userPos;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return (
    locations.find((loc) => {
      const meters = distance(lat, lng, loc.position.lat, loc.position.lng);
      return meters <= loc.radius;
    }) ?? null
  );
}
