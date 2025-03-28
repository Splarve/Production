'use client';

// components/job-posts/DeleteJobPostButtonWrapper.tsx
import { DeleteJobPostButton } from './DeleteJobPostButton';
import { useRouter } from 'next/navigation';

interface DeleteJobPostButtonWrapperProps {
  companyId: string;
  jobPostId: string;
  companyHandle: string;
}

export function DeleteJobPostButtonWrapper({
  companyId,
  jobPostId,
  companyHandle
}: DeleteJobPostButtonWrapperProps) {
  const router = useRouter();

  const handleDeleteSuccess = () => {
    router.push(`/dashboard/company/${companyHandle}/jobs`);
  };

  return (
    <DeleteJobPostButton
      companyId={companyId}
      jobPostId={jobPostId}
      onDeleteSuccess={handleDeleteSuccess}
    />
  );
}