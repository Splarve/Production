// app/dashboard/company/[handle]/members/page.tsx
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ManageTeamMembers } from '@/components/company/ManageTeamMembers';
import { CompanyInvitations } from '@/components/company/CompanyInvitations';

export default async function CompanyMembersPage({ params }: { params: { handle: Promise<string> } }) {
  // Await the params.handle value
  const handle = await params.handle;
  
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
    .select('role')
    .eq('company_id', company.id)
    .eq('user_id', user.id)
    .single();
  
  if (!membership || membershipError) {
    return redirect('/dashboard/company?error=You+do+not+have+access+to+this+company');
  }
  
  // Check permissions for viewing members
  const { data: hasPermission, error: permissionError } = await supabase.rpc(
    'user_has_permission',
    {
      user_id: user.id,
      company_id: company.id,
      required_permission: 'invite_users'
    }
  );
  
  if (!hasPermission) {
    return redirect(`/dashboard/company/${handle}?error=You+do+not+have+permission+to+manage+team+members`);
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-6" 
        asChild
      >
        <Link href={`/dashboard/company/${handle}`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Company
        </Link>
      </Button>
      
      <div className="flex flex-col md:flex-row items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-muted-foreground">Manage team members and invitations</p>
        </div>
      </div>
      
      <div className="grid gap-6">
        {/* Invitations Management */}
        <CompanyInvitations 
          companyId={company.id} 
          userRole={membership.role} 
        />
        
        {/* Team Members Management */}
        <ManageTeamMembers 
          companyId={company.id} 
          userRole={membership.role}
          userId={user.id}
        />
      </div>
    </div>
  );
}