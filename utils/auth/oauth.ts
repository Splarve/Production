// utils/auth/oauth.ts
import { createClient } from '@/utils/supabase/client'

export async function signInWithGoogle(accountType: 'personal' | 'company' = 'personal') {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=${accountType}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  })
  
  return { data, error }
}

export async function getUserType() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data, error } = await supabase
    .from('user_types')
    .select('user_type')
    .eq('id', user.id)
    .single()
  
  if (error) {
    console.error('Error fetching user type:', error)
    return null
  }
  
  return data?.user_type || null
}