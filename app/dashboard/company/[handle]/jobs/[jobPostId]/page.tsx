// app/dashboard/company/[handle]/jobs/[jobPostId]/page.tsx
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Building, MapPin, Clock, Briefcase, GraduationCap, Tag, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { DeleteJobPostButtonWrapper } from '@/components/job-posts/DeleteJobPostButtonWrapper';

export default async function ViewJobPostPage({ 
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
  
  const canEdit = canManageAllJobPosts.data || canManageOwnJobPosts.data;
  
  // Get the current path for sidebar active state
  const currentPath = `/dashboard/company/${handle}/jobs`;

  // Map job types to human-readable labels
  const getJobTypeLabel = (jobType: string | null) => {
    if (!jobType) return null;
    
    const jobTypes: Record<string, string> = {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      'contract': 'Contract',
      'temporary': 'Temporary',
      'internship': 'Internship',
      'remote': 'Remote'
    };
    
    return jobTypes[jobType] || jobType;
  };
  
  // Map experience levels to human-readable labels
  const getExperienceLevelLabel = (level: string | null) => {
    if (!level) return null;
    
    const levels: Record<string, string> = {
      'entry': 'Entry Level',
      'mid': 'Mid Level',
      'senior': 'Senior Level',
      'executive': 'Executive'
    };
    
    return levels[level] || level;
  };
  
  return (
    <div className="bg-gradient-to-br from-white to-[#f8f5ff] min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-fit text-[#4b0076] hover:bg-[#c9a0ff]/10 hover:text-[#8f00ff]" 
            asChild
          >
            <Link href={`/dashboard/company/${handle}/jobs`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
            </Link>
          </Button>
          
          {canEdit && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-[#c9a0ff] hover:bg-[#c9a0ff]/10 text-[#4b0076] hover:text-[#8f00ff]"
                asChild
              >
                <Link href={`/dashboard/company/${handle}/jobs/${jobPostId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              
              <DeleteJobPostButtonWrapper
                companyId={company.id}
                jobPostId={jobPostId}
                companyHandle={handle}
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-2xl font-bold text-[#4b0076]">
            {jobPost.title}
          </h1>
          <Badge
            variant={jobPost.published ? "default" : "outline"}
            className={jobPost.published 
              ? "bg-[#c9a0ff]/20 text-[#8f00ff] hover:bg-[#c9a0ff]/30 border-[#c9a0ff]" 
              : "border-[#c9a0ff]/50 text-[#4b0076]"}
          >
            {jobPost.published ? 'Published' : 'Draft'}
          </Badge>
        </div>
        
        <div className="mb-8 text-sm text-muted-foreground">
          {jobPost.published 
            ? `Published ${jobPost.published_at ? format(new Date(jobPost.published_at), 'MMMM d, yyyy') : 'recently'}`
            : `Last updated ${format(new Date(jobPost.updated_at), 'MMMM d, yyyy')}`
          }
        </div>
        
        {/* Job post preview */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-[#c9a0ff]/30">
              <CardContent className="pt-6">
                {/* Company info */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-full bg-[#c9a0ff]/20 flex items-center justify-center">
                    {company.logo_url ? (
                      <img 
                        src={company.logo_url}
                        alt={company.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <Building className="h-6 w-6 text-[#8f00ff]" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-medium text-[#4b0076]">{company.name}</h2>
                    <p className="text-sm text-muted-foreground">@{company.handle}</p>
                  </div>
                </div>
                
                {/* Job description */}
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: jobPost.description }} />
                </div>
              </CardContent>
            </Card>
            
            {/* Skills section */}
            {jobPost.skills && jobPost.skills.length > 0 && (
              <Card className="border-[#c9a0ff]/30">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium text-[#4b0076] mb-4">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {jobPost.skills.map((skill, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-1 bg-[#c9a0ff]/10 text-[#8f00ff] rounded-full px-3 py-1 border border-[#c9a0ff]/30"
                      >
                        <Tag size={14} />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Job details sidebar */}
          <div>
            <Card className="border-[#c9a0ff]/30 sticky top-6">
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium text-[#4b0076] mb-4">Job Details</h3>
                
                <div className="space-y-4">
                  {jobPost.location && (
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 mt-0.5">
                        <MapPin size={20} className="text-[#8f00ff]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#4b0076]">Location</p>
                        <p>{jobPost.location}</p>
                      </div>
                    </div>
                  )}
                  
                  {jobPost.job_type && (
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 mt-0.5">
                        <Clock size={20} className="text-[#8f00ff]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#4b0076]">Job Type</p>
                        <p className="capitalize">{getJobTypeLabel(jobPost.job_type)}</p>
                      </div>
                    </div>
                  )}
                  
                  {jobPost.experience_level && (
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 mt-0.5">
                        <GraduationCap size={20} className="text-[#8f00ff]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#4b0076]">Experience</p>
                        <p>{getExperienceLevelLabel(jobPost.experience_level)}</p>
                      </div>
                    </div>
                  )}
                  
                  {jobPost.salary_range && (
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 mt-0.5">
                        <Briefcase size={20} className="text-[#8f00ff]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#4b0076]">Salary</p>
                        <p>{jobPost.salary_range}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {company.website && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="font-medium text-[#4b0076] mb-2">Company Website</h3>
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#8f00ff] hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}