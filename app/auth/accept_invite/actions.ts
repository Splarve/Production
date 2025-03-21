'use server'
// app/auth/accept_invite/actions.ts

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface InviteActionResult {
  success?: boolean;
  error?: string;
}

/**
 * Handles invitation acceptance or rejection
 * @param token Invitation token
 * @param action Either 'accept' or 'reject'
 * @returns Result object with success flag and optional error
 */
export async function handleInvite(
  token: string,
  action: 'accept' | 'reject'
): Promise<InviteActionResult> {
  const supabase = createClient()
  
  try {
    // 1. First, get the invitation data to verify it exists and is valid
    console.log("Handling invite with token:", token);
    
    const { data: inviteData, error: fetchError } = await supabase.rpc(
      'get_invitation_by_token',
      { p_token: token }
    )
    
    if (fetchError || !inviteData || inviteData.length === 0) {
      console.log("Error or no invitations found:", fetchError);
      return { 
        success: false, 
        error: 'This invitation is invalid or has expired. Please request a new invitation.' 
      }
    }
    
    const invitation = inviteData[0];
    
    // 2. Check if a user with this email already exists
    const { data: existingUsers, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', invitation.email)
      
    const userExists = existingUsers && existingUsers.length > 0
    
    // 3. Handle accept or reject actions
    if (action === 'reject') {
      // Simply delete the invitation
      const { error: deleteError } = await supabase
        .from('company_invitations')
        .delete()
        .eq('id', invitation.id)
      
      if (deleteError) {
        console.error('Error deleting invitation:', deleteError)
        return { 
          success: false, 
          error: 'Failed to decline invitation. Please try again.' 
        }
      }
      
      return { success: true }
    } else {
      // For accept action, we need to handle differently based on user existence
      if (userExists) {
        // If user exists, we can try to use the stored procedure
        const { data: acceptResult, error: acceptError } = await supabase.rpc(
          'accept_company_invitation',
          { invite_token: token }
        )
        
        if (acceptError) {
          console.error('Error accepting invitation via RPC:', acceptError)
          
          // Special handling: The user might not be logged in, so we'll mark the invitation
          // as pre-accepted and rely on the auth callback to finish the process
          const { error: updateError } = await supabase
            .from('company_invitations')
            .update({ 
              pre_accepted: true 
            })
            .eq('id', invitation.id)
          
          if (updateError) {
            console.error('Error marking invitation as pre-accepted:', updateError)
            return { 
              success: false, 
              error: 'Failed to accept invitation. Please try again or contact support.' 
            }
          }
          
          // Even with the error from RPC, we consider this a success since we've
          // marked the invitation for processing after login
          return { success: true }
        }
        
        return { success: true }
      } else {
        // For non-existing users, mark the invitation as pre-accepted
        // This will be handled when they create their account
        const { error: updateError } = await supabase
          .from('company_invitations')
          .update({ 
            pre_accepted: true 
          })
          .eq('id', invitation.id)
        
        if (updateError) {
          console.error('Error marking invitation as pre-accepted:', updateError)
          return { 
            success: false, 
            error: 'Failed to accept invitation. Please try again or contact support.' 
          }
        }
        
        return { success: true }
      }
    }
  } catch (err: any) {
    console.error('Error handling invitation:', err)
    return { 
      success: false, 
      error: 'An unexpected error occurred. Please try again or contact support.' 
    }
  } finally {
    // Revalidate any paths that might show invitation status
    revalidatePath('/dashboard/company')
  }
}