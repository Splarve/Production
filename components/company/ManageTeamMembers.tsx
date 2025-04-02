'use client';
// components/company/ManageTeamMembers.tsx
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { AlertCircle, MoreVertical, UserMinus } from 'lucide-react';
import { toast } from "sonner";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { MemberRoleSelector } from '@/components/company/MemberRoleSelector';

type Member = {
  userId: string;
  roleId: string;
  roleName: string;
  roleColor: string | null;
  rolePosition: number;
  isDefaultRole: boolean;
  fullName: string;
  username: string | null;
  avatarUrl: string | null;
  joinedAt: string;
};

type Role = {
  id: string;
  name: string;
  color: string | null;
  position: number;
  isDefaultRole: boolean;
};

type ManageTeamMembersProps = {
  companyId: string;
  userRole?: string;
  userId: string;
};

export function ManageTeamMembers({ companyId, userRole, userId }: ManageTeamMembersProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState({
    canChangeRoles: false,
    canChangeRegularRoles: false
  });
  const [roles, setRoles] = useState<Role[]>([]);
  
  // Fetch members and roles on mount
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`/api/companies/${companyId}/members`);
        const data = await response.json();
        
        if (response.ok) {
          setMembers(data.members || []);
          setUserPermissions(data.userPermissions || {});
          
          // Extract roles from members for the role selector
          const extractedRoles = data.members.reduce((acc: Role[], member: Member) => {
            // Skip if role already added
            if (acc.some(role => role.id === member.roleId)) {
              return acc;
            }
            
            acc.push({
              id: member.roleId,
              name: member.roleName,
              color: member.roleColor,
              position: member.rolePosition,
              isDefaultRole: member.isDefaultRole
            });
            
            return acc;
          }, []);
          
          setRoles(extractedRoles);
        } else {
          toast.error(data.error || 'Failed to load team members');
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
        toast.error('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMembers();
  }, [companyId]);
  
  // Handle removing a member
  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    
    try {
      const response = await fetch(`/api/companies/${companyId}/members/${memberToRemove.userId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`${memberToRemove.fullName} has been removed from the company.`);
        
        // Update local state to remove the member
        setMembers(members.filter(m => m.userId !== memberToRemove.userId));
      } else {
        toast.error(data.error || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('An unexpected error occurred');
    } finally {
      // Reset state
      setMemberToRemove(null);
      setConfirmDialogOpen(false);
    }
  };
  
  // Handle role change
  const handleRoleChange = (userId: string, roleId: string, roleName: string) => {
    // Update the member's role in the local state
    setMembers(members.map(member => {
      if (member.userId === userId) {
        return {
          ...member,
          roleId,
          roleName
        };
      }
      return member;
    }));
  };
  
  // Calculate user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Function to determine if a user's role can be changed
  const canChangeUserRole = (member: Member) => {
    // Can't change anything if no permission
    if (!userPermissions.canChangeRoles && !userPermissions.canChangeRegularRoles) {
      return false;
    }
    
    // Can change any user if has full permission
    if (userPermissions.canChangeRoles) {
      return true;
    }
    
    // Can only change regular users (not Owner or Admin) with regular permission
    if (userPermissions.canChangeRegularRoles) {
      return !['Owner', 'Admin'].includes(member.roleName);
    }
    
    return false;
  };
  
  if (isLoading) {
    return (
      <Card className="border-[#c9a0ff]/30">
        <CardHeader>
          <CardTitle className="text-[#4b0076]">Team Members</CardTitle>
          <CardDescription>
            Loading team members...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full bg-gray-200" />
                  <div>
                    <Skeleton className="h-4 w-32 bg-gray-200" />
                    <Skeleton className="h-3 w-24 bg-gray-100 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24 bg-gray-200" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-[#c9a0ff]/30">
      <CardHeader>
        <CardTitle className="text-[#4b0076]">Team Members</CardTitle>
        <CardDescription>
          {members.length} {members.length === 1 ? 'member' : 'members'} in this company
        </CardDescription>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No team members found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.userId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {member.avatarUrl && (
                      <AvatarImage src={member.avatarUrl} alt={member.fullName} />
                    )}
                    <AvatarFallback className="bg-[#c9a0ff]/20 text-[#8f00ff]">
                      {getUserInitials(member.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.fullName}
                      {member.userId === userId && " (you)"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <MemberRoleSelector
                    userId={member.userId}
                    companyId={companyId}
                    currentRoleId={member.roleId}
                    roles={roles}
                    isSelf={member.userId === userId}
                    disabled={!canChangeUserRole(member)}
                    onRoleChange={(roleId, roleName) => 
                      handleRoleChange(member.userId, roleId, roleName)
                    }
                  />
                  
                  {/* Only show more options for non-self members */}
                  {member.userId !== userId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setMemberToRemove(member);
                            setConfirmDialogOpen(true);
                          }}
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <p>
                  Are you sure you want to remove <strong>{memberToRemove?.fullName}</strong> from this company?
                </p>
                
                <div className="p-3 rounded-md bg-amber-50 text-amber-700 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p>This action cannot be undone. The user will lose access to this company and all associated resources.</p>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}