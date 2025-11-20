'use client';

import { useState, useRef, useEffect } from 'react';
import { WritingSession } from '@/lib/services/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { getGradeLevelFromRank } from '@/lib/utils/skill-level';
import { MarkdownRenderer } from '@/lib/utils/markdown-renderer';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message and analysis
  useEffect(() => {
    if (!initialized && rankedMatches.length >= 5) {
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
      
      // Generate initial analysis
      generateInitialAnalysis();
    }
  }, [rankedMatches, initialized, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateInitialAnalysis = async () => {
    setIsLoading(true);
    console.log('📊 IMPROVE - Starting initial analysis...', {
      matchesCount: rankedMatches.length,
      userId: user?.uid,
    });
    
    try {
      // Get user's grade level from rank
      const gradeLevel = userProfile?.currentRank 
        ? getGradeLevelFromRank(userProfile.currentRank)
        : '7th-8th'; // Default fallback

      console.log('📤 IMPROVE - Sending analyze request...', { gradeLevel });

      // Analyze the matches and generate TWR-based recommendations
      const response = await fetch('/api/improve/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matches: rankedMatches,
          userId: user?.uid,
          gradeLevel: gradeLevel,
        }),
      });
      
      console.log('📥 IMPROVE - Analyze response received:', {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type'),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ IMPROVE - Analyze error:', errorData);
        throw new Error(errorData.error || 'Failed to analyze');
      }
      
      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body');
      }
      
      // Create a new message for streaming
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
        
        if (done) {
          console.log('✅ IMPROVE - Analysis stream complete');
          break;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        
        console.log('📝 IMPROVE - Received chunk:', {
          chunkLength: chunk.length,
          totalLength: accumulatedText.length,
        });
        
        // Update the message with accumulated text
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: accumulatedText }
            : msg
        ));
      }
    } catch (error) {
      console.error('❌ IMPROVE - Error generating analysis:', error);
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
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessageText = input.trim();
    console.log('💬 IMPROVE - Sending message:', {
      messageLength: userMessageText.length,
      messagesCount: messages.length,
    });

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
      // Get user's grade level from rank
      const gradeLevel = userProfile?.currentRank 
        ? getGradeLevelFromRank(userProfile.currentRank)
        : '7th-8th'; // Default fallback

      console.log('📤 IMPROVE - Sending chat request...', {
        gradeLevel,
        historyLength: messages.length,
      });

      const response = await fetch('/api/improve/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessageText,
          matches: rankedMatches,
          conversationHistory: messages.slice(-10), // Last 10 messages for context
          userId: user?.uid,
          gradeLevel: gradeLevel,
        }),
      });

      console.log('📥 IMPROVE - Chat response received:', {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type'),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ IMPROVE - Chat error:', errorData);
        throw new Error(errorData.error || 'Failed to generate response');
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body');
      }
      
      // Create a new message for streaming
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
        
        if (done) {
          console.log('✅ IMPROVE - Chat stream complete');
          break;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        
        console.log('📝 IMPROVE - Received chunk:', {
          chunkLength: chunk.length,
          totalLength: accumulatedText.length,
        });
        
        // Update the message with accumulated text
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: accumulatedText }
            : msg
        ));
      }
    } catch (error) {
      console.error('❌ IMPROVE - Error sending message:', error);
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
    console.log('⚡ IMPROVE - Quick action:', action);
    
    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: action,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Get user's grade level from rank
      const gradeLevel = userProfile?.currentRank 
        ? getGradeLevelFromRank(userProfile.currentRank)
        : '7th-8th'; // Default fallback

      console.log('📤 IMPROVE - Sending quick action chat request...', {
        action,
        gradeLevel,
        historyLength: messages.length,
      });

      const response = await fetch('/api/improve/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: action,
          matches: rankedMatches,
          conversationHistory: messages.slice(-10), // Last 10 messages for context
          userId: user?.uid,
          gradeLevel: gradeLevel,
        }),
      });

      console.log('📥 IMPROVE - Quick action response received:', {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type'),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ IMPROVE - Quick action error:', errorData);
        throw new Error(errorData.error || 'Failed to generate response');
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body');
      }
      
      // Create a new message for streaming
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
        
        if (done) {
          console.log('✅ IMPROVE - Quick action stream complete');
          break;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        
        console.log('📝 IMPROVE - Received chunk:', {
          chunkLength: chunk.length,
          totalLength: accumulatedText.length,
        });
        
        // Update the message with accumulated text
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: accumulatedText }
            : msg
        ));
      }
    } catch (error) {
      console.error('❌ IMPROVE - Error with quick action:', error);
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

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Improve Your Writing</h1>
        <p className="text-white/60 text-sm">
          Personalized exercises based on your last 5 ranked matches • Powered by TWR methodology
        </p>
      </div>

      {/* Messages */}
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
            
            {/* Quick action buttons - show after assistant messages, before user response */}
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

      {/* Input */}
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
    </div>
  );
}

