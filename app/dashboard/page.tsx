// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function Dashboard() {
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
  
  if (!userType) {
    // User type not found, sign out and redirect
    await supabase.auth.signOut()
    return redirect('/?error=Please+log+in+again')
  }
  
  if (userType.user_type === 'personal') {
    // Check if user has a personal profile
    const { data: personalProfile } = await supabase
      .from('personal_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()
    
    if (personalProfile) {
      return redirect('/dashboard/personal')
    }
  } else if (userType.user_type === 'company') {
    // Check if user is a member of any company
    const { data: companyMember } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (companyMember) {
      return redirect('/dashboard/company')
    } else {
      // User is a company user but doesn't have a company yet
      return redirect('/onboarding/company')
    }
  }
  
  // If we can't determine the type or the user doesn't have the right profile,
  // sign them out and redirect to login
  await supabase.auth.signOut()
  return redirect('/?error=Please+log+in+again')
}