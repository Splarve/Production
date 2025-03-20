// app/auth/callback/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendWelcomeEmail } from '@/utils/auth/email'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  // Get the account type from the query parameter
  const type = requestUrl.searchParams.get('type') || 'personal'
  
  if (!code) {
    return NextResponse.redirect(
      new URL('/error?message=Authorization+code+not+found', request.url)
    )
  }
  
  try {
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (sessionError) {
      console.error('Session exchange error:', sessionError)
      return NextResponse.redirect(
        new URL(`/error?message=${encodeURIComponent(sessionError.message)}`, request.url)
      )
    }
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('User fetch error:', userError)
      return NextResponse.redirect(
        new URL('/error?message=Failed+to+get+user+information', request.url)
      )
    }
    
    // Extract name from user metadata for email
    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    
    // Check if the user already has a type
    const { data: userType } = await supabase.rpc('get_user_type', {
      user_id: user.id
    })
    
    // If the user already has a type
    if (userType) {
      // If trying to sign in with wrong account type
      if (userType !== type) {
        // Sign out and redirect with error
        await supabase.auth.signOut()
        
        const correctPath = userType === 'personal' ? 'personal' : 'company'
        const errorMessage = `You already have a ${userType} account. Please use the ${userType} login.`
        
        return NextResponse.redirect(
          new URL(`/login/${correctPath}?error=${encodeURIComponent(errorMessage)}`, request.url)
        )
      }
      
      // User exists with correct type
      if (type === 'company') {
        // Check if they have a company
        const { data: companyMember } = await supabase
          .from('company_members')
          .select('company_id')
          .eq('user_id', user.id)
          .maybeSingle()
        
        if (companyMember) {
          // Has company, go to dashboard
          return NextResponse.redirect(new URL('/dashboard/company', request.url))
        } else {
          // No company yet, go to onboarding
          return NextResponse.redirect(new URL('/onboarding/company', request.url))
        }
      } else {
        // Personal user, go to dashboard
        return NextResponse.redirect(new URL('/dashboard/personal', request.url))
      }
    } else {
      // New user - set the user type
      const { error: typeError } = await supabase.rpc('set_user_type', {
        user_id: user.id,
        account_type: type
      })
      
      if (typeError) {
        console.error('Error setting user type:', typeError)
        return NextResponse.redirect(
          new URL('/error?message=Failed+to+set+user+type', request.url)
        )
      }
      
      // Send welcome email
      await sendWelcomeEmail(userName, user.email || '', type as 'personal' | 'company')
      
      // Redirect based on account type
      if (type === 'company') {
        return NextResponse.redirect(new URL('/onboarding/company', request.url))
      } else {
        return NextResponse.redirect(new URL('/dashboard/personal', request.url))
      }
    }
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/error?message=Authentication+process+failed', request.url)
    )
  }
}