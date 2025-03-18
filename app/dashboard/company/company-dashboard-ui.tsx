'use client'
// app/dashboard/company/company-dashboard-ui.tsx
import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import Image from 'next/image'
import Link from 'next/link'
import InviteMemberModal from './invite-member-modal'

interface Company {
  id: number
  username: string
  company_name: string
  description: string | null
  logo_url: string | null
  website: string | null
}

interface Invitation {
  id: number
  email: string
  role: string
  created_at: string
  expires_at: string
}

export default function CompanyDashboardUI({ 
  user, 
  company,
  role,
  pendingInvites
}: { 
  user: User
  company: Company
  role: string
  pendingInvites: Invitation[]
}) {
  const [showInviteModal, setShowInviteModal] = useState(false)
  
  // Function to format role name for display
  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1)
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200">
            {company.logo_url ? (
              <Image 
                src={company.logo_url} 
                alt="Company Logo" 
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{company.company_name}</h1>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">@{company.username}</span>
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                {formatRole(role)}
              </span>
            </div>
            {company.website && (
              <a 
                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center mt-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                {company.website}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Company Dashboard</h2>
            
            {/* Only show invite button to roles that can invite */}
            {(role === 'owner' || role === 'admin' || role === 'hr') && (
              <button 
                onClick={() => setShowInviteModal(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Invite Team Member
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded-lg">
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
          
          {/* Team members section */}
          <h3 className="font-semibold text-lg mb-3 mt-8">Team Members</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingInvites.map((invite) => (
                  <tr key={invite.id}>
                    <td className="px-3 py-2">{invite.email}</td>
                    <td className="px-3 py-2">{formatRole(invite.role)}</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Pending
                      </span>
                    </td>
                  </tr>
                ))}
                {/* Show at least the current user if no other members */}
                <tr>
                  <td className="px-3 py-2">{user.email}</td>
                  <td className="px-3 py-2">{formatRole(role)}</td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Company description */}
          {company.description ? (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">About</h3>
              <p className="text-gray-700">{company.description}</p>
            </div>
          ) : (
            <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold mb-2">Complete Your Profile</h3>
              <p className="text-sm">
                Add a company description, logo, and more details to make your profile stand out to job seekers.
              </p>
              <Link 
                href="/profile/company/edit" 
                className="mt-2 inline-block text-sm text-purple-600 hover:underline"
              >
                Edit Company Profile →
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <nav className="space-y-2">
              <Link href="/jobs/manage" className="block p-2 hover:bg-gray-50 rounded">
                Manage Job Listings
              </Link>
              <Link href="/applications/review" className="block p-2 hover:bg-gray-50 rounded">
                Review Applications
              </Link>
              <Link href="/profile/company/edit" className="block p-2 hover:bg-gray-50 rounded">
                Edit Company Profile
              </Link>
              <Link href="/company/analytics" className="block p-2 hover:bg-gray-50 rounded">
                Job Analytics
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
                <span>Your Role</span>
                <span className="font-medium">{formatRole(role)}</span>
              </div>
              <div className="flex justify-between">
                <span>Company ID</span>
                <span>@{company.username}</span>
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

      {/* Invite Member Modal */}
      {showInviteModal && (
        <InviteMemberModal 
          companyId={company.id} 
          onClose={() => setShowInviteModal(false)}
          userRole={role}
        />
      )}
    </div>
  )
}