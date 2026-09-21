// Interfaz para el proveedor de audio (Permitirá cambiar WebSpeech por Amazon Polly sin tocar componentes)
export interface IAudioProvider {
  speak(text: string, onStart?: () => void, onEnd?: () => void, onError?: (err: any) => void): void;
  stop(): void;
  isSupported(): boolean;
}

class WebSpeechAudioProvider implements IAudioProvider {
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoice();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  private initVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Priorizamos voces naturales en inglés americano (General American)
    this.selectedVoice = 
      voices.find(v => v.lang === 'en-US' && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Guy'))) ||
      voices.find(v => v.lang.startsWith('en-US')) ||
      voices.find(v => v.lang.startsWith('en')) ||
      null;
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  speak(text: string, onStart?: () => void, onEnd?: () => void, onError?: (err: any) => void): void {
    if (!this.isSupported() || !this.synth) {
      console.warn("Speech synthesis not supported in this browser.");
      return;
    }

    // Cancelar reproducciones previas para evitar encolamientos lentos
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.lang = 'en-US';
    utterance.rate = 0.92; // Ligera reducción de velocidad pedagógica para hispanohablantes
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      if (onError) onError(e);
    };

    this.synth.speak(utterance);
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

// Exportamos la instancia única (Singleton)
// A futuro, para usar Amazon Polly, solo cambiaremos esta línea por: export const audioService = new AmazonPollyProvider();
export const audioService: IAudioProvider = new WebSpeechAudioProvider();