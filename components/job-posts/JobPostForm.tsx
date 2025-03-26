// components/job-posts/JobPostForm.tsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Loader2 } from 'lucide-react';

// Dynamically import Quill to avoid SSR issues
const QuillEditor = dynamic(() => import('./QuillEditor'), { 
  ssr: false,
  loading: () => <div className="h-64 border rounded-md flex items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
});

export interface JobPostFormData {
  title: string;
  description: string;
  location: string;
  salaryRange: string;
  jobType: string;
  experienceLevel: string;
  skills: string[];
  published: boolean;
}

interface JobPostFormProps {
  companyId: string;
  initialData?: JobPostFormData;
  jobPostId?: string;
  onSuccess?: (id: string) => void;
}

const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' }
];

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
  { value: 'executive', label: 'Executive' }
];

export function JobPostForm({ 
  companyId, 
  initialData, 
  jobPostId,
  onSuccess
}: JobPostFormProps) {
  const router = useRouter();
  const isEditing = !!jobPostId;
  
  const [formData, setFormData] = useState<JobPostFormData>({
    title: '',
    description: '',
    location: '',
    salaryRange: '',
    jobType: '',
    experienceLevel: '',
    skills: [],
    published: false,
    ...initialData
  });
  
  const [currentTab, setCurrentTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState('');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDescriptionChange = (content: string) => {
    setFormData(prev => ({ ...prev, description: content }));
  };
  
  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };
  
  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };
  
  const handlePublishChange = (publish: boolean) => {
    setFormData(prev => ({ ...prev, published: publish }));
  };
  
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Job title is required');
      setCurrentTab('details');
      return false;
    }
    
    if (!formData.description.trim()) {
      setError('Job description is required');
      setCurrentTab('description');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const url = isEditing
        ? `/api/companies/${companyId}/job-posts/${jobPostId}`
        : `/api/companies/${companyId}/job-posts`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          salaryRange: formData.salaryRange,
          jobType: formData.jobType,
          experienceLevel: formData.experienceLevel,
          skills: formData.skills,
          published: formData.published
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save job post');
      }
      
      if (onSuccess) {
        onSuccess(result.id || jobPostId);
      } else {
        router.push(`/dashboard/company/jobs/${result.id || jobPostId}`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-700 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="details">Job Details</TabsTrigger>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Senior Software Engineer"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g. New York, NY or Remote"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type</Label>
              <Select
                value={formData.jobType}
                onValueChange={(value) => handleSelectChange('jobType', value)}
              >
                <SelectTrigger id="jobType">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Select
                value={formData.experienceLevel}
                onValueChange={(value) => handleSelectChange('experienceLevel', value)}
              >
                <SelectTrigger id="experienceLevel">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="salaryRange">Salary Range</Label>
            <Input
              id="salaryRange"
              name="salaryRange"
              value={formData.salaryRange}
              onChange={handleInputChange}
              placeholder="e.g. $80,000 - $100,000"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="description" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <QuillEditor
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Write a detailed job description..."
            />
          </div>
        </TabsContent>
        
        <TabsContent value="requirements" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skills">Required Skills</Label>
            <div className="flex gap-2">
              <Input
                id="skillInput"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                // components/job-posts/JobPostForm.tsx (continued)
                placeholder="e.g. React"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={handleAddSkill}
                variant="outline"
              >
                Add
              </Button>
            </div>
            
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill) => (
                  <div 
                    key={skill}
                    className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-primary hover:text-red-500 focus:outline-none"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Publish Status</h3>
              <p className="text-sm text-muted-foreground">
                {formData.published 
                  ? 'This job post will be visible to job seekers'
                  : 'This job post will be saved as a draft'}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handlePublishChange(false)}
                className={!formData.published ? 'border-primary text-primary' : ''}
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={() => handlePublishChange(true)}
                className={formData.published ? 'bg-primary text-white' : ''}
              >
                Publish
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>{isEditing ? 'Update Job Post' : 'Create Job Post'}</>
          )}
        </Button>
      </div>
    </form>
  );
}