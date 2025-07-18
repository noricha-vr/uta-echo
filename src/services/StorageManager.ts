import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { RecordingData } from '../types';

interface RecordingDB extends Omit<RecordingData, 'blob'> {
  blobData: ArrayBuffer;
}

class RecordingDatabase extends Dexie {
  recordings!: Table<RecordingDB>;

  constructor() {
    super('UtaEchoDatabase');
    this.version(1).stores({
      recordings: 'id, date, duration, effect, effectLevel, size',
    });
  }
}

export class StorageManager {
  private db: RecordingDatabase;

  constructor() {
    this.db = new RecordingDatabase();
  }

  async saveRecording(recording: RecordingData): Promise<string> {
    try {
      // Convert Blob to ArrayBuffer for storage
      const arrayBuffer = await recording.blob.arrayBuffer();
      
      const dbRecording: RecordingDB = {
        id: recording.id,
        blobData: arrayBuffer,
        date: recording.date,
        duration: recording.duration,
        effect: recording.effect,
        effectLevel: recording.effectLevel,
        size: recording.size,
        title: recording.title,
      };

      await this.db.recordings.add(dbRecording);
      return recording.id;
    } catch (error) {
      console.error('Failed to save recording:', error);
      throw error;
    }
  }

  async getRecordings(): Promise<RecordingData[]> {
    try {
      const dbRecordings = await this.db.recordings
        .orderBy('date')
        .reverse()
        .toArray();

      // Convert ArrayBuffer back to Blob
      return dbRecordings.map(dbRec => ({
        id: dbRec.id,
        blob: new Blob([dbRec.blobData], { type: 'audio/webm;codecs=opus' }),
        date: dbRec.date,
        duration: dbRec.duration,
        effect: dbRec.effect,
        effectLevel: dbRec.effectLevel,
        size: dbRec.size,
        title: dbRec.title,
      }));
    } catch (error) {
      console.error('Failed to get recordings:', error);
      throw error;
    }
  }

  async deleteRecording(id: string): Promise<void> {
    try {
      await this.db.recordings.delete(id);
    } catch (error) {
      console.error('Failed to delete recording:', error);
      throw error;
    }
  }

  async calculateStorageUsage(): Promise<number> {
    try {
      const recordings = await this.db.recordings.toArray();
      return recordings.reduce((total, rec) => total + (rec.blobData.byteLength || 0), 0);
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
      return 0;
    }
  }

  async cleanupOldRecordings(targetSize: number = 90 * 1024 * 1024): Promise<void> {
    try {
      const currentUsage = await this.calculateStorageUsage();
      
      if (currentUsage <= targetSize) {
        return;
      }

      // Get all recordings sorted by date (oldest first)
      const recordings = await this.db.recordings
        .orderBy('date')
        .toArray();

      let totalDeleted = 0;
      for (const recording of recordings) {
        if (currentUsage - totalDeleted <= targetSize) {
          break;
        }

        await this.db.recordings.delete(recording.id);
        totalDeleted += recording.blobData.byteLength;
      }
    } catch (error) {
      console.error('Failed to cleanup old recordings:', error);
      throw error;
    }
  }
}