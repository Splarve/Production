// app/dashboard/company/[handle]/roles/create/page.tsx
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CompanyLayout } from '@/components/dashboard/company-layout';
import { RoleForm } from '@/components/roles/RoleForm';

export default async function CreateRolePage({ params }: { params: { handle: string } }) {
  const { handle } = params;
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect('/login/company');
  }
  
  // Check user type
  const { data: userType } = await supabase
    .from('user_types')
    .select('user_type')
    .eq('id', user.id)
    .single();
  
  if (!userType || userType.user_type !== 'company') {
    return redirect('/login/personal?error=You+need+a+company+account+to+access+this+page');
  }
  
  // Get company by handle
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('handle', handle)
    .single();
  
  if (!company || companyError) {
    return notFound();
  }
  
  // Check if user is a member of this company
  const { data: membership, error: membershipError } = await supabase
    .from('company_members')
    .select('role_id')
    .eq('company_id', company.id)
    .eq('user_id', user.id)
    .single();
  
  if (!membership || membershipError) {
    return redirect('/dashboard/company?error=You+do+not+have+access+to+this+company');
  }
  
  // Check if user has permission to manage roles
  const { data: canManageRoles } = await supabase.rpc(
    'user_has_permission',
    {
      user_id: user.id,
      company_id: company.id,
      required_permission: 'manage_roles'
    }
  );
  
  if (!canManageRoles) {
    return redirect(`/dashboard/company/${handle}/roles?error=You+do+not+have+permission+to+manage+roles`);
  }
  
  // Get the current path for sidebar active state
  const currentPath = `/dashboard/company/${handle}/roles`;
  
  // Get all system permissions for the form
  const { data: systemPermissions } = await supabase
    .from('system_permissions')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });
  
  // Group permissions by category
  const groupedPermissions = systemPermissions?.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, any[]>) || {};
  
  return (
    <CompanyLayout handle={handle} currentPath={currentPath}>
      <div className="container mx-auto py-8 px-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6 text-[#4b0076] hover:bg-[#c9a0ff]/10 hover:text-[#8f00ff]" 
          asChild
        >
          <Link href={`/dashboard/company/${handle}/roles`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Roles
          </Link>
        </Button>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#4b0076]">Create New Role</h1>
          <p className="text-muted-foreground">Create a new role with custom permissions for {company.name}</p>
        </div>
        
        <RoleForm 
          companyId={company.id} 
          companyHandle={handle}
          groupedPermissions={groupedPermissions}
        />
      </div>
    </CompanyLayout>
  );
}