import lamejs from 'lamejs';

export async function convertToMp3(webmBlob: Blob): Promise<Blob> {
  try {
    // Create audio context to decode webm
    const audioContext = new AudioContext();
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Get audio data
    const channels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const samples = audioBuffer.length;
    
    // Create MP3 encoder
    const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128); // 128 kbps
    
    // Process audio data
    const mp3Data: Int8Array[] = [];
    const sampleBlockSize = 1152; // Must be 1152 for MP3
    
    // Convert float samples to 16-bit PCM
    const channelData: Int16Array[] = [];
    for (let i = 0; i < channels; i++) {
      const channel = audioBuffer.getChannelData(i);
      const pcm = new Int16Array(channel.length);
      for (let j = 0; j < channel.length; j++) {
        const s = Math.max(-1, Math.min(1, channel[j]));
        pcm[j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      channelData.push(pcm);
    }
    
    // Encode to MP3
    for (let i = 0; i < samples; i += sampleBlockSize) {
      const leftChunk = channelData[0].subarray(i, i + sampleBlockSize);
      const rightChunk = channels > 1 ? channelData[1].subarray(i, i + sampleBlockSize) : leftChunk;
      
      const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }
    
    // Finish encoding
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
    
    // Combine all chunks
    const totalLength = mp3Data.reduce((acc, chunk) => acc + chunk.length, 0);
    const mp3Result = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of mp3Data) {
      mp3Result.set(chunk, offset);
      offset += chunk.length;
    }
    
    // Close audio context
    await audioContext.close();
    
    return new Blob([mp3Result], { type: 'audio/mp3' });
  } catch (error) {
    console.error('MP3 conversion failed:', error);
    throw error;
  }
}