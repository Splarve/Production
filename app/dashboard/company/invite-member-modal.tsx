'use client'
// app/dashboard/company/invite-member-modal.tsx
import { useState } from 'react'
import { inviteMember } from './actions'
import { CompanyRole } from '@/utils/auth/roles'

interface InviteMemberModalProps {
  companyId: number
  onClose: () => void
  userRole: CompanyRole
}

export default function InviteMemberModal({ 
  companyId, 
  onClose,
  userRole
}: InviteMemberModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<CompanyRole>('member')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Only show role options that the current user can assign
  // For example, 'hr' can't assign 'owner' or 'admin' roles
  const availableRoles = () => {
    switch(userRole) {
      case 'owner':
        return [
          { value: 'admin', label: 'Admin' },
          { value: 'hr', label: 'HR' },
          { value: 'social', label: 'Social' },
          { value: 'member', label: 'Member' }
        ];
      case 'admin':
        return [
          { value: 'hr', label: 'HR' },
          { value: 'social', label: 'Social' },
          { value: 'member', label: 'Member' }
        ];
      case 'hr':
        return [
          { value: 'social', label: 'Social' },
          { value: 'member', label: 'Member' }
        ];
      default:
        return [
          { value: 'member', label: 'Member' }
        ];
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      // Create a FormData object for the server action
      const formData = new FormData()
      formData.append('companyId', companyId.toString())
      formData.append('email', email)
      formData.append('role', role)
      
      const result = await inviteMember(formData)
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(`Invitation sent to ${email}`)
        setEmail('')
        // Wait 2 seconds and close
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Invite Team Member</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                placeholder="colleague@example.com"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as CompanyRole)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              >
                {availableRoles().map((roleOption) => (
                  <option key={roleOption.value} value={roleOption.value}>
                    {roleOption.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {role === 'admin' && 'Can manage team members and all company features'}
                {role === 'hr' && 'Can post jobs and review applications'}
                {role === 'social' && 'Can create and edit job postings'}
                {role === 'member' && 'Can view applications and basic company info'}
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}