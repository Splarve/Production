'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { acceptInvitationAndRedirect } from './actions'

export default function AcceptInvite() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [tokens, setTokens] = useState<{
    original: string | null,
    urlToken: string | null,
    dbTokens: Array<{token: string, email: string, expires_at: string}>
  }>({
    original: null,
    urlToken: null,
    dbTokens: []
  })
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
      
      // Store the original token for comparison
      setTokens(prev => ({...prev, original: token, urlToken: token?.trim() || null}))
      
      try {
        // Get the current user's session
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.email) {
          setUserEmail(session.user.email)
        }
        
        // First check all tokens in the database to see what we have
        const { data: allInvites, error: invitesError } = await supabase
          .from('company_invitations')
          .select('id, token, email, expires_at')
          .order('created_at', { ascending: false })
          .limit(10)
        
        if (invitesError) {
          setDebugInfo(`Error fetching invitations: ${invitesError.message}`)
        }
        
        if (allInvites && allInvites.length > 0) {
          setTokens(prev => ({
            ...prev, 
            dbTokens: allInvites.map(inv => ({
              token: inv.token,
              email: inv.email,
              expires_at: inv.expires_at
            }))
          }))
        } else {
          // Try direct query for the specific token
          const { data: directInvite, error: directError } = await supabase
            .from('company_invitations')
            .select('id, token, email, expires_at')
            .eq('token', token)
            .single()
            
          if (directError) {
            setDebugInfo((prev) => `${prev || ''}
Direct token query error: ${directError.message}
Token used: ${token}`)
          }
          
          if (directInvite) {
            setTokens(prev => ({
              ...prev,
              dbTokens: [{
                token: directInvite.token,
                email: directInvite.email,
                expires_at: directInvite.expires_at
              }]
            }))
          }
        }
        
        // Get the invitation details
        let foundInvitation;
        let { data: invitation, error: inviteError } = await supabase
          .from('company_invitations')
          .select('company_id, role, email')
          .eq('token', token)
          .single()
        
        if (inviteError) {
          setDebugInfo((prev) => `${prev || ''}
Invitation query error: ${inviteError.message}
Token used: ${token}`)
          
          // Try with trimmed token
          const { data: trimmedInvitation, error: trimmedError } = await supabase
            .from('company_invitations')
            .select('company_id, role, email')
            .eq('token', token.trim())
            .single()
            
          if (trimmedError) {
            setDebugInfo((prev) => `${prev || ''}
Trimmed token query error: ${trimmedError.message}
Token used: ${token.trim()}`)
            
            setError('Invalid or expired invitation token')
            setLoading(false)
            return
          } else {
            // Trimmed token worked
            foundInvitation = trimmedInvitation
          }
        } else {
          foundInvitation = invitation
        }
        
        // Get company name
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('company_name')
          .eq('id', foundInvitation.company_id)
          .single()
          
        if (companyError) {
          setDebugInfo((prev) => `${prev || ''}
Company query error: ${companyError.message}
Company ID: ${foundInvitation.company_id}`)
        }
          
        setInviteDetails({
          companyName: company?.company_name || 'a company',
          role: foundInvitation.role,
          email: foundInvitation.email
        })
        
        setLoading(false)
      } catch (err: any) {
        console.error('Failed to process invitation:', err)
        setError('Failed to process invitation')
        setDebugInfo(`Error: ${err.message}\n${err.stack}`)
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
      
      router.push(`/login/personal?email=${encodeURIComponent(inviteDetails.email)}&returnUrl=${returnUrl}`)
    } else {
      router.push('/login/personal')
    }
  }
  
  // Try to manually accept the invitation
  async function manuallyAcceptInvite() {
    if (!token) return;
    
    try {
      setError(null);
      setDebugInfo((prev) => `${prev || ''}\nAttempting manual accept...`)
      
      const res = await fetch('/api/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      const result = await res.json();
      if (result.success) {
        router.push('/dashboard/company?message=Invitation+accepted')
      } else {
        setDebugInfo((prev) => `${prev || ''}\nManual accept error: ${result.error}`)
      }
    } catch (err: any) {
      setDebugInfo((prev) => `${prev || ''}\nManual accept error: ${err.message}`)
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
          
          {/* Display token information for debugging */}
          <div className="mb-6 p-3 bg-gray-100 border border-gray-300 rounded-md text-xs overflow-auto max-h-60">
            <h3 className="font-bold mb-1">Token Info:</h3>
            <p>Original URL token: {tokens.original || 'none'}</p>
            <p>Trimmed URL token: {tokens.urlToken || 'none'}</p>
            
            <h3 className="font-bold mt-3 mb-1">Recent database tokens:</h3>
            {tokens.dbTokens.length > 0 ? (
              <ul>
                {tokens.dbTokens.map((inv, i) => (
                  <li key={i} className={inv.token === tokens.original ? 'text-green-600 font-bold' : ''}>
                    {i+1}. Token: {inv.token.substring(0, 20)}...
                    <br/>Email: {inv.email}
                    <br/>Expires: {new Date(inv.expires_at).toLocaleString()}
                    <br/>{inv.token === tokens.original ? '✓ (exact match)' : ''}
                    {inv.token === tokens.urlToken ? ' ✓ (trimmed match)' : ''}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No tokens found in database</p>
            )}
            
            {debugInfo && (
              <div className="mt-3">
                <h3 className="font-bold mb-1">Debug Info:</h3>
                <pre className="whitespace-pre-wrap">{debugInfo}</pre>
              </div>
            )}
          </div>
          
          <div className="flex justify-center space-x-3">
            <Link href="/login/personal" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
              Go to Login
            </Link>
            
            <button 
              onClick={manuallyAcceptInvite}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Try Manual Accept
            </button>
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
        
        {/* Display token information for debugging */}
        <div className="mb-6 p-3 bg-gray-100 border border-gray-300 rounded-md text-xs overflow-auto max-h-60">
          <h3 className="font-bold mb-1">Token Info:</h3>
          <p>Original URL token: {tokens.original || 'none'}</p>
          <p>Trimmed URL token: {tokens.urlToken || 'none'}</p>
          
          <h3 className="font-bold mt-3 mb-1">Recent database tokens:</h3>
          {tokens.dbTokens.length > 0 ? (
            <ul>
              {tokens.dbTokens.map((inv, i) => (
                <li key={i} className={inv.token === tokens.original ? 'text-green-600 font-bold' : ''}>
                  {i+1}. Token: {inv.token.substring(0, 20)}...
                  <br/>Email: {inv.email}
                  <br/>Expires: {new Date(inv.expires_at).toLocaleString()}
                  <br/>{inv.token === tokens.original ? '✓ (exact match)' : ''}
                  {inv.token === tokens.urlToken ? ' ✓ (trimmed match)' : ''}
                </li>
              ))}
            </ul>
          ) : (
            <p>No tokens found in database</p>
          )}
          
          {debugInfo && (
            <div className="mt-3">
              <h3 className="font-bold mb-1">Debug Info:</h3>
              <pre className="whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          )}
        </div>
        
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
          // Logged in with correct account - show accept form with debugging info
          <div>
            <form action={acceptInvitationAndRedirect} className="flex justify-center">
              <input type="hidden" name="token" value={token || ''} />
              <button 
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                Accept Invitation
              </button>
            </form>
            
            <button 
              onClick={manuallyAcceptInvite}
              className="mt-2 text-xs text-gray-600 underline"
            >
              Alternative: Try Manual Accept
            </button>
          </div>
        )}
      </div>
    </div>
  )
}