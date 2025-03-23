// utils/auth/email.ts

/**
 * Sends a welcome email to a new user
 */
export async function sendWelcomeEmail(
  userName: string,
  userEmail: string,
  accountType: 'personal' | 'company'
): Promise<{ success: boolean; error?: any }> {
  try {
    // Make a request to our server-side API
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'welcome',
        data: {
          userName,
          userEmail,
          accountType
        }
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Error sending welcome email:', result.error);
      return { success: false, error: result.error };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}