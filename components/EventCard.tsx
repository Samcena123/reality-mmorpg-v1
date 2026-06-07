import type { GameEvent } from "../lib/types";

interface Props {
  event: GameEvent;
  onComplete: () => void;
}

export default function EventCard({ event, onComplete }: Props) {
  return (
    <article className="rpg-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="rpg-title">世界事件</p>
          <h2 className="mt-2 text-lg font-black text-white">{event.name}</h2>
        </div>
        <span className="rounded border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-xs font-bold uppercase text-cyan-100">
          {event.type}
        </span>
      </div>
      {event.description && <p className="mt-3 text-sm text-slate-400">{event.description}</p>}
      {event.foodType && <p className="mt-2 text-sm text-amber-200">補給類型：{event.foodType}</p>}
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-emerald-200">{event.reward} 經驗</span>
        <button onClick={onComplete} className="rpg-button px-4 py-2 text-xs">
          完成
        </button>
      </div>
    </article>
  );
}
