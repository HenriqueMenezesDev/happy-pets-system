
import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-card">
      {icon && <div className="text-muted-foreground mb-4 text-4xl">{icon}</div>}
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-muted-foreground mt-2 text-center max-w-sm">{description}</p>
      {onAction && actionLabel && (
        <Button onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
