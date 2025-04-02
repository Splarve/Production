// app/api/companies/[handle]/members/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getCompanyFromHandle } from '@/utils/companies/handle';

// GET: Fetch all members of a company
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
    
    // Check if user is member of this company
    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select('role_id')
      .eq('company_id', company.id)
      .eq('user_id', user.id)
      .single();
    
    if (!membership || membershipError) {
      return NextResponse.json({ error: 'You are not a member of this company' }, { status: 403 });
    }
    
    // Check if user has permission to view members
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
    
    // Fetch company members with user profiles and roles
    const { data: members, error: membersError } = await supabase
      .from('company_members')
      .select(`
        user_id,
        role_id,
        joined_at,
        roles:role_id (
          id,
          name,
          color,
          position,
          is_default
        ),
        users:user_id (
          id,
          personal_profiles:personal_profiles (
            full_name,
            username,
            avatar_url
          )
        )
      `)
      .eq('company_id', company.id)
      .order('joined_at', { ascending: false });
    
    if (membersError) {
      return NextResponse.json({ error: membersError.message }, { status: 500 });
    }
    
    // Check if user has permission to change roles
    const { data: canChangeRoles } = await supabase.rpc(
      'user_has_permission',
      {
        user_id: user.id,
        company_id: company.id,
        required_permission: 'change_user_roles'
      }
    );
    
    const { data: canChangeRegularRoles } = await supabase.rpc(
      'user_has_permission',
      {
        user_id: user.id,
        company_id: company.id,
        required_permission: 'change_regular_user_roles'
      }
    );
    
    // Format member data
    const formattedMembers = members.map(member => {
      const profile = member.users?.personal_profiles?.[0] || null;
      
      return {
        userId: member.user_id,
        roleId: member.role_id,
        roleName: member.roles?.name || 'Unknown',
        roleColor: member.roles?.color || null,
        rolePosition: member.roles?.position || 0,
        isDefaultRole: member.roles?.is_default || false,
        fullName: profile?.full_name || 'Unknown User',
        username: profile?.username || null,
        avatarUrl: profile?.avatar_url || null,
        joinedAt: member.joined_at
      };
    });
    
    return NextResponse.json({
      members: formattedMembers,
      userPermissions: {
        canChangeRoles: canChangeRoles || false,
        canChangeRegularRoles: canChangeRegularRoles || false
      }
    });
  } catch (error: any) {
    console.error('Error fetching company members:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Remove a member from the company
export async function DELETE(
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
    
    // Get the target user ID from request body
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Check if current user has permission to remove members
    const { data: canRemoveMembers } = await supabase.rpc(
      'user_has_permission',
      {
        user_id: user.id,
        company_id: company.id,
        required_permission: 'remove_members'
      }
    );
    
    if (!canRemoveMembers) {
      return NextResponse.json(
        { error: 'You do not have permission to remove members' },
        { status: 403 }
      );
    }
    
    // Check if target user is a member of this company
    const { data: memberInfo, error: memberError } = await supabase
      .from('company_members')
      .select('role_id, roles:role_id(name)')
      .eq('company_id', company.id)
      .eq('user_id', userId)
      .single();
    
    if (memberError || !memberInfo) {
      return NextResponse.json(
        { error: 'User is not a member of this company' },
        { status: 404 }
      );
    }
    
    // Check if target user is an owner
    if (memberInfo.roles && memberInfo.roles.name === 'Owner') {
      // Count how many owners the company has
      const { count: ownerCount, error: countError } = await supabase
        .from('company_members')
        .select('user_id', { count: 'exact', head: false })
        .eq('company_id', company.id)
        .eq('roles.name', 'Owner');
      
      if (countError) {
        return NextResponse.json(
          { error: 'Error checking owner count' },
          { status: 500 }
        );
      }
      
      // If this is the only owner, prevent removal
      if (ownerCount === 1) {
        return NextResponse.json(
          { error: 'Cannot remove the only owner of the company' },
          { status: 400 }
        );
      }
    }
    
    // Remove the user from the company
    const { error: deleteError } = await supabase
      .from('company_members')
      .delete()
      .eq('company_id', company.id)
      .eq('user_id', userId);
    
    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error: any) {
    console.error('Error removing member:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}