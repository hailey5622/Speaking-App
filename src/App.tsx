import { useState, useEffect } from 'react';
import { StartScreen } from './components/StartScreen';
import { PracticeScreen } from './components/PracticeScreen';
import { ResultScreen } from './components/ResultScreen';
import { PastSessionsModal } from './components/PastSessionsModal';
import { BrowserNoticeModal } from './components/BrowserNoticeModal';
import { PRACTICE_DIALOGUE } from './data/dialogueData';
import { PracticeSessionRecord, TurnAttemptResult } from './types';
import { checkSpeechSupport } from './utils/speech';

const STORAGE_KEY = 'lets_be_friends_sessions_v1';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'start' | 'practice' | 'result'>('start');
  const [pastSessions, setPastSessions] = useState<PracticeSessionRecord[]>([]);
  const [latestResults, setLatestResults] = useState<TurnAttemptResult[]>([]);
  const [isPastModalOpen, setIsPastModalOpen] = useState(false);

  // Browser notice modal state
  const [noticeReason, setNoticeReason] = useState<
    'not-supported' | 'permission-denied' | 'in-app-browser' | 'info' | null
  >(null);
  const [inAppBrowserName, setInAppBrowserName] = useState<string | null>(null);

  // Load saved sessions on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPastSessions(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to parse saved sessions from localStorage:', e);
    }

    // Check environment support
    const status = checkSpeechSupport();
    if (status.isInAppBrowser) {
      setInAppBrowserName(status.inAppBrowserName);
      setNoticeReason('in-app-browser');
    }
  }, []);

  const handleStartPractice = () => {
    setCurrentScreen('practice');
  };

  const handleFinishPractice = (results: TurnAttemptResult[]) => {
    setLatestResults(results);

    // Calculate stars:
    // ⭐⭐⭐ (3 stars) completed all 5
    // ⭐⭐ (2 stars) completed 3-4
    // ⭐ (1 star) completed 1-2
    const completed = results.length;
    const stars = completed >= 5 ? 3 : completed >= 3 ? 2 : completed >= 1 ? 1 : 0;

    const newRecord: PracticeSessionRecord = {
      id: `session_${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      completedTurns: completed,
      totalTurns: PRACTICE_DIALOGUE.length,
      stars,
      turns: results,
    };

    const updated = [newRecord, ...pastSessions].slice(0, 20); // retain last 20
    setPastSessions(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save session to localStorage:', e);
    }

    setCurrentScreen('result');
  };

  const handleRestart = () => {
    setCurrentScreen('practice');
  };

  const handleGoHome = () => {
    setCurrentScreen('start');
  };

  const handleClearHistory = () => {
    setPastSessions([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center text-stone-900">
      {currentScreen === 'start' && (
        <StartScreen
          onStart={handleStartPractice}
          onOpenHistory={() => setIsPastModalOpen(true)}
          onOpenPrivacyNotice={() => setNoticeReason('info')}
          pastSessionsCount={pastSessions.length}
        />
      )}

      {currentScreen === 'practice' && (
        <PracticeScreen
          turns={PRACTICE_DIALOGUE}
          onFinishPractice={handleFinishPractice}
          onGoHome={handleGoHome}
          onShowBrowserNotice={(reason) => setNoticeReason(reason)}
        />
      )}

      {currentScreen === 'result' && (
        <ResultScreen
          results={latestResults}
          turns={PRACTICE_DIALOGUE}
          onRestart={handleRestart}
          onGoHome={handleGoHome}
        />
      )}

      {/* Past Sessions Review Modal */}
      <PastSessionsModal
        isOpen={isPastModalOpen}
        onClose={() => setIsPastModalOpen(false)}
        sessions={pastSessions}
        onClearHistory={handleClearHistory}
      />

      {/* Browser / Environment Notice Modal */}
      <BrowserNoticeModal
        isOpen={noticeReason !== null}
        onClose={() => setNoticeReason(null)}
        reason={noticeReason || 'info'}
        inAppBrowserName={inAppBrowserName}
      />
    </div>
  );
}
