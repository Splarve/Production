// components/company/ManageTeamMembers.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, MoreHorizontal, Shield, Crown, UserCheck, MessageSquare, User, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { InviteMembers } from '@/components/company/InviteMembers';

// Role hierarchy for comparison
const ROLE_VALUES = {
  'owner': 5,
  'admin': 4,
  'hr': 3,
  'social': 2,
  'member': 1
};

// Role icons for visual representation
const ROLE_ICONS = {
  'owner': Crown,
  'admin': Shield,
  'hr': UserCheck,
  'social': MessageSquare,
  'member': User
};

// Role descriptions for tooltips
const ROLE_DESCRIPTIONS = {
  'owner': 'Full control of the company, billing, and users',
  'admin': 'Manage company profile, users, and view analytics',
  'hr': 'Invite users and manage regular team members',
  'social': 'View analytics and manage social content',
  'member': 'Basic access to company content'
};

interface TeamMember {
  user_id: string;
  role: string;
  user: {
    email: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

interface ManageTeamMembersProps {
  companyId: string;
  userRole: string;
  userId: string;
}

export function ManageTeamMembers({ companyId, userRole, userId }: ManageTeamMembersProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [canChangeRoles, setCanChangeRoles] = useState(false);
  const [canInviteUsers, setCanInviteUsers] = useState(false);
  
  // Get all available roles that this user can assign
  const availableRolesForUser = getAvailableRoleOptions(userRole);

  useEffect(() => {
    const checkPermissions = async () => {
      const changeRolePermission = await hasPermission(companyId, 'change_user_roles');
      const inviteUsersPermission = await hasPermission(companyId, 'invite_users');
      setCanChangeRoles(changeRolePermission);
      setCanInviteUsers(inviteUsersPermission);
    };

    checkPermissions();
    fetchMembers();
  }, [companyId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('company_members')
        .select(`
          user_id,
          role,
          user:user_id (
            email,
            user_metadata
          )
        `)
        .eq('company_id', companyId)
        .order('role', { ascending: false });
      
      if (error) {
        console.error('Error fetching team members:', error);
        return;
      }
      
      setMembers(data as TeamMember[]);
    } catch (error) {
      console.error('Error in fetchMembers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    // Find current member's role
    const member = members.find(m => m.user_id === memberId);
    if (!member) return;

    // Check if user has permission to change this role
    if (ROLE_VALUES[userRole] <= ROLE_VALUES[member.role]) {
      alert("You cannot change the role of users with equal or higher rank.");
      return;
    }

    if (ROLE_VALUES[userRole] <= ROLE_VALUES[newRole]) {
      alert("You cannot assign a role equal to or higher than your own.");
      return;
    }

    // Confirm role change
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    setChangingRole(memberId);
    try {
      const result = await changeUserRole(companyId, memberId, newRole);
      
      if (result.success) {
        // Update the local state
        setMembers(prev => 
          prev.map(m => 
            m.user_id === memberId ? { ...m, role: newRole } : m
          )
        );
      } else {
        console.error('Failed to change role:', result.error);
        alert(`Failed to change role: ${result.error}`);
      }
    } catch (error) {
      console.error('Error changing role:', error);
    } finally {
      setChangingRole(null);
    }
  };

  // Get initials from name
  const getInitials = (name?: string, email?: string): string => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    
    return 'U';
  };

  // Get available roles based on user's role and the target member's role
  const getAvailableRoles = (memberRole: string): string[] => {
    // Current user can only assign roles below their level
    return Object.keys(ROLE_VALUES).filter(role => 
      // Don't allow changing to the same role
      role !== memberRole && 
      // Don't allow assigning roles equal or higher to the user's own role
      ROLE_VALUES[role] < ROLE_VALUES[userRole]
    );
  };

  // Get all roles a user can possibly assign (for the UI dropdown)
  function getAvailableRoleOptions(role: string): string[] {
    return Object.keys(ROLE_VALUES).filter(r => 
      ROLE_VALUES[r] < ROLE_VALUES[role]
    );
  }

  // Check if user has a specific permission
  async function hasPermission(companyId: string, permission: string): Promise<boolean> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;
      
      const { data, error } = await supabase.rpc(
        'user_has_permission',
        {
          p_user_id: user.id,
          p_company_id: companyId,
          p_required_permission: permission
        }
      );
      
      if (error) {
        console.error('Error checking permission:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error in hasPermission:', error);
      return false;
    }
  }

  // Change a user's role
  async function changeUserRole(
    companyId: string,
    targetUserId: string,
    newRole: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/companies/${companyId}/members/${targetUserId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        return { success: false, error: result.error || result.message };
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error changing user role:', error);
      return { success: false, error: 'Failed to change user role' };
    }
  }

  // Render role badge with appropriate icon
  const RoleBadge = ({ role }: { role: string }) => {
    const IconComponent = ROLE_ICONS[role] || User;
    
    return (
      <div className="flex items-center gap-1" title={ROLE_DESCRIPTIONS[role]}>
        <IconComponent size={14} className="text-primary" />
        <span className="capitalize">{role}</span>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <Users size={20} className="text-primary" />
            Team Members
          </CardTitle>
          <CardDescription>
            Manage your company's team members and their roles
          </CardDescription>
        </div>
        {canInviteUsers && (
          <InviteMembers 
            companyId={companyId} 
            userRole={userRole}
            onInviteSent={fetchMembers}
          />
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="font-medium text-lg">No team members</h3>
            <p className="mt-1">
              {canInviteUsers 
                ? "Invite team members to collaborate in your company." 
                : "There are no team members in your company yet."}
            </p>
            {canInviteUsers && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  // Find and click the InviteMembers trigger button
                  const button = document.querySelector('[data-state="closed"][aria-haspopup="dialog"]') as HTMLButtonElement;
                  if (button) button.click();
                }}
              >
                <User size={16} className="mr-2" />
                Invite People
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  {canChangeRoles && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const isCurrentUser = member.user_id === userId;
                  const canModifyThisUser = canChangeRoles && 
                    ROLE_VALUES[userRole] > ROLE_VALUES[member.role] && 
                    !isCurrentUser;
                  
                  return (
                    <TableRow key={member.user_id}>
                      <TableCell className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage 
                            src={member.user?.user_metadata?.avatar_url} 
                            alt={member.user?.user_metadata?.full_name || member.user?.email} 
                          />
                          <AvatarFallback>
                            {getInitials(
                              member.user?.user_metadata?.full_name, 
                              member.user?.email
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {member.user?.user_metadata?.full_name || 'User'}
                            {isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={member.role} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.user?.email}
                      </TableCell>
                      {canChangeRoles && (
                        <TableCell className="text-right">
                          {canModifyThisUser ? (
                            changingRole === member.user_id ? (
                              <Button variant="ghost" size="sm" disabled>
                                <Loader2 size={16} className="animate-spin" />
                              </Button>
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal size={16} />
                                    <span className="sr-only">Change role</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  {getAvailableRoles(member.role).map((role) => (
                                    <DropdownMenuItem
                                      key={role}
                                      onClick={() => handleRoleChange(member.user_id, role)}
                                    >
                                      <div className="flex items-center gap-2">
                                        {ROLE_ICONS[role]({ size: 14 })}
                                        <span className="capitalize">{role}</span>
                                      </div>
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {isCurrentUser ? 'Current user' : ''}
                            </span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}