// app/dashboard/personal/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import PersonalDashboardUI from './personal-dashboard-ui'

export default async function PersonalDashboard() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return redirect('/login/personal')
  }
  
  // Check user type
  const { data: userType } = await supabase
    .from('user_types')
    .select('user_type')
    .eq('id', user.id)
    .single()
  
  if (!userType || userType.user_type !== 'personal') {
    return redirect('/login/personal?error=You+need+a+personal+account+to+access+this+page')
  }
  
  // Get profile data
  const { data: profile, error } = await supabase
    .from('personal_profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  // If no personal profile is found, redirect to login
  if (!profile) {
    await supabase.auth.signOut()
    return redirect('/login/personal?error=No+personal+profile+found.+Please+login+again.')
  }
  
  return <PersonalDashboardUI user={user} profile={profile} />
}