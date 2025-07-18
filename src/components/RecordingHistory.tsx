import { useState } from 'react';
import type { RecordingData } from '../types';
import RecordingItem from './RecordingItem';

interface RecordingHistoryProps {
  recordings: RecordingData[];
  onDelete: (id: string) => void;
}

const RecordingHistory = ({ recordings, onDelete }: RecordingHistoryProps) => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">録音履歴</h2>
      
      {recordings.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          録音がありません。録音を開始してください。
        </p>
      ) : (
        <div className="space-y-3">
          {recordings.map((recording) => (
            <RecordingItem
              key={recording.id}
              recording={recording}
              isPlaying={playingId === recording.id}
              onPlay={() => setPlayingId(recording.id)}
              onStop={() => setPlayingId(null)}
              onDelete={() => onDelete(recording.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecordingHistory;