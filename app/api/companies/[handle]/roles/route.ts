// app/api/companies/[handle]/roles/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getCompanyFromHandle } from '@/utils/companies/handle';

// GET: Get all roles for a company
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
    
    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has permission to view company members
    const { data: hasPermission } = await supabase.rpc(
      'user_has_permission',
      {
        user_id: user.id,
        company_id: company.id,
        required_permission: 'view_members'
      }
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    // Get all roles for the company with their permissions
    const { data: roles, error: rolesError } = await supabase
      .from('company_roles')
      .select(`
        id,
        name,
        color,
        position,
        is_default,
        created_at,
        updated_at
      `)
      .eq('company_id', company.id)
      .order('position', { ascending: true });
    
    if (rolesError) {
      return NextResponse.json({ error: rolesError.message }, { status: 500 });
    }
    
    // Get all permissions for each role
    const rolesWithPermissions = await Promise.all(roles.map(async (role) => {
      const { data: permissions, error: permissionsError } = await supabase
        .from('company_role_permissions')
        .select(`
          permission,
          enabled
        `)
        .eq('role_id', role.id);
      
      if (permissionsError) {
        console.error(`Error fetching permissions for role ${role.id}:`, permissionsError);
        return { ...role, permissions: {} };
      }
      
      // Convert permissions array to object for easier use in frontend
      const permissionsObj = permissions.reduce((acc, curr) => {
        acc[curr.permission] = curr.enabled;
        return acc;
      }, {} as Record<string, boolean>);
      
      return { ...role, permissions: permissionsObj };
    }));
    
    return NextResponse.json({ roles: rolesWithPermissions });
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a new role
export async function POST(
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
    
    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const { name, color, position, permissions } = await request.json();
    
    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 });
    }
    
    // Create the new role
    const { data: roleId, error: roleError } = await supabase.rpc(
      'create_company_role',
      {
        p_company_id: company.id,
        p_name: name,
        p_color: color || null,
        p_position: position || 0,
        p_permissions: permissions || null
      }
    );
    
    if (roleError) {
      return NextResponse.json({ error: roleError.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, roleId });
  } catch (error: any) {
    console.error('Error creating role:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}