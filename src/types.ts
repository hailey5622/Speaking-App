export interface DialogueTurn {
  id: number;
  partnerPrompt: string;
  partnerKorean: string;
  targetSentence: string;
  targetKorean: string;
  keywords: string[];
  firstLetterHint: string;
  chunkedPhrases: string[];
  alternativeExpressions: string[];
}

export interface TurnAttemptResult {
  turnId: number;
  spokenText: string;
  isSuccess: boolean;
  hasSmallError: boolean;
  feedbackEnglish: string;
  feedbackKorean: string;
  correctedSentence: string;
  attemptNumber: number;
  timestamp: number;
}

export interface PracticeSessionRecord {
  id: string;
  date: string;
  completedTurns: number;
  totalTurns: number;
  stars: number;
  turns: TurnAttemptResult[];
}

export interface FeedbackResponse {
  isSuccess: boolean;
  hasSmallError: boolean;
  feedbackEnglish: string;
  feedbackKorean: string;
  correctedSentence: string;
  firstLetterHint?: string;
  chunkedPhrases?: string[];
  alternativeExpressions?: string[];
}

export type MicState = 'ready' | 'listening' | 'processing';
