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
    
    // Call the secure RPC function to get invitations
    const { data: invitationsData, error: procedureError } = await supabase
      .rpc('get_user_invitations');
    
    if (procedureError) {
      console.error('Error calling get_user_invitations:', procedureError);
      
      // Fallback to a direct query with RLS protection
      const { data: invitations, error: invitationsError } = await supabase
        .from('company_invitations')
        .select(`
          *,
          companies:company_id (
            id,
            name,
            handle,
            logo_url
          )
        `)
        .eq('email', user.email)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (invitationsError) {
        return NextResponse.json({ error: invitationsError.message }, { status: 500 });
      }
      
      // Map minimal inviter info if needed - avoid exposing auth user details
      const safeInvitations = invitations.map(invitation => ({
        ...invitation,
        inviter_name: 'Company Member' // Generic placeholder instead of exposing user details
      }));
      
      return NextResponse.json({ invitations: safeInvitations });
    }
    
    // Return data from the secure function
    return NextResponse.json({ invitations: invitationsData });
    
  } catch (error) {
    console.error('Error fetching user invitations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}