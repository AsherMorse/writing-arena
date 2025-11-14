import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  const baseStyles = 'rounded-xl font-semibold transition-all inline-flex items-center justify-center';
  
  const variants = {
    primary: disabled
      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
      : 'border border-emerald-400/40 bg-emerald-500 text-[#0c141d] hover:bg-emerald-400 hover:scale-105',
    secondary: disabled
      ? 'border border-white/10 bg-white/5 text-white/40 cursor-not-allowed'
      : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10',
    danger: disabled
      ? 'bg-red-500/10 border border-red-500/20 text-red-400/40 cursor-not-allowed'
      : 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30',
    ghost: disabled
      ? 'text-white/40 cursor-not-allowed'
      : 'text-emerald-200 hover:text-emerald-100',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

