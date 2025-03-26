// components/job-posts/JobPostsList.tsx
'use client';

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
import { Loader2, Eye, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Determine if user can manage job posts
  const canManageJobPosts = ['owner', 'admin', 'hr'].includes(userRole);
  
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
  
  const handleDeleteJobPost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job post?')) {
      return;
    }
    
    try {
      setDeletingId(id);
      
      const response = await fetch(`/api/companies/${companyId}/job-posts/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete job post');
      }
      
      // Remove the deleted job post from the list
      setJobPosts(prev => prev.filter(post => post.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete job post');
    } finally {
      setDeletingId(null);
    }
  };
  
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
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : jobPosts.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">No job posts found</h3>
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
              className="mt-4"
            >
              <Link href={`/dashboard/company/jobs/create`}>
                Create Your First Job Post
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobPosts.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.location || 'Not specified'}</TableCell>
                  <TableCell className="capitalize">{job.job_type || 'Not specified'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={job.published ? "default" : "outline"}
                      className={job.published ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
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
                        size="sm"
                        className="h-8 w-8 p-0"
                        asChild
                      >
                        <Link href={`/jobs/${job.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      
                      {canManageJobPosts && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            asChild
                          >
                            <Link href={`/dashboard/company/jobs/${job.id}/edit`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteJobPost(job.id)}
                            disabled={deletingId === job.id}
                          >
                            {deletingId === job.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Delete</span>
                          </Button>
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