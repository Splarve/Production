// utils/invitations/email.ts
import sgMail from '@sendgrid/mail';

interface InvitationEmailParams {
  recipientEmail: string;
  inviterName: string;
  companyName: string;
  companyHandle: string;
  role: string;
  message?: string;
  invitationId: string;
}

/**
 * Sends an invitation email to join a company
 */
export async function sendInvitationEmail({
  recipientEmail,
  inviterName,
  companyName,
  companyHandle,
  role,
  message,
  invitationId
}: InvitationEmailParams): Promise<{ success: boolean; error?: any }> {
  try {
    // Verify SendGrid API key is set
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured, skipping invitation email');
      return { success: false, error: 'API key not configured' };
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    // Create invitation accept/reject URLs
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const acceptUrl = `${baseUrl}/invitations/${invitationId}/accept`;
    const rejectUrl = `${baseUrl}/invitations/${invitationId}/reject`;
    const viewCompanyUrl = `${baseUrl}/companies/${companyHandle}`;
    
    // Format the role name for display
    const roleDisplayName = role.charAt(0).toUpperCase() + role.slice(1);
    
    // Create email message
    const msg = {
      to: recipientEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
      subject: `${inviterName} invited you to join ${companyName} on Splarve`,
      text: `
Hello,

${inviterName} has invited you to join ${companyName} as a ${roleDisplayName} on Splarve.

${message ? `Message from ${inviterName}:\n${message}\n\n` : ''}

To accept this invitation, visit:
${acceptUrl}

To decline this invitation, visit:
${rejectUrl}

Learn more about ${companyName}:
${viewCompanyUrl}

If you don't have a Splarve account yet, you'll be able to create one when you accept the invitation.

This invitation will expire in 7 days.

Best regards,
The Splarve Team
      `,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #ffa857; padding: 20px; text-align: center; color: white;">
    <h1>You've Been Invited to Join ${companyName}</h1>
  </div>
  <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
    <p>Hello,</p>
    <p><strong>${inviterName}</strong> has invited you to join <strong>${companyName}</strong> as a <strong>${roleDisplayName}</strong> on Splarve.</p>
    
    ${message ? `
    <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #ffa857; margin: 20px 0;">
      <p style="margin: 0;"><em>Message from ${inviterName}:</em></p>
      <p style="margin: 10px 0 0 0;">${message}</p>
    </div>
    ` : ''}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${acceptUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; margin-right: 10px;">
        Accept Invitation
      </a>
      <a href="${rejectUrl}" style="background-color: #f44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
        Decline
      </a>
    </div>
    
    <p>If you'd like to learn more about ${companyName} first, you can <a href="${viewCompanyUrl}" style="color: #ffa857; text-decoration: none;">view their company profile</a>.</p>
    
    <p>If you don't have a Splarve account yet, you'll be able to create one when you accept the invitation.</p>
    
    <p style="color: #777; font-size: 0.9em;">This invitation will expire in 7 days.</p>
  </div>
  <div style="padding: 10px; text-align: center; color: #666; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} Splarve. All rights reserved.</p>
  </div>
</div>
      `
    };
    
    // Send the email
    await sgMail.send(msg);
    console.log(`Invitation email sent to ${recipientEmail}`);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error sending invitation email:', error);
    return { success: false, error };
  }
}