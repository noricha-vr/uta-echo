import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  const [downloadProgress, setDownloadProgress] = useState(false);

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
    setDownloadProgress(true);
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
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `recording_${recording.id}.webm`;
      a.click();
    } finally {
      setDownloadProgress(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('この録音を削除しますか？')) {
      onDelete();
    }
  };

  return (
    <motion.div 
      className="glass-card p-4 hover:bg-white/10 transition-all"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={onStop}
      />
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            {/* Play/Pause button */}
            <motion.button
              onClick={isPlaying ? onStop : onPlay}
              className="relative p-3 rounded-full glass-card hover:bg-white/20 transition-all group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: isPlaying ? 0 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isPlaying ? (
                  <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <rect x="6" y="4" width="3" height="12" rx="1" />
                    <rect x="11" y="4" width="3" height="12" rx="1" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 4v12l8-6z" />
                  </svg>
                )}
              </motion.div>
              
              {/* Pulse effect when playing */}
              {isPlaying && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-purple-400/20"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
            
            <div className="flex-1">
              <p className="font-medium text-gray-200">{formatDate(recording.date)}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <span>⏱</span> {formatDuration(recording.duration)}
                </span>
                <span className="text-gray-600">•</span>
                <span className="inline-flex items-center gap-1">
                  <span>💾</span> {formatSize(recording.size)}
                </span>
                {recording.presetName && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="inline-flex items-center gap-1 text-purple-400">
                      <span>🎵</span> {recording.presetName}
                    </span>
                  </>
                )}
                {!recording.presetName && recording.effects && recording.effects.filter(e => e.enabled).length > 0 && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="inline-flex items-center gap-1 text-pink-400">
                      <span>✨</span> カスタム ({recording.effects.filter(e => e.enabled).length} エフェクト)
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Download button */}
          <motion.button
            onClick={handleDownload}
            disabled={downloadProgress}
            className="p-2 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all disabled:opacity-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="MP3でダウンロード"
          >
            {downloadProgress ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </motion.div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
          </motion.button>
          
          {/* Delete button */}
          <motion.button
            onClick={handleDelete}
            className="p-2 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="削除"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default RecordingItem;