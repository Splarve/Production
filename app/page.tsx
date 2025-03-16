// app/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Image from 'next/image'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is logged in, redirect to dashboard 
  // (which will further redirect to the appropriate dashboard based on user type)
  if (user) {
    redirect('/dashboard')
  }

  // If not logged in, show landing page with login/signup options
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with auth buttons */}
      <header className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <Image
            src="/next.svg"
            alt="Next.js Logo"
            width={120}
            height={30}
            className="dark:invert"
          />
          <span className="text-xl font-semibold">Job Board</span>
        </div>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          Connect with your next <span className="text-blue-600">opportunity</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-8">
          Whether you're looking for your dream job or searching for the perfect candidate,
          our platform makes it simple.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-full text-lg font-medium hover:bg-blue-700"
          >
            Get Started
          </Link>
          <Link 
            href="/about"
            className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-full text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Learn More
          </Link>
        </div>
      </main>

      {/* Feature section */}
      <section className="py-12 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* For job seekers */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">For Job Seekers</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Create your profile and showcase your skills
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Browse job listings from top companies
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Apply with just a few clicks
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Track your application status
                </li>
              </ul>
            </div>
            
            {/* For companies */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">For Companies</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Create a company profile to attract talent
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Post job openings with detailed descriptions
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Review and manage applications in one place
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Contact qualified candidates directly
                </li>
              </ul>
            </div>
            
            {/* Why choose us */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Why Choose Us</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  User-friendly interface
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Secure and reliable platform
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Advanced matching algorithms
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Completely free to get started
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Job Board. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
              Terms
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
              Privacy
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}