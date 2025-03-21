'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AcceptInvite() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteDetails, setInviteDetails] = useState<{
    companyName: string;
    role: string;
  } | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const supabase = createClient()
  
  useEffect(() => {
    async function getInviteDetails() {
      if (!token) {
        setError('Invalid or missing invitation token')
        setLoading(false)
        return
      }
      
      try {
        // First, get the invitation details
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
          role: invitation.role
        })
        
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // If logged in, check if email matches
          if (session.user.email === invitation.email) {
            // Accept invite directly
            await acceptInvite()
          } else {
            // Show error that they need to log in with the correct account
            setError(`This invitation was sent to ${invitation.email}. Please log in with that account.`)
          }
        }
        
        setLoading(false)
      } catch (err: any) {
        setError('Failed to process invitation')
        setLoading(false)
      }
    }
    
    getInviteDetails()
  }, [token])
  
  async function acceptInvite() {
    if (!token) return
    
    try {
      setLoading(true)
      
      // Call a server function to accept the invite
      const { data, error } = await supabase.rpc('accept_company_invitation', {
        invite_token: token
      })
      
      if (error) throw error
      
      // Redirect to company dashboard on success
      router.push('/dashboard/company')
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation')
      setLoading(false)
    }
  }
  
  async function handleSignIn() {
    // Save token in local storage for after login
    if (token) {
      localStorage.setItem('pendingInviteToken', token)
    }
    
    // Redirect to sign in page
    router.push('/auth/login')
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
            <Link href="/auth/login" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
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
          You've been invited to join <strong>{inviteDetails?.companyName}</strong> as a <strong>{inviteDetails?.role}</strong>.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleSignIn}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Log In
          </button>
          <button
            onClick={acceptInvite}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Accept Invitation
          </button>
        </div>
      </div>
    </div>
  )
}