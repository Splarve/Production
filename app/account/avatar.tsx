'use client'
// app/account/avatar.tsx
import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'

export default function Avatar({
  uid,
  url,
  size,
  onUpload,
}: {
  uid: string | null
  url: string | null
  size: number
  onUpload: (url: string) => void
}) {
  const supabase = createClient()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function downloadImage(path: string) {
      try {
        setError(null)
        const { data, error } = await supabase.storage.from('avatars').download(path)
        if (error) {
          throw error
        }

        const url = URL.createObjectURL(data)
        setAvatarUrl(url)
      } catch (error) {
        console.log('Error downloading image: ', error)
        setError('Error loading avatar image')
      }
    }

    if (url) downloadImage(url)
  }, [url, supabase])

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    try {
      setUploading(true)
      setError(null)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      // Check if storage bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets()
      const avatarBucketExists = buckets?.some(bucket => bucket.name === 'avatars')
      
      if (!avatarBucketExists) {
        // Create the bucket if it doesn't exist
        const { error: bucketError } = await supabase.storage.createBucket('avatars', {
          public: true  // Make the bucket public
        })
        
        if (bucketError) {
          throw new Error(`Failed to create storage bucket: ${bucketError.message}`)
        }
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const allowedTypes = ['jpg', 'jpeg', 'png', 'gif']
      
      if (!allowedTypes.includes(fileExt)) {
        throw new Error('File type not supported. Please upload a JPG, PNG, or GIF image.')
      }
      
      const filePath = `${uid}-${Math.random().toString(36).substring(2)}.${fileExt}`

      // Enable public access for this file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: `image/${fileExt}`
        })

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
        
      // Call onUpload with the file path, not the public URL
      onUpload(filePath)
      
      // Update local state to show the image
      const objectUrl = URL.createObjectURL(file)
      setAvatarUrl(objectUrl)
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      setError(error.message || 'Error uploading avatar')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div 
        className="w-[150px] h-[150px] rounded-full overflow-hidden border-2 border-gray-200 mb-3"
        style={{ width: size, height: size }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Avatar"
            width={size}
            height={size}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
            No image
          </div>
        )}
      </div>
      
      {error && (
        <div className="text-red-500 text-sm mb-2">
          {error}
        </div>
      )}
      
      <div className="mt-2">
        <label 
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded cursor-pointer text-center text-sm font-medium"
          htmlFor="single"
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </label>
        <input
          style={{
            visibility: 'hidden',
            position: 'absolute',
            width: 0,
            height: 0,
          }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  )
}