// app/api/companies/[companyId]/job-posts/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all job posts for a company
export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const { companyId } = params;
    const { searchParams } = new URL(request.url);
    const publishedParam = searchParams.get('published');
    
    // Convert 'published' to boolean if provided
    const published = publishedParam ? publishedParam === 'true' : null;
    
    const supabase = await createClient();
    
    // Use the secure function to get job posts
    const { data: jobPosts, error } = await supabase.rpc(
      'get_company_job_posts',
      { 
        p_company_id: companyId,
        p_published: published
      }
    );
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ jobPosts });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a new job post
export async function POST(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const { companyId } = params;
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
    
    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }
    
    // Use the secure function to create a job post
    const { data: jobPostId, error: createError } = await supabase.rpc(
      'create_job_post',
      {
        p_company_id: companyId,
        p_title: title,
        p_description: description,
        p_location: location || null,
        p_salary_range: salaryRange || null,
        p_job_type: jobType || null,
        p_experience_level: experienceLevel || null,
        p_skills: skills || [],
        p_published: published || false
      }
    );
    
    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ id: jobPostId, success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}