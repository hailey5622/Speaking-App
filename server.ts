import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini SDK if key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({});
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI client:', err);
  }
}

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

// Fallback rule provider adhering strictly to Section 7 of PRD
function getFallbackFeedback(req: FeedbackRequest): FeedbackResult {
  const { turnIndex, targetSentence, userSpoken, attemptCount, keywords } = req;
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

  // Count keyword matches
  const keywordHits = keywords.filter(kw => cleanedSpoken.includes(kw.toLowerCase()));
  const hitRatio = keywordHits.length / Math.max(keywords.length, 1);
  const isClose = cleanedSpoken === cleanedTarget || hitRatio >= 0.6 || cleanedSpoken.length > 10;

  // Check if it's high similarity or identical
  if (cleanedSpoken === cleanedTarget || hitRatio >= 0.7) {
    return {
      isSuccess: true,
      hasSmallError: false,
      feedbackEnglish: "Nice! Your reply fits the conversation naturally.",
      feedbackKorean: "좋아요! 대화 맥락에 잘 맞는 자연스러운 답변이에요!",
      correctedSentence: targetSentence,
    };
  }

  // Understandable with minor variation or slight error
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

  // By attempt rules from Section 7
  if (attemptCount === 1) {
    return {
      isSuccess: false,
      hasSmallError: false,
      feedbackEnglish: `Good try! You could say, "${targetSentence}."`,
      feedbackKorean: "잘 시도했어요! 이렇게 말하면 더 자연스러워요.",
      correctedSentence: targetSentence,
    };
  } else if (attemptCount === 2) {
    // 2nd attempt elicitation
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
    // 3rd attempt chunking
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

app.post('/api/feedback', async (req, res) => {
  const body: FeedbackRequest = req.body;

  if (!body || !body.targetSentence) {
    return res.status(400).json({ error: 'Missing targetSentence in request body' });
  }

  // If user said nothing
  if (!body.userSpoken || body.userSpoken.trim() === '') {
    return res.json(getFallbackFeedback(body));
  }

  // Attempt using Gemini if configured
  if (aiClient && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are Jina, a friendly and supportive university student chatting casually with a foreign classmate who is learning English (CEFR B1-B2).
Context of Turn ${body.turnIndex + 1}:
- Jina's question/statement: "${body.partnerPrompt}"
- Target model response: "${body.targetSentence}" (Korean meaning: "${body.koreanMeaning}")
- Target key concepts: ${body.keywords.join(', ')}
- What the student actually said (via SpeechRecognition): "${body.userSpoken}"
- Current attempt count on this turn: ${body.attemptCount} (1, 2, or 3+)

Rules from pedagogical design:
1. Prioritize conversational understandability and whether it fits naturally.
2. Accept different expressions if they fit the situation well, not just verbatim matches!
3. Minor grammar mistakes (like missing 'a', 'the', or small tense slip) must NOT count as failures. Do not be overly harsh or textbook-pedantic.
4. If attempt 1 and student wasn't understood: Recast ("Good try! You could say, '[natural sentence].'").
5. If attempt 2 and student needs help: Elicitation ("You're getting closer! Try starting with '[first-letter or opening phrase hint]...'").
6. If attempt 3+ and student needs help: Chunking ("Almost there! Let's try it in small parts: '[chunk 1] / [chunk 2].'").
7. If student succeeded with natural flow: ("Nice! Your reply fits the conversation naturally.")
8. If student succeeded with minor slip: ("Good job! I understood you clearly. Here's a slightly more natural version: '[corrected sentence].'")
9. Always provide brief, encouraging feedback with an accurate Korean translation. Only focus on ONE improvement.

Respond ONLY with valid JSON in this exact structure:
{
  "isSuccess": true/false,
  "hasSmallError": true/false,
  "feedbackEnglish": "Brief encouraging feedback",
  "feedbackKorean": "한국어 번역 및 격려",
  "correctedSentence": "A natural, friendly English version of what they said or the target sentence",
  "firstLetterHint": "Short hint phrase if elicitation needed, or null",
  "chunkedPhrases": ["Chunk 1", "Chunk 2"],
  "alternativeExpressions": ["Alternative 1", "Alternative 2"]
}`;

      const response = await aiClient.models.generateContent({
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
        return res.json(parsed);
      }
    } catch (err) {
      console.warn('Gemini API call failed or timed out, falling back to Section 7 table rules:', err);
    }
  }

  // Graceful fallback to section 7 rules
  const fallback = getFallbackFeedback(body);
  return res.json(fallback);
});

// Setup Vite middleware or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
