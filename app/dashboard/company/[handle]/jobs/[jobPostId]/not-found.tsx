// app/dashboard/company/[handle]/jobs/[jobPostId]/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function JobPostNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="space-y-6 text-center max-w-md">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter text-[#4b0076]">Job Post Not Found</h1>
          <p className="text-muted-foreground">
            The job post you are looking for doesn't exist or you don't have permission to view it.
          </p>
        </div>
        
        <Button asChild className="bg-[#8f00ff] hover:bg-[#4b0076]">
          <Link href="/dashboard/company">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}