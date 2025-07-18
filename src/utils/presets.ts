import type { EffectPreset, EffectConfig } from '../types';
import { EFFECT_PARAMS } from '../types';

export const DEFAULT_PRESETS: EffectPreset[] = [
  {
    id: 'clean',
    name: 'クリーン',
    micGain: 1,
    effects: []
  },
  {
    id: 'karaoke-hall',
    name: 'カラオケホール',
    micGain: 1.2,
    effects: [
      {
        type: 'reverb',
        enabled: true,
        params: { roomSize: 70, decay: 3, wetness: 40 }
      },
      {
        type: 'compressor',
        enabled: true,
        params: { threshold: -20, ratio: 4, attack: 0.003, release: 0.25 }
      }
    ]
  },
  {
    id: 'echo-chamber',
    name: 'エコーチャンバー',
    micGain: 1,
    effects: [
      {
        type: 'delay',
        enabled: true,
        params: { time: 400, feedback: 60, wetness: 50 }
      },
      {
        type: 'reverb',
        enabled: true,
        params: { roomSize: 50, decay: 2, wetness: 30 }
      }
    ]
  },
  {
    id: 'rock-vocal',
    name: 'ロックボーカル',
    micGain: 1.5,
    effects: [
      {
        type: 'distortion',
        enabled: true,
        params: { amount: 30, tone: 70 }
      },
      {
        type: 'compressor',
        enabled: true,
        params: { threshold: -15, ratio: 10, attack: 0.001, release: 0.1 }
      },
      {
        type: 'reverb',
        enabled: true,
        params: { roomSize: 30, decay: 1, wetness: 20 }
      }
    ]
  },
  {
    id: 'dreamy',
    name: 'ドリーミー',
    micGain: 1,
    effects: [
      {
        type: 'chorus',
        enabled: true,
        params: { rate: 1.5, depth: 60, wetness: 50 }
      },
      {
        type: 'reverb',
        enabled: true,
        params: { roomSize: 80, decay: 5, wetness: 60 }
      },
      {
        type: 'lowpass',
        enabled: true,
        params: { frequency: 8000, resonance: 2 }
      }
    ]
  },
  {
    id: 'robot',
    name: 'ロボット',
    micGain: 1,
    effects: [
      {
        type: 'pitch',
        enabled: true,
        params: { shift: -5, wetness: 100 }
      },
      {
        type: 'distortion',
        enabled: true,
        params: { amount: 50, tone: 30 }
      },
      {
        type: 'flanger',
        enabled: true,
        params: { rate: 2, depth: 80, feedback: 70 }
      }
    ]
  },
  {
    id: 'telephone',
    name: '電話',
    micGain: 2,
    effects: [
      {
        type: 'highpass',
        enabled: true,
        params: { frequency: 300, resonance: 5 }
      },
      {
        type: 'lowpass',
        enabled: true,
        params: { frequency: 3400, resonance: 5 }
      },
      {
        type: 'distortion',
        enabled: true,
        params: { amount: 20, tone: 50 }
      }
    ]
  },
  {
    id: 'underwater',
    name: '水中',
    micGain: 1,
    effects: [
      {
        type: 'lowpass',
        enabled: true,
        params: { frequency: 2000, resonance: 10 }
      },
      {
        type: 'chorus',
        enabled: true,
        params: { rate: 0.5, depth: 40, wetness: 70 }
      },
      {
        type: 'reverb',
        enabled: true,
        params: { roomSize: 90, decay: 4, wetness: 80 }
      }
    ]
  }
];

export function createDefaultEffect(type: string): EffectConfig {
  const params = EFFECT_PARAMS[type as keyof typeof EFFECT_PARAMS];
  const defaultParams: Record<string, number> = {};
  
  for (const [key, config] of Object.entries(params)) {
    defaultParams[key] = config.default;
  }
  
  return {
    type: type as any,
    enabled: false,
    params: defaultParams
  };
}