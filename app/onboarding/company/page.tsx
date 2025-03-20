'use client'
// app/onboarding/company/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { AuthLayout } from '@/components/auth/auth-layout'
import { AuthCard } from '@/components/auth/auth-card'
import { AuthInput } from '@/components/auth/auth-input'
import { AuthButton } from '@/components/auth/auth-button'

export default function CompanyOnboarding() {
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    companyName: '',
    companyUsername: '',
    website: ''
  })
  
  const router = useRouter()
  const supabase = createClient()
  
  // Validate the user is logged in and has a company account type
  useEffect(() => {
    async function validateUser() {
      setIsValidating(true)
      
      // Check if the user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Redirect to login if not logged in
        router.push('/login/company?error=You+must+be+logged+in+to+access+this+page')
        return
      }
      
      // Check the user type
      const { data: userType } = await supabase.rpc('get_user_type', {
        user_id: user.id
      })
      
      if (!userType || userType !== 'company') {
        // Redirect if user type is not company
        router.push('/login/company?error=You+need+a+company+account+to+access+this+page')
        return
      }
      
      // Check if the user already has a company
      const { data: companyMember } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (companyMember) {
        // Already has a company, redirect to dashboard
        router.push('/dashboard/company')
        return
      }
      
      setIsValidating(false)
    }
    
    validateUser()
  }, [router, supabase])
  
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not found')
      }
      
      // Use our new setup_company_user function
      const { data, error } = await supabase.rpc('setup_company_user', {
        user_id: user.id,
        company_name: formData.companyName,
        company_username: formData.companyUsername,
        website: formData.website || null
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
      // Redirect to company dashboard
      router.push('/dashboard/company')
    } catch (err: any) {
      console.error('Company creation error:', err)
      setError(err.message || 'Failed to create company')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Show loading state while validating user
  if (isValidating) {
    return (
      <AuthLayout type="company" mode="signup">
        <AuthCard 
          title="Setting Up Your Company" 
          subtitle="Please wait while we validate your account"
        >
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </AuthCard>
      </AuthLayout>
    )
  }
  
  return (
    <AuthLayout type="company" mode="signup">
      <AuthCard 
        title="Complete Your Company Profile" 
        subtitle="Let's set up your company's information"
        error={error}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            id="companyName"
            name="companyName"
            type="text"
            label="Company Name"
            placeholder="Example Company, Inc."
            required
            value={formData.companyName}
            onChange={handleChange}
          />
          
          <AuthInput
            id="companyUsername"
            name="companyUsername"
            type="text"
            label="Company Username"
            placeholder="example-company"
            required
            pattern="[a-zA-Z0-9\-_]+"
            minLength={3}
            helperText="This will be your unique company identifier (letters, numbers, dash, underscore only)"
            value={formData.companyUsername}
            onChange={handleChange}
          />
          
          <AuthInput
            id="website"
            name="website"
            type="url"
            label="Company Website (optional)"
            placeholder="https://example.com"
            value={formData.website}
            onChange={handleChange}
          />
          
          <div className="pt-4">
            <AuthButton
              type="submit"
              isLoading={isLoading}
            >
              {isLoading ? 'Creating Company...' : 'Create Company'}
            </AuthButton>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}