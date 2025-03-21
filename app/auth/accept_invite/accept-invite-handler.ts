// app/auth/accept_invite/accept-invite-handler.ts
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface AcceptInviteHandlerProps {
  token: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export async function handleInviteAcceptance({ 
  token, 
  setLoading, 
  setError 
}: AcceptInviteHandlerProps) {
  if (!token) {
    setError('Invalid or missing invitation token');
    setLoading(false);
    return false;
  }
  
  const supabase = createClient();
  const router = useRouter();
  
  try {
    setLoading(true);
    
    // Call the server function to accept the invite
    const { data, error } = await supabase.rpc('accept_company_invitation', {
      invite_token: token
    });
    
    if (error) throw error;
    
    // Redirect to company dashboard on success
    router.push('/dashboard/company');
    return true;
  } catch (err: any) {
    console.error('Failed to accept invitation:', err);
    setError(err.message || 'Failed to accept invitation');
    setLoading(false);
    return false;
  }
}

export async function storeInviteTokenInLocalStorage(token: string) {
  // Save token in local storage for after login
  if (typeof window !== 'undefined') {
    localStorage.setItem('pendingInviteToken', token);
  }
}

export async function checkAndProcessStoredInvite() {
  // Check if there's a stored token after login
  if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem('pendingInviteToken');
    
    if (storedToken) {
      try {
        const supabase = createClient();
        
        // Call the server function to accept the invite
        const { data, error } = await supabase.rpc('accept_company_invitation', {
          invite_token: storedToken
        });
        
        // Remove the token from storage regardless of result
        localStorage.removeItem('pendingInviteToken');
        
        if (error) throw error;
        
        return { success: true };
      } catch (err: any) {
        console.error('Failed to process stored invitation:', err);
        return { 
          success: false, 
          error: err.message || 'Failed to process invitation'
        };
      }
    }
  }
  
  return { success: false, noToken: true };
}