import { supabase } from '../lib/supabase';

export interface ConversationDisplay {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface MessageDisplay {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
  isMine: boolean;
}

export async function getConversations(userId: string): Promise<ConversationDisplay[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*, participant1_profile:profiles!conversations_participant_1_fkey(*), participant2_profile:profiles!conversations_participant_2_fkey(*)')
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  return (data || []).map((conv: any) => {
    const isParticipant1 = conv.participant_1 === userId;
    const otherProfile = isParticipant1 ? conv.participant2_profile : conv.participant1_profile;

    return {
      id: conv.id,
      otherUserId: isParticipant1 ? conv.participant_2 : conv.participant_1,
      otherUserName: otherProfile?.name || 'Usuario',
      otherUserAvatar: otherProfile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop',
      lastMessage: conv.last_message || '',
      lastMessageAt: conv.last_message_at || conv.created_at,
      unreadCount: 0, // TODO: count unread messages
    };
  });
}

export async function getMessages(conversationId: string, currentUserId: string): Promise<MessageDisplay[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data.map(msg => ({
    id: msg.id,
    senderId: msg.sender_id,
    content: msg.content,
    createdAt: msg.created_at,
    read: msg.read,
    isMine: msg.sender_id === currentUserId,
  }));
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  content: string
): Promise<{ error: string | null }> {
  // Insert message
  const { error: msgError } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: senderId,
    receiver_id: receiverId,
    content,
    read: false,
  });

  if (msgError) {
    console.error('Error sending message:', msgError);
    return { error: msgError.message };
  }

  // Update conversation's last message
  await supabase
    .from('conversations')
    .update({
      last_message: content,
      last_message_at: new Date().toISOString(),
    })
    .eq('id', conversationId);

  return { error: null };
}

export async function getOrCreateConversation(
  userId1: string,
  userId2: string
): Promise<{ id: string; error: string | null }> {
  // Check if conversation exists
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .or(`and(participant_1.eq.${userId1},participant_2.eq.${userId2}),and(participant_1.eq.${userId2},participant_2.eq.${userId1})`)
    .single();

  if (existing) {
    return { id: existing.id, error: null };
  }

  // Create new conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      participant_1: userId1,
      participant_2: userId2,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    return { id: '', error: error.message };
  }

  return { id: data.id, error: null };
}

// Real-time subscription for new messages
export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: any) => void
) {
  return supabase
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
        onNewMessage(payload.new);
      }
    )
    .subscribe();
}
