-- ==========================================
-- CHAT EN TIEMPO REAL - Setup completo
-- Ejecutar en Supabase SQL Editor
-- ==========================================

-- 1. Crear tablas si no existen
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    participant_2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(participant_1, participant_2)
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_read ON messages(receiver_id, read);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de seguridad para CONVERSATIONS
-- Los usuarios solo ven sus propias conversaciones
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (
        auth.uid() = participant_1 OR auth.uid() = participant_2
    );

-- Los usuarios pueden crear conversaciones
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (
        auth.uid() = participant_1 OR auth.uid() = participant_2
    );

-- Los participantes pueden actualizar la conversación (last_message)
DROP POLICY IF EXISTS "Participants can update conversation" ON conversations;
CREATE POLICY "Participants can update conversation" ON conversations
    FOR UPDATE USING (
        auth.uid() = participant_1 OR auth.uid() = participant_2
    );

-- 5. Políticas de seguridad para MESSAGES
-- Los usuarios solo ven mensajes de sus conversaciones
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (
        auth.uid() = sender_id OR auth.uid() = receiver_id
    );

-- Los usuarios pueden enviar mensajes
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
    );

-- Los receptores pueden marcar mensajes como leídos
DROP POLICY IF EXISTS "Receivers can mark as read" ON messages;
CREATE POLICY "Receivers can mark as read" ON messages
    FOR UPDATE USING (
        auth.uid() = receiver_id
    );

-- 6. Función trigger: actualizar last_message en conversations automáticamente
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message = NEW.content,
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger
DROP TRIGGER IF EXISTS on_new_message ON messages;
CREATE TRIGGER on_new_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- 7. Habilitar Realtime en ambas tablas (safe: no falla si ya existen)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'conversations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
    END IF;
END $$;

-- ✅ Listo! Las tablas están configuradas para chat en tiempo real.
