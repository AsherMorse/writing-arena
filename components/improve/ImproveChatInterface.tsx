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
      } catch (error) {
        // Silent fail for conversation save
      }
    }, 2000);
    
    return () => clearTimeout(saveTimer);
  }, [messages, user, currentConversationId]);
  
  const loadConversationHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const conversations = await getImproveConversations(user.uid, 20);
      setPastConversations(conversations);
    } catch (error) {
      // Silent fail for history load
    } finally {
      setLoadingHistory(false);
    }
  };
  
  const loadConversation = (conversation: ImproveConversation) => {
    setMessages(conversation.messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp),
    })));
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
      const gradeLevel = userProfile?.currentRank 
        ? getGradeLevelFromRank(userProfile.currentRank)
        : '7th-8th';

      const response = await fetch('/api/improve/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matches: rankedMatches,
          userId: user?.uid,
          gradeLevel: gradeLevel,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze');
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body');
      }
      
      const messageId = `analysis-${Date.now()}`;
      const analysisMessage: Message = {
        id: messageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, analysisMessage]);
      
      let accumulatedText = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: accumulatedText }
            : msg
        ));
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error analyzing your matches. Please try again.',
        timestamp: new Date(),
      };
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
        content: `Hi ${user?.displayName || 'there'}! 👋

I've reviewed your last 5 ranked matches and I'm here to help you improve your writing using The Writing Revolution (TWR) methodology.

Let me analyze your performance...`,
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
      setInitialized(true);
      
      generateInitialAnalysis();
    }
  }, [rankedMatches, initialized, user, generateInitialAnalysis]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessageText = input.trim();

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const gradeLevel = userProfile?.currentRank 
        ? getGradeLevelFromRank(userProfile.currentRank)
        : '7th-8th';

      const response = await fetch('/api/improve/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessageText,
          matches: rankedMatches,
          conversationHistory: messages.slice(-10),
          userId: user?.uid,
          gradeLevel: gradeLevel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body');
      }
      
      const messageId = `assistant-${Date.now()}`;
      const assistantMessage: Message = {
        id: messageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      let accumulatedText = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: accumulatedText }
            : msg
        ));
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = async (action: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: action,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const gradeLevel = userProfile?.currentRank 
        ? getGradeLevelFromRank(userProfile.currentRank)
        : '7th-8th';

      const response = await fetch('/api/improve/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: action,
          matches: rankedMatches,
          conversationHistory: messages.slice(-10),
          userId: user?.uid,
          gradeLevel: gradeLevel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body');
      }
      
      const messageId = `assistant-${Date.now()}`;
      const assistantMessage: Message = {
        id: messageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      let accumulatedText = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: accumulatedText }
            : msg
        ));
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    'Give me exercises to practice',
    'Explain this more',
    'Show me examples',
    'I want to try a writing exercise',
  ];

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
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto px-6 py-6">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Improve Your Writing</h1>
            <p className="text-white/60 text-sm">
              Personalized exercises based on your last 5 ranked matches • Powered by TWR methodology
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                loadConversationHistory();
                setShowHistory(true);
              }}
              className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white transition"
              title="View conversation history"
            >
              📜 History
            </button>
            <button
              onClick={() => setShowMatchSummary(true)}
              className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white transition"
              title="View match summary"
            >
              📊 Matches
            </button>
            <button
              onClick={() => setShowProgress(true)}
              className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white transition"
              title="View progress"
            >
              📈 Progress
            </button>
            {messages.length > 0 && (
              <button
                onClick={() => setShowExport(true)}
                className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white transition"
                title="Export conversation"
              >
                💾 Export
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2">
        {messages.map((message, index) => (
          <div key={message.id} className="space-y-3">
            <div
              className={`flex gap-4 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 flex-shrink-0">
                  📚
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-emerald-500/20 border border-emerald-400/30 text-white'
                    : 'bg-white/5 border border-white/10 text-white/90'
                }`}
              >
                <div className="text-sm leading-relaxed">
                  {message.role === 'assistant' ? (
                    <MarkdownRenderer content={message.content} />
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 flex-shrink-0">
                  {userProfile?.avatar || '👤'}
                </div>
              )}
            </div>
            
            {message.role === 'assistant' && 
             !isLoading && 
             index === messages.length - 1 && 
             message.content.trim().length > 0 && (
              <div className="ml-12 space-y-2">
                <p className="text-xs text-white/50 mb-2">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action}
                      onClick={() => handleQuickAction(action)}
                      disabled={isLoading}
                      className="px-4 py-2 text-xs font-medium bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 flex-shrink-0">
              📚
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your writing, request exercises, or get TWR tips..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 resize-none focus:outline-none focus:border-emerald-400/50"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#0c141d] font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-white/40 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>

      <Modal
        isOpen={showMatchSummary}
        onClose={() => setShowMatchSummary(false)}
        title="Your Last 5 Matches"
        variant="default"
        size="xl"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {rankedMatches.map((match, index) => {
            const date = match.timestamp?.toDate?.() || new Date();
            return (
              <div
                key={match.id || index}
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-left"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      Match {index + 1} • {date.toLocaleDateString()}
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      {match.promptType || 'Narrative'} • {match.wordCount || 0} words
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-300">
                      {match.score?.toFixed(0) || 0}
                    </div>
                    <div className="text-xs text-white/50">
                      {match.placement ? `#${match.placement}` : '—'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {Object.entries(match.traitScores || {}).map(([trait, score]) => (
                    <div key={trait} className="text-center">
                      <div className="text-xs text-white/50 capitalize">{trait.substring(0, 3)}</div>
                      <div className="text-sm font-semibold text-white">{score || 0}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      <Modal
        isOpen={showProgress}
        onClose={() => setShowProgress(false)}
        title="Your Progress"
        variant="default"
        size="lg"
      >
        {progressMetrics ? (
          <div className="space-y-6 text-left">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-sm text-white/60 mb-2">Overall Average</div>
              <div className="text-3xl font-bold text-emerald-300">
                {progressMetrics.overallAvg.toFixed(1)}
              </div>
              <div className="text-xs text-white/50 mt-1">
                Trend: <span className={
                  progressMetrics.trend === 'improving' ? 'text-emerald-300' :
                  progressMetrics.trend === 'declining' ? 'text-red-300' : 'text-white/60'
                }>
                  {progressMetrics.trend} ({progressMetrics.trendDiff.toFixed(1)} pts)
                </span>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-white/60 mb-3">Average by Trait</div>
              <div className="space-y-3">
                {Object.entries(progressMetrics.avgScores).map(([trait, score]) => (
                  <div key={trait}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white capitalize">{trait}</span>
                      <span className="text-sm font-semibold text-white">{score.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-emerald-400 h-2 rounded-full transition-all"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-white/60">No progress data available</div>
        )}
      </Modal>

      <Modal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        title="Export Conversation"
        variant="default"
        size="md"
      >
        <div className="space-y-4 text-left">
          <p className="text-white/70 text-sm">
            Export your conversation as a text file. This includes all messages and timestamps.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#0c141d] font-semibold rounded-lg transition"
            >
              Download as .txt
            </button>
            <button
              onClick={() => setShowExport(false)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        title="Conversation History"
        variant="default"
        size="lg"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <p className="text-white/70 text-sm">
              Your past improvement sessions. Click to resume.
            </p>
            <button
              onClick={startNewConversation}
              className="px-3 py-1.5 text-xs font-medium bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 rounded-lg transition"
            >
              + New Session
            </button>
          </div>
          
          {loadingHistory ? (
            <div className="text-center py-8 text-white/60">Loading...</div>
          ) : pastConversations.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              No past conversations yet. Start chatting to save your sessions!
            </div>
          ) : (
            pastConversations.map((conversation) => {
              const date = conversation.updatedAt?.toDate?.() || new Date();
              const messageCount = conversation.messages.length;
              const lastMessage = conversation.messages[messageCount - 1];
              const preview = lastMessage?.content?.substring(0, 100) || '';
              
              return (
                <button
                  key={conversation.id}
                  onClick={() => loadConversation(conversation)}
                  className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white mb-1">
                        {date.toLocaleDateString()} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs text-white/50">
                        {messageCount} message{messageCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                    {conversation.id === currentConversationId && (
                      <span className="px-2 py-1 text-xs bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  {preview && (
                    <div className="text-xs text-white/60 mt-2 line-clamp-2">
                      {preview}...
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </Modal>
    </div>
  );
}
