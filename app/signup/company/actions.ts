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

  // Step 2: Create user account
  const { data: userData, error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_type: 'company',
        full_name: fullName
      }
    }
  })

  if (signupError) {
    return redirect('/signup/company?error=' + encodeURIComponent(signupError.message))
  }

  // Step 3: Create company
  if (userData.user) {
    try {
      const { data: companyData, error: companyError } = await supabase.rpc(
        'create_company',
        {
          company_username: companyUsername,
          company_name: companyName,
          description: null,
          website: website
        }
      )

      if (companyError) {
        // Try to sign out if company creation fails
        await supabase.auth.signOut()
        return redirect('/signup/company?error=' + encodeURIComponent('Failed to create company: ' + companyError.message))
      }
    } catch (error) {
      // Try to sign out if company creation fails
      await supabase.auth.signOut()
      return redirect('/signup/company?error=' + encodeURIComponent('Failed to create company profile. Please try again.'))
    }
  }

  // Redirect to verification pending page
  return redirect('/verify-email?email=' + encodeURIComponent(email))
}