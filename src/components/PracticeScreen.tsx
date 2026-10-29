import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Mic,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Home,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Keyboard,
  Send,
  Turtle
} from 'lucide-react';
import { DialogueTurn, FeedbackResponse, MicState, TurnAttemptResult } from '../types';
import { PARTNER_PROFILE, USER_PROFILE } from '../data/dialogueData';
import { speechManager, checkSpeechSupport } from '../utils/speech';
import { requestFeedback } from '../utils/feedbackClient';
import { AudioVisualizer } from './AudioVisualizer';
import { OtherResponsesModal } from './OtherResponsesModal';

interface PracticeScreenProps {
  turns: DialogueTurn[];
  onFinishPractice: (results: TurnAttemptResult[]) => void;
  onGoHome: () => void;
  onShowBrowserNotice: (reason: 'not-supported' | 'permission-denied' | 'in-app-browser') => void;
}

export const PracticeScreen: React.FC<PracticeScreenProps> = ({
  turns,
  onFinishPractice,
  onGoHome,
  onShowBrowserNotice,
}) => {
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [attemptCount, setAttemptCount] = useState(1);
  const [micState, setMicState] = useState<MicState>('ready');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playingRate, setPlayingRate] = useState<number | null>(null);

  // Chat conversation history for the current turn & session
  const [userTranscript, setUserTranscript] = useState('');
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Completed turn results stored for final ResultScreen
  const [turnResults, setTurnResults] = useState<TurnAttemptResult[]>([]);

  // UI helpers
  const [showKoreanTranslation, setShowKoreanTranslation] = useState(false);
  const [showOtherResponsesModal, setShowOtherResponsesModal] = useState(false);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const [keyboardInput, setKeyboardInput] = useState('');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const currentTurn = turns[currentTurnIndex];

  // Auto-play Jina's prompt when arriving at a new turn
  useEffect(() => {
    setUserTranscript('');
    setFeedback(null);
    setAttemptCount(1);
    setShowKoreanTranslation(false);
    setKeyboardInput('');

    // Play partner voice smoothly
    playPartnerAudio(currentTurn.partnerPrompt, 0.9);
  }, [currentTurnIndex]);

  // Scroll to bottom whenever feedback or transcript changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [userTranscript, feedback, micState, currentTurnIndex]);

  const playPartnerAudio = (text: string, rate: number = 0.9) => {
    setIsPlayingAudio(true);
    setPlayingRate(rate);
    speechManager.speakText(
      text,
      rate,
      () => {
        setIsPlayingAudio(true);
      },
      () => {
        setIsPlayingAudio(false);
        setPlayingRate(null);
      },
      () => {
        setIsPlayingAudio(false);
        setPlayingRate(null);
      }
    );
  };

  const handleMicClick = () => {
    // Technical requirement: Disable mic button while model audio is playing
    if (isPlayingAudio) return;

    if (micState === 'listening') {
      // User tapped to finish
      speechManager.stopListening();
      setMicState('processing');
      return;
    }

    if (micState === 'processing') return;

    // Check environment support
    const status = checkSpeechSupport();
    if (!status.isSupported) {
      onShowBrowserNotice('not-supported');
      return;
    }

    if (status.isInAppBrowser) {
      onShowBrowserNotice('in-app-browser');
    }

    setMicState('listening');
    setUserTranscript('');

    const started = speechManager.startListening(
      (transcript, isFinal) => {
        setUserTranscript(transcript);
        if (isFinal && transcript.trim().length > 0) {
          speechManager.stopListening();
          handleProcessSpokenText(transcript);
        }
      },
      (errorType) => {
        setMicState('ready');
        if (errorType === 'permission-denied' || errorType === 'not-allowed') {
          onShowBrowserNotice('permission-denied');
        } else if (errorType === 'no-speech') {
          handleProcessSpokenText('');
        }
      },
      () => {
        // Recognition ended
        setMicState((prev) => (prev === 'listening' ? 'ready' : prev));
      }
    );

    if (!started) {
      setMicState('ready');
    }
  };

  const handleProcessSpokenText = async (text: string) => {
    setMicState('processing');
    setIsEvaluating(true);

    const evaluated = await requestFeedback(
      currentTurnIndex,
      currentTurn,
      text,
      attemptCount
    );

    setFeedback(evaluated);
    setIsEvaluating(false);
    setMicState('ready');

    // Record turn result
    const resultItem: TurnAttemptResult = {
      turnId: currentTurn.id,
      spokenText: text,
      isSuccess: evaluated.isSuccess,
      hasSmallError: evaluated.hasSmallError,
      feedbackEnglish: evaluated.feedbackEnglish,
      feedbackKorean: evaluated.feedbackKorean,
      correctedSentence: evaluated.correctedSentence,
      attemptNumber: attemptCount,
      timestamp: Date.now(),
    };

    // Replace or add turn result
    setTurnResults((prev) => {
      const filtered = prev.filter((r) => r.turnId !== currentTurn.id);
      return [...filtered, resultItem];
    });
  };

  const handleTryAgain = () => {
    setAttemptCount((prev) => prev + 1);
    setFeedback(null);
    setUserTranscript('');
    setMicState('ready');
  };

  const handleNextTurn = () => {
    if (currentTurnIndex < turns.length - 1) {
      setCurrentTurnIndex((prev) => prev + 1);
    } else {
      // Completed all turns!
      onFinishPractice(turnResults);
    }
  };

  const handleUseKeyboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyboardInput.trim()) return;
    setUserTranscript(keyboardInput.trim());
    handleProcessSpokenText(keyboardInput.trim());
    setKeyboardInput('');
  };

  const handleSelectAlternative = (expr: string) => {
    setUserTranscript(expr);
    handleProcessSpokenText(expr);
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-stone-100/60 border-x border-stone-200 shadow-sm overflow-hidden">
      {/* Top Bar: Jina Profile & Turn Progress */}
      <header className="px-4 py-3 bg-white border-b border-stone-200/80 shrink-0 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onGoHome}
            className="p-1.5 -ml-1 text-stone-500 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
            title="Return to Home"
          >
            <Home className="w-5 h-5" />
          </button>

          <div className="relative">
            <img
              src={PARTNER_PROFILE.avatar}
              alt={PARTNER_PROFILE.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-300"
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                isPlayingAudio ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-stone-900">{PARTNER_PROFILE.name}</h2>
              <span className="text-[10px] text-amber-800 bg-amber-100 font-semibold px-1.5 py-0.5 rounded">
                Partner
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
              {isPlayingAudio ? (
                <span className="text-amber-700 font-medium flex items-center gap-1">
                  Speaking...
                  <AudioVisualizer isActive={true} color="bg-amber-600" />
                </span>
              ) : (
                <span>{PARTNER_PROFILE.status}</span>
              )}
            </div>
          </div>
        </div>

        {/* Turn Progress indicator */}
        <div className="flex flex-col items-end">
          <div className="text-[11px] font-bold text-stone-700">
            Turn {currentTurnIndex + 1} / {turns.length}
          </div>
          <div className="flex items-center gap-1 mt-1">
            {turns.map((t, idx) => (
              <span
                key={t.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentTurnIndex
                    ? 'w-5 bg-amber-500'
                    : idx < currentTurnIndex
                    ? 'w-3 bg-stone-700'
                    : 'w-2 bg-stone-300'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Middle: KakaoTalk-Style Chat Area */}
      <main
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 bg-amber-50/20"
      >
        {/* Date / Scenario divider */}
        <div className="flex items-center justify-center my-1">
          <span className="text-[11px] font-medium text-stone-500 bg-stone-200/70 px-3 py-0.5 rounded-full">
            Turn {currentTurnIndex + 1} · Campus Meeting
          </span>
        </div>

        {/* Jina's Bubble (Left side) */}
        <div className="flex items-start gap-2.5 max-w-[88%]">
          <img
            src={PARTNER_PROFILE.avatar}
            alt={PARTNER_PROFILE.name}
            className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5 shadow-2xs"
          />
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-stone-600 pl-1">
              {PARTNER_PROFILE.name}
            </span>

            {/* Bubble body */}
            <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs border border-stone-200 shadow-2xs text-stone-900 text-sm leading-relaxed relative">
              <p className="font-medium text-[14px] text-stone-900">{currentTurn.partnerPrompt}</p>

              {/* Korean translation toggle */}
              {showKoreanTranslation && (
                <p className="text-xs text-stone-500 mt-2 pt-2 border-t border-stone-100 font-normal">
                  🇰🇷 {currentTurn.partnerKorean}
                </p>
              )}
            </div>

            {/* Listen Audio Buttons (Section 5: [🔊 Listen] normal 0.9x and [🐢 Slow] 0.7x) */}
            <div className="flex items-center gap-1.5 pt-0.5 pl-1">
              <button
                onClick={() => playPartnerAudio(currentTurn.partnerPrompt, 0.9)}
                disabled={isPlayingAudio}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  isPlayingAudio && playingRate === 0.9
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
                title="Listen at normal speed (0.9x)"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Listen (0.9x)</span>
              </button>

              <button
                onClick={() => playPartnerAudio(currentTurn.partnerPrompt, 0.7)}
                disabled={isPlayingAudio}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  isPlayingAudio && playingRate === 0.7
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
                title="Listen slowly (0.7x)"
              >
                <Turtle className="w-3.5 h-3.5" />
                <span>Slow (0.7x)</span>
              </button>

              <button
                onClick={() => setShowKoreanTranslation((prev) => !prev)}
                className="px-2 py-1 text-xs text-stone-500 hover:text-stone-800 transition-colors"
              >
                {showKoreanTranslation ? 'Hide translation' : '한국어 보기'}
              </button>
            </div>
          </div>
        </div>

        {/* Student's Spoken Bubble (Right side, KakaoTalk yellow warm bubble) */}
        {(userTranscript || micState === 'listening' || isEvaluating) && (
          <div className="flex items-start justify-end gap-2.5 max-w-[88%] ml-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="space-y-1 text-right">
              <span className="text-[11px] font-semibold text-stone-600 pr-1">
                {USER_PROFILE.name} (You)
              </span>

              {/* KakaoTalk-style Yellow Bubble #FEE500 */}
              <div className="bg-[#FEE500] text-stone-950 p-3.5 rounded-2xl rounded-tr-xs shadow-2xs text-sm leading-relaxed text-left font-medium border border-[#F0D800]">
                {micState === 'listening' ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-stone-800 text-xs">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span>Listening to your voice...</span>
                    </div>
                    <p className="italic text-stone-700">
                      {userTranscript || 'Speak your response now...'}
                    </p>
                  </div>
                ) : isEvaluating ? (
                  <div className="flex items-center gap-2 text-stone-800 text-xs py-1">
                    <AudioVisualizer isActive={true} color="bg-stone-900" />
                    <span>Analyzing your reply...</span>
                  </div>
                ) : (
                  <p>{userTranscript}</p>
                )}
              </div>
            </div>

            <img
              src={USER_PROFILE.avatar}
              alt={USER_PROFILE.name}
              className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5 shadow-2xs ring-1 ring-amber-300"
            />
          </div>
        )}

        {/* Target Sentence Guide Helper if student hasn't spoken yet */}
        {!feedback && !userTranscript && micState === 'ready' && (
          <div className="p-3.5 bg-white/90 backdrop-blur-xs rounded-xl border border-stone-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                Target Speaking Guide
              </span>
              <span className="text-[11px] text-stone-500">
                Key: {currentTurn.keywords.join(', ')}
              </span>
            </div>
            <p className="text-xs text-stone-800 font-medium bg-amber-50/60 p-2.5 rounded-lg border border-amber-100/80">
              "{currentTurn.targetSentence}"
            </p>
            <p className="text-[11px] text-stone-500 px-1">
              🇰🇷 {currentTurn.targetKorean}
            </p>
          </div>
        )}

        {/* Feedback / Correction Box (Section 4 & Section 7) */}
        {feedback && (
          <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-3 animate-in fade-in duration-200">
            {/* Status Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {feedback.isSuccess ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Great Communication!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>
                      {attemptCount === 1
                        ? '1st Attempt (Recast)'
                        : attemptCount === 2
                        ? '2nd Attempt (Hint)'
                        : '3rd Attempt (Chunking)'}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-stone-500 font-medium">
                Attempt {attemptCount}
              </div>
            </div>

            {/* Compare Original Speech vs Natural Expression */}
            <div className="space-y-1.5 text-xs bg-stone-50 p-3 rounded-xl border border-stone-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-900">
                  Natural English expression:
                </span>
                <button
                  onClick={() => speechManager.speakText(feedback.correctedSentence, 0.9)}
                  className="text-amber-800 hover:text-amber-950 p-1 flex items-center gap-1 text-[11px] font-medium"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </button>
              </div>
              <p className="font-semibold text-stone-900 text-sm">
                "{feedback.correctedSentence}"
              </p>
            </div>

            {/* Brief feedback in English + Korean translation (Focus on 1 improvement at a time) */}
            <div className="text-xs text-stone-700 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-100/70">
              <p className="font-medium text-stone-900">{feedback.feedbackEnglish}</p>
              <p className="text-stone-600 mt-1">{feedback.feedbackKorean}</p>
            </div>

            {/* Progression hints: Elicitation / Chunking */}
            {!feedback.isSuccess && attemptCount === 2 && feedback.firstLetterHint && (
              <div className="p-2.5 bg-blue-50/70 rounded-lg text-xs text-blue-900 border border-blue-100 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Hint:</strong> {feedback.firstLetterHint}
                </span>
              </div>
            )}

            {!feedback.isSuccess && attemptCount >= 3 && feedback.chunkedPhrases && (
              <div className="p-2.5 bg-purple-50/70 rounded-lg text-xs text-purple-900 border border-purple-100 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Practice by chunks (조각내서 말해보기):</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {feedback.chunkedPhrases.map((chk, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-white rounded border border-purple-200 text-purple-950 font-medium"
                    >
                      {chk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Control Bar (Section 4 & Section 5) */}
      <footer className="p-4 bg-white border-t border-stone-200 shrink-0 space-y-3">
        {/* Helper Action Buttons: [Try Again] [Other Response] [Next Topic] */}
        <div className="flex items-center justify-between gap-2">
          {feedback ? (
            <>
              <button
                onClick={handleTryAgain}
                className="flex-1 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
                <span>Try Again (다시 말하기)</span>
              </button>

              <button
                onClick={() => setShowOtherResponsesModal(true)}
                className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Other Response</span>
              </button>

              <button
                onClick={handleNextTurn}
                className="flex-1 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <span>{currentTurnIndex < turns.length - 1 ? 'Next Topic' : 'View Results'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowOtherResponsesModal(true)}
                className="py-2 px-3 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Other Response</span>
              </button>

              <button
                onClick={() => setIsKeyboardMode((prev) => !prev)}
                className="py-2 px-3 text-stone-500 hover:text-stone-900 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                title="Toggle text input for silent environments"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>{isKeyboardMode ? 'Use Mic' : 'Type Text'}</span>
              </button>

              <button
                onClick={() => handleProcessSpokenText(currentTurn.targetSentence)}
                className="py-2 px-2.5 bg-amber-100/70 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-medium transition-colors"
                title="Simulate speech with sample target sentence"
              >
                Quick Sample
              </button>
            </>
          )}
        </div>

        {/* Text Input fallback mode for testing / environments without mic access */}
        {isKeyboardMode && !feedback && (
          <form onSubmit={handleUseKeyboardSubmit} className="flex gap-2">
            <input
              type="text"
              value={keyboardInput}
              onChange={(e) => setKeyboardInput(e.target.value)}
              placeholder="Type your response in English..."
              className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={!keyboardInput.trim()}
              className="p-2 bg-stone-900 text-white rounded-xl disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Large Round [🎤 Mic] button with states: Ready → Listening → Done */}
        {!feedback && !isKeyboardMode && (
          <div className="flex flex-col items-center justify-center pt-1 pb-1">
            <div className="relative">
              {/* Outer wave rings when listening */}
              {micState === 'listening' && (
                <>
                  <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-40" />
                  <span className="absolute -inset-2 rounded-full border-2 border-rose-400 animate-pulse" />
                </>
              )}

              <button
                onClick={handleMicClick}
                disabled={isPlayingAudio || micState === 'processing'}
                className={`relative w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all duration-200 cursor-pointer shadow-md ${
                  isPlayingAudio
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-60'
                    : micState === 'listening'
                    ? 'bg-rose-500 text-white scale-105 shadow-rose-300'
                    : micState === 'processing'
                    ? 'bg-amber-600 text-white animate-pulse'
                    : 'bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 shadow-amber-200'
                }`}
                title={isPlayingAudio ? 'Wait for audio to finish' : 'Tap to speak'}
              >
                <Mic className={`w-7 h-7 ${micState === 'listening' ? 'animate-bounce' : ''}`} />
              </button>
            </div>

            {/* Mic Button State Label */}
            <div className="mt-2 text-center">
              <span className="text-xs font-bold text-stone-800 block">
                {isPlayingAudio
                  ? 'Listening paused while Jina speaks...'
                  : micState === 'listening'
                  ? 'Listening... Tap to finish'
                  : micState === 'processing'
                  ? 'Analyzing your speech...'
                  : 'Tap to Speak'}
              </span>
              <span className="text-[11px] text-stone-500">
                {isPlayingAudio
                  ? '오디오 재생 중에는 마이크가 잠시 비활성화됩니다'
                  : micState === 'listening'
                  ? '영어로 답변을 편하게 말해 보세요'
                  : 'Ready → Listening → Done'}
              </span>
            </div>
          </div>
        )}
      </footer>

      {/* Alternative Expressions Modal */}
      <OtherResponsesModal
        isOpen={showOtherResponsesModal}
        onClose={() => setShowOtherResponsesModal(false)}
        targetSentence={currentTurn.targetSentence}
        targetKorean={currentTurn.targetKorean}
        alternativeExpressions={currentTurn.alternativeExpressions}
        onSelectExpression={handleSelectAlternative}
      />
    </div>
  );
};
