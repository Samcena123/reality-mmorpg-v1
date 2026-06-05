export default function EventCard({ event, onComplete }) {
  if (!event) return null;

  return (
    <div style={{
      border: "1px solid #333",
      padding: 20,
      marginTop: 20,
      borderRadius: 10,
      background: "#111",
      color: "#fff"
    }}>
      <h2>⚔️ {event.name}</h2>

      <p>類型：{event.type}</p>
      <p>任務：完成此地點探索</p>

      <button
        onClick={onComplete}
        style={{
          marginTop: 10,
          padding: 10,
          background: "lime",
          border: "none"
        }}
      >
        完成任務
      </button>
    </div>
  );
}