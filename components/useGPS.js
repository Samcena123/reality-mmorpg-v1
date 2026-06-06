"use client";

import { useState, useEffect, useRef } from "react";

export default function useGPS() {
  const [position, setPosition] = useState(null);
  const watchIdRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("❌ [系統錯誤] 你的手機瀏覽器不支援 GPS 地理定位功能！");
      return;
    }

    // 🎯 冒險起步點：預設模擬座標（以南科/安定區週邊為基地）
    // 這樣即使手機抓不到衛星，畫面也能在真實的南科馬路上動起來！
    const mockLocation = { lat: 23.1235, lng: 120.2546 };

    // 啟動 4 秒倒數計時器。如果 4 秒內手機硬體 GPS 裝死，就強制切換到模擬備援模式
    timeoutRef.current = setTimeout(() => {
      if (position === null) {
        console.log("⚠️ [GPS 備援啟動] 手機衛星訊號微弱，已自動切換至【南科特區】模擬定位。");
        setPosition(mockLocation);
      }
    }, 4000);

    const geoOptions = {
      enableHighAccuracy: true, // 強制啟動手機硬體 GPS
      timeout: 8000,            // 超時時間
      maximumAge: 0             // 拒絕快取
    };

    const handleSuccess = (pos) => {
      // 只要硬體成功回傳一次，就清除備援計時器，採用真實 GPS
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      const { latitude, longitude } = pos.coords;
      setPosition({ lat: latitude, lng: longitude });
    };

    const handleError = (error) => {
      console.error("GPS Error:", error.message);
      // 如果硬體報錯（例如在室內沒訊號），也直接幫玩家切進模擬座標，不讓畫面卡死
      if (position === null) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setPosition(mockLocation);
      }
    };

    // 開始監聽定位
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      geoOptions
    );

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return position;
}