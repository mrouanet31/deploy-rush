export const Assets = {
  texture: { player: 'player', enemy: 'enemy' },
  audio: { hit: 'hit', music: 'music' },
} as const;

export type TextureKey = typeof Assets.texture[keyof typeof Assets.texture];
export type AudioKey = typeof Assets.audio[keyof typeof Assets.audio];
