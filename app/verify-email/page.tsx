'use client'
// app/verify-email/page.tsx
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AuthLayout } from '@/components/auth/auth-layout'
import { AuthCard } from '@/components/auth/auth-card'
import { AuthButton } from '@/components/auth/auth-button'
import { motion } from 'framer-motion'

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

  // Used for staggered animation of list items
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <AuthLayout type="personal" mode="signup">
      <AuthCard 
        title="Check Your Email"
        subtitle="We've sent you a verification link"
      >
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </motion.div>
          
          <p className="text-foreground">
            We've sent a verification link to:
          </p>
          <div className="font-medium text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {email}
          </div>
          
          <motion.div 
            className="p-5 bg-primary/5 text-foreground rounded-lg text-left border border-primary/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-medium mb-3 text-foreground">Next steps:</h3>
            <motion.ol 
              className="list-decimal pl-5 space-y-2"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.li variants={item}>Open the email we just sent you</motion.li>
              <motion.li variants={item}>Click the verification link</motion.li>
              <motion.li variants={item}>You'll be redirected to complete your profile</motion.li>
            </motion.ol>
          </motion.div>
          
          <p className="text-sm text-muted-foreground">
            Didn't receive an email? Check your spam folder or try again in a few minutes.
          </p>
          
          <AuthButton
            type="button"
            onClick={() => router.push('/')}
          >
            Back to Home
          </AuthButton>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}