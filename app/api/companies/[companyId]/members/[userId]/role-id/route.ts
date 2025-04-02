// app/api/companies/[companyId]/members/[userId]/role-id/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// PUT: Change a user's role by role_id
export async function PUT(
  request: NextRequest,
  { params }: { params: { companyId: string, userId: string } }
) {
  try {
    const supabase = await createClient();
    const { companyId, userId } = await params;
    
    // Get request body
    const { roleId } = await request.json();
    
    if (!roleId) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify the role belongs to this company
    const { data: role, error: roleError } = await supabase
      .from('company_roles')
      .select('id, name, is_default, company_id')
      .eq('id', roleId)
      .eq('company_id', companyId)
      .single();
    
    if (roleError || !role) {
      return NextResponse.json({ error: 'Role not found in this company' }, { status: 404 });
    }
    
    // Get the current role of the target user
    const { data: memberInfo, error: memberError } = await supabase
      .from('company_members')
      .select('role_id')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .single();
    
    if (memberError) {
      return NextResponse.json({ error: 'Member not found in this company' }, { status: 404 });
    }
    
    // If user is trying to change their own role, they must have manage_all_users permission
    const isSelfModification = userId === user.id;
    
    if (isSelfModification) {
      const { data: canManageAllUsers } = await supabase.rpc(
        'user_has_permission',
        {
          user_id: user.id,
          company_id: companyId,
          required_permission: 'manage_all_users'
        }
      );
      
      if (!canManageAllUsers) {
        return NextResponse.json(
          { error: 'You cannot change your own role' },
          { status: 403 }
        );
      }
    }
    
    // Get current user's permissions
    const { data: canChangeAnyRole } = await supabase.rpc(
      'user_has_permission',
      {
        user_id: user.id,
        company_id: companyId,
        required_permission: 'change_user_roles'
      }
    );
    
    const { data: canChangeRegularRoles } = await supabase.rpc(
      'user_has_permission',
      {
        user_id: user.id,
        company_id: companyId,
        required_permission: 'change_regular_user_roles'
      }
    );
    
    // If user can't change any roles, they can't proceed
    if (!canChangeAnyRole && !canChangeRegularRoles) {
      return NextResponse.json(
        { error: 'You do not have permission to change user roles' },
        { status: 403 }
      );
    }
    
    // If the user can only change regular roles, we need to verify the current role
    // of the target user is not an owner or admin
    if (!canChangeAnyRole && canChangeRegularRoles) {
      // Get the target user's current role
      const { data: currentRole } = await supabase
        .from('company_roles')
        .select('name')
        .eq('id', memberInfo.role_id)
        .single();
      
      // If current role is a high-level role, deny the change
      if (currentRole && ['Owner', 'Admin'].includes(currentRole.name)) {
        return NextResponse.json(
          { error: 'You do not have permission to change this user\'s role' },
          { status: 403 }
        );
      }
      
      // Also verify the new role is not a high-level role
      if (['Owner', 'Admin'].includes(role.name)) {
        return NextResponse.json(
          { error: 'You do not have permission to assign a high-level role' },
          { status: 403 }
        );
      }
    }
    
    // Update the user's role
    const { error: updateError } = await supabase
      .from('company_members')
      .update({ role_id: roleId })
      .eq('user_id', userId)
      .eq('company_id', companyId);
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'User role updated successfully',
      roleName: role.name
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}