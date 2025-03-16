// app/test-protection/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function TestProtection() {
  const supabase = await createClient()
  
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    return redirect('/login?message=You+must+be+logged+in')
  }
  
  // Get profile with user type
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type, full_name')
    .eq('id', user.id)
    .single()
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">User Type Protection Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Your Current Account:</h2>
        
        <div className="space-y-2 mb-6">
          <p>
            <span className="font-medium">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-medium">User Type:</span> {profile?.user_type || 'Not set'}
          </p>
          <p>
            <span className="font-medium">Name:</span> {profile?.full_name || 'Not set'}
          </p>
        </div>
        
        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Test Access to Protected Routes:</h3>
          
          <div className="space-y-4">
            <div>
              <p className="mb-2"><span className="font-medium">Applicant Dashboard:</span></p>
              <Link 
                href="/applicant/dashboard" 
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Access Applicant Dashboard
              </Link>
              <p className="text-sm text-gray-500 mt-1">
                {profile?.user_type === 'applicant' 
                  ? 'You should be able to access this page.' 
                  : 'You should be redirected away since you are not an applicant.'}
              </p>
            </div>
            
            <div>
              <p className="mb-2"><span className="font-medium">Company Dashboard:</span></p>
              <Link 
                href="/company/dashboard" 
                className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Access Company Dashboard
              </Link>
              <p className="text-sm text-gray-500 mt-1">
                {profile?.user_type === 'company' 
                  ? 'You should be able to access this page.' 
                  : 'You should be redirected away since you are not a company.'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <Link 
          href="/dashboard" 
          className="text-blue-600 hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}