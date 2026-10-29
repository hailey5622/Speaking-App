import React from 'react';
import { Play, History, ShieldCheck, Sparkles, MessageCircle, Info } from 'lucide-react';
import { PARTNER_PROFILE, USER_PROFILE, SCENARIO_DETAILS, PRACTICE_DIALOGUE } from '../data/dialogueData';

interface StartScreenProps {
  onStart: () => void;
  onOpenHistory: () => void;
  onOpenPrivacyNotice: () => void;
  pastSessionsCount: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  onOpenHistory,
  onOpenPrivacyNotice,
  pastSessionsCount,
}) => {
  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-stone-50/50 border-x border-stone-200/70 shadow-xs">
      {/* Top Header: App Title + User Profile */}
      <header className="px-5 pt-6 pb-4 bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold tracking-wide uppercase mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Campus English · Speaking Practice</span>
            </div>
            <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">
              Let's Be Friends
            </h1>
            <p className="text-xs text-stone-500 font-medium">Meet and Speak with International Friends</p>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-3 py-1 pr-2 bg-stone-50 rounded-2xl border border-stone-200/80">
            <div className="text-right">
              <div className="text-xs font-bold text-stone-800">{USER_PROFILE.name}</div>
              <div className="text-[10px] text-stone-400">Student</div>
            </div>
            <img
              src={USER_PROFILE.avatar}
              alt={USER_PROFILE.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-xs"
            />
          </div>
        </div>
      </header>

      {/* Middle: Scenario & Conversation Card */}
      <main className="flex-1 px-5 py-5 space-y-4 overflow-y-auto">
        {/* Main Scenario Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/40 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

          {/* Scenario Header with Unboxed Metadata */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-3 font-medium">
            <span className="font-semibold text-amber-800">Scenario #1</span>
            <div className="flex items-center gap-2">
              <span>{SCENARIO_DETAILS.level}</span>
              <span aria-hidden="true">·</span>
              <span>{SCENARIO_DETAILS.targetTime}</span>
            </div>
          </div>

          <h2 className="text-lg font-bold text-stone-900 leading-snug">
            {SCENARIO_DETAILS.title}
          </h2>
          <p className="text-xs text-stone-500 mb-4">{SCENARIO_DETAILS.titleKorean}</p>

          <p className="text-xs text-stone-600 leading-relaxed mb-5">
            {SCENARIO_DETAILS.description}
          </p>

          {/* Partner Preview */}
          <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/60 flex items-center gap-3 mb-5">
            <div className="relative shrink-0">
              <img
                src={PARTNER_PROFILE.avatar}
                alt={PARTNER_PROFILE.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-200"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-stone-900">{PARTNER_PROFILE.name}</span>
                <span className="text-[11px] text-amber-800 font-medium bg-amber-100/80 px-2 py-0.5 rounded">
                  Chat Partner
                </span>
              </div>
              <p className="text-xs text-stone-600 truncate mt-0.5">{PARTNER_PROFILE.role}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Friendly, supportive & casual tone</p>
            </div>
          </div>

          {/* 5 Speaking Dialogue Steps Outline */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-700">Practice Dialogue (5 Turns)</span>
              <span className="text-[11px] text-stone-400">Section 6 PRD</span>
            </div>
            <div className="space-y-1.5">
              {PRACTICE_DIALOGUE.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 px-3 py-2 bg-stone-50 rounded-lg text-xs border border-stone-100"
                >
                  <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                    {item.id}
                  </span>
                  <div className="truncate flex-1">
                    <span className="text-stone-800 font-medium">{item.targetSentence}</span>
                  </div>
                  <span className="text-[10px] text-stone-400 shrink-0">
                    {item.keywords.slice(0, 2).join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Why & Goal Callout */}
        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-stone-800">
            <MessageCircle className="w-4 h-4 text-amber-600" />
            <span>How It Works (4-Step Learning)</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-center pt-1">
            <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
              <span className="text-amber-800 font-bold block text-[11px]">1. Listen</span>
              <span className="text-[10px] text-stone-500">듣기 (0.9x/0.7x)</span>
            </div>
            <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
              <span className="text-amber-800 font-bold block text-[11px]">2. Speak</span>
              <span className="text-[10px] text-stone-500">마이크로 답변</span>
            </div>
            <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
              <span className="text-amber-800 font-bold block text-[11px]">3. Feedback</span>
              <span className="text-[10px] text-stone-500">자연스러운 교정</span>
            </div>
            <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
              <span className="text-amber-800 font-bold block text-[11px]">4. Try Again</span>
              <span className="text-[10px] text-stone-500">다시 도전 & 다음</span>
            </div>
          </div>
          <p className="text-[11px] text-stone-500 pt-1 leading-relaxed">
            * Minor grammar mistakes (like missing 'a' or 'the') are gently shown on screen without hurting your completion stars.
          </p>
        </div>

        {/* Required Privacy Notice on Start Screen (PRD Technical Requirement) */}
        <div
          onClick={onOpenPrivacyNotice}
          className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/70 flex items-start gap-2.5 text-emerald-900 cursor-pointer hover:bg-emerald-50 transition-colors"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
          <div className="text-xs leading-relaxed flex-1">
            <p className="font-semibold text-emerald-950">
              Privacy Notice (개인정보 보호 안내)
            </p>
            <p className="text-emerald-800/90 text-[11px] mt-0.5">
              Your voice is processed to turn it into text and is not recorded or saved.
            </p>
            <p className="text-emerald-700 text-[10px] mt-0.5">
              (음성은 텍스트 변환용으로만 처리되며 녹음되거나 서버에 저장되지 않습니다.)
            </p>
          </div>
          <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
        </div>
      </main>

      {/* Bottom Actions: [Start Conversation] [Review Past Conversations] */}
      <footer className="p-5 bg-white border-t border-stone-100 sticky bottom-0 z-10 space-y-2.5">
        <button
          onClick={onStart}
          className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-stone-950 font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
        >
          <Play className="w-4 h-4 fill-stone-950" />
          <span>Start Conversation (대화 시작하기)</span>
        </button>

        <button
          onClick={onOpenHistory}
          className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <History className="w-3.5 h-3.5" />
          <span>Review Past Conversations {pastSessionsCount > 0 ? `(${pastSessionsCount})` : ''}</span>
        </button>
      </footer>
    </div>
  );
};
