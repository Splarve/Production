'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

/**
 * Modern animated header component for the landing page
 */
export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Animation variants
  const logoVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        ease: 'easeOut' 
      }
    }
  };

  const navVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto max-w-7xl">
        <motion.div 
          className="flex items-center gap-2"
          initial="hidden"
          animate="visible"
          variants={logoVariants}
        >
          <div className="relative h-8 w-8 overflow-hidden rounded-full">
            <Image
              src="/next.svg"
              alt="Splarve Logo"
              width={32}
              height={32}
              className="dark:invert"
              priority
            />
          </div>
          <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Splarve</span>
        </motion.div>

        {/* Desktop navigation */}
        <motion.nav 
          className="hidden md:flex items-center gap-6"
          initial="hidden"
          animate="visible"
          variants={navVariants}
        >
          <motion.div variants={navItemVariants}>
            <Button variant="ghost" asChild className="text-foreground hover:text-primary">
              <Link href="#features">Features</Link>
            </Button>
          </motion.div>
          <motion.div variants={navItemVariants}>
            <Button variant="ghost" asChild className="text-foreground hover:text-primary">
              <Link href="#how-it-works">How it works</Link>
            </Button>
          </motion.div>
          <motion.div variants={navItemVariants}>
            <Button variant="ghost" asChild className="text-foreground hover:text-primary">
              <Link href="#pricing">Pricing</Link>
            </Button>
          </motion.div>
          <motion.div variants={navItemVariants}>
            <Button variant="ghost" asChild className="text-foreground hover:text-primary">
              <Link href="/login/personal">Log in</Link>
            </Button>
          </motion.div>
          <motion.div variants={navItemVariants}>
            <Button asChild className="bg-gradient-to-r from-primary to-accent hover:from-secondary hover:to-accent text-white">
              <Link href="/signup/personal">Sign up</Link>
            </Button>
          </motion.div>
        </motion.nav>

        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-foreground hover:text-primary"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobileMenuVariants}
          >
            <div className="container px-4 py-4 flex flex-col gap-4 border-t border-border mx-auto max-w-7xl">
              <Button variant="ghost" asChild className="justify-start text-foreground hover:text-primary">
                <Link href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
              </Button>
              <Button variant="ghost" asChild className="justify-start text-foreground hover:text-primary">
                <Link href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)}>How it works</Link>
              </Button>
              <Button variant="ghost" asChild className="justify-start text-foreground hover:text-primary">
                <Link href="#pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
              </Button>
              <Button variant="ghost" asChild className="justify-start text-foreground hover:text-primary">
                <Link href="/login/personal" onClick={() => setIsMobileMenuOpen(false)}>Log in</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-primary to-accent hover:from-secondary hover:to-accent text-white w-full">
                <Link href="/signup/personal" onClick={() => setIsMobileMenuOpen(false)}>Sign up</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
} 