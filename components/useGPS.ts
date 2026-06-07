import { useCallback, useEffect, useRef, useState } from "react";
import { distance } from "../lib/engine";
import type { GPSPosition } from "../lib/types";

interface UseGPSReturn {
  position: GPSPosition | null;
  error: string | null;
  loading: boolean;
  isMocked: boolean;
  triggerMock: () => void;
}

const MOCK_POSITION: GPSPosition = { lat: 23.1235, lng: 120.2546 };

export function useGPS(): UseGPSReturn {
  const [position, setPosition] = useState<GPSPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMocked, setIsMocked] = useState(false);
  const lastValidPos = useRef<GPSPosition | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const triggerMock = useCallback(() => {
    setIsMocked(true);
    setLoading(false);
    setError(null);
    setPosition(MOCK_POSITION);
    lastValidPos.current = MOCK_POSITION;

    if (watchIdRef.current !== null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const timer = window.setTimeout(() => {
        setError("此瀏覽器不支援 GPS 定位。");
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    const fallbackTimer = window.setTimeout(() => {
      if (lastValidPos.current === null && !isMocked) {
        triggerMock();
      }
    }, 4000);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const nextPosition: GPSPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        if (lastValidPos.current) {
          const movedMeters = distance(
            lastValidPos.current.lat,
            lastValidPos.current.lng,
            nextPosition.lat,
            nextPosition.lng
          );

          if (movedMeters < 5) {
            setLoading(false);
            return;
          }
        }

        setPosition(nextPosition);
        lastValidPos.current = nextPosition;
        setError(null);
        setLoading(false);
      },
      () => {
        if (!isMocked) triggerMock();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return () => {
      window.clearTimeout(fallbackTimer);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isMocked, triggerMock]);

  return { position, error, loading, isMocked, triggerMock };
}
