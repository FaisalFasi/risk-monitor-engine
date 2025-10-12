import React from 'react';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { ClipboardList, LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode | LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  const IconComponent = icon as LucideIcon;
  const defaultIcon = <ClipboardList className="w-16 h-16 mx-auto text-slate-400" />;
  
  return (
    <Card className={`text-center py-12 ${className}`}>
      <CardContent>
        <div className="mb-4">
          {icon ? (
            typeof icon === 'function' ? (
              <IconComponent className="w-16 h-16 mx-auto text-slate-400" />
            ) : (
              icon
            )
          ) : (
            defaultIcon
          )}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
          {description}
        </p>
        {actionText && onAction && (
          <Button onClick={onAction} variant="outline">
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
