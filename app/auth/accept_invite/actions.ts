'use server'
// app/auth/accept_invite/actions.ts

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Server action to accept a company invitation
 */
export async function acceptInvitation(token: string) {
  try {
    // Ensure token is properly trimmed
    const cleanToken = token.trim();
    
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'You must be logged in to accept an invitation' }
    }
    
    // Call the Supabase function to process the invitation
    const { data, error } = await supabase.rpc('accept_company_invitation', {
      invite_token: cleanToken
    })
    
    if (error) {
      console.error('Error accepting invitation:', error)
      return { success: false, error: error.message }
    }
    
    // Success - return positive result
    return { success: true }
  } catch (err: any) {
    console.error('Error in acceptInvitation action:', err)
    return { success: false, error: err.message || 'An error occurred while accepting the invitation' }
  }
}

/**
 * Action that accepts an invitation and redirects the user
 */
export async function acceptInvitationAndRedirect(formData: FormData) {
  const token = (formData.get('token') as string)?.trim() || '';
  
  if (!token) {
    redirect('/error?message=Invalid+or+missing+invitation+token')
  }
  
  const result = await acceptInvitation(token)
  
  if (!result.success) {
    redirect(`/error?message=${encodeURIComponent(result.error || 'Failed to accept invitation')}`)
  }
  
  // Success - redirect to dashboard
  redirect('/dashboard/company?message=Invitation+accepted')
}