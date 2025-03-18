'use client'
// app/login/personal/page.tsx
import { useState } from 'react'
import { login } from './actions'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

export default function PersonalLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  
  // Use the hook instead of direct access
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      await login(formData)
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
            href="/login/company" 
            className="px-4 py-2 rounded hover:bg-gray-100 border border-gray-300 text-gray-600"
          >
            For Companies
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-gray-600 mt-2">
              Log in to continue your job search
            </p>
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

          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSubmit(formData);
          }} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                href="/signup/personal"
                className="text-blue-600 hover:underline focus:outline-none"
              >
                Sign Up
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