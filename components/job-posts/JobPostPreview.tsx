'use client';

// components/job-posts/JobPostPreview.tsx
import { Building, MapPin, Clock, Briefcase, GraduationCap, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface JobPost {
  id: string;
  title: string;
  description: string;
  location: string | null;
  salary_range: string | null;
  job_type: string | null;
  experience_level: string | null;
  skills: string[] | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

interface Company {
  id: string;
  name: string;
  handle: string;
  logo_url: string | null;
  description: string | null;
  website: string | null;
}

interface JobPostPreviewProps {
  jobPost: JobPost;
  company: Company;
}

export function JobPostPreview({ jobPost, company }: JobPostPreviewProps) {
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
  );
}