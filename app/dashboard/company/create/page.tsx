'use client';
// app/dashboard/company/create/page.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, ArrowLeft, Info } from 'lucide-react';

export default function CreateCompany() {
  const [companyName, setCompanyName] = useState('');
  const [companyHandle, setCompanyHandle] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();
  
  // Function to format handle input (lowercase, replace spaces with hyphens)
  const formatHandle = (input: string) => {
    return input
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9_-]/g, '')
      .slice(0, 30);
  };
  
  // Generate handle suggestion from company name
  const suggestHandle = () => {
    if (companyName && !companyHandle) {
      const suggested = formatHandle(companyName);
      setCompanyHandle(suggested);
      checkHandleAvailability(suggested);
    }
  };
  
  // Check if handle is available
  const checkHandleAvailability = async (handle: string) => {
    if (!handle || handle.length < 3) {
      setHandleAvailable(null);
      return;
    }
    
    try {
      setIsCheckingHandle(true);
      
      const { data, error } = await supabase
        .from('companies')
        .select('handle')
        .eq('handle', handle)
        .single();
      
      setHandleAvailable(!data);
    } catch (error) {
      setHandleAvailable(true); // Assume available on error
    } finally {
      setIsCheckingHandle(false);
    }
  };
  
  // Handle the handle input change
  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatHandle(e.target.value);
    setCompanyHandle(formatted);
    checkHandleAvailability(formatted);
  };
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }
    
    if (!companyHandle || companyHandle.length < 3) {
      setError('Company handle is required (minimum 3 characters)');
      return;
    }
    
    if (handleAvailable === false) {
      setError('This company handle is already taken');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login/company');
        return;
      }
      
      // Create the company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName.trim(),
          handle: companyHandle.trim(),
          description: companyDescription.trim(),
          website: companyWebsite.trim()
        })
        .select('id')
        .single();
      
      if (companyError) throw companyError;
      
      // Add the current user as an owner of the company
      const { error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: company.id,
          user_id: user.id,
          role: 'owner',
          invited_by: user.id
        });
      
      if (memberError) throw memberError;
      
      // Redirect to company dashboard
      router.push('/dashboard/company');
    } catch (error: any) {
      console.error('Error creating company:', error);
      setError(error.message || 'Failed to create company');
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <div className="container max-w-xl mx-auto py-8 px-4">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-6" 
        onClick={() => router.push('/dashboard/company')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Create New Company</CardTitle>
            <CardDescription>
              Set up your company profile to start hiring talent
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-50 text-red-700 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name *</Label>
              <Input 
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onBlur={suggestHandle}
                placeholder="Enter your company name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="company-handle">Company Handle *</Label>
                {handleAvailable !== null && (
                  <span className={`text-xs ${handleAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {handleAvailable ? 'Available' : 'Already taken'}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  @
                </div>
                <Input 
                  id="company-handle"
                  value={companyHandle}
                  onChange={handleHandleChange}
                  onBlur={() => checkHandleAvailability(companyHandle)}
                  placeholder="company-handle"
                  className="pl-8"
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="[a-z0-9_-]{3,30}"
                />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                Only lowercase letters, numbers, hyphens and underscores (3-30 characters)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company-description">Description</Label>
              <Textarea 
                id="company-description"
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                placeholder="Tell us about your company"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company-website">Website</Label>
              <Input 
                id="company-website"
                type="url"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/dashboard/company')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || handleAvailable === false}
            >
              {isSubmitting ? 'Creating...' : 'Create Company'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}