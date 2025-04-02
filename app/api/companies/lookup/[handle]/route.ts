// app/api/companies/lookup/[handle]/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const { handle } = await params;
    const supabase = await createClient();
    
    // Get the company
    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('handle', handle)
      .maybeSingle();
    
    if (error || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ company });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}