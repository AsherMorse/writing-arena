'use client';

import { useParams } from 'next/navigation';
import { useSession } from '@/lib/hooks/useSession';
import WritingSessionContent from '@/components/ranked/WritingSessionContent';
import PeerFeedbackContent from '@/components/ranked/PeerFeedbackContent';
import RevisionContent from '@/components/ranked/RevisionContent';
import ResultsContent from '@/components/ranked/ResultsContent';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';

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
    return <LoadingState message="Connecting to session..." variant="reconnecting" />;
  }
  
  // Error state
  if (error || !session) {
    return (
      <ErrorState 
        error={error || new Error('This session does not exist or you do not have access to it.')}
        title="Session Not Found"
      />
    );
  }
  
  // Render appropriate component based on current phase and state
  const currentPhase = session.config.phase;
  const sessionState = session.state;
  
  // Completed session
  if (sessionState === 'completed') {
    // Pass session data to ResultsContent
    return <ResultsContent session={session} />;
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
  return <LoadingState message="Loading session..." />;
}

