// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function Dashboard() {
  const supabase = await createClient()
  
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    return redirect('/login')
  }
  
  // Get user profile with user_type
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()
  
  // Redirect to the appropriate dashboard based on user type
  if (profile?.user_type === 'company') {
    return redirect('/company/dashboard')
  } else if (profile?.user_type === 'applicant') {
    return redirect('/applicant/dashboard')
  }
  
  // Fallback if user_type is not set properly
  return redirect('/account')
}