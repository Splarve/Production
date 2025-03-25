// app/api/invitations/[invitationId]/accept/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST: Accept an invitation
export async function POST(
  request: NextRequest,
  { params }: { params: { invitationId: string } }
) {
  try {
    // Get the invitation ID from the params
    const invitationthing = await params;
    const invitationId = invitationthing.invitationId;
    
    if (!invitationId) {
      return NextResponse.json(
        { success: false, message: 'Invitation ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: 'You must be logged in to accept invitations' },
        { status: 401 }
      );
    }
    
    // Call the secure function to accept the invitation
    const { data, error } = await supabase.rpc(
      'accept_invitation_secure',
      { p_invitation_id: invitationId }
    );
    
    if (error) {
      console.error('Error accepting invitation:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }
    
    // Check if the operation was successful based on the function's response
    if (!data.success) {
      const statusCode = data.message.includes('not found') ? 404 : 400;
      return NextResponse.json(
        { success: false, message: data.message },
        { status: statusCode }
      );
    }
    
    return NextResponse.json(
      { success: true, message: data.message }
    );
  } catch (error: any) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}