import React from 'react';
import { X, Star, Calendar, Trash2, ChevronRight, MessageSquare, ArrowLeft } from 'lucide-react';
import { PracticeSessionRecord } from '../types';
import { speechManager } from '../utils/speech';

interface PastSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: PracticeSessionRecord[];
  onClearHistory: () => void;
}

export const PastSessionsModal: React.FC<PastSessionsModalProps> = ({
  isOpen,
  onClose,
  sessions,
  onClearHistory,
}) => {
  const [selectedSession, setSelectedSession] = React.useState<PracticeSessionRecord | null>(null);

  if (!isOpen) return null;

  const handlePlay = (text: string) => {
    speechManager.speakText(text, 0.9);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            {selectedSession ? (
              <button
                onClick={() => setSelectedSession(null)}
                className="p-1 -ml-1 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200 transition-colors"
                title="Back to list"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-stone-900 text-sm">
                {selectedSession ? 'Session Review' : 'Past Conversations'}
              </h3>
              <p className="text-xs text-stone-500">
                {selectedSession ? selectedSession.date : '지난 대화 연습 기록'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedSession(null);
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {selectedSession ? (
            /* Selected Session Detail */
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-amber-900">Meeting a New Friend</span>
                  <div className="text-xs text-amber-700 mt-0.5">
                    Completed {selectedSession.completedTurns} of {selectedSession.totalTurns} turns
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < selectedSession.stars ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {selectedSession.turns.map((turn, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-600">Turn {turn.turnId}</span>
                      <span className="text-stone-400">Attempt #{turn.attemptNumber}</span>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="text-stone-500">What you said:</div>
                      <div className="font-medium text-stone-900 p-2 bg-white rounded-lg border border-stone-100">
                        "{turn.spokenText || '(No speech detected)'}"
                      </div>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="text-amber-800 font-medium">Natural version:</div>
                      <div className="p-2 bg-amber-50/80 rounded-lg text-stone-900 flex items-center justify-between">
                        <span>{turn.correctedSentence}</span>
                        <button
                          onClick={() => handlePlay(turn.correctedSentence)}
                          className="text-amber-700 hover:text-amber-900 ml-2"
                        >
                          🔊
                        </button>
                      </div>
                    </div>

                    {turn.feedbackEnglish && (
                      <div className="text-[11px] text-stone-600 bg-white p-2 rounded border border-stone-100">
                        💬 {turn.feedbackEnglish}
                        {turn.feedbackKorean && <span className="block text-stone-400 mt-0.5">{turn.feedbackKorean}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-12 text-center text-stone-400 space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto text-stone-300 stroke-[1.5]" />
              <p className="text-sm font-medium text-stone-600">No practice records yet</p>
              <p className="text-xs text-stone-400">Complete your first conversation with Jina to save your history!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sessions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedSession(item)}
                  className="p-3.5 rounded-xl border border-stone-200 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer bg-white flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span className="text-xs font-semibold text-stone-800">{item.date}</span>
                    </div>
                    <div className="text-xs text-stone-500">
                      Turns: <span className="font-medium text-stone-700">{item.completedTurns}/{item.totalTurns}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < item.stars ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
          {!selectedSession && sessions.length > 0 ? (
            <button
              onClick={onClearHistory}
              className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1.5 transition-colors font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear history
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={() => {
              setSelectedSession(null);
              onClose();
            }}
            className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-medium hover:bg-stone-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
