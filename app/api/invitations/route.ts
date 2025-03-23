import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// app/api/invitations/route.ts
// GET: Fetch invitations for the current user
export async function GET(request: NextRequest) {
    try {
      const supabase = await createClient();
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Get invitations for the user's email
      const { data: invitations, error: invitationsError } = await supabase
        .from('company_invitations')
        .select(`
          *,
          companies:company_id (
            id,
            name,
            handle,
            logo_url
          ),
          inviter:invited_by (
            email,
            user_metadata
          )
        `)
        .eq('email', user.email)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (invitationsError) {
        return NextResponse.json({ error: invitationsError.message }, { status: 500 });
      }
      
      return NextResponse.json({ invitations });
    } catch (error) {
      console.error('Error fetching user invitations:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }