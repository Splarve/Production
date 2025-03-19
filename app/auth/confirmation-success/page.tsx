// app/auth/confirmation-success/page.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'

export default async function ConfirmationSuccess() {
  const supabase = await createClient()
  
  // Try to get user session - this is fallback, as most users will be redirected
  // directly to their login page from auth/confirm/route.ts
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  // Default user type if we can't determine
  let userType = 'personal'
  
  if (user && user.user_metadata && user.user_metadata.user_type) {
    userType = user.user_metadata.user_type as string
    
    // If we have the user type, redirect to appropriate login
    if (userType === 'company') {
      return redirect('/login/company?message=Email+verified+successfully.+Please+log+in.')
    } else if (userType === 'personal') {
      return redirect('/login/personal?message=Email+verified+successfully.+Please+log+in.')
    }
  }
  
  // As a fallback, show the confirmation page with links to both login types
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center bg-white shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/next.svg"
            alt="Logo"
            width={100}
            height={24}
            className="dark:invert"
          />
          <span className="text-xl font-semibold text-black">JobConnect</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3 text-black">Email Verified!</h1>
          <p className="mb-8 text-black">
            Thank you for verifying your email. Your account is now active.
            Please log in to continue.
          </p>
          
          <div className="space-y-4">
            <Link 
              href="/login/personal"
              className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
            >
              Personal Login
            </Link>
            
            <Link 
              href="/login/company"
              className="block w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded transition-colors"
            >
              Company Login
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-6 text-center text-black">
          <p>© {new Date().getFullYear()} JobConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}