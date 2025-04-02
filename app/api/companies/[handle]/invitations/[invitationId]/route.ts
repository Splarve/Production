// app/api/companies/[handle]/invitations/[invitationId]/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getCompanyFromHandle } from '@/utils/companies/handle';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { handle: string; invitationId: string } }
) {
  try {
    const { handle, invitationId } = params;
    
    // Get company by handle first
    const company = await getCompanyFromHandle(handle);
    
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    
    const supabase = await createClient();
    
    // Get current user to verify permissions
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify that the invitation belongs to this company
    const { data: invitation, error: invitationCheckError } = await supabase
      .from('company_invitations')
      .select('id')
      .eq('id', invitationId)
      .eq('company_id', company.id)
      .single();
    
    if (invitationCheckError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found for this company' }, { status: 404 });
    }
    
    // Call the simple function to delete the invitation
    const { data, error } = await supabase.rpc(
      'delete_invitation',
      { p_invitation_id: invitationId }
    );
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data.success) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}