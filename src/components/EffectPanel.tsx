import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EffectConfig, EffectType } from '../types';
import { EFFECT_PARAMS } from '../types';

interface EffectPanelProps {
  effect: EffectConfig;
  onChange: (effect: EffectConfig) => void;
  onRemove: () => void;
}

const EFFECT_ICONS: Record<EffectType, string> = {
  reverb: '🏛️',
  delay: '🔊',
  distortion: '🎸',
  pitch: '🎵',
  chorus: '👥',
  flanger: '🌊',
  lowpass: '🔻',
  highpass: '🔺',
  compressor: '🗜️'
};

const EFFECT_NAMES: Record<EffectType, string> = {
  reverb: 'リバーブ',
  delay: 'ディレイ',
  distortion: 'ディストーション',
  pitch: 'ピッチシフト',
  chorus: 'コーラス',
  flanger: 'フランジャー',
  lowpass: 'ローパスフィルター',
  highpass: 'ハイパスフィルター',
  compressor: 'コンプレッサー'
};

const PARAM_NAMES: Record<string, string> = {
  roomSize: '部屋の大きさ',
  decay: '減衰時間',
  wetness: 'ウェット',
  time: '遅延時間',
  feedback: 'フィードバック',
  amount: '強度',
  tone: 'トーン',
  shift: 'ピッチ',
  rate: 'レート',
  depth: '深さ',
  frequency: '周波数',
  resonance: 'レゾナンス',
  threshold: 'スレッショルド',
  ratio: 'レシオ',
  attack: 'アタック',
  release: 'リリース'
};

const PARAM_UNITS: Record<string, string> = {
  frequency: 'Hz',
  time: 'ms',
  threshold: 'dB',
  shift: '半音',
  rate: 'Hz'
};

const EffectPanel = ({ effect, onChange, onRemove }: EffectPanelProps) => {
  const [expanded, setExpanded] = useState(effect.enabled);
  const [hoveredParam, setHoveredParam] = useState<string | null>(null);
  const paramConfig = EFFECT_PARAMS[effect.type];

  const handleEnabledToggle = () => {
    onChange({ ...effect, enabled: !effect.enabled });
    if (!effect.enabled) {
      setExpanded(true);
    }
  };

  const handleParamChange = (param: string, value: number) => {
    onChange({
      ...effect,
      params: { ...effect.params, [param]: value }
    });
  };

  const getParamPercentage = (param: string, value: number) => {
    const config = paramConfig[param];
    return ((value - config.min) / (config.max - config.min)) * 100;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card overflow-hidden"
    >
      <motion.div 
        className="px-4 py-3 flex items-center justify-between bg-white/5"
        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
      >
        <div className="flex items-center space-x-3">
          {/* Animated toggle */}
          <motion.button
            onClick={handleEnabledToggle}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
              effect.enabled ? 'bg-purple-500' : 'bg-gray-600'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
              animate={{ x: effect.enabled ? 26 : 2 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </motion.button>
          
          {/* Effect name with icon */}
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ rotate: effect.enabled ? [0, 10, -10, 0] : 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl"
            >
              {EFFECT_ICONS[effect.type]}
            </motion.span>
            <h4 className={`font-medium transition-colors ${
              effect.enabled ? 'text-white' : 'text-gray-400'
            }`}>
              {EFFECT_NAMES[effect.type]}
            </h4>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Expand/collapse button */}
          <motion.button
            onClick={() => setExpanded(!expanded)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <motion.svg 
              className="w-5 h-5 text-gray-300"
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </motion.button>
          
          {/* Remove button */}
          <motion.button
            onClick={onRemove}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {Object.entries(paramConfig).map(([param, config], index) => {
                const value = effect.params[param] || config.default;
                const percentage = getParamPercentage(param, value);
                const unit = PARAM_UNITS[param] || '';
                
                return (
                  <motion.div
                    key={param}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onMouseEnter={() => setHoveredParam(param)}
                    onMouseLeave={() => setHoveredParam(null)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-300">
                        {PARAM_NAMES[param] || param}
                      </label>
                      <motion.span 
                        className="text-sm font-mono text-gray-400"
                        animate={{ scale: hoveredParam === param ? 1.1 : 1 }}
                      >
                        {value.toFixed(config.step && config.step >= 1 ? 0 : 1)}
                        {unit && ` ${unit}`}
                      </motion.span>
                    </div>
                    
                    {/* Custom slider */}
                    <div className="relative h-8 group">
                      <div className="absolute inset-y-0 w-full flex items-center">
                        {/* Track background */}
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          {/* Track fill */}
                          <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: `${percentage}%` }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.1 }}
                          />
                        </div>
                        
                        {/* Glow effect on hover */}
                        <AnimatePresence>
                          {hoveredParam === param && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 flex items-center"
                              style={{ width: `${percentage}%` }}
                            >
                              <div className="w-full h-2 rounded-full"
                                style={{
                                  background: 'linear-gradient(to right, rgba(168, 85, 247, 0.4), rgba(236, 72, 153, 0.4))',
                                  filter: 'blur(8px)'
                                }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      {/* Actual input (invisible) */}
                      <input
                        type="range"
                        min={config.min}
                        max={config.max}
                        step={config.step || (config.max - config.min) / 100}
                        value={value}
                        onChange={(e) => handleParamChange(param, Number(e.target.value))}
                        disabled={!effect.enabled}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      
                      {/* Thumb */}
                      <motion.div
                        className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg pointer-events-none"
                        style={{ left: `${percentage}%` }}
                        animate={{ 
                          scale: hoveredParam === param ? 1.2 : 1,
                          boxShadow: hoveredParam === param 
                            ? '0 0 20px rgba(168, 85, 247, 0.6)' 
                            : '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
              
              {/* Wet/Dry mix visual indicator */}
              {effect.params.wetness !== undefined && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>ドライ</span>
                    <motion.div 
                      className="flex-1 mx-3 h-1 bg-gray-700 rounded-full overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-gray-500 to-purple-500"
                        style={{ width: `${effect.params.wetness * 100}%` }}
                        animate={{ width: `${effect.params.wetness * 100}%` }}
                      />
                    </motion.div>
                    <span>ウェット</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EffectPanel;