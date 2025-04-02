// app/api/companies/[handle]/invitations/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getCompanyFromHandle } from '@/utils/companies/handle';
import { Company, CompanyInvitation } from '@/utils/supabase/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const { handle } = await params;
    console.log("API: Fetching invitations for company handle:", handle);
    
    // Get company by handle first
    const company = await getCompanyFromHandle(handle);
    
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Use the renamed stored procedure to get invitations
    const { data: invitations, error: invitationsError } = await supabase.rpc<CompanyInvitation[]>(
      'get_company_invites',
      { p_company_id: company.id }
    );
    
    if (invitationsError) {
      console.error("Error fetching invitations:", invitationsError);
      return NextResponse.json({ error: invitationsError.message }, { status: 500 });
    }
    
    console.log(`Found ${invitations?.length || 0} invitations`);
    return NextResponse.json({ invitations: invitations || [] });
  } catch (error: any) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a new invitation
export async function POST(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const { handle } = params;
    
    // Get company by handle first
    const company = await getCompanyFromHandle(handle);
    
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const { email, role, message } = await request.json();
    console.log("Invitation details:", { email, role });
    
    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    if (!role || !['owner', 'admin', 'hr', 'social', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Valid role is required' }, { status: 400 });
    }
    
    // Use the stored procedure
    const { data: invitationId, error: invitationError } = await supabase.rpc(
      'create_company_invitation',
      {
        p_company_id: company.id,
        p_email: email,
        p_role: role,
        p_message: message
      }
    );
    
    if (invitationError) {
      console.error("Error creating invitation:", invitationError);
      return NextResponse.json({ error: invitationError.message }, { status: 500 });
    }
    
    // Get full invitation details
    const { data: invitation } = await supabase
      .from('company_invitations')
      .select('id, company_id, invited_by, email, role, status, message, created_at, updated_at, expires_at')
      .eq('id', invitationId)
      .single();
    
    console.log("Invitation created successfully:", invitation);
    return NextResponse.json({ invitation });
  } catch (error: any) {
    console.error('Error creating invitation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}