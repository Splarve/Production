'use client'
// app/account/account-form.tsx
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import Avatar from './avatar'

export default function AccountForm({ user }: { user: User | null }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [fullname, setFullname] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [website, setWebsite] = useState<string | null>(null)
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)
  const [userType, setUserType] = useState<string | null>(null)

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name, username, website, avatar_url, user_type`)
        .eq('id', user?.id)
        .single()

      if (error && status !== 406) {
        console.log(error)
        throw error
      }

      if (data) {
        setFullname(data.full_name)
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
        setUserType(data.user_type)
      }
    } catch (error) {
      alert('Error loading user data!')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (user) getProfile()
  }, [user, getProfile])

  async function updateProfile() {
    try {
      setLoading(true)
      setUpdateSuccess(false)

      if (!user) throw new Error('No user')

      const updates = {
        id: user.id,
        full_name: fullname,
        username,
        website,
        avatar_url,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) throw error
      
      setUpdateSuccess(true)
      setTimeout(() => setUpdateSuccess(false), 3000)
    } catch (error) {
      alert('Error updating the data!')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      
      {updateSuccess && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Profile updated successfully!
        </div>
      )}
      
      <div className="mb-6">
        <Avatar
          uid={user?.id ?? null}
          url={avatar_url}
          size={150}
          onUpload={(url) => {
            setAvatarUrl(url)
          }}
        />
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input 
            id="email" 
            type="text" 
            value={user?.email} 
            disabled 
            className="w-full p-2 border rounded bg-gray-100 text-gray-800"
          />
        </div>
        
        <div>
          <label htmlFor="userType" className="block text-sm font-medium mb-1">Account Type</label>
          <input 
            id="userType" 
            type="text" 
            value={userType === 'company' ? 'Company' : userType === 'applicant' ? 'Applicant' : ''} 
            disabled 
            className="w-full p-2 border rounded bg-gray-100 text-gray-800"
          />
        </div>
        
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1">
            {userType === 'company' ? 'Company Name' : 'Full Name'}
          </label>
          <input
            id="fullName"
            type="text"
            value={fullname || ''}
            onChange={(e) => setFullname(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
          <input
            id="username"
            type="text"
            value={username || ''}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <p className="text-sm text-gray-500 mt-1">
            Must be at least 3 characters
          </p>
        </div>
        
        <div>
          <label htmlFor="website" className="block text-sm font-medium mb-1">Website</label>
          <input
            id="website"
            type="url"
            value={website || ''}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="https://example.com"
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-70"
            onClick={updateProfile}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Update Profile'}
          </button>
          
          <form action="/auth/signout" method="post">
            <button 
              type="submit"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}