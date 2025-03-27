// app/api/companies/[companyId]/job-posts/[jobPostId]/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch job post details
export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string; jobPostId: string } }
) {
  try {
    const { companyId, jobPostId } = await params;
    const supabase = await createClient();
    
    // Query the job post directly
    const { data: jobPost, error } = await supabase
      .from('job_posts')
      .select('*')
      .eq('id', jobPostId)
      .eq('company_id', companyId)
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!jobPost) {
      return NextResponse.json({ error: 'Job post not found' }, { status: 404 });
    }
    
    return NextResponse.json({ jobPost });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update job post
export async function PUT(
  request: NextRequest,
  { params }: { params: { companyId: string; jobPostId: string } }
) {
  try {
    const { companyId, jobPostId } = params;
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const {
      title,
      description,
      location,
      salaryRange,
      jobType,
      experienceLevel,
      skills,
      published
    } = await request.json();
    
    // Use the secure function to update a job post
    const { data: result, error: updateError } = await supabase.rpc(
      'update_job_post',
      {
        p_job_post_id: jobPostId,
        p_title: title,
        p_description: description,
        p_location: location,
        p_salary_range: salaryRange,
        p_job_type: jobType,
        p_experience_level: experienceLevel,
        p_skills: skills,
        p_published: published
      }
    );
    
    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete job post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { companyId: string; jobPostId: string } }
) {
  try {
    const { companyId, jobPostId } = params;
    const supabase = await createClient();
    
    // Use the secure function to delete a job post
    const { data: result, error: deleteError } = await supabase.rpc(
      'delete_job_post',
      {
        p_job_post_id: jobPostId
      }
    );
    
    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 400 }
      );
    }
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}