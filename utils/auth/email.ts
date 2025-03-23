// utils/auth/email.ts
import sgMail from '@sendgrid/mail';

/**
 * Sends a welcome email to a new user
 */
export async function sendWelcomeEmail(
  userName: string,
  userEmail: string,
  accountType: 'personal' | 'company'
): Promise<{ success: boolean; error?: any }> {
  try {
    // Verify SendGrid API key is set
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured, skipping welcome email');
      return { success: false, error: 'API key not configured' };
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    // Dashboard URL based on account type
    const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/${accountType}`;
    
    // Personalized message based on account type
    const typeSpecificMessage = accountType === 'personal'
      ? 'start your job search and discover opportunities that match your skills and interests'
      : 'build your employer brand and find the best talent for your team';
    
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
    };
    
    // Send the email
    await sgMail.send(msg);
    console.log(`Welcome email sent to ${userEmail}`);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}