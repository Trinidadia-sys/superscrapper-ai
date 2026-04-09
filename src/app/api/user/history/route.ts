import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Creates a Supabase client authenticated with the user's JWT
// This is required for RLS policies to recognize the user
function getAuthenticatedClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getAuthenticatedClient(token);

    const { data: generations, error } = await supabase
      .from('lead_generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching history:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }

    return NextResponse.json({ generations: generations || [] });

  } catch (error) {
    console.error('History GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getAuthenticatedClient(token);

    const { user_id, niche, location, leads_count, status } = await request.json();

    if (!user_id || !niche || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('lead_generations')
      .insert({
        user_id,
        niche,
        location,
        leads_count: leads_count || 0,
        status: status || 'completed',
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving generation:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: 'Failed to save generation' }, { status: 500 });
    }

    return NextResponse.json({ generation: data });

  } catch (error) {
    console.error('History POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}