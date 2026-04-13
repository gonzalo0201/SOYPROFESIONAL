export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'client' | 'professional';
export type PortfolioCategory = 'antes-despues' | 'en-progreso' | 'terminado' | 'general';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          avatar_url: string | null
          role: UserRole
          age: number | null
          address: string | null
          phone: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          avatar_url?: string | null
          role?: UserRole
          age?: number | null
          address?: string | null
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          avatar_url?: string | null
          role?: UserRole
          age?: number | null
          address?: string | null
          phone?: string | null
        }
      }
      professionals: {
        Row: {
          id: string
          profile_id: string
          trade: string
          description: string
          skills: string[]
          rating: number
          review_count: number
          lat: number
          lng: number
          status: string
          is_verified: boolean
          is_early_adopter: boolean
          is_boosted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          trade: string
          description?: string
          skills?: string[]
          rating?: number
          review_count?: number
          lat?: number
          lng?: number
          status?: string
          is_verified?: boolean
          is_early_adopter?: boolean
          is_boosted?: boolean
          created_at?: string
        }
        Update: {
          trade?: string
          description?: string
          skills?: string[]
          rating?: number
          review_count?: number
          lat?: number
          lng?: number
          status?: string
          is_verified?: boolean
          is_early_adopter?: boolean
          is_boosted?: boolean
        }
      }
      reviews: {
        Row: {
          id: string
          professional_id: string
          client_id: string
          client_name: string
          client_avatar: string | null
          rating: number
          comment: string
          tags: string[]
          is_verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          client_id: string
          client_name: string
          client_avatar?: string | null
          rating: number
          comment: string
          tags?: string[]
          is_verified?: boolean
          created_at?: string
        }
        Update: {
          rating?: number
          comment?: string
          tags?: string[]
          is_verified?: boolean
        }
      }
      portfolio_items: {
        Row: {
          id: string
          professional_id: string
          images: string[]
          caption: string
          description: string
          category: PortfolioCategory
          tags: string[]
          likes: number
          comments: number
          location: string | null
          created_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          images: string[]
          caption: string
          description?: string
          category?: PortfolioCategory
          tags?: string[]
          likes?: number
          comments?: number
          location?: string | null
          created_at?: string
        }
        Update: {
          images?: string[]
          caption?: string
          description?: string
          category?: PortfolioCategory
          tags?: string[]
          likes?: number
          comments?: number
          location?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          content?: string
          read?: boolean
        }
      }
      conversations: {
        Row: {
          id: string
          participant_1: string
          participant_2: string
          last_message: string | null
          last_message_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          participant_1: string
          participant_2: string
          last_message?: string | null
          last_message_at?: string | null
          created_at?: string
        }
        Update: {
          last_message?: string | null
          last_message_at?: string | null
        }
      }
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Professional = Database['public']['Tables']['professionals']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type PortfolioItem = Database['public']['Tables']['portfolio_items']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];

// Combined types (for JOINs)
export interface ProfessionalWithProfile extends Professional {
  profiles: Profile;
}
