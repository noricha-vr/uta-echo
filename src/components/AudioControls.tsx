import { useState } from 'react';
import type { EffectConfig, EffectType } from '../types';
import EffectPanel from './EffectPanel';
import Visualizer from './Visualizer';
import { DEFAULT_PRESETS, createDefaultEffect } from '../utils/presets';

interface AudioControlsProps {
  isMicEnabled: boolean;
  micGain: number;
  effects: EffectConfig[];
  activePreset: string | null;
  isRecording: boolean;
  recordingDuration: number;
  audioEngine: any;
  onMicToggle: () => void;
  onMicGainChange: (gain: number) => void;
  onEffectsChange: (effects: EffectConfig[]) => void;
  onPresetChange: (presetId: string | null) => void;
  onRecordingStart: () => void;
  onRecordingStop: () => void;
}

const AVAILABLE_EFFECTS: { type: EffectType; name: string }[] = [
  { type: 'reverb', name: 'リバーブ' },
  { type: 'delay', name: 'ディレイ' },
  { type: 'distortion', name: 'ディストーション' },
  { type: 'pitch', name: 'ピッチシフト' },
  { type: 'chorus', name: 'コーラス' },
  { type: 'flanger', name: 'フランジャー' },
  { type: 'lowpass', name: 'ローパスフィルター' },
  { type: 'highpass', name: 'ハイパスフィルター' },
  { type: 'compressor', name: 'コンプレッサー' }
];

const AudioControls = ({
  isMicEnabled,
  micGain,
  effects,
  activePreset,
  isRecording,
  recordingDuration,
  audioEngine,
  onMicToggle,
  onMicGainChange,
  onEffectsChange,
  onPresetChange,
  onRecordingStart,
  onRecordingStop,
}: AudioControlsProps) => {
  const [showEffectMenu, setShowEffectMenu] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = DEFAULT_PRESETS.find(p => p.id === presetId);
    if (preset) {
      onPresetChange(presetId);
      onEffectsChange([...preset.effects]);
      onMicGainChange(preset.micGain);
    }
  };

  const handleAddEffect = (type: EffectType) => {
    const newEffect = createDefaultEffect(type);
    newEffect.enabled = true;
    onEffectsChange([...effects, newEffect]);
    onPresetChange(null); // Clear preset when manually adding effects
    setShowEffectMenu(false);
  };

  const handleEffectChange = (index: number, updatedEffect: EffectConfig) => {
    const newEffects = [...effects];
    newEffects[index] = updatedEffect;
    onEffectsChange(newEffects);
    onPresetChange(null); // Clear preset when modifying effects
  };

  const handleEffectRemove = (index: number) => {
    const newEffects = effects.filter((_, i) => i !== index);
    onEffectsChange(newEffects);
    onPresetChange(null); // Clear preset when removing effects
  };

  const availableEffectsToAdd = AVAILABLE_EFFECTS.filter(
    availableEffect => !effects.some(e => e.type === availableEffect.type)
  );

  return (
    <div className="space-y-6">
      {/* マイクとビジュアライザー */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">音声コントロール</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-3">マイク設定</h3>
              <button
                onClick={onMicToggle}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isMicEnabled
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isMicEnabled ? 'マイクOFF' : 'マイクON'}
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                マイクゲイン: {(micGain * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={micGain * 100}
                onChange={(e) => onMicGainChange(Number(e.target.value) / 100)}
                disabled={!isMicEnabled}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">音声ビジュアライザー</h3>
            <Visualizer audioEngine={audioEngine} isActive={isMicEnabled} />
          </div>
        </div>
      </div>

      {/* プリセット */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium mb-3">プリセット</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {DEFAULT_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activePreset === preset.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* エフェクトチェーン */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">エフェクトチェーン</h3>
          <div className="relative">
            <button
              onClick={() => setShowEffectMenu(!showEffectMenu)}
              disabled={availableEffectsToAdd.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              エフェクト追加
            </button>
            
            {showEffectMenu && availableEffectsToAdd.length > 0 && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  {availableEffectsToAdd.map(effect => (
                    <button
                      key={effect.type}
                      onClick={() => handleAddEffect(effect.type)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      {effect.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {effects.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            エフェクトが追加されていません
          </p>
        ) : (
          <div className="space-y-3">
            {effects.map((effect, index) => (
              <EffectPanel
                key={`${effect.type}-${index}`}
                effect={effect}
                onChange={(updated) => handleEffectChange(index, updated)}
                onRemove={() => handleEffectRemove(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 録音コントロール */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium mb-3">録音</h3>
        <div className="flex items-center space-x-4">
          {!isRecording ? (
            <button
              onClick={onRecordingStart}
              disabled={!isMicEnabled}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isMicEnabled
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              録音開始
            </button>
          ) : (
            <>
              <button
                onClick={onRecordingStop}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors"
              >
                録音停止
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-mono text-lg">{formatTime(recordingDuration)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioControls;