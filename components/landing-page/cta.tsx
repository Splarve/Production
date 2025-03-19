'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Modern animated CTA section
 */
export function CTA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="relative py-20 overflow-hidden" ref={ref}>
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary to-secondary"></div>
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 -z-10 opacity-10">
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="dotPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1.5" fill="#fff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotPattern)" />
        </svg>
      </div>
      
      {/* Animated background elements */}
      <motion.div 
        className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-accent opacity-10 blur-3xl"
        animate={{ 
          x: [0, 10, 0], 
          y: [0, 15, 0],
        }} 
        transition={{ 
          repeat: Infinity, 
          duration: 8, 
          ease: "easeInOut" 
        }}
      ></motion.div>
      
      <motion.div 
        className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-primary opacity-10 blur-3xl"
        animate={{ 
          x: [0, -15, 0], 
          y: [0, -10, 0],
        }} 
        transition={{ 
          repeat: Infinity, 
          duration: 10, 
          ease: "easeInOut" 
        }}
      ></motion.div>
      
      <div className="container relative px-4 md:px-6 z-10 mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-6">
              Ready to Take the Next Step?
            </h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl">
              Join thousands of professionals who've found success with Splarve. 
              Whether you're looking for your next career move or building a team, 
              we've got you covered.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="border-white text-black hover:bg-white/10 hover:text-white transition-all"
            >
              <Link href="/signup/personal">
                For Job Seekers
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="border-white text-black hover:bg-white/10 hover:text-white transition-all"
            >
              <Link href="/signup/company">
                For Employers
              </Link>
            </Button>
          </motion.div>
          
          {/* Stats section */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 text-white w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex flex-col items-center p-4 rounded-lg bg-white/10 backdrop-blur-sm">
              <span className="text-4xl font-bold mb-2">200k+</span>
              <span className="text-white/80">Active Users</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-white/10 backdrop-blur-sm">
              <span className="text-4xl font-bold mb-2">10k+</span>
              <span className="text-white/80">Companies</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-white/10 backdrop-blur-sm">
              <span className="text-4xl font-bold mb-2">50k+</span>
              <span className="text-white/80">Job Matches</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 