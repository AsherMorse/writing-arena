'use client';

import { useParams } from 'next/navigation';
import { useSession } from '@/lib/hooks/useSession';
import WritingSessionContent from '@/components/ranked/WritingSessionContent';
import PeerFeedbackContent from '@/components/ranked/PeerFeedbackContent';
import RevisionContent from '@/components/ranked/RevisionContent';
import ResultsContent from '@/components/ranked/ResultsContent';

/**
 * Dynamic Session Route
 * Replaces old URL param-based navigation with clean session-based routing
 * 
 * Auto-detects current phase and renders appropriate component
 */
export default function SessionPage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;
  
  const { session, isReconnecting, error } = useSession(sessionId);
  
  // Loading state
  if (isReconnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Connecting to session...</p>
          <p className="text-blue-200 text-sm mt-2">Restoring your progress...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-8 max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-white text-2xl font-bold mb-2">Session Not Found</h1>
          <p className="text-red-200 mb-6">
            {error?.message || 'This session does not exist or you do not have access to it.'}
          </p>
          <a 
            href="/dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }
  
  // Render appropriate component based on current phase and state
  const currentPhase = session.config.phase;
  const sessionState = session.state;
  
  // Completed session
  if (sessionState === 'completed') {
    return <ResultsContent />;
  }
  
  // Phase-based rendering
  if (currentPhase === 1) {
    return <WritingSessionContent />;
  } else if (currentPhase === 2) {
    return <PeerFeedbackContent />;
  } else if (currentPhase === 3) {
    return <RevisionContent />;
  }
  
  // Fallback
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <p className="text-white text-xl">Loading session...</p>
      </div>
    </div>
  );
}

