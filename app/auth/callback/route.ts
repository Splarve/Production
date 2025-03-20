// app/auth/callback/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendWelcomeEmail } from '@/utils/auth/email'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
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
    
    // Check if user exists in user_types table
    const { data: userTypeData, error: userTypeError } = await supabase
      .from('user_types')
      .select('user_type')
      .eq('id', user.id)
      .maybeSingle()
    
    // If the user is already in our system
    if (userTypeData) {
      // Check if they're trying to login with the correct account type
      if (userTypeData.user_type !== type) {
        // They're trying to sign in with the wrong account type
        // Redirect them to the correct login page with an error message
        const correctLoginPath = userTypeData.user_type === 'personal' ? 'personal' : 'company'
        const errorMessage = `You already have a ${userTypeData.user_type} account. Please use the ${userTypeData.user_type} login.`
        
        return NextResponse.redirect(
          new URL(`/login/${correctLoginPath}?error=${encodeURIComponent(errorMessage)}`, request.url)
        )
      }
      
      // They're using the correct account type, proceed with login
      if (userTypeData.user_type === 'company') {
        // Check if they have a company
        const { data: companyMember } = await supabase
          .from('company_members')
          .select('company_id')
          .eq('user_id', user.id)
          .maybeSingle()
        
        if (companyMember) {
          return NextResponse.redirect(new URL('/dashboard/company', request.url))
        } else {
          // They're a company user but don't have a company yet
          return NextResponse.redirect(new URL('/onboarding/company', request.url))
        }
      } else {
        // Personal user
        return NextResponse.redirect(new URL('/dashboard/personal', request.url))
      }
    } else {
      // This is a brand new user
      // Create user type entry based on the login/signup type they chose
      const { error: createTypeError } = await supabase
        .from('user_types')
        .insert({ id: user.id, user_type: type })
      
      if (createTypeError) {
        console.error('Create user type error:', createTypeError)
        return NextResponse.redirect(
          new URL('/error?message=Failed+to+set+user+type', request.url)
        )
      }
      
      // If they're signing up as a company user
      if (type === 'company') {
        // Send welcome email
        await sendWelcomeEmail(userName, user.email || '', 'company')
        
        // Redirect to company onboarding
        return NextResponse.redirect(new URL('/onboarding/company', request.url))
      }
      
      // For personal users, create their profile
      const { error: createProfileError } = await supabase
        .from('personal_profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || ''
        })
      
      if (createProfileError) {
        console.error('Create profile error:', createProfileError)
        return NextResponse.redirect(
          new URL('/error?message=Failed+to+create+user+profile', request.url)
        )
      }
      
      // Send welcome email for new personal users
      await sendWelcomeEmail(userName, user.email || '', 'personal')
      
      // Redirect to personal dashboard
      return NextResponse.redirect(new URL('/dashboard/personal', request.url))
    }
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/error?message=Authentication+process+failed', request.url)
    )
  }
}