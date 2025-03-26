'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface AuthInputProps {
  id: string;
  name: string;
  type: string;
  label: string;
  placeholder: string;
  required?: boolean;
  minLength?: number;
  pattern?: string;
  helperText?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isCompany?: boolean;
}

/**
 * Styled input field for authentication forms
 */
export function AuthInput({
  id,
  name,
  type,
  label,
  placeholder,
  required = false,
  minLength,
  pattern,
  helperText,
  value,
  onChange,
  isCompany = false,
}: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="space-y-1.5 mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label} {required && <span className={isCompany ? "text-[#8f00ff]" : "text-accent"}>*</span>}
      </label>
      
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          minLength={minLength}
          pattern={pattern}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-md 
                    bg-white transition-all duration-200 outline-none
                    ${isCompany 
                      ? "border-[#c9a0ff]/20 focus:ring-2 focus:ring-[#c9a0ff]/20 focus:border-[#c9a0ff]" 
                      : "border-primary/20 focus:ring-2 focus:ring-primary/20 focus:border-primary"}`}
        />
        
        {isFocused && (
          <motion.div 
            className={`absolute inset-0 pointer-events-none border rounded-md ${isCompany ? "border-[#c9a0ff]" : "border-primary"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
      
      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
} 