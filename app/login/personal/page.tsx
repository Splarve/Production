'use client'
// app/login/personal/page.tsx
import { useState } from 'react'
import { login } from './actions'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AuthLayout } from '@/components/auth/auth-layout'
import { AuthCard } from '@/components/auth/auth-card'
import { AuthInput } from '@/components/auth/auth-input'
import { AuthButton } from '@/components/auth/auth-button'

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
    <AuthLayout type="personal" mode="login">
      <AuthCard 
        title="Welcome Back" 
        subtitle="Log in to continue your job search"
        error={error}
        message={message}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSubmit(formData);
        }} className="space-y-4">
          <AuthInput
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="your@email.com"
            required
          />
          
          <AuthInput
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            required
          />
          
          <div className="pt-2">
            <AuthButton
              type="submit"
              isLoading={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </AuthButton>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            Don't have an account?{' '}
            <Link
              href="/signup/personal"
              className="text-primary hover:underline focus:outline-none font-medium"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}