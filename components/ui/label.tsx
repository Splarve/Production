'use client';

import * as React from "react";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    const baseStyles = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";
    const combinedClassName = className ? `${baseStyles} ${className}` : baseStyles;
    
    return (
      <label
        className={combinedClassName}
        ref={ref}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";

export { Label };