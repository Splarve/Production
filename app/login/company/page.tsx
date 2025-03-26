'use client';
// app/login/company/page.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthProviderButtons } from '@/components/auth/auth-provider-buttons';
import { AuthForm } from '@/components/auth/auth-form';

export default function CompanyLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');
  const urlMessage = searchParams.get('message');
  
  // Use URL params or state
  const displayError = error || urlError;
  const displayMessage = message || urlMessage;

  return (
    <AuthLayout type="company" mode="login">
      <AuthCard 
        title="Company Login" 
        subtitle="Access your company dashboard"
        error={displayError}
        message={displayMessage}
        isCompany={true}
      >
        <div className="space-y-6">
          <AuthProviderButtons 
            type="company" 
            onError={(err) => setError(err)}
          />
          
          <AuthForm 
            mode="login" 
            type="company"
            onError={(err) => setError(err)}
          />
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Don't have a company account?{' '}
            <Link
              href="/signup/company"
              className="text-[#8f00ff] hover:underline focus:outline-none font-medium"
            >
              Sign Up
            </Link>
          </p>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Looking for a job?{' '}
              <Link
                href="/login/personal"
                className="text-[#8f00ff] hover:underline focus:outline-none"
              >
                Login as a job seeker
              </Link>
            </p>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}