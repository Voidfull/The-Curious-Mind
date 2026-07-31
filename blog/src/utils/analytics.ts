import { readJson, writeJson } from './storage';

interface AnalyticsEvent {
  name: string;
  detail?: Record<string, string | number | boolean | null>;
  timestamp: string;
}

const STORAGE_KEY = 'blog_analytics_events';
const MAX_EVENTS = 200;

export function trackEvent(name: string, detail?: AnalyticsEvent['detail']): void {
  const events = readJson<AnalyticsEvent[]>(STORAGE_KEY, []);
  events.push({ name, detail, timestamp: new Date().toISOString() });
  writeJson(STORAGE_KEY, events.slice(-MAX_EVENTS));
}

export function getAnalyticsEvents(): AnalyticsEvent[] {
  return readJson<AnalyticsEvent[]>(STORAGE_KEY, []);
}