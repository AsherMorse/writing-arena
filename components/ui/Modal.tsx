import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  maxWidth = '2xl',
  className = '',
}: ModalProps) {
  if (!isOpen) return null;
  
  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl ${maxWidths[maxWidth]} w-full max-h-[90vh] overflow-y-auto border-2 border-white/10 shadow-2xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  icon?: ReactNode;
}

export function ModalHeader({ title, subtitle, onClose, icon }: ModalHeaderProps) {
  return (
    <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-3xl border-b border-white/10 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon && <div className="text-4xl">{icon}</div>}
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-white/80 text-sm">{subtitle}</p>}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all text-white text-xl"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div className={`sticky bottom-0 bg-slate-900 p-6 rounded-b-3xl border-t border-white/10 ${className}`}>
      {children}
    </div>
  );
}

interface ModalContentProps {
  children: ReactNode;
  className?: string;
}

export function ModalContent({ children, className = '' }: ModalContentProps) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

