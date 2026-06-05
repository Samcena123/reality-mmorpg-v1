import { useEffect, useState } from "react";

export default function useGPS() {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watch = navigator.geolocation.watchPosition((position) => {
      setPos({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    });

    return () => navigator.geolocation.clearWatch(watch);
  }, []);

  return pos;
}