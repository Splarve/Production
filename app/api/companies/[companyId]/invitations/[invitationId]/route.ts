import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// app/api/companies/[companyId]/invitations/[invitationId]/route.ts
// DELETE: Cancel an invitation
export async function DELETE(
    request: NextRequest,
    { params }: { params: { companyId: Promise<string>, invitationId: Promise<string> } }
  ) {
    try {
      // Await the dynamic parameters
      const companyId = await params.companyId;
      const invitationId = await params.invitationId;
      
      const supabase = await createClient();
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Check if the invitation exists and belongs to the company
      const { data: invitation, error: invitationError } = await supabase
        .from('company_invitations')
        .select('*')
        .eq('id', invitationId)
        .eq('company_id', companyId)
        .single();
      
      if (invitationError || !invitation) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }
      
      // Check if user is the one who sent the invitation or has permission
      if (invitation.invited_by !== user.id) {
        // Check if user has permission to manage invitations
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
      }
      
      // Delete the invitation
      const { error: deleteError } = await supabase
        .from('company_invitations')
        .delete()
        .eq('id', invitationId);
      
      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting invitation:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }