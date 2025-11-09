import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Exchange rates (NGN as base currency = 1)
const EXCHANGE_RATES: Record<string, number> = {
  NGN: 1,
  // Note: Other rates are placeholders and should be updated to accurate NGN-based rates if conversions are required
  USD: 0.001, 
  EUR: 0.0009, 
  GBP: 0.0008, 
  AED: 0.0037,
  SAR: 0.0037,
  CAD: 0.0013,
  AUD: 0.0015,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  SAR: '﷼',
  CAD: 'C$',
  AUD: 'A$',
};

const CURRENCY_NAMES: Record<string, string> = {
  NGN: 'Nigerian Naira',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  AED: 'UAE Dirham',
  SAR: 'Saudi Riyal',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
};

interface CurrencyContextType {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  convertFromPKR: (pkrAmount: number) => number;
  formatCurrency: (pkrAmount: number, showSymbol?: boolean, showConversion?: boolean) => string;
  getCurrencySymbol: (currency?: string) => string;
  getCurrencyName: (currency?: string) => string;
  availableCurrencies: string[];
  isBaseCurrency: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('NGN');

  // Load saved currency preference
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency && EXCHANGE_RATES[savedCurrency]) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  // Save currency preference
  useEffect(() => {
    localStorage.setItem('selectedCurrency', selectedCurrency);
  }, [selectedCurrency]);

  const convertFromPKR = (pkrAmount: number): number => {
    if (selectedCurrency === 'NGN') return pkrAmount;
    return pkrAmount * EXCHANGE_RATES[selectedCurrency];
  };

  const formatCurrency = (
    pkrAmount: number, 
    showSymbol: boolean = true, 
    showConversion: boolean = false
  ): string => {
    // Safety check for invalid amounts
    if (pkrAmount === undefined || pkrAmount === null || isNaN(pkrAmount)) {
      return showSymbol ? `${getCurrencySymbol()}0.00` : '0.00';
    }
    
    const convertedAmount = convertFromPKR(pkrAmount);
    const symbol = showSymbol ? getCurrencySymbol() : '';
    const formattedAmount = convertedAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (selectedCurrency === 'NGN') {
      return `${symbol}${formattedAmount}`;
    }

    if (showConversion) {
      return `${symbol}${formattedAmount} (₦${pkrAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
    }

    return `${symbol}${formattedAmount}`;
  };

  const getCurrencySymbol = (currency?: string): string => {
    const curr = currency || selectedCurrency;
    return CURRENCY_SYMBOLS[curr] || curr;
  };

  const getCurrencyName = (currency?: string): string => {
    const curr = currency || selectedCurrency;
    return CURRENCY_NAMES[curr] || curr;
  };

  const availableCurrencies = Object.keys(EXCHANGE_RATES);
  const isBaseCurrency = selectedCurrency === 'NGN';

  const value: CurrencyContextType = {
    selectedCurrency,
    setSelectedCurrency,
    convertFromPKR,
    formatCurrency,
    getCurrencySymbol,
    getCurrencyName,
    availableCurrencies,
    isBaseCurrency,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrencyConverter = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrencyConverter must be used within a CurrencyProvider');
  }
  return context;
};

// Utility function for components that don't need the full context
export const convertPKRToCurrency = (pkrAmount: number, targetCurrency: string): number => {
  if (targetCurrency === 'PKR') return pkrAmount;
  return pkrAmount * EXCHANGE_RATES[targetCurrency];
};

export const formatCurrencyAmount = (
  pkrAmount: number, 
  targetCurrency: string, 
  showSymbol: boolean = true
): string => {
  const convertedAmount = convertPKRToCurrency(pkrAmount, targetCurrency);
  const symbol = showSymbol ? CURRENCY_SYMBOLS[targetCurrency] : '';
  return `${symbol}${convertedAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

