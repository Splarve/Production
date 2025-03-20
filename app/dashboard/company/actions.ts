'use server'
// app/dashboard/company/actions.ts

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendCompanyInvitation } from '@/utils/auth/email'
import { CompanyRole, canAssignRole } from '@/utils/auth/roles'

export async function inviteMember(formData: FormData) {
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
    
    // Get inviter's name
    const inviterName = user.user_metadata.full_name || user.email
    
    // Send invitation email using SendGrid
    const emailResult = await sendCompanyInvitation(
      inviterName,
      company.company_name,
      email,
      token as string,
      role
    )
    
    if (!emailResult.success) {
      // The invitation was created but email failed to send
      // You might want to handle this case differently
      console.error('Failed to send invitation email:', emailResult.error)
      
      // We'll still consider this successful since the invitation was created
      // The user can be notified separately
    }
    
    // After inviting, revalidate the company dashboard page
    revalidatePath('/dashboard/company')
    
    return { success: true }
  } catch (error: any) {
    console.error('Invitation error:', error)
    return { error: error.message || 'Failed to send invitation' }
  }
}