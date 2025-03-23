import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// app/api/invitations/[invitationId]/accept/route.ts
// POST: Accept an invitation
export async function POST(
    request: NextRequest,
    { params }: { params: { invitationId: string } }
  ) {
    try {
      const supabase = await createClient();
      
      // Call the accept_company_invitation function
      const { data, error } = await supabase.rpc(
        'accept_company_invitation',
        { invitation_id: params.invitationId }
      );
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  