// app/dashboard/company/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import CompanyDashboardUI from './company-dashboard-ui'

export default async function CompanyDashboard() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return redirect('/login/company')
  }
  
  // Check user type
  const { data: userType } = await supabase
    .from('user_types')
    .select('user_type')
    .eq('id', user.id)
    .single()
  
  if (!userType || userType.user_type !== 'company') {
    return redirect('/login/company?error=You+need+a+company+account+to+access+this+page')
  }
  
  // Get company membership data
  const { data: companyMember, error: memberError } = await supabase
    .from('company_members')
    .select('company_id, role')
    .eq('user_id', user.id)
    .single()
  
  if (!companyMember) {
    // They're a company user but don't have a company yet
    return redirect('/onboarding/company')
  }
  
  // Get company data
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyMember.company_id)
    .single()
  
  if (!company) {
    await supabase.auth.signOut()
    return redirect('/login/company?error=Company+not+found.+Please+contact+support.')
  }
  
  // Get pending invitations
  const { data: pendingInvites, error: invitesError } = await supabase
    .from('company_invitations')
    .select('*')
    .eq('company_id', company.id)
    .gte('expires_at', 'now()')
  
  return (
    <CompanyDashboardUI 
      user={user} 
      company={company} 
      role={companyMember.role}
      pendingInvites={pendingInvites || []}
    />
  )
}