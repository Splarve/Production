'use server'
// app/login/actions.ts

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  return redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // Get the user type from the form
  const userType = formData.get('userType') as 'company' | 'applicant'
  
  if (!userType || (userType !== 'company' && userType !== 'applicant')) {
    // Handle invalid user type
    return redirect('/login?error=Please+select+a+valid+user+type')
  }

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        user_type: userType
      }
    }
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return redirect('/login?error=' + encodeURIComponent(error.message))
  }

  // Redirect to verification pending page instead of /account
  return redirect('/verify-email?email=' + encodeURIComponent(data.email))
}