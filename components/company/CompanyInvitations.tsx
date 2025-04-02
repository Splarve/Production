'use client';
// components/company/CompanyInvitations.tsx (updated to use handles)
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, MailIcon, ClockIcon, MailPlus, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CompanyInvitation } from '@/utils/supabase/types';

type Role = {
  id: string;
  name: string;
  color: string | null;
  position: number;
  isDefaultRole: boolean;
};

type CompanyInvitationsProps = {
  companyId: string;
  companyHandle: string; // Add company handle
  userRole?: string;
};


export function CompanyInvitations({ companyId, companyHandle, userRole }: CompanyInvitationsProps) {
  const [invitations, setInvitations] = useState<CompanyInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [roleId, setRoleId] = useState(''); // For role-based invitations
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canInvite, setCanInvite] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  
  // Fetch invitations and roles on mount
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        // Fetch invitations using handle-based API
        const response = await fetch(`/api/companies/${companyHandle}/invitations`);
        const data = await response.json();
        
        if (response.ok) {
          setInvitations(data.invitations || []);
        } else {
          toast.error(data.error || 'Failed to load invitations');
        }
        
        // Check if user has invite permission using handle-based API
        const permissionsResponse = await fetch(`/api/companies/${companyHandle}/user-permissions`);
        const permissionsData = await response.json();
        
        if (permissionsResponse.ok) {
          setCanInvite(permissionsData.permissions?.invite_users || false);
        }
        
        // Fetch available roles using handle-based API
        const rolesResponse = await fetch(`/api/companies/${companyHandle}/roles`);
        const rolesData = await response.json();
        
        if (rolesResponse.ok) {
          setRoles(rolesData.roles || []);
          
          // ... rest of the function ...
        }
      } catch (error) {
        console.error('Error fetching invitations:', error);
        toast.error('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInvitations();
  }, [companyHandle]); // Changed from companyId to companyHandle
  
  // Create a new invitation
  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }
    
    if (!roleId) {
      toast.error('Please select a role');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/companies/${companyHandle}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          roleId: roleId,
          message: message.trim() || undefined,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Invitation sent to ${email}`);
        
        // Add the new invitation to the list
        if (data.invitation) {
          setInvitations([data.invitation, ...invitations]);
        }
        
        // Reset form
        setEmail('');
        setMessage('');
        setDialogOpen(false);
      } else {
        toast.error(data.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete an invitation
  const handleDeleteInvitation = async (invitationId: string) => {
    try {
      // Use handle-based API
      const response = await fetch(`/api/companies/${companyHandle}/invitations/${invitationId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Invitation deleted');
        
        // Remove the invitation from the list
        setInvitations(invitations.filter(inv => inv.id !== invitationId));
      } else {
        toast.error(data.error || 'Failed to delete invitation');
      }
    } catch (error) {
      console.error('Error deleting invitation:', error);
      toast.error('An unexpected error occurred');
    }
  };
  
  // Get role name by ID
  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || 'Unknown Role';
  };
  
  if (isLoading) {
    return (
      <Card className="border-[#c9a0ff]/30">
        <CardHeader>
          <CardTitle className="text-[#4b0076]">Pending Invitations</CardTitle>
          <CardDescription>
            Loading invitations...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-[#4b0076]">Pending Invitations</CardTitle>
          <CardDescription>
            {invitations.length} pending {invitations.length === 1 ? 'invitation' : 'invitations'}
          </CardDescription>
        </div>
        
        {canInvite && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#8f00ff] hover:bg-[#4b0076]">
                <MailPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateInvitation}>
                <DialogHeader>
                  <DialogTitle>Invite New Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join this company. The recipient will receive an email with instructions.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      required
                      type="email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={roleId} onValueChange={setRoleId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles
                          .sort((a, b) => b.position - a.position) // Sort by position
                          .map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message (optional)</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Add a personal message to the invitation email"
                      rows={3}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#8f00ff] hover:bg-[#4b0076]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      
      <CardContent>
        {invitations.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No pending invitations</p>
            {canInvite && (
              <Button
                variant="link"
                className="mt-2 text-[#8f00ff]"
                onClick={() => setDialogOpen(true)}
              >
                <MailPlus className="mr-2 h-4 w-4" />
                Send an invitation
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#c9a0ff]/20 flex items-center justify-center">
                    <MailIcon className="h-5 w-5 text-[#8f00ff]" />
                  </div>
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="mr-2">
                        Role: {invitation.roleId ? getRoleName(invitation.roleId) : invitation.role}
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        Expires {formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteInvitation(invitation.id)}
                >
                  <XCircle className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}