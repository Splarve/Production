// utils/companies/handle.ts
import { createClient } from '@/utils/supabase/server';
import { Database } from '@/utils/supabase/types';

/**
 * Get company ID from handle (server-side)
 */
export async function getCompanyIdFromHandle(handle: string): Promise<string | null> {
    const supabase = await createClient();
    
    // Debug log
    console.log('Looking up company ID for handle:', handle);
    
    // Use maybeSingle() instead of single()
    const { data, error } = await supabase
      .from('companies')
      .select('id')
      .eq('handle', handle)
      .maybeSingle(); // Changed from single() to maybeSingle()
    
    if (error) {
      console.error('Database error in getCompanyIdFromHandle:', error);
      return null;
    }
    
    if (!data) {
      console.log('No company found with handle:', handle);
      return null;
    }
    
    return data.id;
  }

/**
 * Get company from handle (server-side)
 * Returns the full company object with typings
 */
export async function getCompanyFromHandle(handle: string): Promise<Database['public']['Tables']['companies']['Row'] | null> {
    const supabase = await createClient();
    
    // Debug log
    console.log('Looking up company with handle:', handle);
    
    // Use maybeSingle() instead of single()
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('handle', handle)
      .maybeSingle(); // Changed from single() to maybeSingle()
    
    if (error) {
      console.error('Database error in getCompanyFromHandle:', error);
      return null;
    }
    
    if (!data) {
      console.log('No company found with handle:', handle);
      return null;
    }
    
    console.log('Found company:', data);
    return data;
  }

/**
 * Client-side version using fetch to the API
 */
export async function getCompanyDataFromHandle(handle: string): Promise<any> {
  try {
    const response = await fetch(`/api/companies/lookup/${handle}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get company data');
    }
    
    const data = await response.json();
    return data.company;
  } catch (error) {
    console.error('Error fetching company data:', error);
    return null;
  }
}