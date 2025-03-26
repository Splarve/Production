'use client';

import { motion } from 'framer-motion';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  error?: string | null;
  message?: string | null;
  isCompany?: boolean;
}

/**
 * Styled container for authentication forms with consistent styling
 */
export function AuthCard({ children, title, subtitle, error, message, isCompany = false }: AuthCardProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className={`bg-white p-8 rounded-xl shadow-lg w-full max-w-md border ${
        isCompany ? "border-[#c9a0ff]/10" : "border-primary/10"
      }`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-2">{subtitle}</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Success message */}
      {message && (
        <div className={`mb-6 p-3 rounded-md ${
          isCompany 
            ? "bg-[#c9a0ff]/10 border border-[#c9a0ff]/20 text-[#4b0076]"
            : "bg-green-50 border border-green-200 text-green-700"
        }`}>
          {message}
        </div>
      )}

      {children}
    </motion.div>
  );
} 