'use client';
// components/roles/RoleForm.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

type SystemPermission = {
  id: number;
  name: string;
  description: string;
  category: string;
  created_at: string;
};

type Role = {
  id: string;
  name: string;
  color: string | null;
  position: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

type RoleFormProps = {
  companyId: string;
  companyHandle: string;
  groupedPermissions: Record<string, SystemPermission[]>;
  role?: Role;
  currentPermissions?: Record<string, boolean>;
};

export const RoleForm = ({ 
  companyId, 
  companyHandle,
  groupedPermissions,
  role,
  currentPermissions = {}
}: RoleFormProps) => {
  const [roleName, setRoleName] = useState(role?.name || '');
  const [roleColor, setRoleColor] = useState(role?.color || '#8f00ff');
  const [permissions, setPermissions] = useState<Record<string, boolean>>(currentPermissions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState('');
  
  const router = useRouter();
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!roleName.trim()) {
      setNameError('Role name is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Determine if we're creating or updating
      const isEditing = !!role;
      const url = isEditing 
        ? `/api/companies/${companyId}/roles/${role.id}`
        : `/api/companies/${companyId}/roles`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      // Only include name and color if we're creating or if the role is not a default role
      const requestBody: any = {
        permissions
      };
      
      if (!isEditing || !role.is_default) {
        requestBody.name = roleName;
        requestBody.color = roleColor;
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(isEditing 
          ? 'Role updated successfully' 
          : 'New role created successfully');
        
        // Redirect to roles list
        router.push(`/dashboard/company/${companyHandle}/roles`);
        router.refresh();
      } else {
        toast.error(data.error || 'Failed to save role');
      }
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle permission toggle
  const togglePermission = (permission: string, enabled: boolean) => {
    setPermissions({
      ...permissions,
      [permission]: enabled,
    });
  };
  
  // Toggle all permissions in a category
  const toggleCategory = (category: string, enabled: boolean) => {
    const newPermissions = { ...permissions };
    
    // Update all permissions in this category
    groupedPermissions[category].forEach(permission => {
      newPermissions[permission.name] = enabled;
    });
    
    setPermissions(newPermissions);
  };
  
  // Check if all permissions in a category are enabled
  const isCategoryFullyEnabled = (category: string) => {
    return groupedPermissions[category].every(
      permission => permissions[permission.name] === true
    );
  };
  
  // Check if some (but not all) permissions in a category are enabled
  const isCategoryPartiallyEnabled = (category: string) => {
    const categoryPermissions = groupedPermissions[category];
    const enabledCount = categoryPermissions.filter(
      permission => permissions[permission.name] === true
    ).length;
    
    return enabledCount > 0 && enabledCount < categoryPermissions.length;
  };
  
  // Initialize permissions if we're in create mode
  useEffect(() => {
    if (!role && Object.keys(permissions).length === 0) {
      const initialPermissions: Record<string, boolean> = {};
      
      // Set all permissions to false by default
      Object.values(groupedPermissions).flat().forEach(permission => {
        initialPermissions[permission.name] = false;
      });
      
      setPermissions(initialPermissions);
    }
  }, [groupedPermissions, permissions, role]);
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card className="border-[#c9a0ff]/30">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  value={roleName}
                  onChange={(e) => {
                    setRoleName(e.target.value);
                    setNameError('');
                  }}
                  placeholder="Enter role name"
                  className={nameError ? 'border-red-500' : ''}
                  disabled={role?.is_default}
                />
                {nameError && (
                  <p className="text-red-500 text-sm mt-1">{nameError}</p>
                )}
                {role?.is_default && (
                  <p className="text-muted-foreground text-sm mt-1">
                    Default role names cannot be changed
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="role-color">Role Color (optional)</Label>
                <div className="flex items-center gap-3">
                  <div 
                    className="h-10 w-10 rounded-md border"
                    style={{ backgroundColor: roleColor || '#8f00ff' }}
                  />
                  <Input
                    id="role-color"
                    type="color"
                    value={roleColor || '#8f00ff'}
                    onChange={(e) => setRoleColor(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#4b0076]">Permissions</h2>
          <p className="text-muted-foreground">
            Define what members with this role can do
          </p>
          
          <Accordion type="multiple" className="w-full">
            {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="hover:text-[#8f00ff]">
                  <div className="flex items-center">
                    <div className="mr-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={isCategoryFullyEnabled(category)}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategory(
                            category, 
                            !isCategoryFullyEnabled(category)
                          );
                        }}
                        className={isCategoryPartiallyEnabled(category) ? 'opacity-70' : ''}
                      />
                    </div>
                    <Label
                      htmlFor={`category-${category}`}
                      className="font-medium cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {category}
                    </Label>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 ml-6 mt-2">
                    {categoryPermissions.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-2">
                        <Checkbox 
                          id={`permission-${permission.name}`}
                          checked={permissions[permission.name] || false}
                          onCheckedChange={(checked) => 
                            togglePermission(permission.name, checked === true)
                          }
                        />
                        <div className="grid gap-1.5">
                          <Label
                            htmlFor={`permission-${permission.name}`}
                            className="font-medium cursor-pointer"
                          >
                            {permission.name.replace(/_/g, ' ')}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/company/${companyHandle}/roles`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#8f00ff] hover:bg-[#4b0076]"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? (role ? 'Updating...' : 'Creating...')
              : (role ? 'Update Role' : 'Create Role')
            }
          </Button>
        </div>
      </div>
    </form>
  );
};