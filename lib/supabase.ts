import { createBrowserClient as createClient } from '@supabase/ssr';

export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
          image_url?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
          image_url?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: 'user' | 'assistant';
          content?: string;
          image_url?: string;
          created_at?: string;
        };
      };
      user_preferences: {
        Row: {
          user_id: string;
          display_name?: string;
          theme: 'light' | 'dark';
          notifications_enabled: boolean;
          anonymous_mode: boolean;
          chat_mode: 'assistant' | 'creative' | 'technical' | 'casual';
          subscription_tier: 'free' | 'pro' | 'enterprise';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name?: string;
          theme?: 'light' | 'dark';
          notifications_enabled?: boolean;
          anonymous_mode?: boolean;
          chat_mode?: 'assistant' | 'creative' | 'technical' | 'casual';
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          display_name?: string;
          theme?: 'light' | 'dark';
          notifications_enabled?: boolean;
          anonymous_mode?: boolean;
          chat_mode?: 'assistant' | 'creative' | 'technical' | 'casual';
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_stats: {
        Row: {
          id: string;
          user_id: string;
          total_conversations: number;
          total_messages: number;
          last_active: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_conversations?: number;
          total_messages?: number;
          last_active?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_conversations?: number;
          total_messages?: number;
          last_active?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

// Client-side Supabase client using @supabase/ssr
export const createBrowserClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
