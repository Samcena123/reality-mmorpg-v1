import type { GameEvent } from "../lib/types";

interface Props {
  event: GameEvent;
  onComplete: () => void;
}

export default function EventCard({ event, onComplete }: Props) {
  if (!event) return null;

  return (
    <div style={{
      marginTop: 20,
      padding: 20,
      borderRadius: 12,
      background: "linear-gradient(145deg, #111, #222)",
      border: "1px solid #444",
      color: "white",
      boxShadow: "0 0 20px rgba(0,255,100,0.2)"
    }}>
      <h2>⚔️ {event.name}</h2>

      <p>🎮 類型：{event.type}</p>

      {event.foodType && (
        <p>🍜 任務類型：{event.foodType}</p>
      )}

      <p>💰 獎勵：+{event.reward} EXP</p>

      <button
        onClick={onComplete}
        style={{
          marginTop: 10,
          padding: "10px 16px",
          background: "#00ff88",
          border: "none",
          borderRadius: 8,
          fontWeight: "bold"
        }}
      >
        ⚔️ 完成事件
      </button>
    </div>
  );
}