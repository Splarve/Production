// app/api/companies/[handle]/user-permissions/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getCompanyFromHandle } from '@/utils/companies/handle';

// GET: Fetch the current user's permissions for a company
export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const { handle } = await params;
    
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
    
    // Get user's permissions in this company
    const { data: permissions, error: permissionsError } = await supabase.rpc(
      'get_user_permissions',
      {
        user_id: user.id,
        company_id: company.id
      }
    );
    
    if (permissionsError) {
      return NextResponse.json({ error: permissionsError.message }, { status: 500 });
    }
    
    // Convert permissions array to object for easier use in frontend
    const permissionsObj = (permissions || []).reduce((acc, curr) => {
      acc[curr.permission] = curr.enabled;
      return acc;
    }, {} as Record<string, boolean>);
    
    return NextResponse.json({ permissions: permissionsObj });
  } catch (error: any) {
    console.error('Error fetching user permissions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}