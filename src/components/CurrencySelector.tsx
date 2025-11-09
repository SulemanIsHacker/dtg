import React from 'react';
import { useCurrencyConverter } from '../hooks/useCurrencyConverter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

interface CurrencySelectorProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ 
  className = '', 
  showLabel = true,
  variant = 'default'
}) => {
  const { 
    selectedCurrency, 
    setSelectedCurrency, 
    availableCurrencies, 
    getCurrencySymbol, 
    getCurrencyName,
    isBaseCurrency 
  } = useCurrencyConverter();

  if (variant === 'minimal') {
    return (
      <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
        <SelectTrigger className={`w-auto ${className}`}>
          <SelectValue>
            <span className="flex items-center gap-2">
              <span className="text-lg">{getCurrencySymbol()}</span>
              <span className="text-sm font-medium">{selectedCurrency}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableCurrencies.map((currency) => (
            <SelectItem key={currency} value={currency}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{getCurrencySymbol(currency)}</span>
                <span className="font-medium">{currency}</span>
                <span className="text-muted-foreground text-sm">
                  {getCurrencyName(currency)}
                </span>
                {currency === 'NGN' && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Base
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabel && (
          <span className="text-sm font-medium text-muted-foreground">Currency:</span>
        )}
        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
          <SelectTrigger className="w-24">
            <SelectValue>
              <span className="flex items-center gap-1">
                <span>{getCurrencySymbol()}</span>
                <span className="text-sm">{selectedCurrency}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {availableCurrencies.map((currency) => (
              <SelectItem key={currency} value={currency}>
                <div className="flex items-center gap-2">
                  <span>{getCurrencySymbol(currency)}</span>
                  <span className="font-medium">{currency}</span>
                  {currency === 'NGN' && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      Base
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Display Currency</label>
          {!isBaseCurrency && (
            <Badge variant="outline" className="text-xs">
              Converted from NGN
            </Badge>
          )}
        </div>
      )}
      <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
        <SelectTrigger>
          <SelectValue>
            <div className="flex items-center gap-2">
              <span className="text-lg">{getCurrencySymbol()}</span>
              <div className="flex flex-col items-start">
                <span className="font-medium">{selectedCurrency}</span>
                <span className="text-xs text-muted-foreground">
                  {getCurrencyName()}
                </span>
              </div>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableCurrencies.map((currency) => (
            <SelectItem key={currency} value={currency}>
              <div className="flex items-center gap-3 w-full">
                <span className="text-lg">{getCurrencySymbol(currency)}</span>
                <div className="flex flex-col items-start flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{currency}</span>
                    {currency === 'NGN' && (
                      <Badge variant="secondary" className="text-xs">
                        Base Currency
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {getCurrencyName(currency)}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CurrencySelector;

