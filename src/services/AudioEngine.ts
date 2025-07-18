import type { EffectType, EffectConfig } from '../types';

interface EffectNode {
  type: EffectType;
  nodes: AudioNode[];
  wetGain?: GainNode;
  dryGain?: GainNode;
  params: Record<string, AudioParam | number>;
}

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private micGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordingDestination: MediaStreamAudioDestinationNode | null = null;
  private effectChain: Map<EffectType, EffectNode> = new Map();
  private analyser: AnalyserNode | null = null;
  private currentMicGain: number = 1;

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
      this.micGainNode = this.audioContext.createGain();
      this.masterGainNode = this.audioContext.createGain();
      this.analyser = this.audioContext.createAnalyser();
      
      // Set initial gain
      this.micGainNode.gain.value = this.currentMicGain;
      
      // Connect source to mic gain
      this.sourceNode.connect(this.micGainNode);
      
      // Create recording destination
      this.recordingDestination = this.audioContext.createMediaStreamDestination();
      
      // Initialize effect chain
      this.rebuildAudioChain([]);

    } catch (error) {
      console.error('Failed to initialize audio:', error);
      this.cleanup();
      throw error;
    }
  }

  setMicGain(gain: number): void {
    this.currentMicGain = gain;
    if (this.micGainNode && this.audioContext) {
      this.micGainNode.gain.setValueAtTime(gain, this.audioContext.currentTime);
    }
  }

  updateEffects(effects: EffectConfig[]): void {
    if (!this.audioContext || !this.micGainNode) return;
    this.rebuildAudioChain(effects);
  }

  private rebuildAudioChain(effects: EffectConfig[]): void {
    if (!this.audioContext || !this.micGainNode || !this.masterGainNode) return;

    // Disconnect existing chain
    this.effectChain.forEach(effect => {
      effect.nodes.forEach(node => node.disconnect());
    });
    this.effectChain.clear();

    // Start with mic gain
    let lastNode: AudioNode = this.micGainNode;

    // Build effect chain
    for (const effect of effects) {
      if (!effect.enabled) continue;

      const effectNode = this.createEffect(effect);
      if (effectNode) {
        this.effectChain.set(effect.type, effectNode);
        
        // Connect dry/wet if available
        if (effectNode.dryGain && effectNode.wetGain) {
          lastNode.connect(effectNode.dryGain);
          lastNode.connect(effectNode.nodes[0]);
          const lastEffectNode = effectNode.nodes[effectNode.nodes.length - 1];
          lastEffectNode.connect(effectNode.wetGain);
          
          // Create merger
          const merger = this.audioContext.createGain();
          effectNode.dryGain.connect(merger);
          effectNode.wetGain.connect(merger);
          lastNode = merger;
        } else {
          // Direct connection
          lastNode.connect(effectNode.nodes[0]);
          lastNode = effectNode.nodes[effectNode.nodes.length - 1];
        }
      }
    }

    // Connect to master gain and destinations
    lastNode.connect(this.masterGainNode);
    lastNode.connect(this.analyser!);
    this.masterGainNode.connect(this.audioContext.destination);
    this.masterGainNode.connect(this.recordingDestination!);
  }

  private createEffect(config: EffectConfig): EffectNode | null {
    if (!this.audioContext) return null;

    switch (config.type) {
      case 'reverb':
        return this.createReverb(config.params);
      case 'delay':
        return this.createDelay(config.params);
      case 'distortion':
        return this.createDistortion(config.params);
      case 'pitch':
        return this.createPitchShift(config.params);
      case 'chorus':
        return this.createChorus(config.params);
      case 'flanger':
        return this.createFlanger(config.params);
      case 'lowpass':
        return this.createLowpass(config.params);
      case 'highpass':
        return this.createHighpass(config.params);
      case 'compressor':
        return this.createCompressor(config.params);
      default:
        return null;
    }
  }

  private createReverb(params: Record<string, number>): EffectNode {
    const convolver = this.audioContext!.createConvolver();
    const wetGain = this.audioContext!.createGain();
    const dryGain = this.audioContext!.createGain();

    // Create impulse response
    const length = this.audioContext!.sampleRate * (params.decay || 2);
    const impulse = this.audioContext!.createBuffer(2, length, this.audioContext!.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const n = length - i;
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(n / length, params.roomSize / 100 || 0.5);
      }
    }
    
    convolver.buffer = impulse;
    
    const wetness = (params.wetness || 50) / 100;
    wetGain.gain.value = wetness;
    dryGain.gain.value = 1 - wetness;

    return {
      type: 'reverb',
      nodes: [convolver],
      wetGain,
      dryGain,
      params: { wetness: wetGain.gain, dryness: dryGain.gain }
    };
  }

  private createDelay(params: Record<string, number>): EffectNode {
    const delay = this.audioContext!.createDelay(2);
    const feedback = this.audioContext!.createGain();
    const wetGain = this.audioContext!.createGain();
    const dryGain = this.audioContext!.createGain();

    delay.delayTime.value = (params.time || 250) / 1000;
    feedback.gain.value = (params.feedback || 50) / 100;
    
    const wetness = (params.wetness || 50) / 100;
    wetGain.gain.value = wetness;
    dryGain.gain.value = 1 - wetness;

    // Create feedback loop
    delay.connect(feedback);
    feedback.connect(delay);

    return {
      type: 'delay',
      nodes: [delay, feedback],
      wetGain,
      dryGain,
      params: { 
        time: delay.delayTime, 
        feedback: feedback.gain,
        wetness: wetGain.gain
      }
    };
  }

  private createDistortion(params: Record<string, number>): EffectNode {
    const waveshaper = this.audioContext!.createWaveShaper();
    const toneFilter = this.audioContext!.createBiquadFilter();
    
    // Create distortion curve
    const amount = params.amount || 50;
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    
    waveshaper.curve = curve;
    waveshaper.oversample = '4x';
    
    // Tone control
    toneFilter.type = 'lowpass';
    toneFilter.frequency.value = 2000 + (params.tone || 50) * 180;
    
    waveshaper.connect(toneFilter);

    return {
      type: 'distortion',
      nodes: [waveshaper, toneFilter],
      params: { tone: toneFilter.frequency }
    };
  }

  private createPitchShift(params: Record<string, number>): EffectNode {
    // Simplified pitch shift using playback rate manipulation
    // For real-time pitch shifting, we'd need a more complex implementation
    const pitchShift = this.audioContext!.createGain();
    const wetGain = this.audioContext!.createGain();
    const dryGain = this.audioContext!.createGain();
    
    const wetness = (params.wetness || 100) / 100;
    wetGain.gain.value = wetness;
    dryGain.gain.value = 1 - wetness;

    // Note: This is a placeholder. Real pitch shifting requires 
    // more complex processing like granular synthesis or phase vocoding
    return {
      type: 'pitch',
      nodes: [pitchShift],
      wetGain,
      dryGain,
      params: { shift: params.shift || 0 }
    };
  }

  private createChorus(params: Record<string, number>): EffectNode {
    const delay1 = this.audioContext!.createDelay(0.1);
    const delay2 = this.audioContext!.createDelay(0.1);
    const lfo1 = this.audioContext!.createOscillator();
    const lfo2 = this.audioContext!.createOscillator();
    const lfoGain1 = this.audioContext!.createGain();
    const lfoGain2 = this.audioContext!.createGain();
    const wetGain = this.audioContext!.createGain();
    const dryGain = this.audioContext!.createGain();
    const merger = this.audioContext!.createGain();

    // Set up LFOs
    lfo1.frequency.value = params.rate || 1.5;
    lfo2.frequency.value = (params.rate || 1.5) * 1.1;
    
    const depth = (params.depth || 50) / 1000;
    lfoGain1.gain.value = depth;
    lfoGain2.gain.value = depth;

    // Connect LFOs to delay times
    lfo1.connect(lfoGain1);
    lfoGain1.connect(delay1.delayTime);
    lfo2.connect(lfoGain2);
    lfoGain2.connect(delay2.delayTime);

    // Set base delay times
    delay1.delayTime.value = 0.02;
    delay2.delayTime.value = 0.03;

    // Start LFOs
    lfo1.start();
    lfo2.start();

    // Connect delays to merger
    delay1.connect(merger);
    delay2.connect(merger);

    const wetness = (params.wetness || 50) / 100;
    wetGain.gain.value = wetness;
    dryGain.gain.value = 1 - wetness;

    return {
      type: 'chorus',
      nodes: [delay1, delay2, merger],
      wetGain,
      dryGain,
      params: { 
        rate: lfo1.frequency,
        depth: lfoGain1.gain,
        wetness: wetGain.gain
      }
    };
  }

  private createFlanger(params: Record<string, number>): EffectNode {
    const delay = this.audioContext!.createDelay(0.02);
    const lfo = this.audioContext!.createOscillator();
    const lfoGain = this.audioContext!.createGain();
    const feedback = this.audioContext!.createGain();
    const wetGain = this.audioContext!.createGain();
    const dryGain = this.audioContext!.createGain();

    // Set up LFO
    lfo.frequency.value = params.rate || 0.5;
    lfoGain.gain.value = (params.depth || 50) / 10000;

    // Connect LFO to delay time
    lfo.connect(lfoGain);
    lfoGain.connect(delay.delayTime);

    // Base delay time
    delay.delayTime.value = 0.005;

    // Feedback
    feedback.gain.value = (params.feedback || 50) / 100;
    delay.connect(feedback);
    feedback.connect(delay);

    lfo.start();

    const wetness = 0.5; // Fixed 50/50 mix for flanger
    wetGain.gain.value = wetness;
    dryGain.gain.value = 1 - wetness;

    return {
      type: 'flanger',
      nodes: [delay, feedback],
      wetGain,
      dryGain,
      params: {
        rate: lfo.frequency,
        depth: lfoGain.gain,
        feedback: feedback.gain
      }
    };
  }

  private createLowpass(params: Record<string, number>): EffectNode {
    const filter = this.audioContext!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = params.frequency || 5000;
    filter.Q.value = params.resonance || 1;

    return {
      type: 'lowpass',
      nodes: [filter],
      params: { 
        frequency: filter.frequency,
        resonance: filter.Q
      }
    };
  }

  private createHighpass(params: Record<string, number>): EffectNode {
    const filter = this.audioContext!.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = params.frequency || 1000;
    filter.Q.value = params.resonance || 1;

    return {
      type: 'highpass',
      nodes: [filter],
      params: {
        frequency: filter.frequency,
        resonance: filter.Q
      }
    };
  }

  private createCompressor(params: Record<string, number>): EffectNode {
    const compressor = this.audioContext!.createDynamicsCompressor();
    
    compressor.threshold.value = params.threshold || -24;
    compressor.ratio.value = params.ratio || 8;
    compressor.attack.value = params.attack || 0.003;
    compressor.release.value = params.release || 0.25;

    return {
      type: 'compressor',
      nodes: [compressor],
      params: {
        threshold: compressor.threshold,
        ratio: compressor.ratio,
        attack: compressor.attack,
        release: compressor.release
      }
    };
  }

  getAnalyserData(): Uint8Array | null {
    if (!this.analyser) return null;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    
    return dataArray;
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
    this.effectChain.forEach(effect => {
      effect.nodes.forEach(node => {
        if ('stop' in node && typeof node.stop === 'function') {
          node.stop();
        }
        node.disconnect();
      });
    });
    
    if (this.sourceNode) this.sourceNode.disconnect();
    if (this.micGainNode) this.micGainNode.disconnect();
    if (this.masterGainNode) this.masterGainNode.disconnect();
    if (this.analyser) this.analyser.disconnect();

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    // Reset all references
    this.audioContext = null;
    this.mediaStream = null;
    this.sourceNode = null;
    this.micGainNode = null;
    this.masterGainNode = null;
    this.mediaRecorder = null;
    this.recordingDestination = null;
    this.analyser = null;
    this.effectChain.clear();
  }
}