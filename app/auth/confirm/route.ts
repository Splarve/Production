// app/auth/confirm/route.ts
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') || '/auth/confirmation-success'
  
  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error) {
      // Make sure this URL is absolute to prevent open redirect vulnerabilities
      const redirectUrl = next.startsWith('/')
        ? new URL(next, request.url).toString()
        : new URL('/auth/confirmation-success', request.url).toString()
        
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Return to error page with a specific message
  return NextResponse.redirect(
    new URL('/error?message=Invalid+or+expired+verification+link', request.url)
  )
}