/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // For Google profile images
      'storage.googleapis.com',    // In case Supabase uses Google Storage
    ],
  },
  // Include any other custom Next.js configuration here
};

module.exports = nextConfig;