import type { DifficultyId, RunModifierId } from '../types';
import { DEFAULT_RUN_MODIFIER, RUN_MODIFIER_IDS } from './runModifiers';

export interface GameMode {
  key: string;
  id: DifficultyId | 'versus';
  daily?: boolean;
  enabled: boolean;
  label: string;
  desc: string;
  modifiers: readonly RunModifierId[];
}

export const GAME_MODES: readonly GameMode[] = [
  { key: 'training', id: 'training', enabled: true, label: 'Training Shift', desc: '60s guided run. Learn the hotkeys safely.', modifiers: ['classic'] },
  { key: 'versus', id: 'versus', enabled: true, label: 'Local Duel', desc: 'P1 pad 1 vs P2 pad 2. Same pipeline, highest score wins.', modifiers: ['classic'] },
  { key: 'normal', id: 'normal', enabled: false, label: 'Normal', desc: 'Relaxed pacing. Learn the pipeline.', modifiers: RUN_MODIFIER_IDS },
  { key: 'hard', id: 'hard', enabled: false, label: 'Hard', desc: 'Faster events, more sequences.', modifiers: RUN_MODIFIER_IDS },
  { key: 'conference', id: 'conference', enabled: false, label: 'Conference', desc: 'The full pipeline rush.', modifiers: RUN_MODIFIER_IDS },
  { key: 'devfest', id: 'conference', daily: true, enabled: true, label: 'DevFest Challenge', desc: 'Same event sequence for everyone today.', modifiers: ['classic'] }
];

export function availableModes(modes: readonly GameMode[] = GAME_MODES): GameMode[] {
  return modes.filter((mode) => mode.enabled);
}

export function availableModifiers(mode: GameMode): readonly RunModifierId[] {
  if (mode.id === 'training' || mode.id === 'versus' || mode.daily) return [DEFAULT_RUN_MODIFIER];
  return mode.modifiers.length > 0 ? mode.modifiers : [DEFAULT_RUN_MODIFIER];
}

export function runModifier(difficulty: DifficultyId, daily: boolean, requested?: RunModifierId): RunModifierId {
  const mode = GAME_MODES.find((item) => item.id === difficulty && Boolean(item.daily) === daily);
  const modifiers = mode ? availableModifiers(mode) : [DEFAULT_RUN_MODIFIER];
  return requested && modifiers.includes(requested) ? requested : modifiers[0];
}