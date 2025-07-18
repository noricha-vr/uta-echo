import { useState, useEffect } from 'react';
import Header from './components/Header';
import AudioControls from './components/AudioControls';
import RecordingHistory from './components/RecordingHistory';
import StorageIndicator from './components/StorageIndicator';
import type { RecordingData, MicPermissionStatus, EffectConfig } from './types';
import { AudioEngine } from './services/AudioEngine';
import { StorageManager } from './services/StorageManager';
import { DEFAULT_PRESETS } from './utils/presets';

function App() {
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [micGain, setMicGain] = useState(1);
  const [effects, setEffects] = useState<EffectConfig[]>([]);
  const [activePreset, setActivePreset] = useState<string | null>('clean');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordings, setRecordings] = useState<RecordingData[]>([]);
  const [storageUsage, setStorageUsage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [, setMicPermissionStatus] = useState<MicPermissionStatus>('prompt');
  
  const [audioEngine] = useState(() => new AudioEngine());
  const [storageManager] = useState(() => new StorageManager());

  const STORAGE_LIMIT = 100 * 1024 * 1024; // 100MB

  useEffect(() => {
    loadRecordings();
    updateStorageUsage();
    
    // Set initial preset
    const cleanPreset = DEFAULT_PRESETS.find(p => p.id === 'clean');
    if (cleanPreset) {
      setEffects([...cleanPreset.effects]);
      setMicGain(cleanPreset.micGain);
    }
    
    return () => {
      audioEngine.cleanup();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (isMicEnabled) {
      audioEngine.updateEffects(effects);
    }
  }, [effects, isMicEnabled]);

  useEffect(() => {
    if (isMicEnabled) {
      audioEngine.setMicGain(micGain);
    }
  }, [micGain, isMicEnabled]);

  const loadRecordings = async () => {
    try {
      const data = await storageManager.getRecordings();
      setRecordings(data);
    } catch (err) {
      console.error('Failed to load recordings:', err);
      setError('録音の読み込みに失敗しました');
    }
  };

  const updateStorageUsage = async () => {
    try {
      const usage = await storageManager.calculateStorageUsage();
      setStorageUsage(usage);
    } catch (err) {
      console.error('Failed to calculate storage:', err);
    }
  };

  const handleMicToggle = async () => {
    if (!isMicEnabled) {
      try {
        await audioEngine.initializeAudio();
        audioEngine.setMicGain(micGain);
        audioEngine.updateEffects(effects);
        setIsMicEnabled(true);
        setMicPermissionStatus('granted');
        setError(null);
      } catch (err: any) {
        if (err.name === 'NotAllowedError') {
          setMicPermissionStatus('denied');
          setError('マイクへのアクセスが拒否されました。ブラウザの設定からマイクの使用を許可してください。');
        } else if (err.name === 'NotFoundError') {
          setError('マイクが見つかりません。マイクが接続されているか確認してください。');
        } else {
          setError('マイクの初期化に失敗しました。');
        }
      }
    } else {
      audioEngine.cleanup();
      setIsMicEnabled(false);
      if (isRecording) {
        await handleRecordingStop();
      }
    }
  };

  const handleMicGainChange = (gain: number) => {
    setMicGain(gain);
  };

  const handleEffectsChange = (newEffects: EffectConfig[]) => {
    setEffects(newEffects);
  };

  const handlePresetChange = (presetId: string | null) => {
    setActivePreset(presetId);
  };

  const handleRecordingStart = () => {
    if (!isMicEnabled) {
      setError('録音を開始するにはマイクを有効にしてください。');
      return;
    }
    
    audioEngine.startRecording();
    setIsRecording(true);
    setError(null);
  };

  const handleRecordingStop = async () => {
    try {
      const blob = await audioEngine.stopRecording();
      
      // Find preset name if using one
      const presetName = activePreset 
        ? DEFAULT_PRESETS.find(p => p.id === activePreset)?.name 
        : undefined;
      
      const recording: RecordingData = {
        id: Date.now().toString(),
        blob,
        date: new Date(),
        duration: recordingDuration,
        effects: [...effects],
        micGain,
        size: blob.size,
        presetName
      };
      
      await storageManager.saveRecording(recording);
      await loadRecordings();
      await updateStorageUsage();
      
      setIsRecording(false);
    } catch (err) {
      console.error('Failed to save recording:', err);
      setError('録音の保存に失敗しました。');
    }
  };

  const handleRecordingDelete = async (id: string) => {
    try {
      await storageManager.deleteRecording(id);
      await loadRecordings();
      await updateStorageUsage();
    } catch (err) {
      console.error('Failed to delete recording:', err);
      setError('録音の削除に失敗しました。');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <AudioControls
          isMicEnabled={isMicEnabled}
          micGain={micGain}
          effects={effects}
          activePreset={activePreset}
          isRecording={isRecording}
          recordingDuration={recordingDuration}
          audioEngine={audioEngine}
          onMicToggle={handleMicToggle}
          onMicGainChange={handleMicGainChange}
          onEffectsChange={handleEffectsChange}
          onPresetChange={handlePresetChange}
          onRecordingStart={handleRecordingStart}
          onRecordingStop={handleRecordingStop}
        />
        
        <div className="mt-8">
          <StorageIndicator
            usage={storageUsage}
            limit={STORAGE_LIMIT}
          />
        </div>
        
        <div className="mt-8">
          <RecordingHistory
            recordings={recordings}
            onDelete={handleRecordingDelete}
          />
        </div>
      </main>
    </div>
  );
}

export default App;