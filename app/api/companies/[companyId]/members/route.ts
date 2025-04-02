// app/api/companies/[companyId]/members/route.ts (Modified to include role_id and role details)
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all members of a company
export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const { companyId } = await params;
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
      .eq('company_id', companyId)
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
        company_id: companyId,
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
      .eq('company_id', companyId)
      .order('joined_at', { ascending: false });
    
    if (membersError) {
      return NextResponse.json({ error: membersError.message }, { status: 500 });
    }
    
    // Check if user has permission to change roles
    const { data: canChangeRoles } = await supabase.rpc(
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