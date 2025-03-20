// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getUser()

  // Check protected routes
  const { pathname } = request.nextUrl
  
  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Company dashboard routes
  if (pathname.startsWith('/dashboard/company')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login/company', request.url))
    }
    
    // Check if they have the right user type
    const { data: userType } = await supabase
      .from('user_types')
      .select('user_type')
      .eq('id', session.user.id)
      .single()
    
    if (!userType || userType.user_type !== 'company') {
      return NextResponse.redirect(
        new URL('/login/company?error=You+need+a+company+account+to+access+this+page', request.url)
      )
    }
  }
  
  // Personal dashboard routes
  if (pathname.startsWith('/dashboard/personal')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login/personal', request.url))
    }
    
    // Check if they have the right user type
    const { data: userType } = await supabase
      .from('user_types')
      .select('user_type')
      .eq('id', session.user.id)
      .single()
    
    if (!userType || userType.user_type !== 'personal') {
      return NextResponse.redirect(
        new URL('/login/personal?error=You+need+a+personal+account+to+access+this+page', request.url)
      )
    }
  }
  
  // Onboarding routes - must be logged in
  if (pathname.startsWith('/onboarding')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login/personal', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/profile/:path*',
    '/jobs/manage/:path*',
    '/applications/:path*',
  ],
}