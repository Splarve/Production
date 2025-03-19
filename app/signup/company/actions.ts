'use server'
// app/signup/company/actions.ts

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const companyName = formData.get('company_name') as string
  const companyUsername = formData.get('company_username') as string
  const website = formData.get('website') as string || null

  // Step 1: Check if company username is available
  const { data: existingCompany, error: companyCheckError } = await supabase
    .from('companies')
    .select('id')
    .eq('username', companyUsername)
    .maybeSingle()

  if (companyCheckError) {
    return redirect('/signup/company?error=' + encodeURIComponent('Error checking company name availability. Please try again.'))
  }

  if (existingCompany) {
    return redirect('/signup/company?error=' + encodeURIComponent('This company username is already taken. Please choose another.'))
  }

  // Step 2: Create user account with company details in metadata
  const { data: userData, error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_type: 'company',
        full_name: fullName,
        company_name: companyName,
        company_username: companyUsername,
        company_website: website
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirmation-success`
    }
  })

  if (signupError) {
    return redirect('/signup/company?error=' + encodeURIComponent(signupError.message))
  }

  // Redirect to verification pending page
  return redirect('/verify-email?email=' + encodeURIComponent(email))
}