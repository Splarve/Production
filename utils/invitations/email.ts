// utils/invitations/email.ts

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
export async function sendInvitationEmail(params: InvitationEmailParams): Promise<{ success: boolean; error?: any }> {
  try {
    // Make a request to our server-side API
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'invitation',
        data: params
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Error sending invitation email:', result.error);
      return { success: false, error: result.error };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error sending invitation email:', error);
    return { success: false, error };
  }
}