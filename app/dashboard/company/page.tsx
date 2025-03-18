// app/dashboard/company/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import CompanyDashboardUI from './company-dashboard-ui'

export default async function CompanyDashboard() {
  const supabase = await createClient()
  
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    return redirect('/login/company')
  }
  
  // Get company membership data
  const { data: companyMember, error: memberError } = await supabase
    .from('company_members')
    .select('company_id, role')
    .eq('user_id', user.id)
    .single()
  
  if (!companyMember) {
    await supabase.auth.signOut()
    return redirect('/login/company?error=No+company+association+found.+Please+login+again.')
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