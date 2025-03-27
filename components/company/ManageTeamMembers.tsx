// components/company/ManageTeamMembers.tsx - Updated version
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Loader2, UserIcon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ChangeUserRole } from './ChangeUserRole';

interface TeamMember {
  user_id: string;
  role: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  last_active: string | null;
}

interface ManageTeamMembersProps {
  companyId: string;
  userRole: string;
  userId: string;
}

export function ManageTeamMembers({ companyId, userRole, userId }: ManageTeamMembersProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Function to fetch members using the new RPC function
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Use the RPC function to get detailed member information
      const { data: membersData, error: membersError } = await supabase.rpc(
        'get_company_members',
        { p_company_id: companyId }
      );
      
      if (membersError) {
        console.error('Error fetching team members:', membersError);
        return;
      }
      
      setMembers(membersData || []);
    } catch (error) {
      console.error('Error in fetchMembers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchMembers();
    }
  }, [companyId]);

  // Generate initials from name or username
  const getInitials = (name: string): string => {
    if (!name) return 'U';
    
    // For full names, use first letters of first and last name
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
    }
    
    // For single names or usernames, use first two letters
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="w-full border-[#c9a0ff]/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl flex items-center gap-2 text-[#4b0076]">
            <Users size={20} className="text-[#8f00ff]" />
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
            <Loader2 size={24} className="animate-spin text-[#8f00ff]" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="mx-auto h-12 w-12 text-[#c9a0ff]/50 mb-3" />
            <h3 className="font-medium text-lg text-[#4b0076]">No team members</h3>
            <p className="mt-1">
              There are no team members in your company yet.
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-[#c9a0ff]/30">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f8f5ff]">
                  <TableHead className="text-[#4b0076]">User</TableHead>
                  <TableHead className="text-[#4b0076]">Role</TableHead>
                  {userRole === 'owner' || userRole === 'admin' ? (
                    <TableHead className="w-10 text-[#4b0076]"></TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const isCurrentUser = member.user_id === userId;
                  
                  return (
                    <TableRow key={member.user_id} className="hover:bg-[#f8f5ff]">
                      <TableCell className="flex items-center gap-3">
                        <Avatar>
                          {member.avatar_url ? (
                            <AvatarImage src={member.avatar_url} alt={member.full_name || member.username || "User"} />
                          ) : (
                            <AvatarFallback>
                              {member.full_name ? getInitials(member.full_name) : getInitials(member.username || 'User')}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {member.full_name || member.username || `User ${member.user_id.substring(0, 8)}`}
                            {isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
                          </div>
                          {member.last_active && (
                            <div className="text-xs text-muted-foreground">
                              Last active {formatDistanceToNow(new Date(member.last_active), { addSuffix: true })}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="capitalize">{member.role}</div>
                      </TableCell>
                      {userRole === 'owner' || userRole === 'admin' ? (
                        <TableCell className="text-right">
                          {!isCurrentUser && (
                            <ChangeUserRole
                              userId={member.user_id}
                              companyId={companyId}
                              currentRole={member.role}
                              userFullName={member.full_name || member.username || `User ${member.user_id.substring(0, 8)}`}
                              userRole={userRole}
                              onRoleChanged={fetchMembers}
                            />
                          )}
                        </TableCell>
                      ) : null}
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