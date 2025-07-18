import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  audioEngine: { getAnalyserData: () => Uint8Array | null };
  onMicToggle: () => void;
  onMicGainChange: (gain: number) => void;
  onEffectsChange: (effects: EffectConfig[]) => void;
  onPresetChange: (presetId: string | null) => void;
  onRecordingStart: () => void;
  onRecordingStop: () => void;
}

const AVAILABLE_EFFECTS: { type: EffectType; name: string; icon: string }[] = [
  { type: 'reverb', name: 'リバーブ', icon: '🏛️' },
  { type: 'delay', name: 'ディレイ', icon: '🔊' },
  { type: 'distortion', name: 'ディストーション', icon: '🎸' },
  { type: 'pitch', name: 'ピッチシフト', icon: '🎵' },
  { type: 'chorus', name: 'コーラス', icon: '👥' },
  { type: 'flanger', name: 'フランジャー', icon: '🌊' },
  { type: 'lowpass', name: 'ローパスフィルター', icon: '🔻' },
  { type: 'highpass', name: 'ハイパスフィルター', icon: '🔺' },
  { type: 'compressor', name: 'コンプレッサー', icon: '🗜️' }
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
    onPresetChange(null);
    setShowEffectMenu(false);
  };

  const handleEffectChange = (index: number, updatedEffect: EffectConfig) => {
    const newEffects = [...effects];
    newEffects[index] = updatedEffect;
    onEffectsChange(newEffects);
    onPresetChange(null);
  };

  const handleEffectRemove = (index: number) => {
    const newEffects = effects.filter((_, i) => i !== index);
    onEffectsChange(newEffects);
    onPresetChange(null);
  };

  const availableEffectsToAdd = AVAILABLE_EFFECTS.filter(
    availableEffect => !effects.some(e => e.type === availableEffect.type)
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* マイクとビジュアライザー */}
      <motion.div 
        className="glass-card p-6"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-semibold mb-4 gradient-text">音声コントロール</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* マイクボタン */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-200">マイク設定</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onMicToggle}
                className={`relative px-8 py-4 rounded-full font-medium text-lg transition-all duration-300 ${
                  isMicEnabled
                    ? 'glow-button pulse-glow'
                    : 'glass-card hover:bg-white/20'
                }`}
              >
                <motion.div
                  animate={{ 
                    rotate: isMicEnabled ? 360 : 0,
                  }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-3"
                >
                  <span className="text-2xl">{isMicEnabled ? '🎤' : '🎙️'}</span>
                  <span>{isMicEnabled ? 'マイクOFF' : 'マイクON'}</span>
                </motion.div>
                
                {/* Recording indicator */}
                <AnimatePresence>
                  {isMicEnabled && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-green-400 rounded-full opacity-75"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
            
            {/* マイクゲイン */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                マイクゲイン: {(micGain * 100).toFixed(0)}%
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={micGain * 100}
                  onChange={(e) => onMicGainChange(Number(e.target.value) / 100)}
                  disabled={!isMicEnabled}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-gray-700 disabled:opacity-50"
                  style={{
                    background: `linear-gradient(to right, var(--gradient-start) 0%, var(--gradient-mid) ${micGain * 50}%, transparent ${micGain * 50}%)`
                  }}
                />
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg pointer-events-none"
                  style={{ left: `${(micGain * 100) / 2}%` }}
                  animate={{ scale: isMicEnabled ? 1 : 0.8 }}
                />
              </div>
            </div>
          </div>
          
          {/* ビジュアライザー */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-medium mb-3 text-gray-200">音声ビジュアライザー</h3>
            <div className="relative overflow-hidden rounded-xl">
              <Visualizer audioEngine={audioEngine} isActive={isMicEnabled} />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* プリセット */}
      <motion.div 
        className="glass-card p-6"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h3 className="text-lg font-medium mb-4 text-gray-200">プリセット</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DEFAULT_PRESETS.map((preset, index) => (
            <motion.button
              key={preset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePresetSelect(preset.id)}
              className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                activePreset === preset.id
                  ? 'glow-button text-white'
                  : 'glass-card hover:bg-white/10 text-gray-200'
              }`}
            >
              <motion.span
                animate={{ 
                  rotate: activePreset === preset.id ? [0, 10, -10, 0] : 0 
                }}
                transition={{ duration: 0.5 }}
                className="inline-block"
              >
                {preset.name}
              </motion.span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* エフェクトチェーン */}
      <motion.div 
        className="glass-card p-6"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-200">エフェクトチェーン</h3>
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEffectMenu(!showEffectMenu)}
              disabled={availableEffectsToAdd.length === 0}
              className="px-4 py-2 glow-button text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="inline-flex items-center gap-2">
                <motion.span
                  animate={{ rotate: showEffectMenu ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  ✨
                </motion.span>
                エフェクト追加
              </span>
            </motion.button>
            
            <AnimatePresence>
              {showEffectMenu && availableEffectsToAdd.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute right-0 mt-2 w-64 glass-card p-2 z-10"
                >
                  <div className="space-y-1">
                    {availableEffectsToAdd.map((effect, index) => (
                      <motion.button
                        key={effect.type}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ x: 10, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                        onClick={() => handleAddEffect(effect.type)}
                        className="block w-full text-left px-4 py-3 rounded-lg transition-all duration-200 text-gray-200"
                      >
                        <span className="inline-flex items-center gap-3">
                          <span className="text-2xl">{effect.icon}</span>
                          <span>{effect.name}</span>
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <AnimatePresence mode="popLayout">
          {effects.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-gray-400 text-center py-12"
            >
              エフェクトが追加されていません
            </motion.p>
          ) : (
            <motion.div className="space-y-3">
              {effects.map((effect, index) => (
                <motion.div
                  key={`${effect.type}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <EffectPanel
                    effect={effect}
                    onChange={(updated) => handleEffectChange(index, updated)}
                    onRemove={() => handleEffectRemove(index)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 録音コントロール */}
      <motion.div 
        className="glass-card p-6"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <h3 className="text-lg font-medium mb-4 text-gray-200">録音</h3>
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={isRecording ? onRecordingStop : onRecordingStart}
            disabled={!isMicEnabled}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50'
                : 'glass-card hover:bg-white/20 text-gray-200'
            }`}
          >
            <span className="inline-flex items-center gap-3">
              <motion.span
                animate={{ scale: isRecording ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 1, repeat: isRecording ? Infinity : 0 }}
                className="inline-block w-3 h-3 bg-current rounded-full"
              />
              {isRecording ? '録音停止' : '録音開始'}
            </span>
          </motion.button>
          
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-lg font-mono text-gray-300"
              >
                {formatTime(recordingDuration)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AudioControls;