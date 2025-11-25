import { createClient } from '@supabase/supabase-js';
import type { Wish } from '@/typings/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    anonKey: !!supabaseAnonKey,
  });
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (with service role key)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;

/**
 * Insert a new wish into the database
 */
export async function createWish(wish: Omit<Wish, 'id' | 'created_at'>) {
  const { data, error } = await supabaseAdmin
    .from('wishes')
    .insert([wish])
    .select()
    .single();

  if (error) throw error;
  return data as Wish;
}

/**
 * Get all wishes, ordered by created_at descending
 */
export async function getWishes(limit = 50): Promise<Wish[]> {
  // Create a fresh client for each request to avoid caching
  const freshClient = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await freshClient
    .from('wishes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('❌ Error fetching wishes:', error);
    throw error;
  }
  
  console.log(`📊 Query returned ${data?.length || 0} wishes`);
  if (data && data.length > 0) {
    console.log('📌 Most recent wish ID:', data[0].id);
  }
  
  return data as Wish[];
}

/**
 * Get a single wish by ID
 */
export async function getWishById(id: string): Promise<Wish | null> {
  const { data, error } = await supabaseAdmin
    .from('wishes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Wish;
}

/**
 * Get wishes by wallet address
 */
export async function getWishesByWallet(walletAddress: string): Promise<Wish[]> {
  const { data, error } = await supabaseAdmin
    .from('wishes')
    .select('*')
    .eq('wallet_address', walletAddress)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Wish[];
}
