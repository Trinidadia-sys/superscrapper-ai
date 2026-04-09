import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Create user profile with default plan
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user?.id,
        email: data.user?.email,
        plan: 'starter',
        lead_credits: 100,
        used_credits: 0,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    return NextResponse.json({ 
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
      }
    });

  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
