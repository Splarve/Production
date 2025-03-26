'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { AuthButton } from './auth-button';
import { AuthInput } from './auth-input';

interface AuthFormProps {
  mode: 'login' | 'signup';
  type: 'personal' | 'company';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function AuthForm({ mode, type, onSuccess, onError }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const supabase = createClient();
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (mode === 'signup') {
        // Check if user already exists with different account type
        const { data: existingUser } = await supabase
          .from('user_types')
          .select('user_type')
          .eq('id', (await supabase.auth.signInWithPassword({ email, password }))?.data?.user?.id)
          .single();
        
        if (existingUser && existingUser.user_type !== type) {
          const existingType = existingUser.user_type;
          onError?.(`Email already in use with a ${existingType} account. Please use a different email or login with your ${existingType} account.`);
          setIsLoading(false);
          return;
        }
        
        // Sign up
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?type=${type}`,
            data: {
              account_type: type
            }
          }
        });
        
        if (error) throw error;
        
        onSuccess?.();
      } else {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        // Check if user type matches
        const { data: userType } = await supabase
          .from('user_types')
          .select('user_type')
          .eq('id', data.user.id)
          .single();
          
        if (!userType) {
          // First-time login after email verification
          window.location.href = `/auth/callback?type=${type}`;
          return;
        }
        
        if (userType.user_type !== type) {
          await supabase.auth.signOut();
          onError?.(`This email is registered as a ${userType.user_type} account. Please use the ${userType.user_type} login.`);
          setIsLoading(false);
          return;
        }
        
        window.location.href = `/dashboard/${type}`;
      }
    } catch (error: any) {
      onError?.(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthInput
        id="email"
        name="email"
        type="email"
        label="Email Address"
        placeholder="your.email@example.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        isCompany={type === 'company'}
      />
      
      <AuthInput
        id="password"
        name="password"
        type="password"
        label="Password"
        placeholder={mode === 'signup' ? 'Create a secure password' : 'Enter your password'}
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        helperText={mode === 'signup' ? "At least 8 characters" : undefined}
        isCompany={type === 'company'}
      />
      
      <AuthButton
        type="submit"
        isLoading={isLoading}
        variant="primary"
        fullWidth
        isCompany={type === 'company'}
      >
        {isLoading 
          ? (mode === 'signup' ? 'Creating Account...' : 'Signing In...') 
          : (mode === 'signup' ? 'Create Account' : 'Sign In')}
      </AuthButton>
    </form>
  );
}