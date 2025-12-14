import { useCallback } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseStreamReaderOptions {
  onMessageUpdate: (messageId: string, content: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for reading streaming responses from API
 * Handles the common pattern of reading chunks and updating messages
 */
export function useStreamReader(options: UseStreamReaderOptions) {
  const { onMessageUpdate, onError } = options;

  const readStream = useCallback(async (
    response: Response,
    messageId: string
  ): Promise<void> => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('No response body');
    }

    let accumulatedText = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        onMessageUpdate(messageId, accumulatedText);
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error('Stream reading error'));
      } else {
        throw error;
      }
    }
  }, [onMessageUpdate, onError]);

  return { readStream };
}

