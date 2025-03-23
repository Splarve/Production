// components/invitations/UserInvitations.tsx
'use client';

import { useState, useEffect } from 'react';
import { Building, UserPlus, Check, X, Clock } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserInvitations, acceptInvitation, rejectInvitation, Invitation } from '@/utils/invitations';
import { formatDistanceToNow } from 'date-fns';

export function UserInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        setLoading(true);
        const data = await getUserInvitations();
        setInvitations(data);
      } catch (error) {
        console.error('Error fetching invitations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  const handleAccept = async (id: string) => {
    setProcessingIds(prev => ({ ...prev, [id]: true }));
    try {
      const result = await acceptInvitation(id);
      if (result.success) {
        // Remove from the list
        setInvitations(prev => prev.filter(inv => inv.id !== id));
      } else {
        console.error('Failed to accept invitation:', result.error);
        alert(`Failed to accept invitation: ${result.error}`);
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
    } finally {
      setProcessingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleReject = async (id: string) => {
    setProcessingIds(prev => ({ ...prev, [id]: true }));
    try {
      const result = await rejectInvitation(id);
      if (result.success) {
        // Remove from the list
        setInvitations(prev => prev.filter(inv => inv.id !== id));
      } else {
        console.error('Failed to reject invitation:', result.error);
        alert(`Failed to reject invitation: ${result.error}`);
      }
    } catch (error) {
      console.error('Error rejecting invitation:', error);
    } finally {
      setProcessingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Loading invitations...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return null; // Don't show anything if there are no invitations
  }

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <UserPlus size={20} className="text-primary" />
          Company Invitations
        </CardTitle>
        <CardDescription>
          You have {invitations.length} pending invitation{invitations.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div 
              key={invitation.id} 
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {invitation.companies?.logo_url ? (
                    <img 
                      src={invitation.companies.logo_url}
                      alt={invitation.companies?.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <Building className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">
                    {invitation.companies?.name || 'Company'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Invited by {invitation.inviter?.user_metadata?.full_name || invitation.inviter?.email} to join as {invitation.role}
                  </p>
                  {invitation.message && (
                    <p className="text-sm mt-1 italic">{invitation.message}</p>
                  )}
                  <div className="text-xs text-muted-foreground mt-1 flex items-center">
                    <Clock size={12} className="mr-1" />
                    Expires {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReject(invitation.id)}
                  disabled={processingIds[invitation.id]}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <X size={16} className="mr-1" />
                  Decline
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleAccept(invitation.id)}
                  disabled={processingIds[invitation.id]}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Check size={16} className="mr-1" />
                  Accept
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}