import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (auto-generated from Supabase or manually defined)
export interface Course {
  id: string;
  slug: string;
  name: string;
  color: string;
  enabled: boolean;
  grade: 'DP1' | 'DP2';
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  date: string;
  time?: string;
  course_id: string;
  recurrence_frequency?: string;
  recurrence_interval?: number;
  recurrence_count?: number;
  recurrence_until?: string;
  recurrence_group_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}
