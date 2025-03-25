// components/company/ChangeUserRole.tsx
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
import { AlertCircle, UserCog } from 'lucide-react';

interface ChangeUserRoleProps {
  userId: string;
  companyId: string;
  currentRole: string;
  userFullName: string;
  userRole: string;
  onRoleChanged: () => void;
}

// Role hierarchy for comparison
const ROLE_VALUES = {
  'owner': 5,
  'admin': 4,
  'hr': 3,
  'social': 2,
  'member': 1
};

// Role descriptions
const roleDescriptions: Record<string, string> = {
  'owner': 'Full control of the company, billing, and users.',
  'admin': 'Manage company profile, users, and view analytics.',
  'hr': 'Invite users and manage regular team members.',
  'social': 'View analytics and manage social content.',
  'member': 'Basic access to company content.'
};

export function ChangeUserRole({ 
  userId, 
  companyId, 
  currentRole,
  userFullName,
  userRole,
  onRoleChanged 
}: ChangeUserRoleProps) {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get available roles based on user's role
  const availableRoles = Object.keys(ROLE_VALUES).filter(role => {
    // If user is owner, they can assign any role
    if (userRole === 'owner') return true;
    
    // Otherwise users can only assign roles below their level
    return ROLE_VALUES[role as keyof typeof ROLE_VALUES] < ROLE_VALUES[userRole as keyof typeof ROLE_VALUES];
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRole === currentRole) {
      setOpen(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/companies/${companyId}/members/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: selectedRole }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update role');
      }
      
      setOpen(false);
      onRoleChanged();
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Determine if this user's role can be changed
  const canChangeRole = userRole === 'owner' || 
    (ROLE_VALUES[userRole as keyof typeof ROLE_VALUES] > ROLE_VALUES[currentRole as keyof typeof ROLE_VALUES]);
  
  if (!canChangeRole) return null;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          title="Change Role"
        >
          <UserCog size={16} className="text-muted-foreground" />
          <span className="sr-only">Change role</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Change role for {userFullName || `User ${userId.substring(0, 8)}`}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Role</label>
            <div className="px-3 py-2 rounded-md bg-muted text-sm capitalize">
              {currentRole}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">New Role</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role} className="capitalize">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRole && (
              <p className="text-xs text-muted-foreground mt-1">
                {roleDescriptions[selectedRole]}
              </p>
            )}
          </div>
          
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
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
            <Button type="submit" disabled={loading || selectedRole === currentRole}>
              {loading ? 'Updating...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}