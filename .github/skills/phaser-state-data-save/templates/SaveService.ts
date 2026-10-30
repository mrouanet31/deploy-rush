export interface SaveDataV1 { version: 1; highScore: number; settings: { muted: boolean }; }
const KEY = 'game-save-v1';
export function loadSave(): SaveDataV1 {
  const raw = localStorage.getItem(KEY);
  if (!raw) return { version: 1, highScore: 0, settings: { muted: false } };
  const parsed = JSON.parse(raw) as Partial<SaveDataV1>;
  return { version: 1, highScore: parsed.highScore ?? 0, settings: { muted: !!parsed.settings?.muted } };
}
export function save(data: SaveDataV1) { localStorage.setItem(KEY, JSON.stringify(data)); }
