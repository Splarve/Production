// app/api/invitations/[invitationId]/delete/route.ts - Simple endpoint to delete invitation
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { invitationId: string } }
) {
  try {
    const { invitationId } = await params;
    const supabase = await createClient();
    
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