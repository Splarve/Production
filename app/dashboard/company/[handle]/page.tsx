// app/dashboard/company/[handle]/page.tsx
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Building, Users, Edit, Settings, Briefcase } from 'lucide-react';
import { CompanyLayout } from '@/components/dashboard/company-layout';

interface CompanyPageProps {
  params: Promise<{ handle: string }>;
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  // Await the params object to get the handle
  const { handle } = await params;
  
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
  
  const isOwnerOrAdmin = membership.role === 'owner' || membership.role === 'admin';
  
  // Check if user has permission to manage members
  const { data: canManageMembers } = await supabase.rpc(
    'user_has_permission',
    {
      user_id: user.id,
      company_id: company.id,
      required_permission: 'invite_users'
    }
  );
  
  // Get the current path for sidebar active state
  const currentPath = `/dashboard/company/${handle}`;

  // Wrap the existing content with the CompanyLayout
  return (
    <CompanyLayout handle={handle} currentPath={currentPath}>
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              {company.logo_url ? (
                <img 
                  src={company.logo_url}
                  alt={company.name}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <Building className="h-8 w-8 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{company.name}</h1>
              <p className="text-muted-foreground">@{company.handle} • Your role: {membership.role}</p>
            </div>
          </div>
          
          {isOwnerOrAdmin && (
            <div className="mt-4 md:mt-0 flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/company/${company.handle}/settings`}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/company/${company.handle}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          )}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              {company.description ? (
                <p className="mb-4">{company.description}</p>
              ) : (
                <p className="text-muted-foreground italic mb-4">No description provided</p>
              )}
              
              {company.website && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Website:</span>
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Job Posts</CardTitle>
              <CardDescription>
                Manage and create job postings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Create job postings and manage applications.</p>
                
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/company/${company.handle}/jobs`}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    Manage Jobs
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage your company team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>View and manage your company team members and invitations.</p>
                
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/company/${company.handle}/members`}>
                    <Users className="mr-2 h-4 w-4" />
                    {canManageMembers ? 'Manage Team Members' : 'View Team Members'}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CompanyLayout>
  );
}