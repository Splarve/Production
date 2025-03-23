'use client';
// app/login/personal/page.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthProviderButtons } from '@/components/auth/auth-provider-buttons';
import { AuthForm } from '@/components/auth/auth-form';

export default function PersonalLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');
  const urlMessage = searchParams.get('message');
  
  // Use URL params or state
  const displayError = error || urlError;
  const displayMessage = message || urlMessage;

  return (
    <AuthLayout type="personal" mode="login">
      <AuthCard 
        title="Welcome Back" 
        subtitle="Log in to your personal account"
        error={displayError}
        message={displayMessage}
      >
        <div className="space-y-6">
          <AuthProviderButtons 
            type="personal" 
            onError={(err) => setError(err)}
          />
          
          <AuthForm 
            mode="login" 
            type="personal"
            onError={(err) => setError(err)}
          />
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Don't have an account?{' '}
            <Link
              href="/signup/personal"
              className="text-primary hover:underline focus:outline-none font-medium"
            >
              Sign Up
            </Link>
          </p>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Looking to hire?{' '}
              <Link
                href="/login/company"
                className="text-primary hover:underline focus:outline-none"
              >
                Login as a company
              </Link>
            </p>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}