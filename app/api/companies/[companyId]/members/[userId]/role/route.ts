import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// app/api/companies/[companyId]/members/[userId]/role/route.ts
// PUT: Change a user's role
export async function PUT(
    request: NextRequest,
    { params }: { params: { companyId: string, userId: string } }
  ) {
    try {
      const supabase = await createClient();
      
      // Get request body
      const { role } = await request.json();
      
      // Call the change_user_role function
      const { data, error } = await supabase.rpc(
        'change_user_role',
        { 
          target_user_id: params.userId,
          company_id: params.companyId,
          new_role: role
        }
      );
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error changing user role:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }