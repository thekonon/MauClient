import { AppEvents } from "./events";

type EventHandler<T> = (payload: T) => void;

class EventBus<EventMap extends object> {
  private listeners: {
    [K in keyof EventMap]?: EventHandler<EventMap[K]>[];
  } = {};

  on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
    (this.listeners[event] ??= []).push(handler);
  }

  off<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
    const handlers = this.listeners[event];
    if (!handlers) return;
    this.listeners[event] = handlers.filter((h) => h !== handler);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    const handlers = this.listeners[event];
    if (!handlers) return;
    handlers.forEach((handler) => handler(payload));
  }
}

export const eventBus = new EventBus<AppEvents>();
