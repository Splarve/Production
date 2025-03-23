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
import { sendInvitation } from '@/utils/invitations';
import { UserPlus } from 'lucide-react';
import { z } from 'zod';

interface InviteMembersProps {
  companyId: string;
  userRole: string;
  onInviteSent: () => void;
}

const roleDescriptions: Record<string, string> = {
  'owner': 'Full control of the company, billing, and users.',
  'admin': 'Manage company profile, users, and view analytics.',
  'hr': 'Invite users and manage regular team members.',
  'social': 'View analytics and manage social content.',
  'member': 'Basic access to company content.'
};

// Create schema for form validation
const invitationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['owner', 'admin', 'hr', 'social', 'member']),
  message: z.string().optional()
});

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
    setErrors({});

    try {
      // Validate form data
      const data = { email, role, message };
      invitationSchema.parse(data);
      
      setLoading(true);
      const result = await sendInvitation(companyId, email, role, message);
      
      if (result.success) {
        // Reset form and close dialog
        setEmail('');
        setRole('member');
        setMessage('');
        setOpen(false);
        onInviteSent();
      } else {
        setErrors({ submit: result.error || 'Failed to send invitation' });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path.length > 0) {
            formattedErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(formattedErrors);
      } else {
        setErrors({ submit: 'An unexpected error occurred' });
      }
    } finally {
      setLoading(false);
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
            <p className="text-sm text-muted-foreground mt-1">
              {roleDescriptions[role] || ''}
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

// Helper function to determine which roles a user can assign based on their own role
function getAvailableRoles(userRole: string): string[] {
  // Role hierarchy: owner > admin > hr > social > member
  const roleValues: Record<string, number> = {
    'owner': 5,
    'admin': 4,
    'hr': 3,
    'social': 2,
    'member': 1
  };

  const currentRoleValue = roleValues[userRole] || 0;
  
  // Users can only assign roles below their level
  return Object.keys(roleValues).filter(role => 
    roleValues[role] < currentRoleValue
  );
}