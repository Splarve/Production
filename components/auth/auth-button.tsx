'use client';

import { motion } from 'framer-motion';

interface AuthButtonProps {
  type: 'submit' | 'button';
  children: React.ReactNode;
  isLoading?: boolean;
  onClick?: () => void;
  variant?: 'primary' | 'outline';
  fullWidth?: boolean;
  className?: string;
  isCompany?: boolean;
}

/**
 * Styled button for authentication forms with loading state support
 */
export function AuthButton({
  type,
  children,
  isLoading = false,
  onClick,
  variant = 'primary',
  fullWidth = true,
  className = '',
  isCompany = false,
}: AuthButtonProps) {
  const baseClasses = "px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none";
  const widthClasses = fullWidth ? "w-full" : "";
  
  // Company-specific or personal styling
  const variantClasses = {
    primary: isCompany 
      ? "bg-gradient-to-r from-[#c9a0ff] to-[#8f00ff] text-white hover:from-[#4b0076] hover:to-[#8f00ff] focus:ring-2 focus:ring-[#c9a0ff]/50 disabled:opacity-70 disabled:cursor-not-allowed"
      : "bg-gradient-to-r from-primary to-accent text-white hover:from-secondary hover:to-accent focus:ring-2 focus:ring-primary/50 disabled:opacity-70 disabled:cursor-not-allowed",
    outline: isCompany
      ? "border border-[#c9a0ff] text-[#8f00ff] hover:bg-[#c9a0ff]/5 focus:ring-2 focus:ring-[#c9a0ff]/30 disabled:opacity-70 disabled:cursor-not-allowed"
      : "border border-primary text-primary hover:bg-primary/5 focus:ring-2 focus:ring-primary/30 disabled:opacity-70 disabled:cursor-not-allowed"
  };
  
  const buttonClasses = `${baseClasses} ${widthClasses} ${variantClasses[variant]} ${className}`;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={buttonClasses}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {typeof children === 'string' && children.includes('...') ? children : 'Processing...'}
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
} 