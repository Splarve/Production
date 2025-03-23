// app/signup/personal/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthProviderButtons } from '@/components/auth/auth-provider-buttons';
import { AuthForm } from '@/components/auth/auth-form';
import { motion } from 'framer-motion';

export default function PersonalSignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');
  
  // Use URL params or state
  const displayError = error || urlError;

  return (
    <AuthLayout type="personal" mode="signup">
      <AuthCard 
        title="Create Your Account" 
        subtitle="Sign up to find your dream job"
        error={displayError}
        message={success ? "Check your email for a confirmation link to complete your signup" : null}
      >
        {!success ? (
          <div className="space-y-6">
            <AuthProviderButtons 
              type="personal" 
              onError={(err) => setError(err)}
            />
            
            <AuthForm 
              mode="signup" 
              type="personal"
              onSuccess={() => setSuccess(true)}
              onError={(err) => setError(err)}
            />
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="mb-4 mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-medium">Verification email sent!</p>
            <p className="text-muted-foreground mt-2">Please check your inbox and click the link to complete your registration.</p>
          </div>
        )}
          
        <motion.div 
          className="text-xs text-muted-foreground mt-6 text-center"
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
  );
}