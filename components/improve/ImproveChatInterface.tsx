'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { WritingSession, saveImproveConversation, updateImproveConversation, getImproveConversations, ImproveConversation } from '@/lib/services/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { getGradeLevelFromRank } from '@/lib/utils/skill-level';
import { MarkdownRenderer } from '@/lib/utils/markdown-renderer';
import { Modal } from '@/components/shared/Modal';

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
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No response body');
      
      const messageId = `analysis-${Date.now()}`;
      const analysisMessage: Message = { id: messageId, role: 'assistant', content: '', timestamp: new Date() };
      setMessages(prev => [...prev, analysisMessage]);
      
      let accumulatedText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, content: accumulatedText } : msg));
      }
    } catch (error) {
      const errorMessage: Message = { id: `error-${Date.now()}`, role: 'assistant', content: 'Sorry, I encountered an error analyzing your matches. Please try again.', timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [rankedMatches, user, userProfile]);

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
    const userMessage: Message = { id: `user-${Date.now()}`, role: 'user', content: userMessageText, timestamp: new Date() };
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

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No response body');
      
      const messageId = `assistant-${Date.now()}`;
      const assistantMessage: Message = { id: messageId, role: 'assistant', content: '', timestamp: new Date() };
      setMessages(prev => [...prev, assistantMessage]);
      
      let accumulatedText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, content: accumulatedText } : msg));
      }
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
    const userMessage: Message = { id: `user-${Date.now()}`, role: 'user', content: action, timestamp: new Date() };
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

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No response body');
      
      const messageId = `assistant-${Date.now()}`;
      const assistantMessage: Message = { id: messageId, role: 'assistant', content: '', timestamp: new Date() };
      setMessages(prev => [...prev, assistantMessage]);
      
      let accumulatedText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, content: accumulatedText } : msg));
      }
    } catch (error) {
      const errorMessage: Message = { id: `error-${Date.now()}`, role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = ['Give me exercises to practice', 'Explain this more', 'Show me examples', 'I want to try a writing exercise'];

  const progressMetrics = useMemo(() => {
    if (rankedMatches.length === 0) return null;
    const avgScores = {
      content: rankedMatches.reduce((sum, m) => sum + m.traitScores.content, 0) / rankedMatches.length,
      organization: rankedMatches.reduce((sum, m) => sum + m.traitScores.organization, 0) / rankedMatches.length,
      grammar: rankedMatches.reduce((sum, m) => sum + m.traitScores.grammar, 0) / rankedMatches.length,
      vocabulary: rankedMatches.reduce((sum, m) => sum + m.traitScores.vocabulary, 0) / rankedMatches.length,
      mechanics: rankedMatches.reduce((sum, m) => sum + m.traitScores.mechanics, 0) / rankedMatches.length,
    };
    const overallAvg = rankedMatches.reduce((sum, m) => sum + m.score, 0) / rankedMatches.length;
    const firstHalf = rankedMatches.slice(0, 2);
    const lastHalf = rankedMatches.slice(-2);
    const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.score, 0) / firstHalf.length;
    const lastHalfAvg = lastHalf.reduce((sum, m) => sum + m.score, 0) / lastHalf.length;
    const trend = lastHalfAvg > firstHalfAvg ? 'improving' : lastHalfAvg < firstHalfAvg ? 'declining' : 'stable';
    return { avgScores, overallAvg, trend, trendDiff: Math.abs(lastHalfAvg - firstHalfAvg) };
  }, [rankedMatches]);

  const handleExport = () => {
    const conversationText = messages.map(msg => {
      const role = msg.role === 'user' ? 'You' : 'Coach';
      const date = msg.timestamp.toLocaleString();
      return `[${date}] ${role}:\n${msg.content}\n`;
    }).join('\n---\n\n');
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `improvement-session-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExport(false);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-80px)] max-w-4xl flex-col px-6 py-6">
      <div className="mb-6">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-semibold">Improve Your Writing</h1>
            <p className="text-sm text-[rgba(255,255,255,0.4)]">
              Personalized exercises based on your last 5 ranked matches • TWR methodology
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { loadConversationHistory(); setShowHistory(true); }} className="rounded-[6px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-3 py-1.5 text-xs font-medium text-[rgba(255,255,255,0.4)] transition hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]">📜 History</button>
            <button onClick={() => setShowMatchSummary(true)} className="rounded-[6px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-3 py-1.5 text-xs font-medium text-[rgba(255,255,255,0.4)] transition hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]">📊 Matches</button>
            <button onClick={() => setShowProgress(true)} className="rounded-[6px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-3 py-1.5 text-xs font-medium text-[rgba(255,255,255,0.4)] transition hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]">📈 Progress</button>
            {messages.length > 0 && (
              <button onClick={() => setShowExport(true)} className="rounded-[6px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-3 py-1.5 text-xs font-medium text-[rgba(255,255,255,0.4)] transition hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]">💾 Export</button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 flex-1 space-y-6 overflow-y-auto pr-2">
        {messages.map((message, index) => (
          <div key={message.id} className="space-y-3">
            <div className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(0,229,229,0.15)] text-[#00e5e5]">📚</div>
              )}
              <div className={`max-w-[80%] rounded-[14px] p-4 ${message.role === 'user' ? 'border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.1)]' : 'border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)]'}`}>
                <div className="text-sm leading-relaxed">
                  {message.role === 'assistant' ? <MarkdownRenderer content={message.content} /> : <div className="whitespace-pre-wrap">{message.content}</div>}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(255,95,143,0.15)] text-[#ff5f8f]">{userProfile?.avatar || '👤'}</div>
              )}
            </div>
            
            {message.role === 'assistant' && !isLoading && index === messages.length - 1 && message.content.trim().length > 0 && (
              <div className="ml-12 space-y-2">
                <p className="mb-2 text-xs text-[rgba(255,255,255,0.3)]">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <button key={action} onClick={() => handleQuickAction(action)} disabled={isLoading} className="rounded-[6px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.08)] px-3 py-1.5 text-xs font-medium text-[#00e5e5] transition-all hover:bg-[rgba(0,229,229,0.15)] disabled:cursor-not-allowed disabled:opacity-50">
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(0,229,229,0.15)] text-[#00e5e5]">📚</div>
            <div className="rounded-[14px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] p-4">
              <div className="flex gap-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-[#00e5e5]" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-[#00e5e5]" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-[#00e5e5]" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[rgba(255,255,255,0.05)] pt-4">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your writing, request exercises, or get TWR tips..."
            className="flex-1 resize-none rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] px-4 py-3 text-sm placeholder-[rgba(255,255,255,0.22)] focus:border-[#00e5e5] focus:outline-none"
            rows={2}
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={!input.trim() || isLoading} className="rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] px-6 py-3 font-medium text-[#101012] transition hover:bg-[#33ebeb] disabled:cursor-not-allowed disabled:opacity-50">
            Send
          </button>
        </div>
        <p className="mt-2 text-xs text-[rgba(255,255,255,0.22)]">Press Enter to send, Shift+Enter for new line</p>
      </div>

      <Modal isOpen={showMatchSummary} onClose={() => setShowMatchSummary(false)} title="Your Last 5 Matches" variant="default" size="xl">
        <div className="max-h-[60vh] space-y-3 overflow-y-auto">
          {rankedMatches.map((match, index) => {
            const date = match.timestamp?.toDate?.() || new Date();
            return (
              <div key={match.id || index} className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4 text-left">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium">Match {index + 1} • {date.toLocaleDateString()}</div>
                    <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">{match.promptType || 'Narrative'} • {match.wordCount || 0} words</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg font-medium text-[#00e5e5]">{match.score?.toFixed(0) || 0}</div>
                    <div className="text-xs text-[rgba(255,255,255,0.3)]">{match.placement ? `#${match.placement}` : '—'}</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {Object.entries(match.traitScores || {}).map(([trait, score]) => (
                    <div key={trait} className="text-center">
                      <div className="text-[10px] capitalize text-[rgba(255,255,255,0.4)]">{trait.substring(0, 3)}</div>
                      <div className="font-mono text-sm">{score || 0}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      <Modal isOpen={showProgress} onClose={() => setShowProgress(false)} title="Your Progress" variant="default" size="lg">
        {progressMetrics ? (
          <div className="space-y-6 text-left">
            <div className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4">
              <div className="mb-2 text-xs text-[rgba(255,255,255,0.4)]">Overall Average</div>
              <div className="font-mono text-3xl font-medium text-[#00e5e5]">{progressMetrics.overallAvg.toFixed(1)}</div>
              <div className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">
                Trend: <span style={{ color: progressMetrics.trend === 'improving' ? '#00d492' : progressMetrics.trend === 'declining' ? '#ff5f8f' : 'rgba(255,255,255,0.4)' }}>
                  {progressMetrics.trend} ({progressMetrics.trendDiff.toFixed(1)} pts)
                </span>
              </div>
            </div>
            
            <div>
              <div className="mb-3 text-xs text-[rgba(255,255,255,0.4)]">Average by Trait</div>
              <div className="space-y-3">
                {Object.entries(progressMetrics.avgScores).map(([trait, score]) => (
                  <div key={trait}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm capitalize">{trait}</span>
                      <span className="font-mono text-sm text-[#00e5e5]">{score.toFixed(1)}</span>
                    </div>
                    <div className="h-[6px] overflow-hidden rounded-[3px] bg-[rgba(255,255,255,0.05)]">
                      <div className="h-full rounded-[3px] bg-[#00e5e5] transition-all" style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-[rgba(255,255,255,0.4)]">No progress data available</div>
        )}
      </Modal>

      <Modal isOpen={showExport} onClose={() => setShowExport(false)} title="Export Conversation" variant="default" size="md">
        <div className="space-y-4 text-left">
          <p className="text-sm text-[rgba(255,255,255,0.5)]">Export your conversation as a text file.</p>
          <div className="flex gap-3">
            <button onClick={handleExport} className="flex-1 rounded-[10px] border border-[#00e5e5] bg-[#00e5e5] px-4 py-2 font-medium text-[#101012] transition hover:bg-[#33ebeb]">Download as .txt</button>
            <button onClick={() => setShowExport(false)} className="rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.025)] px-4 py-2 transition hover:bg-[rgba(255,255,255,0.04)]">Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showHistory} onClose={() => setShowHistory(false)} title="Conversation History" variant="default" size="lg">
        <div className="max-h-[60vh] space-y-4 overflow-y-auto">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[rgba(255,255,255,0.5)]">Your past improvement sessions. Click to resume.</p>
            <button onClick={startNewConversation} className="rounded-[6px] border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.08)] px-3 py-1.5 text-xs font-medium text-[#00e5e5] transition hover:bg-[rgba(0,229,229,0.15)]">+ New Session</button>
          </div>
          
          {loadingHistory ? (
            <div className="py-8 text-center text-[rgba(255,255,255,0.4)]">Loading...</div>
          ) : pastConversations.length === 0 ? (
            <div className="py-8 text-center text-[rgba(255,255,255,0.4)]">No past conversations yet.</div>
          ) : (
            pastConversations.map((conversation) => {
              const date = conversation.updatedAt?.toDate?.() || new Date();
              const messageCount = conversation.messages.length;
              const lastMessage = conversation.messages[messageCount - 1];
              const preview = lastMessage?.content?.substring(0, 100) || '';
              
              return (
                <button key={conversation.id} onClick={() => loadConversation(conversation)} className="w-full rounded-[10px] border border-[rgba(255,255,255,0.05)] bg-[#101012] p-4 text-left transition hover:bg-[rgba(255,255,255,0.04)]">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 text-sm font-medium">{date.toLocaleDateString()} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-xs text-[rgba(255,255,255,0.4)]">{messageCount} message{messageCount !== 1 ? 's' : ''}</div>
                    </div>
                    {conversation.id === currentConversationId && (
                      <span className="rounded-[20px] bg-[rgba(0,229,229,0.12)] px-2 py-0.5 text-[10px] font-medium text-[#00e5e5]">Current</span>
                    )}
                  </div>
                  {preview && <div className="mt-2 line-clamp-2 text-xs text-[rgba(255,255,255,0.4)]">{preview}...</div>}
                </button>
              );
            })
          )}
        </div>
      </Modal>
    </div>
  );
}
