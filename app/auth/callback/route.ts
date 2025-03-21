// app/auth/callback/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendWelcomeEmail } from '@/utils/auth/email'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  // Get the account type from the query parameter
  const type = requestUrl.searchParams.get('type') || 'personal'
  // Check if there's an invitation token in the query
  const inviteToken = requestUrl.searchParams.get('invite_token')
  
  if (!code) {
    return NextResponse.redirect(
      new URL('/error?message=Authorization+code+not+found', request.url)
    )
  }
  
  try {
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (sessionError) {
      console.error('Session exchange error:', sessionError)
      return NextResponse.redirect(
        new URL(`/error?message=${encodeURIComponent(sessionError.message)}`, request.url)
      )
    }
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('User fetch error:', userError)
      return NextResponse.redirect(
        new URL('/error?message=Failed+to+get+user+information', request.url)
      )
    }
    
    // Extract name from user metadata for email
    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    
    // Check if the user already has a type
    const { data: userType } = await supabase.rpc('get_user_type', {
      user_id: user.id
    })
    
    // If the user already has a type
    if (userType) {
      // If trying to sign in with wrong account type
      if (userType !== type && !inviteToken) {
        // Sign out and redirect with error
        await supabase.auth.signOut()
        
        const correctPath = userType === 'personal' ? 'personal' : 'company'
        const errorMessage = `You already have a ${userType} account. Please use the ${userType} login.`
        
        return NextResponse.redirect(
          new URL(`/login/${correctPath}?error=${encodeURIComponent(errorMessage)}`, request.url)
        )
      }
      
      // If there's an invitation token, try to accept it explicitly
      if (inviteToken) {
        await supabase.rpc('accept_company_invitation', {
          invite_token: inviteToken
        })
      }
      
      // Check for and process pending invitations for this user's email
      const processingResult = await processPendingInvitations(supabase, user.id, user.email || '')
      
      // If invitations were processed, redirect to company dashboard
      if (processingResult.processed) {
        return NextResponse.redirect(
          new URL('/dashboard/company?message=Invitation+accepted', request.url)
        )
      }
      
      // User exists with correct type
      if (type === 'company') {
        // Check if they have a company
        const { data: companyMember } = await supabase
          .from('company_members')
          .select('company_id')
          .eq('user_id', user.id)
          .maybeSingle()
        
        if (companyMember) {
          // Has company, go to dashboard
          return NextResponse.redirect(new URL('/dashboard/company', request.url))
        } else {
          // No company yet, go to onboarding
          return NextResponse.redirect(new URL('/onboarding/company', request.url))
        }
      } else {
        // Personal user, go to dashboard
        return NextResponse.redirect(new URL('/dashboard/personal', request.url))
      }
    } else {
      // New user - set the user type
      const { error: typeError } = await supabase.rpc('set_user_type', {
        user_id: user.id,
        account_type: type
      })
      
      if (typeError) {
        console.error('Error setting user type:', typeError)
        return NextResponse.redirect(
          new URL('/error?message=Failed+to+set+user+type', request.url)
        )
      }
      
      // If there's an invitation token, try to accept it explicitly
      if (inviteToken) {
        await supabase.rpc('accept_company_invitation', {
          invite_token: inviteToken
        })
      }
      
      // Check for and process pending invitations for this user's email
      const processingResult = await processPendingInvitations(supabase, user.id, user.email || '')
      
      // If invitations were processed, redirect to company dashboard
      // Also update user type to company if needed
      if (processingResult.processed) {
        // Update user type to company if needed
        if (type === 'personal') {
          await supabase
            .from('user_types')
            .update({ user_type: 'company' })
            .eq('id', user.id)
        }
        
        // Send welcome email - with company type since they're joining a company
        await sendWelcomeEmail(userName, user.email || '', 'company')
        
        return NextResponse.redirect(
          new URL('/dashboard/company?message=Invitation+accepted', request.url)
        )
      }
      
      // Send welcome email
      await sendWelcomeEmail(userName, user.email || '', type as 'personal' | 'company')
      
      // Redirect based on account type
      if (type === 'company') {
        return NextResponse.redirect(new URL('/onboarding/company', request.url))
      } else {
        return NextResponse.redirect(new URL('/dashboard/personal', request.url))
      }
    }
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/error?message=Authentication+process+failed', request.url)
    )
  }
}

/**
 * Process any pending invitations for a user, including pre-accepted ones
 */
async function processPendingInvitations(supabase: any, userId: string, email: string): Promise<{ processed: boolean }> {
  try {
    // Find any pending invitations for this email
    // Include pre-accepted invitations even if expired
    const { data: invitations, error: inviteError } = await supabase
      .from('company_invitations')
      .select('*')
      .eq('email', email)
      .or(`expires_at.gte.now(),pre_accepted.eq.true`)
    
    if (inviteError) {
      console.error('Error fetching invitations:', inviteError)
      return { processed: false }
    }
    
    if (!invitations || invitations.length === 0) {
      // No pending invitations
      return { processed: false }
    }
    
    console.log(`Processing ${invitations.length} pending invitations for ${email}`)
    let success = false
    
    // Process each invitation
    for (const invitation of invitations) {
      try {
        // Add the user to the company
        // Ensure we're using the correct company_id variable
        const companyId = invitation.company_id;
        const { error: memberError } = await supabase
          .from('company_members')
          .insert({
            company_id: companyId,
            user_id: userId,
            role: invitation.role,
            invited_by: invitation.invited_by,
            invited_at: invitation.created_at,
            joined_at: new Date().toISOString()
          })
        
        if (memberError) {
          if (memberError.code === '23505') {
            // Unique constraint violation - user is already a member
            // Still consider this successful for our purpose
            success = true
          } else {
            console.error('Error adding member:', memberError)
            continue
          }
        } else {
          success = true
        }
        
        // Delete the invitation
        const { error: deleteError } = await supabase
          .from('company_invitations')
          .delete()
          .eq('id', invitation.id)
        
        if (deleteError) {
          console.error('Error deleting invitation:', deleteError)
        }
        
        console.log(`Processed invitation for ${email} to company ${invitation.company_id}`)
      } catch (err) {
        console.error('Error processing invitation:', err)
      }
    }
    
    return { processed: success }
  } catch (error) {
    console.error('Error in processPendingInvitations:', error)
    return { processed: false }
  }
}