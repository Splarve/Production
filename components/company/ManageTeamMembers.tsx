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
  
  // Get all available roles that this user can assign
  const availableRolesForUser = getAvailableRoleOptions(userRole);

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

  useEffect(() => {
    const checkPermissions = async () => {
      const canChange = await hasPermission(companyId, 'change_user_roles');
      setCanChangeRoles(canChange);
    };

    checkPermissions();
    fetchMembers();
  }, [companyId]);

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

  // Render role badge with appropriate icon
  const RoleBadge = ({ role }: { role: string }) => {
    const IconComponent = ROLE_ICONS[role] || User;
    
    return (
      <div className="flex items-center gap-1">
        <IconComponent size={14} className="text-primary" />
        <span className="capitalize">{role}</span>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Users size={20} className="text-primary" />
          Team Members
        </CardTitle>
        <CardDescription>
          Manage your company's team members and their roles
        </CardDescription>
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
              Your company doesn't have any team members yet.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
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
                            {member.user?.user_metadata?.full_name || 'Anonymous User'}
                            {isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.user?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={member.role} />
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
                                    <span className="sr-only">Open menu</span>
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