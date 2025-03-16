// app/company/dashboard/page.tsx
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
    return redirect('/login')
  }
  
  // Get profile data
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  // Verify this is a company
  if (!profile || profile.user_type !== 'company') {
    return redirect('/account')
  }
  
  return <CompanyDashboardUI user={user} profile={profile} />
}