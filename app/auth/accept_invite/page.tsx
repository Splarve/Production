// app/auth/accept-invite/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { signInWithGoogle } from '@/utils/auth/oauth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AcceptInvite() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteDetails, setInviteDetails] = useState<{
    companyName: string;
    role: string;
    invitedBy: string;
    email: string;
  } | null>(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  useEffect(() => {
    async function validateInvite() {
      if (!token) {
        setError('Invalid invitation link')
        setLoading(false)
        return
      }
      
      const supabase = createClient()
      
      // Check if user is already authenticated
      const { data: { user } } = await supabase.auth.getUser()
      
      // Fetch invitation details
      const { data: inviteData, error: inviteError } = await supabase
        .from('company_invitations')
        .select(`
          email,
          role,
          company_id,
          companies(company_name),
          invited_by(email, user_metadata->full_name)
        `)
        .eq('token', token)
        .single()
      
      if (inviteError || !inviteData) {
        setError('Invalid or expired invitation')
        setLoading(false)
        return
      }
      
      // Format the data for display
      setInviteDetails({
        companyName: inviteData.companies?.company_name || 'Unknown Company',
        role: inviteData.role,
        invitedBy: inviteData.invited_by?.full_name || inviteData.invited_by?.email || 'Unknown',
        email: inviteData.email
      })
      
      // If user is logged in and has the same email as the invite
      if (user && user.email === inviteData.email) {
        // Accept the invitation immediately
        await acceptInvitation(token)
        return
      }
      
      setLoading(false)
    }
    
    validateInvite()
  }, [token, router])
  
  async function acceptInvitation(token: string) {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // User is not authenticated, they need to sign in first
        setLoading(false)
        return
      }
      
      // Fetch the invitation again to make sure it's still valid
      const { data: invite } = await supabase
        .from('company_invitations')
        .select('company_id, role')
        .eq('token', token)
        .single()
      
      if (!invite) {
        setError('Invitation not found or expired')
        setLoading(false)
        return
      }
      
      // Insert the user as a company member
      const { error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: invite.company_id,
          user_id: user.id,
          role: invite.role,
          joined_at: new Date().toISOString()
        })
      
      if (memberError) {
        if (memberError.code === '23505') { // Unique constraint violation
          // User is already a member, no need to show an error
          setError(null)
        } else {
          console.error('Error accepting invitation:', memberError)
          setError('Failed to accept invitation')
          setLoading(false)
          return
        }
      }
      
      // Delete the invitation
      await supabase
        .from('company_invitations')
        .delete()
        .eq('token', token)
      
      // Update user type to 'company' if it's currently 'personal'
      const { data: userType } = await supabase
        .from('user_types')
        .select('user_type')
        .eq('id', user.id)
        .single()
      
      if (userType && userType.user_type === 'personal') {
        await supabase
          .from('user_types')
          .update({ user_type: 'company' })
          .eq('id', user.id)
      }
      
      // Redirect to company dashboard
      router.push('/dashboard/company?message=Invitation+accepted+successfully')
    } catch (err) {
      console.error('Error accepting invitation:', err)
      setError('An error occurred while accepting the invitation')
      setLoading(false)
    }
  }
  
  async function handleSignIn() {
    try {
      await signInWithGoogle('company')
    } catch (err) {
      console.error('Error signing in with Google:', err)
      setError('Failed to sign in with Google')
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Processing Invitation</h2>
          <p className="text-gray-600">Please wait while we validate your invitation...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Invitation Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/">
            <Button className="w-full">Return to Home</Button>
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Company Invitation</h2>
        
        {inviteDetails && (
          <div className="mb-8">
            <p className="text-center mb-4">
              <span className="font-medium">{inviteDetails.invitedBy}</span> has invited you to join 
              <span className="font-medium"> {inviteDetails.companyName}</span> as a
              <span className="font-medium"> {inviteDetails.role}</span>.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <p className="text-sm text-gray-600">This invitation was sent to:</p>
              <p className="font-medium">{inviteDetails.email}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <Button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
              </g>
            </svg>
            Accept with Google
          </Button>
          
          <div className="text-center text-sm text-gray-500">
            <p>By accepting this invitation, you'll be added to the company's team.</p>
          </div>
        </div>
      </div>
    </div>
  )
}