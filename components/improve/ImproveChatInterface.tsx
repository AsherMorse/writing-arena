'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { WritingSession, saveImproveConversation, updateImproveConversation, getImproveConversations, ImproveConversation } from '@/lib/services/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { getGradeLevelFromRank } from '@/lib/utils/skill-level';
import { useStreamReader } from '@/lib/hooks/useStreamReader';
import { useProgressMetrics } from '@/lib/hooks/useProgressMetrics';
import { useApiCall } from '@/lib/hooks/useApiCall';
import { getCurrentTimestamp } from '@/lib/utils/date-utils';
import { ChatHeader } from './ChatHeader';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { ChatModals } from './ChatModals';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ImproveChatInterfaceProps {
  rankedMatches: WritingSession[];
}

export default function ImproveChatInterface({ rankedMatches }: ImproveChatInterfaceProps) {
  const { user, userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const analysisStarted = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [showMatchSummary, setShowMatchSummary] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [pastConversations, setPastConversations] = useState<ImproveConversation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Stream reader hook for handling streaming responses
  const { readStream } = useStreamReader({
    onMessageUpdate: useCallback((messageId: string, content: string) => {
      setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, content } : msg));
    }, []),
    onError: useCallback((error: Error) => {
      const errorMessage: Message = { 
        id: `error-${getCurrentTimestamp()}`, 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMessage]);
    }, []),
  });
  
  useEffect(() => {
    if (messages.length === 0 || !user) return;
    const saveTimer = setTimeout(async () => {
      try {
        if (currentConversationId) {
          await updateImproveConversation(currentConversationId, messages);
        } else {
          const id = await saveImproveConversation(user.uid, messages);
          setCurrentConversationId(id);
        }
      } catch (error) {}
    }, 2000);
    return () => clearTimeout(saveTimer);
  }, [messages, user, currentConversationId]);
  
  const loadConversationHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const conversations = await getImproveConversations(user.uid, 20);
      setPastConversations(conversations);
    } catch (error) {}
    finally { setLoadingHistory(false); }
  };
  
  const loadConversation = (conversation: ImproveConversation) => {
    setMessages(conversation.messages.map(msg => ({ ...msg, timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp) })));
    setCurrentConversationId(conversation.id || null);
    setShowHistory(false);
  };
  
  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setInitialized(false);
    analysisStarted.current = false;
    setShowHistory(false);
  };

  const generateInitialAnalysis = useCallback(async () => {
    setIsLoading(true);
    try {
      const gradeLevel = userProfile?.currentRank ? getGradeLevelFromRank(userProfile.currentRank) : '7th-8th';
      const response = await fetch('/api/improve/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matches: rankedMatches, userId: user?.uid, gradeLevel }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze');
      }
      
      const messageId = `analysis-${getCurrentTimestamp()}`;
      const analysisMessage: Message = { id: messageId, role: 'assistant', content: '', timestamp: new Date() };
      setMessages(prev => [...prev, analysisMessage]);
      
      await readStream(response, messageId);
    } catch (error) {
      const errorMessage: Message = { id: `error-${getCurrentTimestamp()}`, role: 'assistant', content: 'Sorry, I encountered an error analyzing your matches. Please try again.', timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [rankedMatches, user, userProfile, readStream]);

  useEffect(() => {
    if (!initialized && !analysisStarted.current && rankedMatches.length >= 5) {
      analysisStarted.current = true;
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Hi ${user?.displayName || 'there'}! 👋\n\nI've reviewed your last 5 ranked matches and I'm here to help you improve your writing using The Writing Revolution (TWR) methodology.\n\nLet me analyze your performance...`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setInitialized(true);
      generateInitialAnalysis();
    }
  }, [rankedMatches, initialized, user, generateInitialAnalysis]);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessageText = input.trim();
    const userMessage: Message = { id: `user-${getCurrentTimestamp()}`, role: 'user', content: userMessageText, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const gradeLevel = userProfile?.currentRank ? getGradeLevelFromRank(userProfile.currentRank) : '7th-8th';
      const response = await fetch('/api/improve/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessageText, matches: rankedMatches, conversationHistory: messages.slice(-10), userId: user?.uid, gradeLevel }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate response');
      }

      const messageId = `assistant-${Date.now()}`;
      const assistantMessage: Message = { id: messageId, role: 'assistant', content: '', timestamp: new Date() };
      setMessages(prev => [...prev, assistantMessage]);
      
      await readStream(response, messageId);
    } catch (error) {
      const errorMessage: Message = { id: `error-${Date.now()}`, role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleQuickAction = async (action: string) => {
    const userMessage: Message = { id: `user-${getCurrentTimestamp()}`, role: 'user', content: action, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const gradeLevel = userProfile?.currentRank ? getGradeLevelFromRank(userProfile.currentRank) : '7th-8th';
      const response = await fetch('/api/improve/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: action, matches: rankedMatches, conversationHistory: messages.slice(-10), userId: user?.uid, gradeLevel }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate response');
      }

      const messageId = `assistant-${Date.now()}`;
      const assistantMessage: Message = { id: messageId, role: 'assistant', content: '', timestamp: new Date() };
      setMessages(prev => [...prev, assistantMessage]);
      
      await readStream(response, messageId);
    } catch (error) {
      const errorMessage: Message = { id: `error-${Date.now()}`, role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = ['Give me exercises to practice', 'Explain this more', 'Show me examples', 'I want to try a writing exercise'];
  const progressMetrics = useProgressMetrics(rankedMatches);
  const { call: apiCall } = useApiCall();

  return (
    <div className="mx-auto flex h-[calc(100vh-80px)] max-w-4xl flex-col px-6 py-6">
      <ChatHeader
        onHistoryClick={() => {
          loadConversationHistory();
          setShowHistory(true);
        }}
        onMatchesClick={() => setShowMatchSummary(true)}
        onProgressClick={() => setShowProgress(true)}
        onExportClick={() => setShowExport(true)}
        hasMessages={messages.length > 0}
      />

      <ChatMessageList
        messages={messages}
        isLoading={isLoading}
        userAvatar={userProfile?.avatar}
        quickActions={quickActions}
        onQuickAction={handleQuickAction}
        messagesEndRef={messagesEndRef}
      />

      <ChatInput input={input} onInputChange={setInput} onSend={handleSend} isLoading={isLoading} />

      <ChatModals
        showMatchSummary={showMatchSummary}
        showProgress={showProgress}
        showExport={showExport}
        showHistory={showHistory}
        onCloseMatchSummary={() => setShowMatchSummary(false)}
        onCloseProgress={() => setShowProgress(false)}
        onCloseExport={() => setShowExport(false)}
        onCloseHistory={() => setShowHistory(false)}
        rankedMatches={rankedMatches}
        progressMetrics={progressMetrics}
        messages={messages}
        pastConversations={pastConversations}
        loadingHistory={loadingHistory}
        currentConversationId={currentConversationId}
        onLoadConversation={loadConversation}
        onStartNewConversation={startNewConversation}
      />
    </div>
  );
}
