'use client'
// app/onboarding/company/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { AuthLayout } from '@/components/auth/auth-layout'
import { AuthCard } from '@/components/auth/auth-card'
import { AuthInput } from '@/components/auth/auth-input'
import { AuthButton } from '@/components/auth/auth-button'

export default function CompanyOnboarding() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    companyName: '',
    companyUsername: '',
    website: ''
  })
  
  const router = useRouter()
  
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      
      // Create company in database
      const { data, error } = await supabase.rpc('create_company', {
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