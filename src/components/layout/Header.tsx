import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { Menu } from 'lucide-react';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  actions,
  className,
  onMenuToggle,
  showMenuButton = false,
}) => {
  return (
    <header
      className={cn(
        'flex items-center justify-between p-4 border-b border-border bg-background',
        'sticky top-0 z-40',
        className
      )}
    >
      <div className="flex items-center space-x-4">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        
        <div className="flex flex-col">
          {title && (
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </header>
  );
};

export default Header;
