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
  companies?: {
    id: string;
    name: string;
    handle: string;
    logo_url?: string;
  };
  inviter?: {
    email: string;
    user_metadata: {
      full_name?: string;
    };
  };
}

/**
 * Get all invitations for the current company
 */
export async function getCompanyInvitations(companyId: string): Promise<Invitation[]> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('company_invitations')
      .select(`
        *,
        inviter:invited_by (
          email,
          user_metadata
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching company invitations:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getCompanyInvitations:', error);
    return [];
  }
}

/**
 * Get all pending invitations for the current user
 */
export async function getUserInvitations(): Promise<Invitation[]> {
  try {
    const supabase = createClient();
    
    // Get current user's email
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('company_invitations')
      .select(`
        *,
        companies:company_id (
          id,
          name,
          handle,
          logo_url
        ),
        inviter:invited_by (
          email,
          user_metadata
        )
      `)
      .eq('email', user.email)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user invitations:', error);
      return [];
    }
    
    return data || [];
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
    const supabase = createClient();
    
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
    
    // Get company details for email
    const { data: company } = await supabase
      .from('companies')
      .select('name, handle')
      .eq('id', companyId)
      .single();
    
    // Get current user for email
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

/**
 * Change a user's role in a company
 */
export async function changeUserRole(
  companyId: string,
  userId: string,
  newRole: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/companies/${companyId}/members/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: newRole }),
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return { success: false, error: result.error || result.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error changing user role:', error);
    return { success: false, error: 'Failed to change user role' };
  }
}

/**
 * Check if the current user has a specific permission in a company
 */
export async function hasPermission(
  companyId: string, 
  permission: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.rpc(
      'user_has_permission',
      {
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