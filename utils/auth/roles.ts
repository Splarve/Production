// utils/auth/roles.ts
import { createClient } from '@/utils/supabase/client'

export type CompanyRole = 'owner' | 'admin' | 'hr' | 'social' | 'member'

export async function getUserRoleInCompany(companyId: number): Promise<CompanyRole | null> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data, error } = await supabase
    .from('company_members')
    .select('role')
    .eq('company_id', companyId)
    .eq('user_id', user.id)
    .single()
  
  if (error) {
    console.error('Error fetching user role:', error)
    return null
  }
  
  return data?.role as CompanyRole || null
}

export async function hasPermission(companyId: number, permission: string): Promise<boolean> {
  const supabase = createClient()
  
  const { data, error } = await supabase.rpc('authorize_company', {
    requested_permission: permission,
    company_id: companyId,
    user_id: (await supabase.auth.getUser()).data.user?.id
  })
  
  if (error) {
    console.error('Error checking permission:', error)
    return false
  }
  
  return !!data
}

// Can the current user assign this role to someone else
export function canAssignRole(inviterRole: CompanyRole, roleToAssign: CompanyRole): boolean {
  // Role hierarchy: owner > admin > hr > social > member
  const roleValues = {
    'owner': 5,
    'admin': 4,
    'hr': 3,
    'social': 2,
    'member': 1
  }
  
  // Users can only assign roles below their level
  return roleValues[inviterRole] > roleValues[roleToAssign]
}