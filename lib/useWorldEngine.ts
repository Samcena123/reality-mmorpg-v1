import { useEffect, useState } from "react";
import type { GameLocation, GPSPosition } from "./types";
import { refreshWorld } from "./worldManager";

function getDistance(a: GPSPosition, b: GPSPosition) {
  const dx = a.lat - b.lat;
  const dy = a.lng - b.lng;
  return Math.sqrt(dx * dx + dy * dy);
}

export function useWorldEngine(center: GPSPosition | null) {
  const [locations, setLocations] = useState<GameLocation[]>([]);
  const [lastPos, setLastPos] = useState<GPSPosition | null>(null);

  useEffect(() => {
    if (!center) return;

    if (lastPos && getDistance(center, lastPos) < 0.0005) return;

    (async () => {
      const world = await refreshWorld({
        center,
        radius: 500,
        worldLevel: 1,
        intensity: "normal",
      });

      setLocations(world);
      setLastPos(center);
    })();
  }, [center]);

  return locations;
}