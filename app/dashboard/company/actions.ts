'use server'
// app/dashboard/company/actions.ts

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function inviteMember(companyId: number, email: string, role: string) {
  try {
    const supabase = await createClient()
    
    // Make sure user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'You must be logged in to invite team members' }
    }
    
    // Check if user has permission to invite with this role
    const { data: permission, error: permissionError } = await supabase.rpc(
      'authorize_company',
      {
        requested_permission: 'member.invite',
        company_id: companyId,
        user_id: user.id
      }
    )
    
    if (permissionError || !permission) {
      return { error: 'You do not have permission to invite team members' }
    }
    
    // Check if inviter has permission to assign this role
    const inviterRole = await getUserRoleInCompany(user.id, companyId)
    
    if (!canAssignRole(inviterRole, role)) {
      return { error: `As a ${inviterRole}, you cannot assign the ${role} role` }
    }
    
    // Create the invitation
    const { data: token, error: inviteError } = await supabase.rpc(
      'invite_to_company',
      {
        company_id: companyId,
        email: email,
        role: role
      }
    )
    
    if (inviteError) {
      return { error: inviteError.message }
    }
    
    // Send email with invitation link - in a real app, you'd use a server endpoint to send emails
    // For now, we'll just log that we would send an email
    console.log(`Would send invitation email to ${email} with token ${token}`)
    
    // After inviting, revalidate the company dashboard page
    revalidatePath('/dashboard/company')
    
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to send invitation' }
  }
}

// Helper function to get user's role in a company
async function getUserRoleInCompany(userId: string, companyId: number): Promise<string> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('company_members')
    .select('role')
    .eq('user_id', userId)
    .eq('company_id', companyId)
    .single()
  
  if (error || !data) {
    throw new Error('Failed to get user role')
  }
  
  return data.role
}

// Helper function to check if a user with a certain role can assign another role
function canAssignRole(inviterRole: string, roleToAssign: string): boolean {
  // Role hierarchy: owner > admin > hr > social > member
  const roleValues = {
    'owner': 5,
    'admin': 4,
    'hr': 3,
    'social': 2,
    'member': 1
  }
  
  // Users can only assign roles below their level
  return roleValues[inviterRole as keyof typeof roleValues] > roleValues[roleToAssign as keyof typeof roleValues]
}