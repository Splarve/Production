'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

/**
 * Animated floating element component
 */
const FloatingElement = ({ 
  children, 
  delay = 0, 
  duration = 4, 
  yOffset = 15 
}: { 
  children: React.ReactNode; 
  delay?: number; 
  duration?: number; 
  yOffset?: number;
}) => {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ 
        y: [-yOffset, yOffset, -yOffset],
      }}
      transition={{ 
        repeat: Infinity, 
        duration: duration,
        delay: delay,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Modern hero section with animations
 */
export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="relative overflow-hidden py-20 md:py-32 bg-background">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffa85712_1px,transparent_1px),linear-gradient(to_bottom,#ffa85712_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/10 blur-[100px]"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-[10%] opacity-70 -z-10">
        <FloatingElement delay={0.5} yOffset={10}>
          <div className="h-24 w-24 rounded-full bg-accent/10 backdrop-blur-md border border-accent/20"></div>
        </FloatingElement>
      </div>
      <div className="absolute bottom-20 right-[10%] opacity-70 -z-10">
        <FloatingElement delay={0.3} yOffset={12}>
          <div className="h-32 w-32 rounded-full bg-primary/10 backdrop-blur-md border border-primary/20"></div>
        </FloatingElement>
      </div>
      <div className="absolute top-1/2 left-[80%] opacity-70 -z-10">
        <FloatingElement delay={0.7} yOffset={8}>
          <div className="h-16 w-16 rounded-full bg-secondary/10 backdrop-blur-md border border-secondary/20"></div>
        </FloatingElement>
      </div>

      {/* Main content */}
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <motion.div 
          className="flex flex-col md:flex-row items-center gap-12"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Text content */}
          <div className="md:w-1/2 space-y-6">
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold !leading-tight tracking-tighter text-foreground"
              variants={itemVariants}
            >
              Find Your Dream Job with{' '}
              <div className="inline-block">
                <FloatingElement duration={3} yOffset={5} delay={1}>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent inline-block">
                    Splarve
                  </span>
                </FloatingElement>
              </div>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground max-w-[600px]"
              variants={itemVariants}
            >
              Whether you're looking for your next career opportunity or searching for the perfect talent, 
              Splarve makes your journey simpler and more effective.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              variants={itemVariants}
            >
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent hover:from-secondary hover:to-accent text-white"
              >
                <Link href="/signup/personal">For Job Seekers</Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline" 
                className="border-[#c9a0ff] text-[#8f00ff] hover:text-[#4b0076] hover:bg-[#c9a0ff]/5"
              >
                <Link href="/signup/company">For Employers</Link>
              </Button>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-4 text-sm text-muted-foreground"
              variants={itemVariants}
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-br from-primary/50 to-accent/50 opacity-50"></div>
                  </div>
                ))}
              </div>
              <div>
                <span className="font-medium">4,000+</span> professionals joined this month
              </div>
            </motion.div>
          </div>
          
          {/* Image section */}
          <div className="md:w-1/2 relative">
            <FloatingElement duration={6} yOffset={10}>
              <div className="relative h-[400px] w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-6xl md:text-7xl lg:text-8xl font-bold text-center">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                        Splarve
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-2xl border border-primary/20 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatType: "reverse",
                      duration: 2,
                    }}
                  >
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  </motion.div>
                </div>
                
                <div className="absolute -top-6 -right-6 h-24 w-24 rounded-2xl border border-accent/20 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 8,
                      ease: "linear",
                    }}
                  >
                    <div className="h-12 w-12 rounded-full border-2 border-accent border-dashed flex items-center justify-center">
                      <div className="h-8 w-8 rounded-full bg-accent"></div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </FloatingElement>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 