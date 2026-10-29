import { GoogleGenAI } from '@google/genai';

interface FeedbackRequest {
  turnIndex: number;
  partnerPrompt: string;
  targetSentence: string;
  koreanMeaning: string;
  userSpoken: string;
  attemptCount: number;
  keywords: string[];
}

interface FeedbackResult {
  isSuccess: boolean;
  hasSmallError: boolean;
  feedbackEnglish: string;
  feedbackKorean: string;
  correctedSentence: string;
  firstLetterHint?: string;
  chunkedPhrases?: string[];
  alternativeExpressions?: string[];
}

function getFallbackFeedback(req: FeedbackRequest): FeedbackResult {
  const { targetSentence, userSpoken, attemptCount, keywords } = req;
  const cleanedSpoken = (userSpoken || '').trim().toLowerCase().replace(/[.,!?'"]/g, '');
  const cleanedTarget = targetSentence.toLowerCase().replace(/[.,!?'"]/g, '');

  if (!cleanedSpoken) {
    return {
      isSuccess: false,
      hasSmallError: false,
      feedbackEnglish: "Take your time! Try speaking again when you're ready.",
      feedbackKorean: "천천히 해도 괜찮아요! 준비되면 다시 말해 보세요.",
      correctedSentence: targetSentence,
    };
  }

  const keywordHits = (keywords || []).filter(kw => cleanedSpoken.includes(kw.toLowerCase()));
  const hitRatio = keywordHits.length / Math.max((keywords || []).length, 1);

  if (cleanedSpoken === cleanedTarget || hitRatio >= 0.7) {
    return {
      isSuccess: true,
      hasSmallError: false,
      feedbackEnglish: "Nice! Your reply fits the conversation naturally.",
      feedbackKorean: "좋아요! 대화 맥락에 잘 맞는 자연스러운 답변이에요!",
      correctedSentence: targetSentence,
    };
  }

  if (hitRatio >= 0.4 || cleanedSpoken.length >= 8) {
    if (attemptCount === 1) {
      return {
        isSuccess: true,
        hasSmallError: true,
        feedbackEnglish: `Good job! I understood you clearly. Here's a slightly more natural version: "${targetSentence}"`,
        feedbackKorean: "잘했어요! 의미가 명확하게 전달됐어요. 이렇게 말하면 조금 더 자연스러워요.",
        correctedSentence: targetSentence,
      };
    }
  }

  if (attemptCount === 1) {
    return {
      isSuccess: false,
      hasSmallError: false,
      feedbackEnglish: `Good try! You could say, "${targetSentence}."`,
      feedbackKorean: "잘 시도했어요! 이렇게 말하면 더 자연스러워요.",
      correctedSentence: targetSentence,
    };
  } else if (attemptCount === 2) {
    const words = targetSentence.split(' ');
    const hintWord = words.slice(0, 3).join(' ');
    return {
      isSuccess: false,
      hasSmallError: false,
      feedbackEnglish: `You're getting closer! Try starting with "${hintWord}..."`,
      feedbackKorean: "점점 좋아지고 있어요! 이 힌트로 시작해 보세요.",
      correctedSentence: targetSentence,
      firstLetterHint: `${hintWord}...`,
    };
  } else {
    const words = targetSentence.split(' ');
    const half = Math.ceil(words.length / 2);
    const chunk1 = words.slice(0, half).join(' ');
    const chunk2 = words.slice(half).join(' ');
    return {
      isSuccess: false,
      hasSmallError: false,
      feedbackEnglish: `Almost there! Let's try it in small parts: "${chunk1} / ${chunk2}."`,
      feedbackKorean: "거의 다 왔어요! 짧은 부분으로 나눠서 말해 봐요.",
      correctedSentence: targetSentence,
      chunkedPhrases: [chunk1, chunk2],
    };
  }
}

export default async function handler(req: any, res: any) {
  // Support CORS if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // ignore
    }
  }

  const payload: FeedbackRequest = body || {};

  if (!payload.targetSentence) {
    return res.status(400).json({ error: 'Missing targetSentence in request body' });
  }

  if (!payload.userSpoken || payload.userSpoken.trim() === '') {
    return res.status(200).json(getFallbackFeedback(payload));
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are Jina, a friendly and supportive university student chatting casually with a foreign classmate who is learning English (CEFR B1-B2).
Context of Turn ${payload.turnIndex + 1}:
- Jina's question/statement: "${payload.partnerPrompt}"
- Target model response: "${payload.targetSentence}" (Korean meaning: "${payload.koreanMeaning}")
- Target key concepts: ${(payload.keywords || []).join(', ')}
- What the student actually said: "${payload.userSpoken}"
- Current attempt count: ${payload.attemptCount}

Rules:
1. Prioritize conversational understandability and whether it fits naturally.
2. Accept different expressions if they fit the situation well.
3. Minor grammar mistakes (like missing 'a', 'the') must NOT count as failures.
4. If attempt 1: Recast ("Good try! You could say, '[natural sentence].'").
5. If attempt 2: Elicitation ("You're getting closer! Try starting with '[first-letter hint]...'").
6. If attempt 3+: Chunking ("Almost there! Let's try it in small parts: '[chunk 1] / [chunk 2].'").
7. If student succeeded: ("Nice! Your reply fits the conversation naturally.")
8. If student succeeded with minor slip: ("Good job! I understood you clearly. Here's a slightly more natural version: '[corrected sentence].'")
9. Always provide brief, encouraging feedback with an accurate Korean translation.

Respond ONLY with valid JSON:
{
  "isSuccess": true/false,
  "hasSmallError": true/false,
  "feedbackEnglish": "Brief encouraging feedback",
  "feedbackKorean": "한국어 번역 및 격려",
  "correctedSentence": "A natural, friendly English version of what they said",
  "firstLetterHint": "Short hint phrase if needed, or null",
  "chunkedPhrases": ["Chunk 1", "Chunk 2"],
  "alternativeExpressions": ["Alternative 1", "Alternative 2"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text) as FeedbackResult;
        return res.status(200).json(parsed);
      }
    } catch (err) {
      console.warn('Vercel serverless Gemini call failed:', err);
    }
  }

  return res.status(200).json(getFallbackFeedback(payload));
}
