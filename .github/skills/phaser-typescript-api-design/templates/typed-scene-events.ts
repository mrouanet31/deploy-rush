export type SceneEventMap = {
  damage: { amount: number; source: string };
  pickup: { id: string; kind: 'coin' | 'health' };
};
