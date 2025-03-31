# Splarve - The Big Idea

Splarve is currently under development as our Capstone Project!

## 🚀 Features

### For Job Seekers

* TO-DO Feature List

### For Companies

* TO-DO Feature List

## 💻 Tech Stack

Splarve is built using the following technologies:

* **Frontend** : Next.js 15, React 19, TailwindCSS 4
* **Authentication & Database** : Supabase (PostgreSQL + Auth)
* **Email** : SendGrid
* **UI Components** : Shadcn UI
* **Animations** : Framer Motion
* **Rich Text Editing** : Quill

## 🏗️ Project Structure

```
/app                 # Next.js application routes and API
  /api               # Server-side API routes 
  /auth              # Auth-related pages and callbacks
  /dashboard         # Dashboard pages for both user types
  /login, /signup    # Authentication pages
/components          # React components
  /auth              # Authentication components
  /company           # Company dashboard components
  /job-posts         # Job posting components
  /landing-page      # Landing page components
  /ui                # Shared UI components (shadcn)
/hooks               # React hooks
/lib                 # Utility libraries
/public              # Static assets
/utils               # Utility functions
  /auth              # Authentication utilities
  /supabase          # Supabase client utilities
```

## 🔐 Role-Based Access Control

The application implements a comprehensive role system for company members:

* **Owner** : Full control of the company, billing, and users
* **Admin** : Manage company profile, users, and view analytics
* **HR** : Invite users and manage regular team members
* **Social** : View analytics and manage social content
* **Member** : Basic access to company content

## 🚦 Getting Started

### Prerequisites

* Node.js (v18+)
* We like to use pnpm
* Supabase account for database and authentication
* SendGrid account for email services

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/splarve.git
   cd splarve
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables by creating a `.env.local` file based on the example below:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   SENDGRID_API_KEY=your_sendgrid_api_key
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   ```
4. Start the development server:
   ```bash
   pnpm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`

## 📝 Database Schema

The application uses a PostgreSQL database with the following key tables:

* ---- We will finalize this!

## 🧪 Development Features

* TypeScript for type safety
* ESLint for code linting
* Next.js App Router for routing
* Server components and API routes
* Middleware for authentication protection

## 📱 Responsive Design

The application is fully responsive with:

* ---- Do a device check later

## 🙋 Contributing

1. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is commercially licensed to Daisuke Fujiwara and Enes Akyuz, and no change is allowed unless you are a part of the organization of Splarve officially and have an employee-employer relationship with us.

## ✉️ Contact

For any questions or feedback, please reach out to the project maintainers.

---

Built with ❤️ using Next.js, React, and Supabase
