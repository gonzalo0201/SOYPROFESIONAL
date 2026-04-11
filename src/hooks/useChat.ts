import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getMessages,
  sendMessage as sendMessageService,
  markAsRead,
  subscribeToMessages,
  type MessageDisplay,
} from '../services/chat';

interface UseChatResult {
  messages: MessageDisplay[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  isSending: boolean;
}

export function useChat(
  conversationId: string | undefined,
  currentUserId: string | undefined,
  receiverId: string | undefined
): UseChatResult {
  const [messages, setMessages] = useState<MessageDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Load initial messages
  useEffect(() => {
    if (!conversationId || !currentUserId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadMessages() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getMessages(conversationId!, currentUserId!);
        if (!cancelled) {
          setMessages(data);
        }
        // Mark messages as read
        await markAsRead(conversationId!, currentUserId!);
      } catch (err) {
        console.error('Error loading messages:', err);
        if (!cancelled) {
          setError('Error al cargar mensajes');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadMessages();
    return () => { cancelled = true; };
  }, [conversationId, currentUserId]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    // Clean up previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const unsubscribe = subscribeToMessages(
      conversationId,
      currentUserId,
      (newMessage) => {
        if (newMessage.read && newMessage.isOwn) {
          // Read receipt: update existing message
          setMessages(prev =>
            prev.map(msg =>
              msg.id === newMessage.id ? { ...msg, read: true } : msg
            )
          );
        } else {
          // New message from other person
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          // Mark as read immediately since we're viewing the chat
          markAsRead(conversationId, currentUserId);
        }
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribe();
      unsubscribeRef.current = null;
    };
  }, [conversationId, currentUserId]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId || !currentUserId || !receiverId || !content.trim()) return;

    setIsSending(true);

    // Optimistic update: add message immediately
    const optimisticMsg: MessageDisplay = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: currentUserId,
      receiverId,
      content: content.trim(),
      isOwn: true,
      read: false,
      createdAt: new Date().toISOString(),
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const sentMsg = await sendMessageService(conversationId, currentUserId, receiverId, content);
      if (sentMsg) {
        // Replace optimistic message with real one
        setMessages(prev =>
          prev.map(msg => (msg.id === optimisticMsg.id ? sentMsg : msg))
        );
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMsg.id));
    } finally {
      setIsSending(false);
    }
  }, [conversationId, currentUserId, receiverId]);

  return { messages, isLoading, error, sendMessage, isSending };
}
