import React from 'react';
import { OrderStatus } from '../../types';
import { Clock, RefreshCw, CheckCircle2, CheckCheck, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const config: Record<OrderStatus, { bg: string; text: string; border: string; icon: React.ReactNode; label: string }> = {
    Waiting: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />,
      label: 'Waiting in Queue',
    },
    Preparing: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />,
      label: 'Now Preparing',
    },
    Ready: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-300',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />,
      label: 'Ready for Collection',
    },
    Completed: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
      icon: <CheckCheck className="w-3.5 h-3.5 text-slate-500" />,
      label: 'Completed',
    },
    Cancelled: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: <XCircle className="w-3.5 h-3.5 text-rose-500" />,
      label: 'Cancelled',
    },
  };

  const current = config[status] || config.Waiting;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs sm:text-sm font-semibold gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm font-bold gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs font-medium ${current.bg} ${current.text} ${current.border} ${sizeClasses[size]}`}
    >
      {showIcon && current.icon}
      <span>{current.label}</span>
    </span>
  );
};
