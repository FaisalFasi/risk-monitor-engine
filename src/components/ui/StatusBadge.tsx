import React from 'react';
import { Badge } from './Badge';
import { CheckCircle2, XCircle, AlertTriangle, Info, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: 'success' | 'error' | 'warning' | 'info' | 'pending';
  text: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  className = ''
}) => {
  const statusConfig = {
    success: {
      className: 'bg-green-500 text-white',
      icon: CheckCircle2
    },
    error: {
      className: 'bg-red-500 text-white',
      icon: XCircle
    },
    warning: {
      className: 'bg-yellow-500 text-white',
      icon: AlertTriangle
    },
    info: {
      className: 'bg-blue-500 text-white',
      icon: Info
    },
    pending: {
      className: 'bg-gray-500 text-white',
      icon: Clock
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} ${className} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {text}
    </Badge>
  );
};
