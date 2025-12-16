import { NextResponse } from 'next/server';
import { getWishes } from '@/lib/supabase';
import type { WishesResponse } from '@/typings/types';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const wishes = await getWishes(50);
    
    return NextResponse.json<WishesResponse>(
      { success: true, wishes },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    console.error('Error fetching wishes:', error);
    return NextResponse.json<WishesResponse>(
      { success: false, error: 'Failed to fetch wishes' },
      { status: 500 }
    );
  }
}
