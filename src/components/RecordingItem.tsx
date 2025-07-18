import { useRef, useEffect, useState } from 'react';
import type { RecordingData } from '../types';
import { convertToMp3 } from '../utils/audioConverter';

interface RecordingItemProps {
  recording: RecordingData;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  onDelete: () => void;
}

const RecordingItem = ({
  recording,
  isPlaying,
  onPlay,
  onStop,
  onDelete,
}: RecordingItemProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(recording.blob);
    setAudioUrl(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [recording.blob]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isPlaying]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const handleDownload = async () => {
    try {
      const mp3Blob = await convertToMp3(recording.blob);
      const url = URL.createObjectURL(mp3Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording_${recording.id}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to convert to MP3:', error);
      // Fallback to webm download
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `recording_${recording.id}.webm`;
      a.click();
    }
  };

  const handleDelete = () => {
    if (window.confirm('この録音を削除しますか？')) {
      onDelete();
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={onStop}
      />
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <button
              onClick={isPlaying ? onStop : onPlay}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              title={isPlaying ? '停止' : '再生'}
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <rect x="6" y="4" width="3" height="12" />
                  <rect x="11" y="4" width="3" height="12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 4v12l8-6z" />
                </svg>
              )}
            </button>
            
            <div>
              <p className="font-medium">{formatDate(recording.date)}</p>
              <p className="text-sm text-gray-600">
                {formatDuration(recording.duration)} | {formatSize(recording.size)} | 
                リバーブ {recording.effectLevel}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="ダウンロード"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="削除"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordingItem;