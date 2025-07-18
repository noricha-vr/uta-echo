export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private convolverNode: ConvolverNode | null = null;
  private wetGainNode: GainNode | null = null;
  private dryGainNode: GainNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isEffectEnabled: boolean = true;
  private recordingDestination: MediaStreamAudioDestinationNode | null = null;

  async initializeAudio(): Promise<void> {
    try {
      // Get user media
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      // Create audio context
      this.audioContext = new AudioContext();

      // Create nodes
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.gainNode = this.audioContext.createGain();
      this.convolverNode = this.audioContext.createConvolver();
      this.wetGainNode = this.audioContext.createGain();
      this.dryGainNode = this.audioContext.createGain();

      // Create impulse response for reverb
      await this.createImpulseResponse();

      // Set initial gains
      this.wetGainNode.gain.value = 0.5;
      this.dryGainNode.gain.value = 0.5;

      // Connect nodes for reverb effect
      this.sourceNode.connect(this.gainNode);
      
      // Dry path (direct signal)
      this.gainNode.connect(this.dryGainNode);
      this.dryGainNode.connect(this.audioContext.destination);
      
      // Wet path (reverb signal)
      this.gainNode.connect(this.convolverNode);
      this.convolverNode.connect(this.wetGainNode);
      this.wetGainNode.connect(this.audioContext.destination);

      // Create destination for recording
      this.recordingDestination = this.audioContext.createMediaStreamDestination();
      this.dryGainNode.connect(this.recordingDestination);
      this.wetGainNode.connect(this.recordingDestination);

    } catch (error) {
      console.error('Failed to initialize audio:', error);
      this.cleanup();
      throw error;
    }
  }

  private async createImpulseResponse(): Promise<void> {
    if (!this.audioContext || !this.convolverNode) return;

    const length = this.audioContext.sampleRate * 2; // 2 seconds reverb
    const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }

    this.convolverNode.buffer = impulse;
  }

  applyReverb(intensity: number): void {
    if (!this.wetGainNode || !this.dryGainNode) return;

    // intensity is 0-100, convert to 0-1
    const wetLevel = (intensity / 100) * 0.8; // Max 80% wet signal
    const dryLevel = 1 - wetLevel;

    this.wetGainNode.gain.setValueAtTime(this.isEffectEnabled ? wetLevel : 0, this.audioContext!.currentTime);
    this.dryGainNode.gain.setValueAtTime(this.isEffectEnabled ? dryLevel : 1, this.audioContext!.currentTime);
  }

  toggleEffect(enabled: boolean): void {
    this.isEffectEnabled = enabled;
    if (!this.wetGainNode || !this.dryGainNode || !this.audioContext) return;

    if (enabled) {
      // Re-apply current intensity
      this.applyReverb(50); // Default to 50% if needed
    } else {
      // Bypass effect
      this.wetGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      this.dryGainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
    }
  }

  startRecording(): void {
    if (!this.recordingDestination) {
      throw new Error('Audio not initialized');
    }

    this.recordedChunks = [];
    
    const options = {
      mimeType: 'audio/webm;codecs=opus',
    };

    this.mediaRecorder = new MediaRecorder(this.recordingDestination.stream, options);
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm;codecs=opus' });
        this.recordedChunks = [];
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  cleanup(): void {
    // Stop all tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }

    // Disconnect all nodes
    if (this.sourceNode) this.sourceNode.disconnect();
    if (this.gainNode) this.gainNode.disconnect();
    if (this.convolverNode) this.convolverNode.disconnect();
    if (this.wetGainNode) this.wetGainNode.disconnect();
    if (this.dryGainNode) this.dryGainNode.disconnect();

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    // Reset all references
    this.audioContext = null;
    this.mediaStream = null;
    this.sourceNode = null;
    this.gainNode = null;
    this.convolverNode = null;
    this.wetGainNode = null;
    this.dryGainNode = null;
    this.mediaRecorder = null;
    this.recordingDestination = null;
  }
}