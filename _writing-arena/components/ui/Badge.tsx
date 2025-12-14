import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}: BadgeProps) {
  const baseStyles = 'rounded-full inline-flex items-center justify-center font-semibold';
  
  const variants = {
    default: 'border border-white/10 bg-white/5 text-white/50',
    success: 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    warning: 'border border-yellow-400/30 bg-yellow-400/10 text-yellow-300',
    danger: 'border border-red-400/30 bg-red-400/10 text-red-300',
    info: 'border border-blue-400/30 bg-blue-400/10 text-blue-300',
  };
  
  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
  };
  
  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}

