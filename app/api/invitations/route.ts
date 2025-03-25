// app/api/invitations/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch invitations for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user - this verifies authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Try to use the secure RPC function first
    const { data: invitationsData, error: rpcError } = await supabase.rpc(
      'get_user_invitations'
    );
    
    if (!rpcError && invitationsData) {
      return NextResponse.json({ invitations: invitationsData });
    }
    
    // If RPC fails, fall back to a direct query with RLS (which should also work now)
    console.log("RPC function returned an error, falling back to direct query:", rpcError);
    
    // Use the email from the authenticated user
    const userEmail = user.email;
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }
    
    // Direct query with RLS protection
    const { data: invitations, error: invitationsError } = await supabase
      .from('company_invitations')
      .select(`
        id,
        company_id,
        invited_by,
        email,
        role,
        status,
        message,
        created_at,
        updated_at,
        expires_at,
        companies:company_id (
          id,
          name,
          handle,
          logo_url
        )
      `)
      .eq('email', userEmail)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (invitationsError) {
      console.error('Error fetching invitations with direct query:', invitationsError);
      return NextResponse.json({ error: invitationsError.message }, { status: 500 });
    }
    
    // Map minimal inviter info if needed - avoid exposing auth user details
    const safeInvitations = invitations.map(invitation => ({
      ...invitation,
      inviter_name: 'Company Member' // Generic placeholder instead of exposing user details
    }));
    
    return NextResponse.json({ invitations: safeInvitations });
    
  } catch (error) {
    console.error('Error fetching user invitations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}