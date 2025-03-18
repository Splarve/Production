'use server'
// app/login/personal/actions.ts

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
    return redirect('/login/personal?error=' + encodeURIComponent(error.message))
  }

  // Check if the user is a personal user
  const { data: profile, error: profileError } = await supabase
    .from('personal_profiles')
    .select('id')
    .eq('id', userData.user.id)
    .single()

  if (profileError || !profile) {
    // Sign out if this is not a personal account
    await supabase.auth.signOut()
    return redirect('/login/personal?error=This+is+not+a+personal+account.+Please+use+the+correct+login+page.')
  }

  revalidatePath('/', 'layout')
  return redirect('/dashboard/personal')
}