// app/api/companies/[handle]/roles/[roleId]/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getCompanyFromHandle } from '@/utils/companies/handle';

// GET: Get a single role
export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string; roleId: string } }
) {
  try {
    const { handle, roleId } = await params;
    
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
    
    // Get the role
    const { data: role, error: roleError } = await supabase
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
      .eq('id', roleId)
      .eq('company_id', company.id)
      .single();
    
    if (roleError || !role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }
    
    // Get permissions for the role
    const { data: permissions, error: permissionsError } = await supabase
      .from('company_role_permissions')
      .select(`
        permission,
        enabled
      `)
      .eq('role_id', roleId);
    
    if (permissionsError) {
      return NextResponse.json({ error: permissionsError.message }, { status: 500 });
    }
    
    // Convert permissions array to object for easier use in frontend
    const permissionsObj = permissions.reduce((acc, curr) => {
      acc[curr.permission] = curr.enabled;
      return acc;
    }, {} as Record<string, boolean>);
    
    return NextResponse.json({ role: { ...role, permissions: permissionsObj } });
  } catch (error: any) {
    console.error('Error fetching role:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update a role
export async function PUT(
  request: NextRequest,
  { params }: { params: { handle: string; roleId: string } }
) {
  try {
    const { handle, roleId } = params;
    
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
    
    // Check if role exists and belongs to this company
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('company_roles')
      .select('id')
      .eq('id', roleId)
      .eq('company_id', company.id)
      .single();
    
    if (roleCheckError || !existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }
    
    // Update the role
    const { data: result, error: updateError } = await supabase.rpc(
      'update_company_role',
      {
        p_role_id: roleId,
        p_name: name || null,
        p_color: color || null,
        p_position: position || null,
        p_permissions: permissions || null
      }
    );
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Delete a role
export async function DELETE(
  request: NextRequest,
  { params }: { params: { handle: string; roleId: string } }
) {
  try {
    const { handle, roleId } = params;
    
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
    
    // Get the transfer role ID from the request body
    const { transferToRoleId } = await request.json();
    
    if (!transferToRoleId) {
      return NextResponse.json(
        { error: 'Transfer role ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the roles exist and belong to this company
    const { data: roles, error: rolesError } = await supabase
      .from('company_roles')
      .select('id')
      .in('id', [roleId, transferToRoleId])
      .eq('company_id', company.id);
    
    if (rolesError || !roles || roles.length !== 2) {
      return NextResponse.json({ error: 'One or both roles not found' }, { status: 404 });
    }
    
    // Delete the role
    const { data: result, error: deleteError } = await supabase.rpc(
      'delete_company_role',
      {
        p_role_id: roleId,
        p_transfer_to_role_id: transferToRoleId
      }
    );
    
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    console.error('Error deleting role:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}