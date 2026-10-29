import { DialogueTurn, FeedbackResponse } from '../types';

export function getDeterministicFeedback(
  turn: DialogueTurn,
  spokenText: string,
  attemptCount: number
): FeedbackResponse {
  const cleanSpoken = (spokenText || '').trim().toLowerCase().replace(/[.,!?'"]/g, '');
  const cleanTarget = turn.targetSentence.toLowerCase().replace(/[.,!?'"]/g, '');

  if (!cleanSpoken) {
    return {
      isSuccess: false,
      hasSmallError: false,
      feedbackEnglish: "Take your time! Try speaking again when you're ready.",
      feedbackKorean: "천천히 해도 괜찮아요! 준비되면 다시 말해 보세요.",
      correctedSentence: turn.targetSentence,
      firstLetterHint: turn.firstLetterHint,
      chunkedPhrases: turn.chunkedPhrases,
      alternativeExpressions: turn.alternativeExpressions,
    };
  }

  // Count keyword matches
  const keywordHits = turn.keywords.filter(kw => cleanSpoken.includes(kw.toLowerCase()));
  const hitRatio = keywordHits.length / Math.max(turn.keywords.length, 1);

  // Check if almost exact match or matches key words
  if (cleanSpoken === cleanTarget || hitRatio >= 0.7) {
    return {
      isSuccess: true,
      hasSmallError: false,
      feedbackEnglish: "Nice! Your reply fits the conversation naturally.",
      feedbackKorean: "좋아요! 대화 맥락에 잘 맞는 자연스러운 답변이에요!",
      correctedSentence: turn.targetSentence,
      alternativeExpressions: turn.alternativeExpressions,
    };
  }

  // Understandable with small variation or minor grammar slip (missing 'a', 'the', slight word order)
  if (hitRatio >= 0.4 || cleanSpoken.length >= 10) {
    return {
      isSuccess: true,
      hasSmallError: true,
      feedbackEnglish: `Good job! I understood you clearly. Here's a slightly more natural version: "${turn.targetSentence}"`,
      feedbackKorean: "잘했어요! 의미가 명확하게 전달됐어요. 이렇게 말하면 조금 더 자연스러워요.",
      correctedSentence: turn.targetSentence,
      alternativeExpressions: turn.alternativeExpressions,
    };
  }

  // Did not understand or off topic - apply Section 7 attempt progression
  if (attemptCount === 1) {
    return {
      isSuccess: false,
      hasSmallError: false,
      feedbackEnglish: `Good try! You could say, "${turn.targetSentence}"`,
      feedbackKorean: "잘 시도했어요! 이렇게 말하면 더 자연스러워요.",
      correctedSentence: turn.targetSentence,
      firstLetterHint: turn.firstLetterHint,
      chunkedPhrases: turn.chunkedPhrases,
      alternativeExpressions: turn.alternativeExpressions,
    };
  } else if (attemptCount === 2) {
    return {
      isSuccess: false,
      hasSmallError: false,
      feedbackEnglish: `You're getting closer! ${turn.firstLetterHint}`,
      feedbackKorean: "점점 좋아지고 있어요! 이 힌트로 시작해 보세요.",
      correctedSentence: turn.targetSentence,
      firstLetterHint: turn.firstLetterHint,
      chunkedPhrases: turn.chunkedPhrases,
      alternativeExpressions: turn.alternativeExpressions,
    };
  } else {
    const chunkStr = turn.chunkedPhrases.join(' / ');
    return {
      isSuccess: false,
      hasSmallError: false,
      feedbackEnglish: `Almost there! Let's try it in small parts: "${chunkStr}"`,
      feedbackKorean: "거의 다 왔어요! 짧은 부분으로 나눠서 말해 봐요.",
      correctedSentence: turn.targetSentence,
      firstLetterHint: turn.firstLetterHint,
      chunkedPhrases: turn.chunkedPhrases,
      alternativeExpressions: turn.alternativeExpressions,
    };
  }
}

export async function requestFeedback(
  turnIndex: number,
  turn: DialogueTurn,
  userSpoken: string,
  attemptCount: number
): Promise<FeedbackResponse> {
  // If user said nothing, return immediate guidance
  if (!userSpoken || !userSpoken.trim()) {
    return getDeterministicFeedback(turn, '', attemptCount);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        turnIndex,
        partnerPrompt: turn.partnerPrompt,
        targetSentence: turn.targetSentence,
        koreanMeaning: turn.targetKorean,
        userSpoken,
        attemptCount,
        keywords: turn.keywords,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        isSuccess: Boolean(data.isSuccess),
        hasSmallError: Boolean(data.hasSmallError),
        feedbackEnglish: data.feedbackEnglish || "Nice! Your reply fits the conversation naturally.",
        feedbackKorean: data.feedbackKorean || "좋아요! 대화 맥락에 잘 맞는 자연스러운 답변이에요!",
        correctedSentence: data.correctedSentence || turn.targetSentence,
        firstLetterHint: data.firstLetterHint || turn.firstLetterHint,
        chunkedPhrases: data.chunkedPhrases || turn.chunkedPhrases,
        alternativeExpressions: data.alternativeExpressions || turn.alternativeExpressions,
      };
    }
  } catch (err) {
    console.warn('API feedback request failed, falling back to Section 7 table rules:', err);
  }

  // Always guaranteed fallback according to Section 7
  return getDeterministicFeedback(turn, userSpoken, attemptCount);
}
