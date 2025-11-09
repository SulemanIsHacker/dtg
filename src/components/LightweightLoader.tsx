import React from 'react';

interface LightweightLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LightweightLoader: React.FC<LightweightLoaderProps> = ({
  size = 'md',
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {/* Pure CSS spinner - no JavaScript animations */}
      <div className={`${sizeClasses[size]} relative`}>
        <div className={`${sizeClasses[size]} border-2 border-muted border-t-primary rounded-full animate-spin`} />
      </div>
      
      {text && (
        <p className={`text-muted-foreground ${textSizeClasses[size]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Ultra-lightweight dots loader using only CSS
export const CSSDotsLoader: React.FC<{ text?: string; className?: string }> = ({ 
  text, 
  className = '' 
}) => (
  <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
    {text && (
      <p className="text-muted-foreground text-sm font-medium">
        {text}
      </p>
    )}
  </div>
);

// Pulse loader using only CSS
export const CSSPulseLoader: React.FC<{ text?: string; className?: string }> = ({ 
  text, 
  className = '' 
}) => (
  <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
    <div className="w-8 h-8 bg-primary rounded-full animate-pulse" />
    {text && (
      <p className="text-muted-foreground text-sm font-medium">
        {text}
      </p>
    )}
  </div>
);

// Skeleton loader for content placeholders
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
    <div className="space-y-4">
      <div className="h-4 bg-muted rounded animate-pulse" style={{ width: '60%' }} />
      <div className="h-3 bg-muted rounded animate-pulse" style={{ width: '100%' }} />
      <div className="h-3 bg-muted rounded animate-pulse" style={{ width: '80%' }} />
      <div className="h-3 bg-muted rounded animate-pulse" style={{ width: '40%' }} />
    </div>
  </div>
);

// Grid skeleton for tool cards
export const SkeletonGrid: React.FC<{ count?: number; className?: string }> = ({ 
  count = 6, 
  className = '' 
}) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
