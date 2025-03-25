'use client';
// components/invitations/UserInvitations.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, X, Building, Loader2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Define the Invitation interface for type safety
interface Invitation {
  id: string;
  company_id: string;
  invited_by: string;
  email: string;
  role: string;
  status: string;
  message?: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  company_name?: string;
  company_handle?: string;
  company_logo_url?: string;
  inviter_name?: string;
  companies?: {
    id: string;
    name: string;
    handle: string;
    logo_url?: string;
  };
}

export function UserInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const router = useRouter();
  
  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the API endpoint directly
      const response = await fetch('/api/invitations');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch invitations');
      }
      
      const data = await response.json();
      setInvitations(data.invitations || []);
    } catch (err: any) {
      console.error('Error fetching invitations:', err);
      setError(err.message || 'Could not load invitations');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchInvitations();
  }, []);
  
  const handleAccept = async (invitationId: string) => {
    try {
      setProcessingId(invitationId);
      setError(null);
      
      const response = await fetch(`/api/invitations/${invitationId}/accept`, {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Remove from the list
        setInvitations(invitations.filter(inv => inv.id !== invitationId));
        // Refresh the page to show new company
        router.refresh();
      } else {
        setError(result.error || result.message || 'Failed to accept invitation');
      }
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      setError(err.message || 'Failed to accept invitation');
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleReject = async (invitationId: string) => {
    try {
      setProcessingId(invitationId);
      setError(null);
      
      const response = await fetch(`/api/invitations/${invitationId}/reject`, {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Remove from the list
        setInvitations(invitations.filter(inv => inv.id !== invitationId));
      } else {
        setError(result.error || result.message || 'Failed to reject invitation');
      }
    } catch (err: any) {
      console.error('Error rejecting invitation:', err);
      setError(err.message || 'Failed to reject invitation');
    } finally {
      setProcessingId(null);
    }
  };
  
  // Skip rendering if no invitations and not loading and no error
  if (!loading && invitations.length === 0 && !error) {
    return null;
  }
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Invitations</CardTitle>
          <CardDescription>Pending company invitations</CardDescription>
        </div>
        {error && (
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchInvitations}
            disabled={loading}
            className="h-8 px-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-4 text-center flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
            <span className="text-muted-foreground">Loading invitations...</span>
          </div>
        ) : error ? (
          <div className="p-3 rounded-md bg-red-50 text-red-700 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error loading invitations</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : invitations.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">No pending invitations</div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => {
              // Get company info from either flat or nested structure
              const company = invitation.companies || {};
              const companyName = company.name || invitation.company_name || 'Company';
              const companyLogo = company.logo_url || invitation.company_logo_url;
              const companyHandle = company.handle || invitation.company_handle;
              // Use safe inviter name from either structure, with fallback
              const inviterName = invitation.inviter_name || 'Company Member';
              
              return (
                <div 
                  key={invitation.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {companyLogo ? (
                        <img 
                          src={companyLogo}
                          alt={companyName}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <Building className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{companyName}</h4>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">{inviterName}</span> invited you to join as <span className="font-medium capitalize">{invitation.role}</span>
                      </p>
                      {invitation.message && (
                        <p className="mt-2 text-sm italic">"{invitation.message}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 self-end sm:self-center">
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