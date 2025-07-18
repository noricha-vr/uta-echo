export interface RecordingData {
  id: string;
  blob: Blob;
  date: Date;
  duration: number;
  effect: string;
  effectLevel: number;
  size: number;
  title?: string;
}

export interface AppState {
  // 音声関連
  isMicEnabled: boolean;
  isEffectEnabled: boolean;
  effectIntensity: number;
  
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