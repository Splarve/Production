'use client'
// app/signup/company/page.tsx
import { useState } from 'react'
import { signup } from './actions'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

export default function CompanySignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // Step 1: Account details, Step 2: Company details
  
  // Use the hook instead of direct access
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (step === 1) {
      // Move to company details step
      setStep(2)
      return
    }
    
    // Handle final submission
    setIsLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      await signup(formData)
    } finally {
      setIsLoading(false)
    }
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
        
        <div className="flex gap-3">
          <Link 
            href="/signup/personal" 
            className="px-4 py-2 rounded hover:bg-gray-100 border border-gray-300 text-gray-600"
          >
            For Job Seekers
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Create a Company Account</h1>
            <p className="text-gray-600 mt-2">
              {step === 1 ? 'Set up your account details' : 'Tell us about your company'}
            </p>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
              1
            </div>
            <div className={`h-1 w-16 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
              2
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Success message */}
          {message && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="your@company.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Full Name
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Your Name"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    id="company_name"
                    name="company_name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Example Company, Inc."
                  />
                </div>
                
                <div>
                  <label htmlFor="company_username" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Username
                  </label>
                  <input
                    id="company_username"
                    name="company_username"
                    type="text"
                    required
                    pattern="[a-zA-Z0-9\-_]+"
                    minLength={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="company-name"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be your unique company identifier (letters, numbers, dash, underscore only)
                  </p>
                </div>
                
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Website (optional)
                  </label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="https://example.com"
                  />
                </div>
              </>
            )}
            
            <div className="pt-2">
              {step === 1 ? (
                <button
                  type="submit"
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors"
                >
                  Continue
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              )}
            </div>
            
            <div className="text-xs text-gray-500 mt-4">
              By signing up, you agree to our{' '}
              <a href="#" className="text-purple-600 hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have a company account?{' '}
              <Link
                href="/login/company"
                className="text-purple-600 hover:underline focus:outline-none"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 bg-white border-t border-gray-200">
        <div className="container mx-auto px-6 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} JobConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}