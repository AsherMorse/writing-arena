/**
 * Time warning notification component
 * Displays time warnings consistently across all phases
 */

interface TimeWarningNotificationProps {
  warning: {
    message: string;
    severity: 'info' | 'warning' | 'urgent';
  } | null;
}

export function TimeWarningNotification({ warning }: TimeWarningNotificationProps) {
  if (!warning) return null;
  
  const severityStyles = {
    info: 'bg-[rgba(0,229,229,0.1)] border-[rgba(0,229,229,0.3)] text-[#00e5e5]',
    warning: 'bg-[rgba(255,144,48,0.1)] border-[rgba(255,144,48,0.3)] text-[#ff9030]',
    urgent: 'bg-[rgba(255,95,143,0.1)] border-[rgba(255,95,143,0.3)] text-[#ff5f8f]',
  };
  
  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-[10px] border px-4 py-2 text-sm font-medium shadow-lg animate-pulse ${severityStyles[warning.severity]}`}>
      ⏰ {warning.message}
    </div>
  );
}

