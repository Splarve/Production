// components/company/CompanyInvitations.tsx
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
import { InviteMembers } from '@/components/company/InviteMembers';
import { Mail, X, CheckCircle, XCircle, Clock, AlertCircle, Loader2, UserPlus } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

export interface Invitation {
  id: string;
  company_id: string;
  invited_by: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

interface CompanyInvitationsProps {
  companyId: string;
  userRole: string;
}

export function CompanyInvitations({ companyId, userRole }: CompanyInvitationsProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Determine if user can manage invitations
  const canInvite = ['owner', 'admin', 'hr'].includes(userRole);

  // Function to fetch invitations using server API
  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the correct API endpoint
      const response = await fetch(`/api/companies/${companyId}/invitations`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch invitations');
      }
      
      const data = await response.json();
      setInvitations(data.invitations || []);
    } catch (error: any) {
      setError(error.message || 'Failed to load invitations');
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch invitations when component mounts
  useEffect(() => {
    if (companyId) {
      fetchInvitations();
    } else {
      setLoading(false);
    }
  }, [companyId]);

  // Function to cancel an invitation
  async function handleCancelInvitation(id: string) {
    if (!confirm('Are you sure you want to cancel this invitation?')) {
      return;
    }

    setCancelingId(id);
    try {
      const response = await fetch(`/api/companies/${companyId}/invitations/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel invitation');
      }
      
      // Remove from the list on success
      setInvitations(prev => prev.filter(inv => inv.id !== id));
    } catch (error: any) {
      alert(error.message || 'An error occurred while canceling the invitation');
    } finally {
      setCancelingId(null);
    }
  }

  // Get status badge based on invitation status
  const getStatusBadge = (invitation: Invitation) => {
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    const isExpired = expiresAt < now;

    if (isExpired && invitation.status === 'pending') {
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <AlertCircle size={14} />
          <span>Expired</span>
        </div>
      );
    }

    switch (invitation.status) {
      case 'pending':
        return (
          <div className="flex items-center gap-1 text-amber-500">
            <Clock size={14} />
            <span>Pending</span>
          </div>
        );
      case 'accepted':
        return (
          <div className="flex items-center gap-1 text-green-500">
            <CheckCircle size={14} />
            <span>Accepted</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1 text-destructive">
            <XCircle size={14} />
            <span>Declined</span>
          </div>
        );
      default:
        return null;
      }
      };

      // If user doesn't have permission, don't render the component
      if (!canInvite) {
      return null;
      }

      return (
      <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl">Team Invitations</CardTitle>
          <CardDescription>
            Manage invitations to join your company
          </CardDescription>
        </div>
        {canInvite && (
          <InviteMembers 
            companyId={companyId} 
            userRole={userRole}
            onInviteSent={fetchInvitations}
          />
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500/50 mb-3" />
            <h3 className="font-medium text-lg">Error Loading Invitations</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-4"
              onClick={fetchInvitations}
            >
              Try Again
            </Button>
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="font-medium text-lg">No invitations</h3>
            <p className="mt-1">
              {canInvite 
                ? "Invite team members to collaborate in your company." 
                : "There are no pending invitations at this time."}
            </p>
            {canInvite && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  // Find and click the InviteMembers trigger button
                  const button = document.querySelector('[data-state="closed"][aria-haspopup="dialog"]') as HTMLButtonElement;
                  if (button) button.click();
                }}
              >
                <UserPlus size={16} className="mr-2" />
                Invite People
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">{invitation.email}</TableCell>
                    <TableCell className="capitalize">{invitation.role}</TableCell>
                    <TableCell>{getStatusBadge(invitation)}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                          </TooltipTrigger>
                          <TooltipContent>
                            {format(new Date(invitation.created_at), 'PPpp')}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelInvitation(invitation.id)}
                        disabled={cancelingId === invitation.id}
                        className="h-8 w-8 p-0"
                      >
                        {cancelingId === invitation.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <X size={16} className="text-muted-foreground" />
                        )}
                        <span className="sr-only">Delete invitation</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      </Card>
      );
      }
