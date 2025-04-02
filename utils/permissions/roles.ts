// utils/permissions/roles.ts
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/utils/supabase/types';

// Types for role and permissions
export type Role = {
  id: string;
  name: string;
  color: string | null;
  position: number;
  is_default: boolean;
};

export type Permission = {
  id: number;
  name: string;
  description: string;
  category: string;
};

export type RoleWithPermissions = Role & {
  permissions: Record<string, boolean>;
};

/**
 * Get all company roles with permissions
 */
export async function getCompanyRoles(companyHandle: string): Promise<RoleWithPermissions[]> {
  try {
    const response = await fetch(`/api/companies/${companyHandle}/roles`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch roles');
    }
    
    const data = await response.json();
    return data.roles || [];
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
}

/**
 * Get a single role by ID
 */
export async function getRoleById(companyHandle: string, roleId: string): Promise<RoleWithPermissions | null> {
  try {
    const response = await fetch(`/api/companies/${companyHandle}/roles/${roleId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch role');
    }
    
    const data = await response.json();
    return data.role || null;
  } catch (error) {
    console.error('Error fetching role:', error);
    return null;
  }
}

/**
 * Get all system permissions
 */
export async function getSystemPermissions(companyHandle: string): Promise<Record<string, Permission[]>> {
  try {
    const response = await fetch(`/api/companies/${companyHandle}/system-permissions`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch permissions');
    }
    
    const data = await response.json();
    return data.permissions || {};
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return {};
  }
}

/**
 * Create a new role
 */
export async function createRole(
  companyHandle: string, 
  data: { 
    name: string; 
    color?: string; 
    permissions: Record<string, boolean>;
  }
): Promise<{ success: boolean; roleId?: string; error?: string }> {
  try {
    const response = await fetch(`/api/companies/${companyHandle}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error };
    }
    
    return { success: true, roleId: result.roleId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update a role
 */
export async function updateRole(
  companyHandle: string,
  roleId: string,
  data: {
    name?: string;
    color?: string;
    permissions?: Record<string, boolean>;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/companies/${companyHandle}/roles/${roleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error };
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a role
 */
export async function deleteRole(
  companyHandle: string,
  roleId: string,
  transferToRoleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/companies/${companyHandle}/roles/${roleId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transferToRoleId }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error };
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get current user's permissions for a company
 */
export async function getUserPermissions(companyHandle: string): Promise<Record<string, boolean>> {
  try {
    const response = await fetch(`/api/companies/${companyHandle}/user-permissions`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch permissions');
    }
    
    const data = await response.json();
    return data.permissions || {};
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return {};
  }
}

/**
 * Check if current user has a specific permission
 */
export async function hasPermission(companyHandle: string, permission: string): Promise<boolean> {
  try {
    const permissions = await getUserPermissions(companyHandle);
    return !!permissions[permission];
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}