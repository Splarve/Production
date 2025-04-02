'use client';

// components/job-posts/DeleteJobPostButtonWrapper.tsx (updated for handles)
import { DeleteJobPostButton } from './DeleteJobPostButton';
import { useRouter } from 'next/navigation';

interface DeleteJobPostButtonWrapperProps {
  companyHandle: string; // Changed from companyId
  jobPostId: string;
}

export function DeleteJobPostButtonWrapper({
  companyHandle,
  jobPostId,
}: DeleteJobPostButtonWrapperProps) {
  const router = useRouter();

  const handleDeleteSuccess = () => {
    router.push(`/dashboard/company/${companyHandle}/jobs`);
  };

  return (
    <DeleteJobPostButton
      companyHandle={companyHandle}
      jobPostId={jobPostId}
      onDeleteSuccess={handleDeleteSuccess}
    />
  );
}