'use client'
// app/company/dashboard/company-dashboard-ui.tsx
import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import Image from 'next/image'
import Link from 'next/link'

interface Profile {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  website: string | null
  user_type: string
}

export default function CompanyDashboardUI({ 
  user, 
  profile 
}: { 
  user: User
  profile: Profile 
}) {
  const companyName = profile.full_name || 'Company Name'
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200">
            {profile.avatar_url ? (
              <Image 
                src={profile.avatar_url} 
                alt="Company Logo" 
                layout="fill" 
                objectFit="cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Logo
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{companyName}</h1>
            <p className="text-gray-500">{user.email}</p>
            {profile.website && (
              <a 
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                {profile.website}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 col-span-2">
          <h2 className="text-xl font-semibold mb-4">Company Dashboard</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Active Job Listings</h3>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-gray-600">No active listings</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Applications Received</h3>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-gray-600">No applications yet</p>
            </div>
          </div>
          
          <p className="mb-4">Welcome to your employer dashboard! From here you can:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>Post new job openings</li>
            <li>Review applicant submissions</li>
            <li>Manage your company profile</li>
            <li>Contact potential candidates</li>
          </ul>
          
          <div className="mt-6">
            <Link 
              href="/company/jobs/new" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            >
              Post a New Job
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <nav className="space-y-2">
              <Link href="/company/jobs" className="block p-2 hover:bg-gray-50 rounded">
                Manage Job Listings
              </Link>
              <Link href="/company/applications" className="block p-2 hover:bg-gray-50 rounded">
                Review Applications
              </Link>
              <Link href="/account" className="block p-2 hover:bg-gray-50 rounded">
                Edit Company Profile
              </Link>
              <Link href="/company/analytics" className="block p-2 hover:bg-gray-50 rounded">
                Listing Analytics
              </Link>
            </nav>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Account</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Account Type</span>
                <span className="font-medium text-purple-600">Company</span>
              </div>
              <div className="flex justify-between">
                <span>Username</span>
                <span>{profile.username || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span>Website</span>
                <span>{profile.website || 'Not set'}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <form action="/auth/signout" method="post">
                <button type="submit" className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded">
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}