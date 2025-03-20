'use client'
// app/signup/company/page.tsx
import { useState } from 'react'
import { signup } from './actions'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AuthLayout } from '@/components/auth/auth-layout'
import { AuthCard } from '@/components/auth/auth-card'
import { AuthInput } from '@/components/auth/auth-input'
import { AuthButton } from '@/components/auth/auth-button'
import { StepIndicator } from '@/components/auth/step-indicator'
import { motion, AnimatePresence } from 'framer-motion'

export default function CompanySignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // Step 1: Account details, Step 2: Company details
  // Form state to store values between steps
  const [formValues, setFormValues] = useState({
    email: '',
    full_name: '',
    password: '',
    company_name: '',
    company_username: '',
    website: ''
  })
  
  // Use the hook instead of direct access
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    // Get the current form data
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    
    if (step === 1) {
      // Save values from first step
      setFormValues(prevValues => ({
        ...prevValues,
        email: formData.get('email') as string,
        full_name: formData.get('full_name') as string,
        password: formData.get('password') as string
      }))
      
      // Move to company details step
      setStep(2)
      return
    }
    
    // For the final step, we need to combine all values into a single FormData
    const completeFormData = new FormData();
    
    // Add values from first step
    completeFormData.append('email', formValues.email);
    completeFormData.append('full_name', formValues.full_name);
    completeFormData.append('password', formValues.password);
    
    // Add values from second step
    completeFormData.append('company_name', formData.get('company_name') as string);
    completeFormData.append('company_username', formData.get('company_username') as string);
    completeFormData.append('website', (formData.get('website') as string) || '');
    
    // Handle final submission
    setIsLoading(true)
    try {
      await signup(completeFormData)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Step titles and subtitles
  const stepContent = [
    {
      title: "Create a Company Account",
      subtitle: "Set up your account details"
    },
    {
      title: "Company Information",
      subtitle: "Tell us about your company"
    }
  ];
  
  // Animation variants for step transition
  const stepVariants = {
    hidden: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
      transition: {
        duration: 0.3
      }
    })
  };

  return (
    <AuthLayout type="company" mode="signup">
      <AuthCard 
        title={stepContent[step - 1].title}
        subtitle={stepContent[step - 1].subtitle}
        error={error}
        message={message}
      >
        <StepIndicator currentStep={step} totalSteps={2} />
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait" custom={step === 2 ? 1 : -1}>
            {step === 1 ? (
              <motion.div
                key="step1"
                custom={1}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                <AuthInput
                  id="email"
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="your@company.com"
                  required
                  value={formValues.email}
                  onChange={(e) => setFormValues({...formValues, email: e.target.value})}
                />
                
                <AuthInput
                  id="full_name"
                  name="full_name"
                  type="text"
                  label="Your Full Name"
                  placeholder="Your Name"
                  required
                  value={formValues.full_name}
                  onChange={(e) => setFormValues({...formValues, full_name: e.target.value})}
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
                  value={formValues.password}
                  onChange={(e) => setFormValues({...formValues, password: e.target.value})}
                />
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                custom={-1}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                <AuthInput
                  id="company_name"
                  name="company_name"
                  type="text"
                  label="Company Name"
                  placeholder="Example Company, Inc."
                  required
                  value={formValues.company_name}
                  onChange={(e) => setFormValues({...formValues, company_name: e.target.value})}
                />
                
                <AuthInput
                  id="company_username"
                  name="company_username"
                  type="text"
                  label="Company Username"
                  placeholder="company-name"
                  required
                  pattern="[a-zA-Z0-9\-_]+"
                  minLength={3}
                  helperText="This will be your unique company identifier (letters, numbers, dash, underscore only)"
                  value={formValues.company_username}
                  onChange={(e) => setFormValues({...formValues, company_username: e.target.value})}
                />
                
                <AuthInput
                  id="website"
                  name="website"
                  type="url"
                  label="Company Website (optional)"
                  placeholder="https://example.com"
                  value={formValues.website}
                  onChange={(e) => setFormValues({...formValues, website: e.target.value})}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-between">
            {step === 2 && (
              <AuthButton
                type="button"
                variant="outline"
                fullWidth={false}
                onClick={() => setStep(1)}
              >
                Back
              </AuthButton>
            )}
            
            <AuthButton
              type="submit"
              isLoading={isLoading}
              fullWidth={step === 1}
            >
              {step === 1 
                ? 'Continue'
                : isLoading 
                  ? 'Signing Up...' 
                  : 'Complete Signup'
              }
            </AuthButton>
          </div>
          
          {step === 1 && (
            <div className="text-xs text-muted-foreground mt-4 text-center">
              By continuing, you agree to our{' '}
              <Link href="#" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login/company"
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