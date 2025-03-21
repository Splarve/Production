'use client'
// app/auth/accept_invite/page.tsx
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { handleInvite } from './actions'

export default function AcceptInvite() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteData, setInviteData] = useState<{
    company_name: string;
    email: string;
    role: string;
    invited_by_name: string;
  } | null>(null)
  
  useEffect(() => {
    async function fetchInviteData() {
      if (!token) {
        setError('Invalid invitation link. No token provided.')
        setIsLoading(false)
        return
      }
      
      const supabase = createClient()
      
      try {
        console.log("Fetching invitation with token:", token);
        
        // Use the RPC function to get invitation safely
        const { data: inviteData, error: inviteError } = await supabase.rpc(
          'get_invitation_by_token',
          { p_token: token }
        )
        
        if (inviteError) {
          console.log("Error fetching invitation:", inviteError);
          setError('Error retrieving invitation. Please try again.')
          setIsLoading(false)
          return
        }
        
        if (!inviteData || inviteData.length === 0) {
          console.log("No invitation found with token:", token);
          setError('Invalid or expired invitation. Please ask for a new invitation.')
          setIsLoading(false)
          return
        }
        
        // Get inviter's name
        const { data: inviterData } = await supabase
          .from('auth.users')
          .select('raw_user_meta_data->full_name')
          .eq('id', inviteData[0].invited_by)
          .single()
        
        const inviterName = !inviterData 
          ? 'Someone' 
          : (inviterData?.raw_user_meta_data?.full_name || 'Someone')
        
        setInviteData({
          company_name: inviteData[0].company_name,
          email: inviteData[0].email,
          role: inviteData[0].role,
          invited_by_name: inviterName
        })
      } catch (err) {
        console.error('Error fetching invitation data:', err)
        setError('Something went wrong. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchInviteData()
  }, [token])
  
  const handleAccept = async () => {
    if (!token || !inviteData) return
    
    setIsLoading(true)
    try {
      const result = await handleInvite(token, 'accept')
      
      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }
      
      // Redirect to login page with success message
      router.push(`/login/company?message=${encodeURIComponent('Invitation accepted! Please log in with your account to access the company dashboard.')}`)
    } catch (err) {
      console.error('Error accepting invitation:', err)
      setError('Failed to accept invitation. Please try again.')
      setIsLoading(false)
    }
  }
  
  const handleReject = async () => {
    if (!token || !inviteData) return
    
    setIsLoading(true)
    try {
      const result = await handleInvite(token, 'reject')
      
      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }
      
      // Redirect to home page with message
      router.push(`/?message=${encodeURIComponent('Invitation rejected successfully.')}`)
    } catch (err) {
      console.error('Error rejecting invitation:', err)
      setError('Failed to reject invitation. Please try again.')
      setIsLoading(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="w-full py-4 px-6 flex justify-between items-center bg-white shadow-sm">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/next.svg"
              alt="Logo"
              width={100}
              height={24}
              className="dark:invert"
            />
            <span className="text-xl font-semibold">Splarve</span>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
            <p className="text-center mt-4">Loading invitation details...</p>
          </div>
        </main>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="w-full py-4 px-6 flex justify-between items-center bg-white shadow-sm">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/next.svg"
              alt="Logo"
              width={100}
              height={24}
              className="dark:invert"
            />
            <span className="text-xl font-semibold">Splarve</span>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Invitation Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              href="/"
              className="inline-block bg-primary text-white py-2 px-6 rounded-md hover:bg-primary/90 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </main>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="w-full py-4 px-6 flex justify-between items-center bg-white shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/next.svg"
            alt="Logo"
            width={100}
            height={24}
            className="dark:invert"
          />
          <span className="text-xl font-semibold">Splarve</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Company Invitation</h2>
          </div>
          
          <div className="mb-8">
            <p className="text-gray-600 mb-4">
              <span className="font-semibold">{inviteData?.invited_by_name}</span> has invited you to join <span className="font-semibold">{inviteData?.company_name}</span> as a <span className="font-semibold capitalize">{inviteData?.role}</span>.
            </p>
            <p className="text-gray-600 mb-4">
              This invitation was sent to <span className="font-semibold">{inviteData?.email}</span>.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-sm text-yellow-700">
                You'll need to sign in with the email address mentioned above after accepting this invitation.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAccept}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Accept Invitation'}
            </button>
            <button
              onClick={handleReject}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Decline'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}