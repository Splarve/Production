import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// app/api/companies/[companyId]/members/[userId]/role/route.ts
// PUT: Change a user's role
export async function PUT(
  request: NextRequest,
  { params }:  { params: { companyId: string, userId: string } }
) {
  try {
    const supabase = await createClient();
    
    // Get request body
    const { role } = await request.json();
    const bruh = await params;
    // Call the secure function to change role
    const { data, error } = await supabase.rpc(
      'change_user_role_secure',
      { 
        target_user_id: bruh.userId,
        company_id: bruh.companyId,
        new_role: role
      }
    );
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data.success) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, message: data.message });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}