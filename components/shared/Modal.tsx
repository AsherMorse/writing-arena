'use client';

import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  variant?: 'default' | 'ranking' | 'tips';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  variant = 'default', 
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  const variantClasses = {
    default: 'border-[rgba(255,255,255,0.05)]',
    ranking: 'border-[rgba(0,229,229,0.2)]',
    tips: 'border-[rgba(0,212,146,0.2)]',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div 
        className={`relative mx-4 max-h-[90vh] overflow-y-auto rounded-[14px] border bg-[#101012] p-8 shadow-2xl ${sizeClasses[size]} ${variantClasses[variant]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-[6px] border border-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.4)] transition-all hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgba(255,255,255,0.8)]"
            aria-label="Close modal"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {title && (
          <h2 className="mb-6 text-center text-xl font-semibold text-[rgba(255,255,255,0.8)]">{title}</h2>
        )}
        
        {children}
      </div>
    </div>
  );
}
