'use server'
// app/signup/personal/actions.ts

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        user_type: 'personal',
        full_name: formData.get('full_name') as string
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirmation-success`
    }
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return redirect('/signup/personal?error=' + encodeURIComponent(error.message))
  }

  // Redirect to verification pending page
  return redirect('/verify-email?email=' + encodeURIComponent(data.email))
}