// app/api/companies/[companyId]/invitations/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: Promise<string> } }
) {
  try {
    // Await the companyId from params
    const companyId = await params.companyId;
    
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has appropriate role (owner, admin, or hr)
    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select('role')
      .eq('company_id', companyId)
      .eq('user_id', user.id)
      .single();
    
    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Not a member of this company' }, { status: 403 });
    }
    
    // Check if user has appropriate role
    if (!['owner', 'admin', 'hr'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to view company invitations' }, 
        { status: 403 }
      );
    }
    
    // User has permission, get invitations
    const { data: invitations, error: invitationsError } = await supabase
      .from('company_invitations')
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

// POST: Create a new invitation
export async function POST(
  request: NextRequest,
  { params }: { params: { companyId: Promise<string> } }
) {
  try {
    // Await the companyId from params
    const companyId = await params.companyId;
    
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has permission to invite users
    const { data: permission, error: permissionError } = await supabase.rpc(
      'user_has_permission',
      {
        user_id: user.id,
        company_id: companyId,
        required_permission: 'invite_users'
      }
    );
    
    if (permissionError || !permission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    // Get request body
    const { email, role, message } = await request.json();
    
    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    if (!role || !['owner', 'admin', 'hr', 'social', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Valid role is required' }, { status: 400 });
    }
    
    // Check if the user's role allows them to assign this role
    const { data: userRole } = await supabase
      .from('company_members')
      .select('role')
      .eq('company_id', companyId)
      .eq('user_id', user.id)
      .single();
    
    // Role hierarchy
    const roleValues = {
      'owner': 5,
      'admin': 4,
      'hr': 3,
      'social': 2,
      'member': 1
    };
    
    // Check if user can assign this role
    if (roleValues[userRole.role] <= roleValues[role]) {
      return NextResponse.json({ 
        error: 'You cannot assign a role equal to or higher than your own' 
      }, { status: 403 });
    }
    
    // Check if the email already exists in the company
    const { data: existingMember } = await supabase
      .from('company_members')
      .select('user_id')
      .eq('company_id', companyId)
      .eq('user_id', (
        await supabase
          .from('auth.users')
          .select('id')
          .eq('email', email)
          .single()
      ).data?.id)
      .maybeSingle();
    
    if (existingMember) {
      return NextResponse.json({ 
        error: 'This user is already a member of the company' 
      }, { status: 400 });
    }
    
    // Check for pending invitation
    const { data: existingInvitation } = await supabase
      .from('company_invitations')
      .select('id')
      .eq('company_id', companyId)
      .eq('email', email)
      .eq('status', 'pending')
      .maybeSingle();
    
    if (existingInvitation) {
      return NextResponse.json({ 
        error: 'There is already a pending invitation for this email' 
      }, { status: 400 });
    }
    
    // Create invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('company_invitations')
      .insert({
        company_id: companyId,
        invited_by: user.id,
        email,
        role,
        message,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      })
      .select()
      .single();
    
    if (invitationError) {
      return NextResponse.json({ error: invitationError.message }, { status: 500 });
    }
    
    // TODO: Send invitation email
    // This is where we would integrate with SendGrid to send an email
    
    return NextResponse.json({ invitation });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}