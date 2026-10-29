import React, { useState } from 'react';
import {
  Star,
  RotateCcw,
  Home,
  Volume2,
  CheckCircle,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DialogueTurn, TurnAttemptResult } from '../types';
import { PARTNER_PROFILE, PRACTICE_DIALOGUE } from '../data/dialogueData';
import { speechManager } from '../utils/speech';

interface ResultScreenProps {
  results: TurnAttemptResult[];
  turns: DialogueTurn[];
  onRestart: () => void;
  onGoHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  results,
  turns,
  onRestart,
  onGoHome,
}) => {
  const [expandedTurns, setExpandedTurns] = useState<Record<number, boolean>>({});

  const completedCount = results.length;
  const totalTurns = turns.length;

  // Star rules from Section 6 PRD (Reward completion, not accuracy):
  // ⭐⭐⭐ Completed all conversation turns (5 turns)
  // ⭐⭐ Completed most conversation turns (3-4 turns)
  // ⭐ Completed at least one conversation turn (1-2 turns)
  const stars =
    completedCount >= totalTurns
      ? 3
      : completedCount >= 3
      ? 2
      : completedCount >= 1
      ? 1
      : 0;

  const toggleTurnExpand = (id: number) => {
    setExpandedTurns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePlayAudio = (text: string) => {
    speechManager.speakText(text, 0.9);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-stone-50/50 border-x border-stone-200 shadow-xs">
      {/* Top: Summary Header + Completion Message */}
      <header className="p-6 bg-white border-b border-stone-200 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-100/50 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Conversation Completed</span>
        </div>

        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          Great Job Chatting with Jina!
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          새로운 외국인 친구와의 첫 대화 연습을 성공적으로 마쳤어요!
        </p>

        {/* Stars Display (Section 6 Completion Rules) */}
        <div className="mt-5 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((starNum) => (
              <Star
                key={starNum}
                className={`w-9 h-9 transition-transform duration-300 ${
                  starNum <= stars
                    ? 'fill-amber-400 text-amber-400 drop-shadow-sm scale-105'
                    : 'text-stone-200'
                }`}
              />
            ))}
          </div>

          <div className="mt-2 text-xs font-bold text-stone-700">
            {stars === 3
              ? '⭐⭐⭐ Completed all 5 conversation turns!'
              : stars === 2
              ? `⭐⭐ Completed ${completedCount} conversation turns!`
              : `⭐ Great start! Completed ${completedCount} turn.`}
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5">
            (정확도 감점 없이 대화 완성을 축하하는 보상 시스템입니다)
          </p>
        </div>
      </header>

      {/* Middle: Feedback on Grammar, Naturalness & Useful Expressions */}
      <main className="flex-1 p-5 space-y-5 overflow-y-auto">
        {/* Jina's Feedback Message */}
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs flex items-start gap-3">
          <img
            src={PARTNER_PROFILE.avatar}
            alt={PARTNER_PROFILE.name}
            className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-amber-200"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-900">{PARTNER_PROFILE.name}'s Note</span>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                Exchange Buddy
              </span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              "It was so fun meeting you! You shared your thoughts about studying, your curiosity about biotechnology, and suggested coffee on Saturday. Keep up this friendly conversational flow!"
            </p>
            <p className="text-[11px] text-stone-400">
              (첫 만남에서 호기심을 표현하고 주말 약속을 제안하는 흐름이 아주 자연스러웠어요!)
            </p>
          </div>
        </div>

        {/* 5 Essential Key Expressions Recap (Section 6 Table) */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              5 Essential Dialogue Key Expressions
            </h3>
          </div>

          <div className="space-y-2">
            {PRACTICE_DIALOGUE.map((turn) => {
              const userTurnRecord = results.find((r) => r.turnId === turn.id);
              return (
                <div
                  key={turn.id}
                  className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-800">
                      Turn {turn.id} · Key words: {turn.keywords.join(', ')}
                    </span>
                    <button
                      onClick={() => handlePlayAudio(turn.targetSentence)}
                      className="text-stone-500 hover:text-amber-800 p-1 flex items-center gap-1 text-[11px]"
                      title="Listen"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-medium text-stone-900">
                    "{turn.targetSentence}"
                  </p>
                  <p className="text-[11px] text-stone-500">
                    🇰🇷 {turn.targetKorean}
                  </p>
                  {userTurnRecord && (
                    <div className="pt-1 text-[11px] text-emerald-800 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>You said: "{userTurnRecord.spokenText || '(Completed)'}"</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Conversation Review Accordion */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Turn-by-Turn Naturalness Review
            </h3>
            <span className="text-[11px] text-stone-400">자연스러운 문장 비교</span>
          </div>

          <div className="space-y-2">
            {turns.map((turn) => {
              const result = results.find((r) => r.turnId === turn.id);
              const isExpanded = Boolean(expandedTurns[turn.id]);

              return (
                <div
                  key={turn.id}
                  className="rounded-xl border border-stone-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleTurnExpand(turn.id)}
                    className="w-full p-3 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-left transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-stone-800">
                        Turn {turn.id}: {turn.partnerPrompt.slice(0, 32)}...
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {result ? `Attempt #${result.attemptNumber}` : 'Target Turn'}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-stone-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-500" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-3 bg-white space-y-2 text-xs border-t border-stone-200">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
                          Jina asked:
                        </span>
                        <div className="flex items-center justify-between text-stone-800">
                          <span>"{turn.partnerPrompt}"</span>
                          <button
                            onClick={() => handlePlayAudio(turn.partnerPrompt)}
                            className="text-amber-700 hover:text-amber-900 ml-2"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {result && result.spokenText && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
                            What you spoke:
                          </span>
                          <p className="text-stone-700 font-medium">"{result.spokenText}"</p>
                        </div>
                      )}

                      <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60">
                        <span className="text-[10px] uppercase font-bold text-amber-900 block mb-0.5">
                          Improved Natural Sentence:
                        </span>
                        <div className="flex items-center justify-between text-stone-900 font-semibold">
                          <span>"{result?.correctedSentence || turn.targetSentence}"</span>
                          <button
                            onClick={() => handlePlayAudio(result?.correctedSentence || turn.targetSentence)}
                            className="text-amber-800 hover:text-amber-950 ml-2"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1">🇰🇷 {turn.targetKorean}</p>
                      </div>

                      {result?.feedbackEnglish && (
                        <div className="text-[11px] text-stone-600 bg-stone-50 p-2 rounded">
                          💡 {result.feedbackEnglish}
                          {result.feedbackKorean && (
                            <span className="block text-stone-400 mt-0.5">
                              {result.feedbackKorean}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Bottom Actions: [Practice Again] [Back to Home] (Section 4) */}
      <footer className="p-4 bg-white border-t border-stone-200 sticky bottom-0 z-10 flex gap-2.5">
        <button
          onClick={onRestart}
          className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-stone-950 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-stone-950" />
          <span>Practice Again (다시 연습)</span>
        </button>

        <button
          onClick={onGoHome}
          className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4 text-stone-600" />
          <span>Home (홈으로)</span>
        </button>
      </footer>
    </div>
  );
};
