import React from 'react';
import { useCurrencyConverter } from '../hooks/useCurrencyConverter';
import { Badge } from './ui/badge';

interface CurrencyDisplayProps {
  pkrAmount: number;
  showSymbol?: boolean;
  showConversion?: boolean;
  showBaseCurrency?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'highlight' | 'muted';
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  pkrAmount,
  showSymbol = true,
  showConversion = false,
  showBaseCurrency = false,
  className = '',
  size = 'md',
  variant = 'default'
}) => {
  const { 
    selectedCurrency, 
    formatCurrency, 
    getCurrencySymbol, 
    isBaseCurrency 
  } = useCurrencyConverter();

  // Safety check for undefined/null pkrAmount
  if (pkrAmount === undefined || pkrAmount === null || isNaN(pkrAmount)) {
    return <span className={`text-muted-foreground ${className}`}>Price not available</span>;
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold'
  };

  const variantClasses = {
    default: 'text-foreground',
    highlight: 'text-primary font-semibold',
    muted: 'text-muted-foreground'
  };

  const baseClasses = `${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  if (isBaseCurrency) {
    return (
      <span className={baseClasses}>
        {formatCurrency(pkrAmount, showSymbol)}
      </span>
    );
  }

  if (showConversion) {
    return (
      <div className="flex flex-col gap-1">
        <span className={baseClasses}>
          {formatCurrency(pkrAmount, showSymbol)}
        </span>
        <span className="text-xs text-muted-foreground">
          Base: {getCurrencySymbol('NGN')}{pkrAmount.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
        </span>
      </div>
    );
  }

  if (showBaseCurrency) {
    return (
      <div className="flex items-center gap-2">
        <span className={baseClasses}>
          {formatCurrency(pkrAmount, showSymbol)}
        </span>
        <Badge variant="outline" className="text-xs">
          {getCurrencySymbol('NGN')}{pkrAmount.toLocaleString('en-US', { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0 
          })}
        </Badge>
      </div>
    );
  }

  return (
    <span className={baseClasses}>
      {formatCurrency(pkrAmount, showSymbol)}
    </span>
  );
};

// Specialized components for common use cases
export const PriceDisplay: React.FC<Omit<CurrencyDisplayProps, 'showSymbol' | 'showConversion'>> = (props) => (
  <CurrencyDisplay {...props} showSymbol={true} />
);

export const RevenueDisplay: React.FC<Omit<CurrencyDisplayProps, 'showSymbol' | 'showConversion'>> = (props) => (
  <CurrencyDisplay {...props} showSymbol={true} variant="highlight" size="lg" />
);

export const AnalyticsDisplay: React.FC<Omit<CurrencyDisplayProps, 'showSymbol' | 'showConversion'>> = (props) => (
  <CurrencyDisplay {...props} showSymbol={true} showBaseCurrency={true} />
);

export default CurrencyDisplay;

