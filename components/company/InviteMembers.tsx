// components/company/InviteMembers.tsx
'use client';

import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Info } from 'lucide-react';

interface InviteMembersProps {
  companyId: string;
  userRole: string;
  onInviteSent: () => void;
}

// Role descriptions to help users understand each role
const roleDescriptions: Record<string, string> = {
  'owner': 'Full control of the company, billing, and users.',
  'admin': 'Manage company profile, users, and view analytics.',
  'hr': 'Invite users and manage regular team members.',
  'social': 'View analytics and manage social content.',
  'member': 'Basic access to company content.'
};

// Role hierarchy for comparison
const ROLE_VALUES = {
  'owner': 5,
  'admin': 4,
  'hr': 3,
  'social': 2,
  'member': 1
};

export function InviteMembers({ companyId, userRole, onInviteSent }: InviteMembersProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get the available roles based on the user's role
  const availableRoles = getAvailableRoles(userRole);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setErrors({});
      
      const result = await sendInvitation(companyId, email, role, message);
      
      if (result.success) {
        // Reset form and close dialog
        setEmail('');
        setRole('member');
        setMessage('');
        setOpen(false);
        
        // Call the callback to refresh the invitations list
        if (onInviteSent) {
          onInviteSent();
        }
      } else {
        setErrors({ submit: result.error || 'Failed to send invitation' });
      }
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      setErrors({ submit: error.message || 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  }

  // Helper function to validate email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Helper function to validate the form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!role) {
      newErrors.role = 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to get available roles based on user's role
  function getAvailableRoles(currentUserRole: string): string[] {
    // Role hierarchy: owner > admin > hr > social > member
    return Object.keys(ROLE_VALUES).filter(role => 
      // Users can only assign roles below their level
      ROLE_VALUES[role] < ROLE_VALUES[currentUserRole]
    );
  }

  // Function to send invitation
// Modified sendInvitation function in InviteMembers component

async function sendInvitation(
  companyId: string,
  email: string,
  role: string,
  message?: string
): Promise<{ success: boolean; invitation?: any; error?: string }> {
  try {
    // Call our server-side API endpoint instead of direct Supabase access
    const response = await fetch(`/api/companies/${companyId}/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, role, message }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error };
    }
    
    return { success: true, invitation: result.invitation };
  } catch (error: any) {
    console.error('Error sending invitation:', error);
    return { success: false, error: 'Failed to send invitation' };
  }
}
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <UserPlus size={16} />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your company. They'll receive an email with a link to accept.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role" className={errors.role ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((r) => (
                  <SelectItem key={r} value={r} className="capitalize">
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role}</p>
            )}
            
            {/* Show description of selected role */}
            <p className="text-sm text-muted-foreground mt-1 flex items-start gap-1">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{roleDescriptions[role] || ''}</span>
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Personal message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal note to your invitation"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none"
            />
          </div>
          
          {errors.submit && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {errors.submit}
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}