'use server'
// app/login/company/actions.ts

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: userData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return redirect('/login/company?error=' + encodeURIComponent(error.message))
  }

  // Check if the user is a member of any company
  const { data: companyMember, error: memberError } = await supabase
    .from('company_members')
    .select('company_id, role')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  if (memberError || !companyMember) {
    // Sign out if this is not a company account or member of any company
    await supabase.auth.signOut()
    return redirect('/login/company?error=This+account+is+not+associated+with+any+company.+Please+use+the+correct+login+page.')
  }

  revalidatePath('/', 'layout')
  return redirect('/dashboard/company')
}