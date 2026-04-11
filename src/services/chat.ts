import { supabase } from '../lib/supabase';
import type { Message, Conversation, Profile } from '../lib/database.types';

// =============================================
// Types
// =============================================

export interface ConversationDisplay {
  id: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
}

export interface MessageDisplay {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isOwn: boolean;
  read: boolean;
  createdAt: string;
  time: string;
}

// =============================================
// Conversations
// =============================================

/**
 * Get all conversations for a user, with other participant's profile info
 */
export async function getConversations(userId: string): Promise<ConversationDisplay[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  // Get other participant profiles
  const otherUserIds = data.map((conv: Conversation) =>
    conv.participant_1 === userId ? conv.participant_2 : conv.participant_1
  );

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', otherUserIds);

  const profileMap = new Map<string, Profile>();
  profiles?.forEach(p => profileMap.set(p.id, p));

  // Get unread counts per conversation
  const { data: unreadData } = await supabase
    .from('messages')
    .select('conversation_id')
    .eq('receiver_id', userId)
    .eq('read', false);

  const unreadCounts = new Map<string, number>();
  unreadData?.forEach(msg => {
    const count = unreadCounts.get(msg.conversation_id) || 0;
    unreadCounts.set(msg.conversation_id, count + 1);
  });

  return data.map((conv: Conversation) => {
    const otherUserId = conv.participant_1 === userId ? conv.participant_2 : conv.participant_1;
    const otherProfile = profileMap.get(otherUserId);

    return {
      id: conv.id,
      otherUser: {
        id: otherUserId,
        name: otherProfile?.name || 'Usuario',
        avatar: otherProfile?.avatar_url || `https://ui-avatars.com/api/?name=U&background=10b981&color=fff`,
        role: otherProfile?.role || 'client',
      },
      lastMessage: conv.last_message,
      lastMessageAt: conv.last_message_at,
      unreadCount: unreadCounts.get(conv.id) || 0,
      createdAt: conv.created_at,
    };
  });
}

/**
 * Get or create a conversation between two users
 */
export async function getOrCreateConversation(
  userId: string,
  otherUserId: string
): Promise<string | null> {
  // Check both orderings since we have a UNIQUE constraint
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .or(
      `and(participant_1.eq.${userId},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${userId})`
    )
    .single();

  if (existing) return existing.id;

  // Create new conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      participant_1: userId,
      participant_2: otherUserId,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    return null;
  }

  return data.id;
}

// =============================================
// Messages
// =============================================

/**
 * Get all messages for a conversation
 */
export async function getMessages(
  conversationId: string,
  currentUserId: string
): Promise<MessageDisplay[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data.map((msg: Message) => ({
    id: msg.id,
    conversationId: msg.conversation_id,
    senderId: msg.sender_id,
    receiverId: msg.receiver_id,
    content: msg.content,
    isOwn: msg.sender_id === currentUserId,
    read: msg.read,
    createdAt: msg.created_at,
    time: new Date(msg.created_at).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));
}

/**
 * Send a new message
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  content: string
): Promise<MessageDisplay | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      receiver_id: receiverId,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return null;
  }

  return {
    id: data.id,
    conversationId: data.conversation_id,
    senderId: data.sender_id,
    receiverId: data.receiver_id,
    content: data.content,
    isOwn: true,
    read: data.read,
    createdAt: data.created_at,
    time: new Date(data.created_at).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

/**
 * Mark all messages in a conversation as read (for the receiver)
 */
export async function markAsRead(conversationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .eq('receiver_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error marking messages as read:', error);
  }
}

// =============================================
// Realtime Subscriptions
// =============================================

/**
 * Subscribe to new messages in a conversation
 */
export function subscribeToMessages(
  conversationId: string,
  currentUserId: string,
  onNewMessage: (message: MessageDisplay) => void
) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const msg = payload.new as Message;
        // Don't duplicate own messages (already added optimistically)
        if (msg.sender_id === currentUserId) return;

        onNewMessage({
          id: msg.id,
          conversationId: msg.conversation_id,
          senderId: msg.sender_id,
          receiverId: msg.receiver_id,
          content: msg.content,
          isOwn: false,
          read: msg.read,
          createdAt: msg.created_at,
          time: new Date(msg.created_at).toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        });
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        // Handle read receipts
        const msg = payload.new as Message;
        if (msg.read && msg.sender_id === currentUserId) {
          // Our messages were read by the other person
          onNewMessage({
            id: msg.id,
            conversationId: msg.conversation_id,
            senderId: msg.sender_id,
            receiverId: msg.receiver_id,
            content: msg.content,
            isOwn: true,
            read: true,
            createdAt: msg.created_at,
            time: new Date(msg.created_at).toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          });
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to conversation list updates
 */
export function subscribeToConversations(
  userId: string,
  onUpdate: () => void
) {
  const channel = supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
      },
      (payload) => {
        const conv = payload.new as Conversation;
        // Only trigger for our conversations
        if (conv.participant_1 === userId || conv.participant_2 === userId) {
          onUpdate();
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
