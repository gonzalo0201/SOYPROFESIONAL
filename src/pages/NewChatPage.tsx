import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getOrCreateConversation } from '../services/chat';
import { supabase } from '../lib/supabase';

/**
 * This page handles the transition from professional profile to chat.
 * Route: /chat/new/:professionalId
 * 
 * It looks up the professional's profile_id (auth user id),
 * creates or finds a conversation, and redirects to /chat/:conversationId
 */
export function NewChatPage() {
    const { professionalId } = useParams<{ professionalId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!professionalId || !user) {
            if (!user) navigate('/login');
            return;
        }

        async function createChat() {
            try {
                // The professionalId param is from the professionals table.
                // We need the profile_id (auth user id) for the conversation.
                const { data: professional } = await supabase
                    .from('professionals')
                    .select('profile_id')
                    .eq('id', professionalId)
                    .single();

                if (!professional) {
                    setError('Profesional no encontrado');
                    return;
                }

                if (professional.profile_id === user!.id) {
                    setError('No podés chatear contigo mismo');
                    return;
                }

                // Get or create conversation
                const conversationId = await getOrCreateConversation(
                    user!.id,
                    professional.profile_id
                );

                if (conversationId) {
                    // Redirect to the actual chat
                    navigate(`/chat/${conversationId}`, { replace: true });
                } else {
                    setError('Error al crear conversación');
                }
            } catch (err) {
                console.error('Error creating chat:', err);
                setError('Error al crear conversación');
            }
        }

        createChat();
    }, [professionalId, user, navigate]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <p className="text-slate-400 mb-4">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-emerald-600 font-bold text-sm"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="text-emerald-500 animate-spin" />
                <p className="text-slate-400 text-sm">Iniciando conversación...</p>
            </div>
        </div>
    );
}
