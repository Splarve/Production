'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Building, User, Search, Bell, Briefcase, BarChart, CheckCircle2, Users } from 'lucide-react';

/**
 * Feature card component with hover effects
 */
const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  features = [], 
  color = 'primary',
  index = 0,
}: { 
  icon: any; 
  title: string; 
  description: string; 
  features?: string[];
  color?: 'primary' | 'accent';
  index?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  // Gradient maps for different colors
  const gradients = {
    primary: {
      background: 'from-primary/20 to-primary/5',
      border: 'border-primary/20',
      icon: 'bg-primary text-white',
      hoverBg: 'group-hover:bg-primary/10',
      checkmark: 'text-primary',
    },
    accent: {
      background: 'from-accent/20 to-accent/5',
      border: 'border-accent/20',
      icon: 'bg-accent text-white',
      hoverBg: 'group-hover:bg-accent/10',
      checkmark: 'text-accent',
    },
  };

  const gradient = gradients[color];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="w-full"
    >
      <Card className={`group h-full overflow-hidden border ${gradient.border} bg-gradient-to-b ${gradient.background} transition-all duration-300 hover:shadow-md`}>
        <CardHeader className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full p-2 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${gradient.icon}`}>
              <Icon size={20} strokeWidth={2} />
            </div>
          </div>
          <CardTitle className="text-xl font-bold transition-colors duration-300 text-foreground">{title}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <ul className="space-y-2 text-sm">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start">
                <span className={`mr-2 ${gradient.checkmark}`}>
                  <CheckCircle2 size={16} />
                </span>
                <span className="text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * Features section with animation
 */
export function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const descriptionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, delay: 0.2 }
    }
  };

  return (
    <section id="features" className="relative py-20 overflow-hidden bg-background">
      {/* Background elements */}
      <div className="absolute left-0 right-0 bottom-0 -z-10 m-auto h-[250px] w-[250px] rounded-full bg-accent/10 blur-[100px]"></div>
      
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16" ref={ref}>
          <motion.h2 
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground"
            variants={titleVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            How Splarve Works
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground"
            variants={descriptionVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            Empowering both job seekers and employers with intuitive tools to streamline the hiring process.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Job Seekers */}
          <FeatureCard
            icon={User}
            title="For Job Seekers"
            description="Everything you need to advance your career journey."
            features={[
              "Create your professional profile",
              "Discover opportunities matching your skills",
              "Apply with just a few clicks",
              "Track your application status"
            ]}
            color="primary"
            index={0}
          />
          
          {/* For Companies */}
          <FeatureCard
            icon={Building}
            title="For Companies"
            description="Tools to build your team with the right talent."
            features={[
              "Build your employer brand",
              "Post detailed job listings",
              "Invite team members with specific roles",
              "Connect with qualified candidates"
            ]}
            color="accent"
            index={1}
          />
          
          {/* Additional Features for Job Seekers */}
          <FeatureCard
            icon={Search}
            title="Smart Search"
            description="Find the perfect match for your skills and interests."
            features={[
              "AI-powered job recommendations",
              "Filter by location, salary, and more",
              "Save favorite searches",
              "Get notified about new matches"
            ]}
            color="primary"
            index={2}
          />
          
          {/* Additional Features for Companies */}
          <FeatureCard
            icon={Users}
            title="Team Collaboration"
            description="Streamline your hiring process with collaborative tools."
            features={[
              "Add team members to review applications",
              "Assign roles and permissions",
              "Collaborative feedback system",
              "Unified hiring pipeline"
            ]}
            color="accent"
            index={3}
          />
          
          {/* Career Growth */}
          <FeatureCard
            icon={BarChart}
            title="Career Insights"
            description="Make informed decisions about your career path."
            features={[
              "Salary insights and comparisons",
              "Industry trend analytics",
              "Skill demand forecasting",
              "Career growth recommendations"
            ]}
            color="primary"
            index={4}
          />
          
          {/* Advanced Recruiting */}
          <FeatureCard
            icon={Briefcase}
            title="Advanced Recruiting"
            description="Powerful tools to find the best candidates faster."
            features={[
              "Candidate screening automation",
              "Skill assessment tools",
              "Interview scheduling system",
              "Applicant tracking analytics"
            ]}
            color="accent"
            index={5}
          />
        </div>
      </div>
    </section>
  );
} 