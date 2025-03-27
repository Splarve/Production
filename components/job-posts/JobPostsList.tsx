'use client';

// components/job-posts/JobPostsList.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Tabs,
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Loader2, Eye, Edit, PlusCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DeleteJobPostButton } from './DeleteJobPostButton';

interface JobPost {
  id: string;
  title: string;
  location: string;
  job_type: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

interface JobPostsListProps {
  companyId: string;
  userRole: string;
}

export function JobPostsList({ companyId, userRole }: JobPostsListProps) {
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Determine if user can manage job posts
  const canManageJobPosts = ['owner', 'admin', 'hr'].includes(userRole);
  
  // Extract company handle from URL
  const [companyHandle, setCompanyHandle] = useState<string>('');
  
  useEffect(() => {
    // Get company handle from URL path
    const pathParts = window.location.pathname.split('/');
    const handleIndex = pathParts.findIndex(part => part === 'company') + 1;
    const handle = handleIndex > 0 && handleIndex < pathParts.length 
      ? pathParts[handleIndex] 
      : '';
    
    setCompanyHandle(handle);
  }, []);
  
  const fetchJobPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construct URL with published filter if needed
      let url = `/api/companies/${companyId}/job-posts`;
      if (activeTab === 'published') {
        url += '?published=true';
      } else if (activeTab === 'drafts') {
        url += '?published=false';
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch job posts');
      }
      
      const data = await response.json();
      setJobPosts(data.jobPosts || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setJobPosts([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch job posts when component mounts or tab changes
  useEffect(() => {
    fetchJobPosts();
  }, [companyId, activeTab]);
  
  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-700 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 bg-[#f8f5ff] border-[#c9a0ff]/30">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#c9a0ff]/20 data-[state=active]:text-[#8f00ff]">All Jobs</TabsTrigger>
            <TabsTrigger value="published" className="data-[state=active]:bg-[#c9a0ff]/20 data-[state=active]:text-[#8f00ff]">Published</TabsTrigger>
            <TabsTrigger value="drafts" className="data-[state=active]:bg-[#c9a0ff]/20 data-[state=active]:text-[#8f00ff]">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {canManageJobPosts && (
          <Button 
            asChild 
            className="mt-0 bg-[#8f00ff] hover:bg-[#4b0076] whitespace-nowrap"
          >
            <Link href={`/dashboard/company/${companyHandle}/jobs/create`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Job Post
            </Link>
          </Button>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 size={24} className="animate-spin text-[#8f00ff]" />
        </div>
      ) : jobPosts.length === 0 ? (
        <div className="text-center py-8 border rounded-lg border-[#c9a0ff]/30">
          <h3 className="text-lg font-medium mb-2 text-[#4b0076]">No job posts found</h3>
          <p className="text-muted-foreground">
            {activeTab === 'all' 
              ? 'You haven\'t created any job posts yet' 
              : activeTab === 'published'
                ? 'You don\'t have any published job posts'
                : 'You don\'t have any draft job posts'}
          </p>
          {canManageJobPosts && (
            <Button 
              asChild 
              variant="outline" 
              className="mt-4 border-[#c9a0ff] hover:bg-[#c9a0ff]/10 text-[#4b0076] hover:text-[#8f00ff]"
            >
              <Link href={`/dashboard/company/${companyHandle}/jobs/create`}>
                Create Your First Job Post
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-md border border-[#c9a0ff]/30">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f8f5ff]">
                <TableHead className="text-[#4b0076]">Job Title</TableHead>
                <TableHead className="text-[#4b0076]">Location</TableHead>
                <TableHead className="text-[#4b0076]">Type</TableHead>
                <TableHead className="text-[#4b0076]">Status</TableHead>
                <TableHead className="text-[#4b0076]">Date</TableHead>
                <TableHead className="text-right text-[#4b0076]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobPosts.map((job) => (
                <TableRow key={job.id} className="hover:bg-[#f8f5ff]">
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.location || 'Not specified'}</TableCell>
                  <TableCell className="capitalize">{job.job_type || 'Not specified'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={job.published ? "default" : "outline"}
                      className={job.published ? "bg-[#c9a0ff]/20 text-[#8f00ff] hover:bg-[#c9a0ff]/30 border-[#c9a0ff]" : "border-[#c9a0ff]/50 text-[#4b0076]"}
                    >
                      {job.published ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {job.published 
                      ? job.published_at && `Published ${format(new Date(job.published_at), 'MMM d, yyyy')}`
                      : `Updated ${format(new Date(job.updated_at), 'MMM d, yyyy')}`}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0 hover:bg-[#c9a0ff]/10 hover:text-[#8f00ff]"
                        asChild
                      >
                        <Link href={`/dashboard/company/${companyHandle}/jobs/${job.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      
                      {canManageJobPosts && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0 hover:bg-[#c9a0ff]/10 hover:text-[#8f00ff]"
                            asChild
                          >
                            <Link href={`/dashboard/company/${companyHandle}/jobs/${job.id}/edit`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                          
                          <DeleteJobPostButton
                            companyId={companyId}
                            jobPostId={job.id}
                            variant="ghost"
                            size="icon"
                            onDeleteSuccess={fetchJobPosts}
                          />
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}