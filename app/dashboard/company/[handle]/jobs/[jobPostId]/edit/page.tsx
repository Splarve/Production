// app/dashboard/company/[handle]/jobs/[jobPostId]/edit/page.tsx
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { JobPostForm, JobPostFormData } from '@/components/job-posts/JobPostForm';
import { CompanyLayout } from '@/components/dashboard/company-layout';

export default async function EditJobPostPage({ 
  params 
}: { 
  params: { handle: string; jobPostId: string } 
}) {
  const { handle, jobPostId } = await params;
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
  
  // Get the job post
  const { data: jobPost, error: jobPostError } = await supabase
    .from('job_posts')
    .select('*')
    .eq('id', jobPostId)
    .eq('company_id', company.id)
    .single();
  
  if (!jobPost || jobPostError) {
    return notFound();
  }
  
  // Check permissions
  const isCreator = jobPost.created_by === user.id;
  const canManageAllJobPosts = await supabase.rpc(
    'user_has_permission',
    {
      user_id: user.id,
      company_id: company.id,
      required_permission: 'manage_all_job_posts'
    }
  );
  
  const canManageOwnJobPosts = isCreator && await supabase.rpc(
    'user_has_permission',
    {
      user_id: user.id,
      company_id: company.id,
      required_permission: 'manage_own_job_posts'
    }
  );
  
  if (!canManageAllJobPosts.data && !canManageOwnJobPosts.data) {
    return redirect(`/dashboard/company/${handle}/jobs?error=You+do+not+have+permission+to+edit+this+job+post`);
  }
  
  // Prepare form data
  const formData: JobPostFormData = {
    title: jobPost.title,
    description: jobPost.description,
    location: jobPost.location || '',
    salaryRange: jobPost.salary_range || '',
    jobType: jobPost.job_type || '',
    experienceLevel: jobPost.experience_level || '',
    skills: jobPost.skills || [],
    published: jobPost.published
  };
  
  // Get the current path for sidebar active state
  const currentPath = `/dashboard/company/${handle}/jobs`;
  
  return (
    <CompanyLayout handle={handle} currentPath={currentPath}>
      <div className="container mx-auto py-8 px-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6 text-[#4b0076] hover:bg-[#c9a0ff]/10 hover:text-[#8f00ff]" 
          asChild
        >
          <Link href={`/dashboard/company/${handle}/jobs`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
          </Link>
        </Button>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#4b0076]">Edit Job Post</h1>
          <p className="text-muted-foreground">Editing job post for {company.name}</p>
        </div>
        
        <JobPostForm 
          companyId={company.id} 
          initialData={formData} 
          jobPostId={jobPostId} 
        />
      </div>
    </CompanyLayout>
  );
}