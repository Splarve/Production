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
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface TeamMember {
  user_id: string;
  role: string;
}

interface ManageTeamMembersProps {
  companyId: string;
  userRole: string;
  userId: string;
}

export function ManageTeamMembers({ companyId, userRole, userId }: ManageTeamMembersProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [canInviteUsers, setCanInviteUsers] = useState(false);
  
  useEffect(() => {
    // Owners always have permission to invite
    if (userRole === 'owner') {
      setCanInviteUsers(true);
    } else {
      hasPermission(companyId, 'invite_users').then(setCanInviteUsers);
    }

    fetchMembers();
  }, [companyId, userRole]);

  // Check if user has a specific permission
  async function hasPermission(companyId: string, permission: string): Promise<boolean> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;
      
      // If user is owner, always return true
      if (userRole === 'owner') {
        return true;
      }
      
      // Otherwise check permission
      const { data, error } = await supabase.rpc(
        'user_has_permission',
        {
          user_id: user.id,
          company_id: companyId,
          required_permission: permission
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

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Simple query without any joins to avoid permission issues
      const { data: membersData, error: membersError } = await supabase
        .from('company_members')
        .select('user_id, role')
        .eq('company_id', companyId)
        .order('role', { ascending: false });
      
      if (membersError) {
        console.error('Error fetching team members:', membersError);
        return;
      }
      
      setMembers(membersData);
    } catch (error) {
      console.error('Error in fetchMembers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate initials from the user ID
  const getInitials = (userId: string): string => {
    return userId.substring(0, 2).toUpperCase();
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
            View your company's team members
          </CardDescription>
        </div>
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
              There are no team members in your company yet.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const isCurrentUser = member.user_id === userId;
                  
                  return (
                    <TableRow key={member.user_id}>
                      <TableCell className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(member.user_id)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            User {member.user_id.substring(0, 8)}
                            {isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="capitalize">{member.role}</div>
                      </TableCell>
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