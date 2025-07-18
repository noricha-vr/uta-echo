import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RecordingData } from '../types';
import RecordingItem from './RecordingItem';

interface RecordingHistoryProps {
  recordings: RecordingData[];
  onDelete: (id: string) => void;
}

const RecordingHistory = ({ recordings, onDelete }: RecordingHistoryProps) => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <motion.div 
      className="glass-card p-6"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-semibold mb-4 gradient-text flex items-center gap-3">
        <span className="text-3xl">🎵</span>
        録音履歴
      </h2>
      
      <AnimatePresence mode="popLayout">
        {recordings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="text-6xl mb-4"
            >
              🎤
            </motion.div>
            <p className="text-gray-400">
              録音がありません。録音を開始してください。
            </p>
          </motion.div>
        ) : (
          <motion.div className="space-y-3">
            {recordings.map((recording, index) => (
              <motion.div
                key={recording.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <RecordingItem
                  recording={recording}
                  isPlaying={playingId === recording.id}
                  onPlay={() => setPlayingId(recording.id)}
                  onStop={() => setPlayingId(null)}
                  onDelete={() => onDelete(recording.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RecordingHistory;