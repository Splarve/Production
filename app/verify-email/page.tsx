// app/verify-email/page.tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default function VerifyEmail({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  const email = searchParams.email

  if (!email) {
    redirect('/')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Check your email</h1>
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We've sent a verification link to: <br />
            <span className="font-medium">{email}</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please check your email and click the verification link to complete your registration.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Next steps:</h3>
            <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <li>Open the email from our team</li>
              <li>Click the verification link</li>
              <li>You'll be redirected to complete your profile</li>
            </ol>
          </div>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Didn't receive the email? Check your spam folder or</p>
            <Link 
              href="/login" 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              try signing up again
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}