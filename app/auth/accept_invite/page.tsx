'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { acceptInvitationAndRedirect } from './actions'

export default function AcceptInvite() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteDetails, setInviteDetails] = useState<{
    companyName: string;
    role: string;
    email: string;
  } | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const supabase = createClient()
  
  useEffect(() => {
    async function getInviteAndUserDetails() {
      if (!token) {
        setError('Invalid or missing invitation token')
        setLoading(false)
        return
      }
      
      try {
        // Get the current user's session
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.email) {
          setUserEmail(session.user.email)
        }
        
        // Get the invitation details
        const { data: invitation, error: inviteError } = await supabase
          .from('company_invitations')
          .select('company_id, role, email')
          .eq('token', token)
          .single()
        
        if (inviteError || !invitation) {
          setError('Invalid or expired invitation token')
          setLoading(false)
          return
        }
        
        // Get company name
        const { data: company } = await supabase
          .from('companies')
          .select('company_name')
          .eq('id', invitation.company_id)
          .single()
          
        setInviteDetails({
          companyName: company?.company_name || 'a company',
          role: invitation.role,
          email: invitation.email
        })
        
        setLoading(false)
      } catch (err: any) {
        console.error('Failed to process invitation:', err)
        setError('Failed to process invitation')
        setLoading(false)
      }
    }
    
    getInviteAndUserDetails()
  }, [token, supabase])
  
  // Redirect to login page with specific email
  function handleLoginRedirect() {
    if (inviteDetails?.email) {
      // Store the token in localStorage for after login
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingInviteToken', token || '');
      }
      
      // Add a returnUrl parameter to redirect back after login
      const returnUrl = encodeURIComponent(`/auth/accept_invite?token=${token}`)
      
      // FIXED: Use /login/personal instead of /auth/login
      router.push(`/login/personal?email=${encodeURIComponent(inviteDetails.email)}&returnUrl=${returnUrl}`)
    } else {
      // FIXED: Use /login/personal instead of /auth/login
      router.push('/login/personal')
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Processing invitation...</h2>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-center mb-4">Invitation Error</h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <div className="flex justify-center">
            <Link href="/login/personal" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!inviteDetails) {
    return null; // Should never happen, but prevents TS errors
  }
  
  const emailMismatch = userEmail && userEmail.toLowerCase() !== inviteDetails.email.toLowerCase();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-purple-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-center mb-4">Company Invitation</h2>
        <p className="text-gray-600 mb-6 text-center">
          You've been invited to join <strong>{inviteDetails.companyName}</strong> as a <strong>{inviteDetails.role}</strong>.
        </p>
        
        {userEmail ? (
          // User is logged in
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              You're currently logged in as <strong>{userEmail}</strong>
            </p>
            {emailMismatch && (
              <p className="text-sm text-red-600">
                This invitation was sent to <strong>{inviteDetails.email}</strong>. Please log in with that account.
              </p>
            )}
          </div>
        ) : (
          // User is not logged in
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              This invitation was sent to <strong>{inviteDetails.email}</strong>. Please log in with that account to accept.
            </p>
          </div>
        )}
        
        {!userEmail ? (
          // Not logged in - show login button
          <div className="flex justify-center">
            <button
              onClick={handleLoginRedirect}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Log In
            </button>
          </div>
        ) : emailMismatch ? (
          // Logged in with wrong account
          <div className="flex justify-center">
            <button
              onClick={handleLoginRedirect}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Log In with Correct Account
            </button>
          </div>
        ) : (
          // Logged in with correct account - show accept form
          <form action={acceptInvitationAndRedirect} className="flex justify-center">
            <input type="hidden" name="token" value={token || ''} />
            <button 
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Accept Invitation
            </button>
          </form>
        )}
      </div>
    </div>
  )
}