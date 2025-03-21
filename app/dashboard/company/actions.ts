'use server'
// app/dashboard/company/actions.ts

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendCompanyInvitation } from '@/utils/auth/email'
import { CompanyRole, canAssignRole } from '@/utils/auth/roles'

interface InvitationResult {
  success?: boolean;
  error?: string;
  warning?: string;
  message?: string;
}

export async function inviteMember(formData: FormData): Promise<InvitationResult> {
  try {
    const supabase = await createClient()
    
    // Extract form data
    const companyId = parseInt(formData.get('companyId') as string, 10)
    const email = formData.get('email') as string
    const role = formData.get('role') as CompanyRole
    
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
    
    // Get the inviter's role
    const { data: userRole } = await supabase
      .from('company_members')
      .select('role')
      .eq('company_id', companyId)
      .eq('user_id', user.id)
      .single()
      
    if (!userRole) {
      return { error: 'You are not a member of this company' }
    }
    
    // Check if inviter has permission to assign this role
    if (!canAssignRole(userRole.role as CompanyRole, role)) {
      return { error: `As a ${userRole.role}, you cannot assign the ${role} role` }
    }
    
    // Get company details
    const { data: company } = await supabase
      .from('companies')
      .select('company_name')
      .eq('id', companyId)
      .single()
      
    if (!company) {
      return { error: 'Company not found' }
    }
    
    // Check if user already has a pending invitation
    const { data: existingInvitation } = await supabase
      .from('company_invitations')
      .select('id')
      .eq('company_id', companyId)
      .eq('email', email)
      .single()
    
    if (existingInvitation) {
      // If there's an existing invitation, we'll update it
      console.log(`Updating existing invitation for ${email}`)
    }
    
    // Create the invitation
    const { data: token, error: inviteError } = await supabase.rpc(
      'invite_to_company',
      {
        in_company_id: companyId,
        in_email: email, 
        in_role: role
      }
    )
    
    if (inviteError) {
      return { error: inviteError.message }
    }
    
    // Get inviter's name
    const inviterName = user.user_metadata.full_name || user.email || 'A team member'
    
    // Send invitation email using SendGrid
    const emailResult = await sendCompanyInvitation(
      inviterName,
      company.company_name,
      email,
      token as string,
      role
    )
    
    if (!emailResult.success) {
      // Log the error but don't fail the invitation creation
      console.error('Failed to send invitation email:', emailResult.error)
      return { 
        success: true, 
        warning: 'Invitation created but email delivery failed. You may need to share the invitation link manually.' 
      }
    }
    
    // After inviting, revalidate the company dashboard page
    revalidatePath('/dashboard/company')
    
    return { 
      success: true,
      message: `Invitation sent to ${email}`
    }
  } catch (error: any) {
    console.error('Invitation error:', error)
    return { error: error.message || 'Failed to send invitation' }
  }
}