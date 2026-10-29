/**
 * Browser Speech Recognition & Speech Synthesis Utility
 * Strictly follows PRD Technical Requirements:
 * - SpeechRecognition en-US
 * - SpeechSynthesis en-US (normal rate 0.9, slow rate 0.7)
 * - No simultaneous MediaRecorder
 * - Detection for in-app browsers, missing APIs, and permissions
 */

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export interface SpeechSupportStatus {
  isSupported: boolean;
  isInAppBrowser: boolean;
  inAppBrowserName: string | null;
  isHttps: boolean;
}

export function checkSpeechSupport(): SpeechSupportStatus {
  const isHttps = typeof window !== 'undefined' ? (window.location.protocol === 'https:' || window.location.hostname === 'localhost') : true;
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';

  let isInAppBrowser = false;
  let inAppBrowserName: string | null = null;

  if (/KAKAOTALK/i.test(userAgent)) {
    isInAppBrowser = true;
    inAppBrowserName = 'KakaoTalk';
  } else if (/Instagram/i.test(userAgent)) {
    isInAppBrowser = true;
    inAppBrowserName = 'Instagram';
  } else if (/FBAN|FBAV/i.test(userAgent)) {
    isInAppBrowser = true;
    inAppBrowserName = 'Facebook';
  } else if (/Line/i.test(userAgent)) {
    isInAppBrowser = true;
    inAppBrowserName = 'LINE';
  }

  const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : undefined;
  const isSupported = Boolean(SpeechRecognition);

  return {
    isSupported,
    isInAppBrowser,
    inAppBrowserName,
    isHttps,
  };
}

class SpeechManager {
  private recognitionInstance: any = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingAudio = false;

  public isSpeechPlaying(): boolean {
    return this.isSpeakingAudio;
  }

  /**
   * Play speech using browser's SpeechSynthesis
   * normal rate = 0.9, slow rate = 0.7
   */
  public speakText(
    text: string,
    rate: number = 0.9,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this environment');
      onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate; // 0.9 (normal) or 0.7 (slow)
      utterance.pitch = 1.05; // natural young adult pitch

      // Pick an English voice if available
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Female')));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      this.currentUtterance = utterance;
      this.isSpeakingAudio = true;

      utterance.onstart = () => {
        this.isSpeakingAudio = true;
        onStart?.();
      };

      utterance.onend = () => {
        this.isSpeakingAudio = false;
        this.currentUtterance = null;
        onEnd?.();
      };

      utterance.onerror = (e) => {
        this.isSpeakingAudio = false;
        this.currentUtterance = null;
        onError?.(e);
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      this.isSpeakingAudio = false;
      onError?.(e);
      onEnd?.();
    }
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeakingAudio = false;
    this.currentUtterance = null;
  }

  /**
   * Start Speech Recognition (en-US)
   */
  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (errorType: string, rawError?: any) => void,
    onEnd: () => void
  ): boolean {
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : undefined;
    if (!SpeechRecognition) {
      onError('not-supported');
      return false;
    }

    // Never speak while listening
    this.stopSpeaking();

    try {
      if (this.recognitionInstance) {
        this.recognitionInstance.abort();
      }

      const recognition = new SpeechRecognition();
      this.recognitionInstance = recognition;
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let finalTranscript = '';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }
        const text = finalTranscript || interimTranscript;
        onResult(text, Boolean(finalTranscript));
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          onError('permission-denied', event);
        } else if (event.error === 'no-speech') {
          onError('no-speech', event);
        } else {
          onError(event.error || 'unknown', event);
        }
      };

      recognition.onend = () => {
        this.recognitionInstance = null;
        onEnd();
      };

      recognition.start();
      return true;
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      onError('start-failed', e);
      return false;
    }
  }

  public stopListening() {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch (e) {
        // ignore
      }
      this.recognitionInstance = null;
    }
  }
}

export const speechManager = new SpeechManager();
