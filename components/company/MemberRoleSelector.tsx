'use client';
// components/company/MemberRoleSelector.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Check, ChevronsUpDown } from 'lucide-react';
import { toast } from "sonner";

type Role = {
  id: string;
  name: string;
  color: string | null;
  position: number;
  isDefaultRole: boolean;
};

type MemberRoleSelectorProps = {
  userId: string;
  companyId: string;
  companyHandle: string; // Add company handle
  currentRoleId: string;
  roles: Role[];
  isSelf: boolean;
  disabled?: boolean;
  onRoleChange?: (roleId: string, roleName: string) => void;
};

export const MemberRoleSelector = ({
  userId,
  companyId,
  companyHandle,
  currentRoleId,
  roles,
  isSelf,
  disabled = false,
  onRoleChange
}: MemberRoleSelectorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Find the current role
  const currentRole = roles.find(role => role.id === currentRoleId);
  
  // Handle role change
  const handleRoleChange = async (roleId: string) => {
    // Skip if selecting the current role
    if (roleId === currentRoleId) return;
    
    setIsLoading(true);
    
    try {
      // Use company handle instead of ID
      const response = await fetch(`/api/companies/${companyHandle}/members/${userId}/role-id`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roleId }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || 'Role updated successfully');
        
        // Call the callback if provided
        if (onRoleChange) {
          onRoleChange(roleId, data.roleName || roles.find(r => r.id === roleId)?.name || 'Unknown');
        }
      } else {
        toast.error(data.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`w-32 justify-between ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={disabled || isLoading}
        >
          <span 
            className="truncate"
            style={{ 
              color: currentRole?.color || undefined 
            }}
          >
            {currentRole?.name || 'Unknown'}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {roles
          .sort((a, b) => b.position - a.position) // Sort by position (higher first)
          .map((role) => (
            <DropdownMenuItem
              key={role.id}
              className={`flex items-center justify-between ${
                role.id === currentRoleId ? 'bg-accent' : ''
              }`}
              onClick={() => handleRoleChange(role.id)}
              disabled={disabled || isLoading || (isSelf && role.name === 'Owner')}
            >
              <span
                className="truncate"
                style={{ 
                  color: role.color || undefined 
                }}
              >
                {role.name}
              </span>
              {role.id === currentRoleId && (
                <Check className="h-4 w-4 ml-2" />
              )}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};