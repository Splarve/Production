'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Github, Twitter, Linkedin, Facebook, Instagram, ArrowRight } from 'lucide-react';

/**
 * Social media icon with hover animation
 */
const SocialIcon = ({ 
  icon: Icon, 
  href 
}: { 
  icon: any; 
  href: string 
}) => {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-primary transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon size={18} />
    </motion.a>
  );
};

/**
 * Footer link with hover animation
 */
const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <motion.div
      whileHover={{ x: 3 }}
      transition={{ duration: 0.2 }}
    >
      <Link 
        href={href} 
        className="text-slate-400 hover:text-white transition-colors"
      >
        {children}
      </Link>
    </motion.div>
  );
};

/**
 * Modern footer component with newsletter signup
 */
export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // This would normally connect to a newsletter service
      setIsSubmitted(true);
    }
  };

  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'For Job Seekers', href: '/signup/personal' },
        { name: 'For Employers', href: '/signup/company' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Blog', href: '#' },
        { name: 'Help Center', href: '#' },
        { name: 'Guides', href: '#' },
        { name: 'Events', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About', href: '#' },
        { name: 'Careers', href: '#' },
        { name: 'Contact', href: '#' },
        { name: 'Partners', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy', href: '#' },
        { name: 'Terms', href: '#' },
        { name: 'Cookies', href: '#' },
        { name: 'Licenses', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Logo and company info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-800">
                <Image
                  src="/next.svg"
                  alt="Splarve Logo"
                  width={40}
                  height={40}
                  className="invert"
                />
              </div>
              <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Splarve</span>
            </div>
            <p className="text-slate-400 max-w-xs">
              Connecting talented professionals with the best companies through our advanced job matching platform.
            </p>
            <div className="flex gap-3">
              <SocialIcon icon={Twitter} href="https://twitter.com" />
              <SocialIcon icon={Linkedin} href="https://linkedin.com" />
              <SocialIcon icon={Facebook} href="https://facebook.com" />
              <SocialIcon icon={Instagram} href="https://instagram.com" />
              <SocialIcon icon={Github} href="https://github.com" />
            </div>
          </div>

          {/* Footer links */}
          {footerSections.map((section, i) => (
            <div key={i} className="space-y-4">
              <h3 className="text-md font-medium">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <FooterLink href={link.href}>{link.name}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10 bg-slate-800" />

        {/* Newsletter section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-10">
          <div>
            <h3 className="text-lg font-medium mb-3">Subscribe to our newsletter</h3>
            <p className="text-slate-400 mb-4">
              Stay up to date with the latest news, updates, and job opportunities.
            </p>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 rounded-md bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-secondary"
                >
                  <ArrowRight size={16} />
                </Button>
              </form>
            ) : (
              <p className="text-green-400">Thanks for subscribing!</p>
            )}
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Splarve. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              <Link href="#" className="hover:text-white transition-colors">Status</Link>
              <Link href="#" className="hover:text-white transition-colors">Sitemap</Link>
              <Link href="#" className="hover:text-white transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 