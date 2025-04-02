// app/api/companies/[companyId]/system-permissions/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET: Get all system permissions
export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const { companyId } = await params;
    const supabase = await createClient();
    
    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has permission to manage roles
    const { data: hasPermission } = await supabase.rpc(
      'user_has_permission',
      {
        user_id: user.id,
        company_id: companyId,
        required_permission: 'manage_roles'
      }
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    // Get all permissions from the system_permissions table
    const { data: permissions, error: permissionsError } = await supabase
      .from('system_permissions')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    
    if (permissionsError) {
      return NextResponse.json({ error: permissionsError.message }, { status: 500 });
    }
    
    // Group permissions by category
    const groupedPermissions = permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, any[]>);
    
    return NextResponse.json({ permissions: groupedPermissions });
  } catch (error: any) {
    console.error('Error fetching system permissions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
