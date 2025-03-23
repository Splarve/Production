// app/dashboard/company/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, PlusCircle } from 'lucide-react';

export default async function CompanyDashboard() {
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
  
  // Fetch companies this user belongs to
  const { data: userCompanies } = await supabase
    .from('company_members')
    .select(`
      company_id,
      role,
      companies:company_id (
        id,
        name,
        handle,
        logo_url
      )
    `)
    .eq('user_id', user.id);
    
  const hasCompanies = userCompanies && userCompanies.length > 0;
  
  // Extracted name from user metadata
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Company Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {userName}</p>
        </div>
        <form action="/auth/signout" method="post" className="mt-2 md:mt-0">
          <Button type="submit" variant="outline" size="sm">
            Sign Out
          </Button>
        </form>
      </div>
      
      {!hasCompanies ? (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                You don&apos;t have any companies yet. Create one or wait for an invitation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/dashboard/company/create">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create a Company
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userCompanies.map((companyMember) => (
            <Card key={companyMember.company_id}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {companyMember.companies?.logo_url ? (
                      <img 
                        src={companyMember.companies.logo_url}
                        alt={companyMember.companies.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <Building className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <CardTitle>{companyMember.companies?.name}</CardTitle>
                    <CardDescription>
                      @{companyMember.companies?.handle} • Role: {companyMember.role}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/company/${companyMember.companies?.handle}`}>
                      Manage Company
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Card className="border-dashed border-2 border-primary/20 bg-transparent shadow-none">
            <CardHeader className="pb-3">
              <CardTitle>Add New Company</CardTitle>
              <CardDescription>Create a new company or organization</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/dashboard/company/create">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Create Company
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}