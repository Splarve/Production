// app/dashboard/company/[handle]/jobs/page.tsx
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { JobPostsList } from '@/components/job-posts/JobPostsList';

export default async function CompanyJobsPage({ params }: { params: { handle: string } }) {
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
    .select('role')
    .eq('company_id', company.id)
    .eq('user_id', user.id)
    .single();
  
  if (!membership || membershipError) {
    return redirect('/dashboard/company?error=You+do+not+have+access+to+this+company');
  }
  
  // Check if user has permission to create job posts
  const { data: canCreateJobPost } = await supabase.rpc(
    'user_has_permission',
    {
      user_id: user.id,
      company_id: company.id,
      required_permission: 'create_job_post'
    }
  );
  
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
          <h1 className="text-2xl font-bold">{company.name} Jobs</h1>
          <p className="text-muted-foreground">Manage job postings for your company</p>
        </div>
        
        {canCreateJobPost && (
          <Button asChild className="mt-4 md:mt-0">
            <Link href={`/dashboard/company/${handle}/jobs/create`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Job Post
            </Link>
          </Button>
        )}
      </div>
      
      <JobPostsList companyId={company.id} userRole={membership.role} />
    </div>
  );
}