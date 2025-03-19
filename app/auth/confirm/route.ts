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

    // The main verification
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error && data.user) {
      // Get user_type from user metadata
      const userMetadata = data.user.user_metadata || {}
      const userType = userMetadata.user_type as string || ''
      
      if (userType === 'company') {
        return NextResponse.redirect(
          new URL('/login/company?message=Email+verified+successfully.+Please+log+in.', request.url)
        )
      } else if (userType === 'personal') {
        return NextResponse.redirect(
          new URL('/login/personal?message=Email+verified+successfully.+Please+log+in.', request.url)
        )
      }
      
      // If we couldn't determine user type from metadata
      return NextResponse.redirect(
        new URL('/auth/confirmation-success', request.url)
      )
    }
  }

  // Return to error page with a specific message
  return NextResponse.redirect(
    new URL('/error?message=Invalid+or+expired+verification+link', request.url)
  )
}