'use client';
// components/invitations/UserInvitations.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Invitation, acceptInvitation, rejectInvitation, getUserInvitations } from '@/utils/invitations';
import { AlertCircle, Check, X, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function UserInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const router = useRouter();
  
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        setLoading(true);
        const invitationData = await getUserInvitations();
        setInvitations(invitationData);
      } catch (err) {
        console.error('Error fetching invitations:', err);
        setError('Could not load invitations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvitations();
  }, []);
  
  const handleAccept = async (invitationId: string) => {
    try {
      setProcessingId(invitationId);
      const result = await acceptInvitation(invitationId);
      
      if (result.success) {
        // Remove from the list
        setInvitations(invitations.filter(inv => inv.id !== invitationId));
        // Refresh the page to show new company
        router.refresh();
      } else {
        setError(result.error || 'Failed to accept invitation');
      }
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError('Failed to accept invitation');
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleReject = async (invitationId: string) => {
    try {
      setProcessingId(invitationId);
      const result = await rejectInvitation(invitationId);
      
      if (result.success) {
        // Remove from the list
        setInvitations(invitations.filter(inv => inv.id !== invitationId));
      } else {
        setError(result.error || 'Failed to reject invitation');
      }
    } catch (err) {
      console.error('Error rejecting invitation:', err);
      setError('Failed to reject invitation');
    } finally {
      setProcessingId(null);
    }
  };
  
  // Skip rendering if no invitations and not loading
  if (!loading && invitations.length === 0) {
    return null;
  }
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Invitations</CardTitle>
        <CardDescription>Pending company invitations</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-4 text-center text-muted-foreground">Loading invitations...</div>
        ) : error ? (
          <div className="p-3 rounded-md bg-red-50 text-red-700 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : invitations.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">No pending invitations</div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => {
              // Get company info from either flat or nested structure
              const companyName = invitation.company_name || invitation.companies?.name;
              const companyLogo = invitation.company_logo_url || invitation.companies?.logo_url;
              // Use safe inviter name from either structure, with fallback
              const inviterName = invitation.inviter_name || 'Company Member';
              
              return (
                <div 
                  key={invitation.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {companyLogo ? (
                        <img 
                          src={companyLogo}
                          alt={companyName || 'Company'}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <Building className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{companyName || 'Company'}</h4>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">{inviterName}</span> invited you to join as <span className="font-medium">{invitation.role}</span>
                      </p>
                      {invitation.message && (
                        <p className="mt-2 text-sm italic">"{invitation.message}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={!!processingId}
                      onClick={() => handleReject(invitation.id)}
                    >
                      {processingId === invitation.id ? (
                        <span className="animate-pulse">Processing...</span>
                      ) : (
                        <>
                          <X className="mr-1 h-4 w-4" />
                          Decline
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      disabled={!!processingId}
                      onClick={() => handleAccept(invitation.id)}
                    >
                      {processingId === invitation.id ? (
                        <span className="animate-pulse">Processing...</span>
                      ) : (
                        <>
                          <Check className="mr-1 h-4 w-4" />
                          Accept
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}