// utils/auth/email.ts

/**
 * Sends an invitation email to join a company
 * @param inviterName Name of the person inviting
 * @param companyName Name of the company
 * @param recipientEmail Email of the invitee
 * @param token Secure invitation token
 * @param role Role being offered in the company
 * @returns Promise with success status and error if any
 */
export async function sendCompanyInvitation(
    inviterName: string,
    companyName: string,
    recipientEmail: string,
    token: string,
    role: string
  ): Promise<{ success: boolean; error?: any }> {
    try {
      // Verify SendGrid API key is set
      if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SendGrid API key not configured')
      }
      
      // Build invitation URL
      const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/accept_invite?token=${token}`
      
      // Import SendGrid following their pattern
      const sgMail = require('@sendgrid/mail')
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      
      // Create email message following SendGrid example format
      const msg = {
        to: recipientEmail,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
        subject: `${inviterName} invited you to join ${companyName} on Splarve`,
        text: `Hello,
        
  ${inviterName} has invited you to join ${companyName} on Splarve as a ${role}.
  
  To accept this invitation, please visit:
  ${inviteUrl}
  
  This invitation will expire in 7 days.
  
  If you didn't expect this invitation, you can safely ignore this email.
  
  Best regards,
  The Splarve Team`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #ffa857; padding: 20px; text-align: center; color: white;">
      <h1>You're invited to join ${companyName}</h1>
    </div>
    <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
      <p>Hello,</p>
      <p><strong>${inviterName}</strong> has invited you to join <strong>${companyName}</strong> on Splarve as a <strong>${role}</strong>.</p>
      <p>Click the button below to accept this invitation and set up your account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${inviteUrl}" style="background-color: #fa5b3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Accept Invitation
        </a>
      </div>
      <p>This invitation will expire in 7 days.</p>
      <p>If you didn't expect this invitation, you can safely ignore this email.</p>
    </div>
    <div style="padding: 10px; text-align: center; color: #666; font-size: 12px;">
      <p>&copy; ${new Date().getFullYear()} Splarve. All rights reserved.</p>
    </div>
  </div>`
      }
      
      // Send email using SendGrid's example approach
      await sgMail.send(msg)
        .then(() => {
          console.log(`Invitation email sent to ${recipientEmail}`)
        })
        .catch((error: any) => {
          console.error('Error sending invitation email:', error)
          throw error
        })
      
      return { success: true }
    } catch (error: any) {
      console.error('Error sending invitation email:', error)
      return { success: false, error }
    }
  }
  
  /**
   * Sends a welcome email to a new user
   * @param userName Name of the user
   * @param userEmail Email of the user
   * @param accountType Type of account created (personal or company)
   * @returns Promise with success status and error if any
   */
  export async function sendWelcomeEmail(
    userName: string,
    userEmail: string,
    accountType: 'personal' | 'company'
  ): Promise<{ success: boolean; error?: any }> {
    try {
      // Verify SendGrid API key is set
      if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SendGrid API key not configured')
      }
      
      // Dashboard URL based on account type
      const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/${accountType}`
      
      // Personalized message based on account type
      const typeSpecificMessage = accountType === 'personal'
        ? 'start your job search and discover opportunities that match your skills and interests'
        : 'build your employer brand and find the best talent for your team'
      
      // Import SendGrid
      const sgMail = require('@sendgrid/mail')
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      
      // Create email message
      const msg = {
        to: userEmail,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
        subject: `Welcome to Splarve, ${userName}!`,
        text: `Hello ${userName},
        
  Welcome to Splarve! We're excited to have you join our platform.
  
  You've successfully created a ${accountType} account. You can now ${typeSpecificMessage}.
  
  Visit your dashboard to get started: ${dashboardUrl}
  
  If you have any questions, please don't hesitate to contact our support team.
  
  Best regards,
  The Splarve Team`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #ffa857; padding: 20px; text-align: center; color: white;">
      <h1>Welcome to Splarve!</h1>
    </div>
    <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
      <p>Hello ${userName},</p>
      <p>Welcome to Splarve! We're excited to have you join our platform.</p>
      <p>You've successfully created a <strong>${accountType}</strong> account. You can now ${typeSpecificMessage}.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}" style="background-color: #fa5b3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Go to Dashboard
        </a>
      </div>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
    </div>
    <div style="padding: 10px; text-align: center; color: #666; font-size: 12px;">
      <p>&copy; ${new Date().getFullYear()} Splarve. All rights reserved.</p>
    </div>
  </div>`
      }
      
      // Send the email
      await sgMail.send(msg)
        .then(() => {
          console.log(`Welcome email sent to ${userEmail}`)
        })
        .catch((error: any) => {
          console.error('Error sending welcome email:', error)
          throw error
        })
      
      return { success: true }
    } catch (error: any) {
      console.error('Error sending welcome email:', error)
      return { success: false, error }
    }
  }