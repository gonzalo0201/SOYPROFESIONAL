import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getConversations,
  subscribeToConversations,
  type ConversationDisplay,
} from '../services/chat';

interface UseConversationsResult {
  conversations: ConversationDisplay[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useConversations(userId: string | undefined): UseConversationsResult {
  const [conversations, setConversations] = useState<ConversationDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setError(null);
    try {
      const data = await getConversations(userId);
      setConversations(data);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Error al cargar conversaciones');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Realtime subscription: re-fetch when conversations change
  useEffect(() => {
    if (!userId) return;

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const unsubscribe = subscribeToConversations(userId, () => {
      // Re-fetch the full list when something changes
      fetchConversations();
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribe();
      unsubscribeRef.current = null;
    };
  }, [userId, fetchConversations]);

  return {
    conversations,
    isLoading,
    error,
    refetch: fetchConversations,
  };
}
