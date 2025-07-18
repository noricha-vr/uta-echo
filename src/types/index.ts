export type EffectType = 'reverb' | 'delay' | 'distortion' | 'pitch' | 'chorus' | 'flanger' | 'lowpass' | 'highpass' | 'compressor';

export interface EffectConfig {
  type: EffectType;
  enabled: boolean;
  params: Record<string, number>;
}

export interface EffectPreset {
  id: string;
  name: string;
  effects: EffectConfig[];
  micGain: number;
}

export interface RecordingData {
  id: string;
  blob: Blob;
  date: Date;
  duration: number;
  effects: EffectConfig[];
  micGain: number;
  size: number;
  title?: string;
  presetName?: string;
}

export interface AppState {
  // 音声関連
  isMicEnabled: boolean;
  micGain: number;
  effects: EffectConfig[];
  activePreset: string | null;
  
  // 録音関連
  isRecording: boolean;
  recordingDuration: number;
  recordings: RecordingData[];
  
  // ストレージ関連
  storageUsage: number;
  storageLimit: number;
  
  // エラー状態
  error: string | null;
  micPermissionStatus: 'granted' | 'denied' | 'prompt';
}

export type MicPermissionStatus = 'granted' | 'denied' | 'prompt';

export const EFFECT_PARAMS: Record<EffectType, Record<string, { min: number; max: number; default: number; step?: number }>> = {
  reverb: {
    roomSize: { min: 0, max: 100, default: 50 },
    decay: { min: 0.1, max: 10, default: 2 },
    wetness: { min: 0, max: 100, default: 50 }
  },
  delay: {
    time: { min: 0, max: 2000, default: 250 },
    feedback: { min: 0, max: 90, default: 50 },
    wetness: { min: 0, max: 100, default: 50 }
  },
  distortion: {
    amount: { min: 0, max: 100, default: 50 },
    tone: { min: 0, max: 100, default: 50 }
  },
  pitch: {
    shift: { min: -12, max: 12, default: 0, step: 1 },
    wetness: { min: 0, max: 100, default: 100 }
  },
  chorus: {
    rate: { min: 0.1, max: 10, default: 1.5 },
    depth: { min: 0, max: 100, default: 50 },
    wetness: { min: 0, max: 100, default: 50 }
  },
  flanger: {
    rate: { min: 0.1, max: 10, default: 0.5 },
    depth: { min: 0, max: 100, default: 50 },
    feedback: { min: 0, max: 90, default: 50 }
  },
  lowpass: {
    frequency: { min: 100, max: 20000, default: 5000 },
    resonance: { min: 0, max: 30, default: 1 }
  },
  highpass: {
    frequency: { min: 20, max: 10000, default: 1000 },
    resonance: { min: 0, max: 30, default: 1 }
  },
  compressor: {
    threshold: { min: -60, max: 0, default: -24 },
    ratio: { min: 1, max: 20, default: 8 },
    attack: { min: 0, max: 1, default: 0.003 },
    release: { min: 0, max: 1, default: 0.25 }
  }
};