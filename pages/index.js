import { useEffect, useState } from "react";
import useGPS from "../components/useGPS";
import EventCard from "../components/EventCard";
import { locations } from "../lib/locations";
import { checkTrigger } from "../lib/engine";

export default function Home() {
  const pos = useGPS();
  const [event, setEvent] = useState(null);
  const [exp, setExp] = useState(0);
  const [log, setLog] = useState([]);

  useEffect(() => {
    const triggered = checkTrigger(pos, locations);

    if (triggered) {
      setEvent(triggered);
    }
  }, [pos]);

  const completeEvent = () => {
    setExp(exp + 200);

    setLog([
      ...log,
      `擊敗 ${event.name} +200 EXP`
    ]);

    setEvent(null);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>🌍 Reality MMORPG</h1>

      <h3>EXP：{exp}</h3>

      <p>
        GPS：
        {pos ? `${pos.lat}, ${pos.lng}` : "定位中..."}
      </p>

      <EventCard event={event} onComplete={completeEvent} />

      <h3>戰鬥紀錄</h3>
      <ul>
        {log.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </div>
  );
}