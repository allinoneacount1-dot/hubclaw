import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './environment.js';

const supabaseUrl = config.supabaseUrl;
const supabaseAnonKey = config.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_ANON_KEY not set. Database operations will fail.');
}

// Main Supabase client (anon key — for public operations)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Service role client (for admin operations — bypasses RLS)
export const supabaseAdmin: SupabaseClient | null = config.supabaseServiceKey
  ? createClient(supabaseUrl, config.supabaseServiceKey)
  : null;

// Helper to get the right client
export function getSupabaseClient(admin = false): SupabaseClient {
  if (admin && supabaseAdmin) return supabaseAdmin;
  return supabase;
}

export default supabase;
