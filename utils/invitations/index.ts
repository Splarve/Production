// utils/invitations/index.ts
import { createClient } from '@/utils/supabase/client';
import { sendInvitationEmail } from '@/utils/invitations/email';

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

/**
 * Get all pending invitations for the current user
 * Uses secure RLS-protected methods to access invitations
 */
export async function getUserInvitations(): Promise<Invitation[]> {
  try {
    const supabase = createClient();
    
    // Get current user's session - this will verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return [];
    }
    
    // Option 1: Call secured RPC function (most secure approach)
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_user_invitations');
      
    if (!rpcError && rpcData) {
      return rpcData;
    }
    
    console.warn('RPC function unavailable, falling back to API');
    
    // Option 2: Fallback to secured API endpoint
    try {
      const response = await fetch('/api/invitations');
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const { invitations } = await response.json();
      return invitations || [];
    } catch (apiError) {
      console.error('Error fetching from API:', apiError);
      
      // Option 3: Last resort - direct query with RLS protection
      const { data, error } = await supabase
        .from('company_invitations')
        .select(`
          *,
          companies:company_id (
            id,
            name,
            handle,
            logo_url
          )
        `)
        .eq('email', session.user.email)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user invitations:', error);
        return [];
      }
      
      // Apply minimal safe transformation
      return data.map(inv => ({
        ...inv,
        inviter_name: 'Company Member' // Generic placeholder for privacy
      }));
    }
  } catch (error) {
    console.error('Error in getUserInvitations:', error);
    return [];
  }
}

/**
 * Send an invitation to join a company
 */
export async function sendInvitation(
  companyId: string,
  email: string,
  role: string,
  message?: string
): Promise<{ success: boolean; invitation?: Invitation; error?: string }> {
  try {
    // Make API call to create invitation
    const response = await fetch(`/api/companies/${companyId}/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, role, message }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error };
    }
    
    const supabase = createClient();
    
    // Get company details for email
    const { data: company } = await supabase
      .from('companies')
      .select('name, handle')
      .eq('id', companyId)
      .single();
    
    // Get current user for email - getting only necessary fields
    const { data: { user } } = await supabase.auth.getUser();
    
    if (company && user) {
      // Send invitation email
      await sendInvitationEmail({
        recipientEmail: email,
        inviterName: user.user_metadata?.full_name || user.email || 'A company manager',
        companyName: company.name,
        companyHandle: company.handle,
        role,
        message,
        invitationId: result.invitation.id
      });
    }
    
    return { success: true, invitation: result.invitation };
  } catch (error) {
    console.error('Error sending invitation:', error);
    return { success: false, error: 'Failed to send invitation' };
  }
}

/**
 * Cancel/delete an invitation
 */
export async function cancelInvitation(
  companyId: string,
  invitationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/companies/${companyId}/invitations/${invitationId}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    return { success: false, error: 'Failed to cancel invitation' };
  }
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(
  invitationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/invitations/${invitationId}/accept`, {
      method: 'POST',
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return { success: false, error: result.error || result.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return { success: false, error: 'Failed to accept invitation' };
  }
}

/**
 * Reject an invitation
 */
export async function rejectInvitation(
  invitationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/invitations/${invitationId}/reject`, {
      method: 'POST',
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return { success: false, error: result.error || result.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error rejecting invitation:', error);
    return { success: false, error: 'Failed to reject invitation' };
  }
}