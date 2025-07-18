import { useState } from 'react';
import type { EffectConfig, EffectType } from '../types';
import { EFFECT_PARAMS } from '../types';

interface EffectPanelProps {
  effect: EffectConfig;
  onChange: (effect: EffectConfig) => void;
  onRemove: () => void;
}

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
  time: '遅延時間 (ms)',
  feedback: 'フィードバック',
  amount: '強度',
  tone: 'トーン',
  shift: 'ピッチ (半音)',
  rate: 'レート (Hz)',
  depth: '深さ',
  frequency: '周波数 (Hz)',
  resonance: 'レゾナンス',
  threshold: 'スレッショルド (dB)',
  ratio: 'レシオ',
  attack: 'アタック',
  release: 'リリース'
};

const EffectPanel = ({ effect, onChange, onRemove }: EffectPanelProps) => {
  const [expanded, setExpanded] = useState(effect.enabled);
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

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={effect.enabled}
            onChange={handleEnabledToggle}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <h4 className="font-medium">{EFFECT_NAMES[effect.type]}</h4>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title={expanded ? '閉じる' : '開く'}
          >
            <svg className={`w-5 h-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={onRemove}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="削除"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 space-y-4">
          {Object.entries(paramConfig).map(([param, config]) => (
            <div key={param}>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">
                  {PARAM_NAMES[param] || param}
                </label>
                <span className="text-sm text-gray-600">
                  {effect.params[param]?.toFixed(config.step && config.step >= 1 ? 0 : 1)}
                  {param === 'frequency' ? ' Hz' : ''}
                  {param === 'time' ? ' ms' : ''}
                  {param === 'threshold' ? ' dB' : ''}
                  {param === 'shift' ? ' 半音' : ''}
                </span>
              </div>
              <input
                type="range"
                min={config.min}
                max={config.max}
                step={config.step || (config.max - config.min) / 100}
                value={effect.params[param] || config.default}
                onChange={(e) => handleParamChange(param, Number(e.target.value))}
                disabled={!effect.enabled}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EffectPanel;