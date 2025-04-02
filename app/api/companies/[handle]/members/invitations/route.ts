// app/api/companies/[companyId]/members/invitations/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: Promise<string> } }
) {
  try {
    // Await the dynamic parameter
    const datathing = await params
    const companyId = await datathing.companyId;
    
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is member of company (with any role)
    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select('role')
      .eq('company_id', companyId)
      .eq('user_id', user.id)
      .single();
    
    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Not a member of this company' }, { status: 403 });
    }
    
    // Check if user has permission to view invitations
    const { data: hasPermission, error: permissionError } = await supabase.rpc(
      'user_has_permission',
      {
        user_id: user.id,
        company_id: companyId,
        required_permission: 'invite_users'
      }
    );
    
    if (permissionError || !hasPermission) {
      return NextResponse.json({ 
        error: 'You do not have permission to view company invitations' 
      }, { status: 403 });
    }
    
    // Use a simple query that doesn't try to access the auth.users table
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
        expires_at
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    if (invitationsError) {
      return NextResponse.json({ error: invitationsError.message }, { status: 500 });
    }
    
    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}