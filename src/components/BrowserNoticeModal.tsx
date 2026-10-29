import React from 'react';
import { AlertCircle, Chrome, Smartphone, Lock, X } from 'lucide-react';

interface BrowserNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: 'not-supported' | 'permission-denied' | 'in-app-browser' | 'info';
  inAppBrowserName?: string | null;
}

export const BrowserNoticeModal: React.FC<BrowserNoticeModalProps> = ({
  isOpen,
  onClose,
  reason,
  inAppBrowserName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-stone-200 p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            {reason === 'not-supported' ? (
              <Chrome className="w-5 h-5 text-amber-800" />
            ) : reason === 'permission-denied' ? (
              <Lock className="w-5 h-5 text-rose-600" />
            ) : reason === 'in-app-browser' ? (
              <Smartphone className="w-5 h-5 text-amber-800" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-800" />
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="font-bold text-stone-900 text-base">
            {reason === 'not-supported'
              ? 'Speech Recognition Not Supported'
              : reason === 'permission-denied'
              ? 'Microphone Permission Needed'
              : reason === 'in-app-browser'
              ? 'In-App Browser Detected'
              : 'Voice & Privacy Notice'}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            {reason === 'not-supported'
              ? '음성 인식을 지원하지 않는 브라우저입니다'
              : reason === 'permission-denied'
              ? '마이크 사용 권한이 거부되었습니다'
              : reason === 'in-app-browser'
              ? `${inAppBrowserName || '인앱'} 브라우저 환경 안내`
              : '안전한 음성 처리 안내'}
          </p>
        </div>

        <div className="text-xs text-stone-600 space-y-2 bg-stone-50 p-3.5 rounded-xl border border-stone-100 leading-relaxed">
          {reason === 'not-supported' && (
            <>
              <p>
                This browser does not support the Web Speech API. For the best speaking practice experience, please open this app in <strong>Google Chrome</strong> or Microsoft Edge.
              </p>
              <p className="text-stone-500">
                (원활한 음성 연습을 위해 크롬(Chrome) 브라우저에서 열어주세요.)
              </p>
            </>
          )}

          {reason === 'permission-denied' && (
            <>
              <p>
                Microphone access was blocked or denied. Please click the camera/lock icon in your browser address bar and switch <strong>Microphone</strong> to <strong>Allow</strong>.
              </p>
              <p className="text-stone-500">
                (주소창의 자물쇠/설정 아이콘을 눌러 마이크 권한을 허용해 주세요.)
              </p>
            </>
          )}

          {reason === 'in-app-browser' && (
            <>
              <p>
                In-app browsers like <strong>{inAppBrowserName || 'KakaoTalk/Instagram'}</strong> frequently restrict microphone audio input.
              </p>
              <p>
                Please tap the <strong>•••</strong> menu at the top or bottom right, and select <strong>"Open in Chrome"</strong> or <strong>"Open in Safari"</strong>.
              </p>
              <p className="text-stone-500">
                (더보기 메뉴에서 다른 브라우저로 열기를 선택하시면 마이크가 정상 작동합니다.)
              </p>
            </>
          )}

          {reason === 'info' && (
            <>
              <p>
                🔒 <strong>Privacy Guarantee:</strong>
                <br />
                Your voice is processed live by your browser to turn it into text and is <strong>not recorded or saved</strong> on any server.
              </p>
              <p className="text-stone-500">
                (학습자의 음성은 실시간 텍스트 변환용으로만 사용되며 오디오 파일로 저장되거나 전송되지 않습니다.)
              </p>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs"
        >
          Understood (확인)
        </button>
      </div>
    </div>
  );
};
