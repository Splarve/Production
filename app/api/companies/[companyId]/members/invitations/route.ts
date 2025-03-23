// app/api/companies/[companyId]/members/invitations/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    // In Next.js, dynamic route params must be awaited
    const companyId = params.companyId;
    
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
    
    // Use raw SQL query to bypass RLS
    const { data: invitations, error: invitationsError } = await supabase.from('company_invitations')
      .select('*')
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

// DELETE endpoint to cancel an invitation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    // In Next.js, dynamic route params must be awaited
    const companyId = params.companyId;
    
    const { invitationId } = await request.json();
    
    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
    }
    
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
    
    // Delete the invitation
    const { error: deleteError } = await supabase
      .from('company_invitations')
      .delete()
      .eq('id', invitationId)
      .eq('company_id', companyId);
    
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error canceling invitation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}