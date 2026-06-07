export interface RawCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime: string };
  end: { dateTime: string };
  lat?: number;
  lng?: number;
}

export interface CalendarQuest {
  id: string;
  name: string;
  type: "boss" | "rare" | "exploration" | "food";
  reward: number;
  description: string;
  startTime: string;
  endTime: string;
  locationName: string;
  lat: number;
  lng: number;
}

function classifyEvent(event: RawCalendarEvent): Pick<CalendarQuest, "type" | "reward"> {
  const text = `${event.summary} ${event.description ?? ""}`.toLowerCase();

  if (/(meeting|presentation|interview|review|exam|deadline|bug|launch)/.test(text)) {
    return { type: "boss", reward: 300 };
  }

  if (/(gym|workout|read|class|coding|develop|meditate|study)/.test(text)) {
    return { type: "rare", reward: 200 };
  }

  if (/(lunch|dinner|breakfast|coffee|dessert|food|restaurant|market)/.test(text)) {
    return { type: "food", reward: 150 };
  }

  return { type: "exploration", reward: 120 };
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function parseDailyCalendar(
  events: RawCalendarEvent[],
  currentLat: number,
  currentLng: number
): CalendarQuest[] {
  return events.map((event) => {
    const classification = classifyEvent(event);

    return {
      id: event.id,
      name: event.summary,
      type: classification.type,
      reward: classification.reward,
      description: event.description ?? "由行事曆轉換而成的現實世界任務。",
      startTime: formatTime(event.start.dateTime),
      endTime: formatTime(event.end.dateTime),
      locationName: event.location ?? "未標記地點",
      lat: event.lat ?? currentLat + (Math.random() - 0.5) * 0.005,
      lng: event.lng ?? currentLng + (Math.random() - 0.5) * 0.005,
    };
  });
}

export function parseCalendarFeed(events: unknown): RawCalendarEvent[] {
  if (!Array.isArray(events)) return [];
  return events.filter((event): event is RawCalendarEvent => {
    const candidate = event as Partial<RawCalendarEvent>;
    return Boolean(candidate.id && candidate.summary && candidate.start?.dateTime && candidate.end?.dateTime);
  });
}
