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
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 md:p-6 flex justify-between items-center bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <Image
            src="/next.svg"
            alt="JobConnect Logo"
            width={120}
            height={30}
            className="dark:invert"
          />
          <span className="text-xl font-semibold">JobConnect</span>
        </div>
        <div className="flex gap-2">
          <Link
            href="/login/personal"
            className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 text-sm transition-colors"
          >
            Personal Log in
          </Link>
          <Link
            href="/signup/personal"
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors"
          >
            Personal Sign up
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 md:py-24">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Find Your Dream Job with <span className="text-blue-600">JobConnect</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 md:max-w-xl">
              Whether you're looking for your next career opportunity or searching for the perfect talent, 
              JobConnect makes your journey simpler and more effective.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/signup/personal"
                className="px-8 py-3 bg-blue-600 text-white rounded-md text-lg font-medium hover:bg-blue-700 transition-colors text-center"
              >
                For Job Seekers
              </Link>
              <Link 
                href="/signup/company"
                className="px-8 py-3 border border-blue-600 text-blue-600 rounded-md text-lg font-medium hover:bg-blue-50 transition-colors text-center"
              >
                For Employers
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="relative h-64 md:h-96 w-full">
              <Image
                src="/vercel.svg"
                alt="Job search illustration"
                fill
                className="object-contain dark:invert"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How JobConnect Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For job seekers */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">For Job Seekers</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Create your professional profile
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Discover opportunities matching your skills
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
              <div className="mt-6 flex space-x-4">
                <Link 
                  href="/login/personal" 
                  className="flex-1 text-center py-2 px-4 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup/personal" 
                  className="flex-1 text-center py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </div>
            
            {/* For companies */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">For Companies</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Build your employer brand
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Post detailed job listings
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Invite team members with specific roles
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Connect with qualified candidates
                </li>
              </ul>
              <div className="mt-6 flex space-x-4">
                <Link 
                  href="/login/company" 
                  className="flex-1 text-center py-2 px-4 border border-purple-600 text-purple-600 rounded hover:bg-purple-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup/company" 
                  className="flex-1 text-center py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Take the Next Step?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of professionals who've found success with JobConnect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup/personal" 
              className="px-8 py-3 bg-white text-blue-600 rounded-md text-lg font-medium hover:bg-gray-100"
            >
              For Job Seekers
            </Link>
            <Link 
              href="/signup/company" 
              className="px-8 py-3 border border-white text-white rounded-md text-lg font-medium hover:bg-blue-700"
            >
              For Employers
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-800 text-white mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center justify-center md:justify-start">
              <Image
                src="/next.svg"
                alt="JobConnect Logo"
                width={100}
                height={24}
                className="invert"
              />
              <span className="text-xl font-semibold ml-2">JobConnect</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              © {new Date().getFullYear()} JobConnect. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}