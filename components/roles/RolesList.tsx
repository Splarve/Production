'use client';
// components/roles/RolesList.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, MoreVertical, Trash, AlertCircle } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from "sonner";
import { Skeleton } from '@/components/ui/skeleton';

type RoleWithPermissions = {
  id: string;
  name: string;
  color: string | null;
  position: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  permissions: Record<string, boolean>;
};

type RolesListProps = {
  companyId: string;
  companyHandle: string;
};

export const RolesList = ({ companyId, companyHandle }: RolesListProps) => {
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState<RoleWithPermissions | null>(null);
  const [transferRoleId, setTransferRoleId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const router = useRouter();
  
  // Fetch roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(`/api/companies/${companyHandle}/roles`);
        const data = await response.json();
        
        if (response.ok) {
          setRoles(data.roles || []);
        } else {
          toast.error(data.error || 'Failed to load roles');
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast.error('An unexpected error occurred while loading roles');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRoles();
  }, [companyHandle]);
  
  // Handle role deletion
  const handleDeleteRole = async () => {
    if (!deleteRoleId || !transferRoleId) return;
    
    try {
      const response = await fetch(`/api/companies/${companyHandle}/roles/${deleteRoleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transferToRoleId: transferRoleId }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || 'Role deleted successfully');
        
        // Remove the deleted role from the state
        setRoles(roles.filter(role => role.id !== deleteRoleId));
        
        // Reset state
        setDeleteRoleId(null);
        setTransferRoleId(null);
        setTargetRole(null);
        setDeleteDialogOpen(false);
      } else {
        toast.error(data.error || 'Failed to delete role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('An unexpected error occurred while deleting the role');
    }
  };
  
  // Get role name by ID
  const getRoleName = (id: string) => {
    const role = roles.find(role => role.id === id);
    return role?.name || 'Unknown Role';
  };
  
  // Show delete confirmation dialog
  const confirmDelete = (role: RoleWithPermissions) => {
    setTargetRole(role);
    setDeleteRoleId(role.id);
    
    // Find a default role to transfer members to
    const defaultRole = roles.find(r => r.is_default && r.id !== role.id);
    if (defaultRole) {
      setTransferRoleId(defaultRole.id);
    } else if (roles.length > 1) {
      // If no default role, select the first available role that isn't being deleted
      const otherRole = roles.find(r => r.id !== role.id);
      if (otherRole) {
        setTransferRoleId(otherRole.id);
      }
    }
    
    setDeleteDialogOpen(true);
  };
  
  // Calculate enabled permissions count
  const getEnabledPermissionsCount = (permissions: Record<string, boolean>) => {
    return Object.values(permissions).filter(enabled => enabled).length;
  };
  
  // Get total permissions count
  const getTotalPermissionsCount = (permissions: Record<string, boolean>) => {
    return Object.keys(permissions).length;
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-[#c9a0ff]/30">
            <CardHeader>
              <Skeleton className="h-6 w-40 bg-gray-200" />
              <Skeleton className="h-4 w-24 bg-gray-100 mt-1" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-20 bg-gray-200" />
                <Skeleton className="h-8 w-20 bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (roles.length === 0) {
    return (
      <Card className="border-[#c9a0ff]/30">
        <CardHeader>
          <CardTitle className="text-[#4b0076]">No Custom Roles</CardTitle>
          <CardDescription>
            You haven't created any custom roles for this company yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="bg-[#8f00ff] hover:bg-[#4b0076]"
            onClick={() => router.push(`/dashboard/company/${companyHandle}/roles/create`)}
          >
            Create Your First Role
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <div className="space-y-4">
        {roles.map((role) => (
          <Card key={role.id} className="border-[#c9a0ff]/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center text-[#4b0076]">
                    {role.name}
                    {role.is_default && (
                      <Badge className="ml-2 bg-[#c9a0ff]/20 text-[#8f00ff] border-[#c9a0ff]">
                        Default
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {getEnabledPermissionsCount(role.permissions)} of {getTotalPermissionsCount(role.permissions)} permissions enabled
                  </CardDescription>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/company/${companyHandle}/roles/${role.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Role
                      </Link>
                    </DropdownMenuItem>
                    
                    {!role.is_default && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => confirmDelete(role)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Role
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="text-sm space-y-1 mb-3">
                <div className="font-medium">Key Permissions:</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(role.permissions)
                    .filter(([, enabled]) => enabled)
                    .slice(0, 5)
                    .map(([permission]) => (
                      <Badge 
                        key={permission}
                        variant="outline" 
                        className="border-[#c9a0ff]/50 text-[#8f00ff]"
                      >
                        {permission.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  
                  {getEnabledPermissionsCount(role.permissions) > 5 && (
                    <Badge 
                      variant="outline" 
                      className="border-[#c9a0ff]/50 text-[#8f00ff]"
                    >
                      +{getEnabledPermissionsCount(role.permissions) - 5} more
                    </Badge>
                  )}
                  
                  {getEnabledPermissionsCount(role.permissions) === 0 && (
                    <span className="text-muted-foreground italic">No permissions enabled</span>
                  )}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-[#c9a0ff] hover:bg-[#c9a0ff]/10 text-[#4b0076] hover:text-[#8f00ff]"
                asChild
              >
                <Link href={`/dashboard/company/${companyHandle}/roles/${role.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Permissions
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Delete Role Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <p>
                  Are you sure you want to delete the <strong>{targetRole?.name}</strong> role? 
                  This action cannot be undone.
                </p>
                
                <div className="p-3 rounded-md bg-amber-50 text-amber-700 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium">Before deleting</p>
                    <p className="text-sm">
                      You must select another role to transfer members to:
                    </p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <label className="block text-sm font-medium mb-1">
                    Transfer members to:
                  </label>
                  <Select
                    value={transferRoleId || ""}
                    onValueChange={setTransferRoleId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles
                        .filter(role => role.id !== deleteRoleId)
                        .map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name} {role.is_default ? "(Default)" : ""}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              disabled={!transferRoleId}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};