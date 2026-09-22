import { SpeechAnalysisMetrics } from '../types';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const FILLER_WORDS = ['um', 'uh', 'like', 'basically', 'actually', 'literally', 'you know', 'sort of', 'kind of'];

export class SpeechAnalysisEngine {
  private recognition: any = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private isListening = false;
  private startTime = 0;
  private totalWords = 0;
  private fullTranscript = '';
  private interimTranscript = '';
  private fillersFound: string[] = [];
  private onMetricsCallback: ((metrics: SpeechAnalysisMetrics) => void) | null = null;
  private animFrameId: number | null = null;

  public async start(onMetrics: (metrics: SpeechAnalysisMetrics) => void) {
    this.onMetricsCallback = onMetrics;
    this.isListening = true;
    this.startTime = Date.now();
    this.totalWords = 0;
    this.fullTranscript = '';
    this.interimTranscript = '';
    this.fillersFound = [];

    // 1. Initialize Microphone Audio Visualizer (Web Audio API)
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.micStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);
      this.trackAudioVolume();
    } catch (e) {
      console.warn('Microphone stream initialization for audio level failed', e);
    }

    // 2. Initialize Web Speech Recognition
    const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechClass) {
      try {
        this.recognition = new SpeechClass();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcriptChunk = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              this.fullTranscript += ' ' + transcriptChunk;
              this.inspectFillers(transcriptChunk);
            } else {
              interim += transcriptChunk;
            }
          }

          this.interimTranscript = interim;
          this.calculateAndEmitMetrics();
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition error', event.error);
        };

        this.recognition.onend = () => {
          if (this.isListening) {
            try { this.recognition.start(); } catch {}
          }
        };

        this.recognition.start();
      } catch (e) {
        console.warn('Speech recognition start failed', e);
      }
    }
  }

  public stop() {
    this.isListening = false;
    if (this.recognition) {
      try { this.recognition.stop(); } catch {}
      this.recognition = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.audioContext) {
      try { this.audioContext.close(); } catch {}
      this.audioContext = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private inspectFillers(text: string) {
    const lower = text.toLowerCase();
    for (const filler of FILLER_WORDS) {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = lower.match(regex);
      if (matches) {
        matches.forEach((m) => this.fillersFound.push(m.toLowerCase()));
      }
    }
  }

  private trackAudioVolume = () => {
    if (!this.isListening || !this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const avg = sum / dataArray.length;
    const volume = Math.min(100, Math.round((avg / 128) * 100));

    this.calculateAndEmitMetrics(volume);
    this.animFrameId = requestAnimationFrame(this.trackAudioVolume);
  };

  private calculateAndEmitMetrics(currentVol: number = 0) {
    const textToCount = (this.fullTranscript + ' ' + this.interimTranscript).trim();
    const words = textToCount.length > 0 ? textToCount.split(/\s+/).filter(Boolean) : [];
    this.totalWords = words.length;

    // Calculate WPM
    const elapsedMinutes = Math.max(0.1, (Date.now() - this.startTime) / 60000);
    const wpm = Math.round(this.totalWords / elapsedMinutes);

    if (this.onMetricsCallback) {
      this.onMetricsCallback({
        transcript: this.fullTranscript.trim(),
        interimTranscript: this.interimTranscript.trim(),
        wordCount: this.totalWords,
        wpm,
        fillerCount: this.fillersFound.length,
        fillersDetected: [...this.fillersFound],
        isListening: this.isListening,
        audioVolume: currentVol,
      });
    }
  }
}

export const speechEngine = new SpeechAnalysisEngine();
