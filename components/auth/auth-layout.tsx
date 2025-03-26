'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  type: 'personal' | 'company';
  mode: 'login' | 'signup';
}

/**
 * Consistent layout for all authentication pages with branded header and footer
 */
export function AuthLayout({ children, type, mode }: AuthLayoutProps) {
  // Determine opposite user type for the switcher
  const oppositeType = type === 'personal' ? 'company' : 'personal';
  const oppositeLabel = type === 'personal' ? 'For Companies' : 'For Job Seekers';
  const currentYear = new Date().getFullYear();
  const isCompany = type === 'company';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffa85712_1px,transparent_1px),linear-gradient(to_bottom,#ffa85712_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className={`absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full ${isCompany ? 'bg-[#c9a0ff]/10' : 'bg-primary/10'} blur-[100px]`}></div>
      
      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center bg-white/80 backdrop-blur-sm shadow-sm z-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold">
            <span className={`bg-clip-text text-transparent bg-gradient-to-r ${isCompany ? 'from-[#c9a0ff] to-[#8f00ff]' : 'from-primary to-accent'}`}>
              Splarve
            </span>
          </div>
        </Link>
        
        <div className="flex gap-3">
          <Link 
            href={`/${mode}/${oppositeType}`} 
            className={`px-4 py-2 rounded-md border ${
              isCompany 
                ? 'border-[#c9a0ff]/30 text-[#8f00ff] hover:bg-[#c9a0ff]/5' 
                : 'border-primary/30 text-primary hover:bg-primary/5'
            } transition-colors`}
          >
            {oppositeLabel}
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6 relative">
        {/* Decorative elements */}
        <motion.div 
          className={`absolute top-20 left-20 h-16 w-16 rounded-full ${
            isCompany 
              ? 'bg-[#c9a0ff]/10 border-[#c9a0ff]/20' 
              : 'bg-primary/10 border-primary/20'
          } backdrop-blur-md border hidden lg:block`}
          animate={{ 
            y: [0, 15, 0], 
          }} 
          transition={{ 
            repeat: Infinity, 
            duration: 6, 
            ease: "easeInOut" 
          }}
        ></motion.div>
        
        <motion.div 
          className={`absolute bottom-20 right-20 h-24 w-24 rounded-full ${
            isCompany 
              ? 'bg-[#8f00ff]/10 border-[#8f00ff]/20' 
              : 'bg-accent/10 border-accent/20'
          } backdrop-blur-md border hidden lg:block`}
          animate={{ 
            y: [0, -20, 0], 
          }} 
          transition={{ 
            repeat: Infinity, 
            duration: 8, 
            ease: "easeInOut",
            delay: 1 
          }}
        ></motion.div>
        
        {children}
      </main>

      {/* Footer */}
      <footer className={`py-6 bg-white/80 backdrop-blur-sm border-t ${isCompany ? 'border-[#c9a0ff]/10' : 'border-primary/10'}`}>
        <div className="container mx-auto px-6 text-center text-muted-foreground text-sm">
          <p>© {currentYear} Splarve. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 