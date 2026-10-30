export type GameEvents = {
  'score:changed': { score: number };
  'player:dead': { reason: string };
};

export class EventBus<E extends Record<string, unknown>> {
  private listeners = new Map<keyof E, Set<(payload: any) => void>>();
  on<K extends keyof E>(type: K, fn: (payload: E[K]) => void) {
    const set = this.listeners.get(type) ?? new Set(); set.add(fn as any); this.listeners.set(type, set);
    return () => set.delete(fn as any);
  }
  emit<K extends keyof E>(type: K, payload: E[K]) {
    this.listeners.get(type)?.forEach(fn => fn(payload));
  }
}
