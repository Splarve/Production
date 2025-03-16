// app/auth/confirmation-success/page.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function ConfirmationSuccess() {
  const supabase = await createClient()
  
  // Check if user is authenticated after confirmation
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    // If somehow not logged in, redirect to login
    return redirect('/login?message=Please+log+in+with+your+verified+email')
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Email Verified Successfully!</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Thank you for verifying your email. Your account is now active.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/account"
            className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
          >
            Complete Your Profile
          </Link>
          
          <Link
            href="/dashboard"
            className="block w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 font-medium rounded transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}