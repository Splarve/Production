// utils/invitations/index.ts
import { createClient } from '@/utils/supabase/client';

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
 * Uses API endpoint for better error handling
 */
export async function getUserInvitations(): Promise<Invitation[]> {
  try {
    // Use the API endpoint directly
    const response = await fetch('/api/invitations');
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    const { invitations } = await response.json();
    return invitations || [];
  } catch (error) {
    console.error('Error in getUserInvitations:', error);
    return [];
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
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return { 
        success: false, 
        error: result.message || 'Failed to accept invitation' 
      };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error accepting invitation:', error);
    return { success: false, error: error.message || 'Failed to accept invitation' };
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
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return { 
        success: false, 
        error: result.message || 'Failed to reject invitation' 
      };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error rejecting invitation:', error);
    return { success: false, error: error.message || 'Failed to reject invitation' };
  }
}