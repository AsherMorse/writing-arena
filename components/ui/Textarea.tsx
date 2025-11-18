'use client';

import { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'feedback' | 'revision';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ variant = 'default', className = '', ...props }, ref) => {
    const baseClasses = 'w-full p-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:border-blue-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      default: 'min-h-[80px]',
      feedback: 'min-h-[100px]',
      revision: 'min-h-[200px]',
    };
    
    return (
      <textarea
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
        spellCheck="true"
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

