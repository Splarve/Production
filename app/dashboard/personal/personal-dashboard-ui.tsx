'use client'
// app/dashboard/personal/personal-dashboard-ui.tsx
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
}

export default function PersonalDashboardUI({ 
  user, 
  profile 
}: { 
  user: User
  profile: Profile 
}) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200">
            {profile.avatar_url ? (
              <Image 
                src={profile.avatar_url} 
                alt="Profile" 
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile.full_name || 'Job Seeker'}</h1>
            <p className="text-gray-500">{user.email}</p>
            {profile.username && <p className="text-sm">@{profile.username}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 col-span-2">
          <h2 className="text-xl font-semibold mb-4">Personal Dashboard</h2>
          <p className="mb-4">Welcome to your personal dashboard! From here you can:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>Search for job openings</li>
            <li>Submit applications</li>
            <li>Track your application status</li>
            <li>Update your resume and skills</li>
          </ul>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Getting Started</h3>
            <p>Complete your profile to increase your chances of being noticed by employers.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <nav className="space-y-2">
              <Link href="/jobs/browse" className="block p-2 hover:bg-gray-50 rounded">
                Browse Jobs
              </Link>
              <Link href="/profile/applications" className="block p-2 hover:bg-gray-50 rounded">
                My Applications
              </Link>
              <Link href="/profile/personal/edit" className="block p-2 hover:bg-gray-50 rounded">
                Edit Profile
              </Link>
              <Link href="/profile/resume" className="block p-2 hover:bg-gray-50 rounded">
                Resume Builder
              </Link>
            </nav>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Account</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Account Type</span>
                <span className="font-medium text-blue-600">Personal</span>
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