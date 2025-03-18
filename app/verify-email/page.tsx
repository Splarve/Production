'use client'
// app/verify-email/page.tsx
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function VerifyEmail() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const router = useRouter()
  
  useEffect(() => {
    if (!email) {
      router.push('/')
    }
  }, [email, router])

  if (!email) {
    return null // Will redirect in the useEffect
  }

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
          <span className="text-xl font-semibold">JobConnect</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3">Check your email</h1>
          <p className="mb-6 text-gray-600">
            We've sent a verification link to:<br />
            <span className="font-medium">{email}</span>
          </p>
          <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-md text-left">
            <h3 className="font-medium mb-2">Next steps:</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Open the email we just sent you</li>
              <li>Click the verification link</li>
              <li>You'll be redirected to complete your profile</li>
            </ol>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Didn't receive an email? Check your spam folder or try again in a few minutes.
          </p>
          <Link 
            href="/"
            className="inline-block bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-6 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} JobConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}