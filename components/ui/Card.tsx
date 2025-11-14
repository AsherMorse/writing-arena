import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'accent' | 'muted';
}

export default function Card({
  children,
  className = '',
  size = 'lg',
  variant = 'default',
}: CardProps) {
  const baseStyles = 'rounded-3xl border bg-[#141e27]';
  
  const variants = {
    default: 'border-white/10',
    accent: 'border-emerald-400/30 bg-emerald-500/5',
    muted: 'border-white/10 opacity-60',
  };
  
  const sizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </div>
  );
}

