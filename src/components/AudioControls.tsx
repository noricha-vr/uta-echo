interface AudioControlsProps {
  isMicEnabled: boolean;
  isEffectEnabled: boolean;
  effectIntensity: number;
  isRecording: boolean;
  recordingDuration: number;
  onMicToggle: () => void;
  onEffectToggle: () => void;
  onEffectIntensityChange: (value: number) => void;
  onRecordingStart: () => void;
  onRecordingStop: () => void;
}

const AudioControls = ({
  isMicEnabled,
  isEffectEnabled,
  effectIntensity,
  isRecording,
  recordingDuration,
  onMicToggle,
  onEffectToggle,
  onEffectIntensityChange,
  onRecordingStart,
  onRecordingStop,
}: AudioControlsProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">音声コントロール</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <h3 className="text-lg font-medium mb-3">エフェクト設定</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isEffectEnabled}
                onChange={onEffectToggle}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2">リバーブエフェクト</span>
            </label>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                エフェクト強度: {effectIntensity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={effectIntensity}
                onChange={(e) => onEffectIntensityChange(Number(e.target.value))}
                disabled={!isEffectEnabled}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
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