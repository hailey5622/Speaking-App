import React from 'react';
import { X, Volume2, Sparkles } from 'lucide-react';
import { speechManager } from '../utils/speech';

interface OtherResponsesModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSentence: string;
  targetKorean: string;
  alternativeExpressions: string[];
  onSelectExpression?: (expr: string) => void;
}

export const OtherResponsesModal: React.FC<OtherResponsesModalProps> = ({
  isOpen,
  onClose,
  targetSentence,
  targetKorean,
  alternativeExpressions,
  onSelectExpression,
}) => {
  if (!isOpen) return null;

  const handlePlayAudio = (text: string) => {
    speechManager.speakText(text, 0.9);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-amber-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-sm">Other Natural Responses</h3>
              <p className="text-xs text-stone-500">다양한 자연스러운 표현들</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block mb-1">
              Standard Target Sentence
            </span>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-stone-900 text-sm font-medium">{targetSentence}</p>
                <p className="text-stone-500 text-xs mt-0.5">{targetKorean}</p>
              </div>
              <button
                onClick={() => handlePlayAudio(targetSentence)}
                className="shrink-0 p-1.5 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors"
                title="Listen"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-2 px-1">
              Alternative Natural Ways to Reply
            </span>
            <div className="space-y-2.5">
              {alternativeExpressions.map((expr, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl border border-stone-200/80 bg-white hover:border-amber-400 hover:shadow-xs transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                        Option {index + 1}
                      </span>
                    </div>
                    <p className="text-stone-800 text-sm leading-relaxed">{expr}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handlePlayAudio(expr)}
                      className="p-1.5 rounded-lg text-stone-400 group-hover:text-amber-700 hover:bg-amber-50 transition-colors"
                      title="Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    {onSelectExpression && (
                      <button
                        onClick={() => {
                          onSelectExpression(expr);
                          onClose();
                        }}
                        className="text-xs px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 hover:bg-amber-200 font-medium transition-colors"
                      >
                        Try this
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-xs text-amber-900/80 leading-relaxed">
            💡 <strong>Tip:</strong> You don't have to repeat the exact target sentence! Any understandable English that fits the conversation is accepted.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors"
          >
            Got it (확인)
          </button>
        </div>
      </div>
    </div>
  );
};
