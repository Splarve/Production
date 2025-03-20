'use client'
// app/signup/personal/page.tsx
import { useState } from 'react'
import { signup } from './actions'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AuthLayout } from '@/components/auth/auth-layout'
import { AuthCard } from '@/components/auth/auth-card'
import { AuthInput } from '@/components/auth/auth-input'
import { AuthButton } from '@/components/auth/auth-button'
import { motion } from 'framer-motion'

export default function PersonalSignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  
  // Use the hook instead of direct access
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      await signup(formData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout type="personal" mode="signup">
      <AuthCard 
        title="Create Your Account" 
        subtitle="Sign up to find your dream job"
        error={error}
        message={message}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSubmit(formData);
        }} className="space-y-2">
          <AuthInput
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="your@email.com"
            required
          />
          
          <AuthInput
            id="full_name"
            name="full_name"
            type="text"
            label="Full Name"
            placeholder="Your Name"
            required
          />
          
          <AuthInput
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            required
            minLength={6}
            helperText="Must be at least 6 characters"
          />
          
          <div className="pt-4">
            <AuthButton
              type="submit"
              isLoading={isLoading}
            >
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </AuthButton>
          </div>
          
          <motion.div 
            className="text-xs text-muted-foreground mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            By signing up, you agree to our{' '}
            <Link href="#" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </motion.div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login/personal"
              className="text-primary hover:underline focus:outline-none font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}