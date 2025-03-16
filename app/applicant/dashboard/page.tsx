// app/applicant/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ApplicantDashboardUI from './applicant-dashboard-ui'

export default async function ApplicantDashboard() {
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
  
  // Verify this is an applicant
  if (!profile || profile.user_type !== 'applicant') {
    return redirect('/account')
  }
  
  return <ApplicantDashboardUI user={user} profile={profile} />
}