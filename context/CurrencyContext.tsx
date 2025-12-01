
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ApiService from '../services/api';
import { Currency, Rate, RateResponse } from '../types';

interface CurrencyContextType {
  currencies: Currency[];
  rates: Rate[];
  isLoading: boolean;
  selectedCurrency: string;
  setCurrency: (code: string) => void;
  formatPrice: (amount: number, currencyCode: string) => string;
  getSymbol: (currencyCode: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [rates, setRates] = useState<Rate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    return localStorage.getItem('user_currency') || 'USD';
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [currenciesData, ratesData] = await Promise.all([
            ApiService.get<Currency[]>('/utils/currencies/'),
            ApiService.get<RateResponse>('/utils/rates/')
        ]);
        
        setCurrencies(currenciesData || []);
        setRates(ratesData?.rates || []);
      } catch (error) {
        console.error("Failed to fetch currency data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const setCurrency = (code: string) => {
    setSelectedCurrency(code);
    localStorage.setItem('user_currency', code);
  };

  const parseSymbol = useCallback((symbolString: string): string => {
    if (symbolString.startsWith('U+')) {
      try {
        const hex = symbolString.substring(2);
        return String.fromCodePoint(parseInt(hex, 16));
      } catch (e) {
        console.warn(`Failed to parse unicode symbol: ${symbolString}`, e);
        return symbolString;
      }
    }
    return symbolString;
  }, []);

  const getSymbol = useCallback((currencyCode: string): string => {
    const currency = currencies.find(c => c.currency === currencyCode);
    if (currency) {
      return parseSymbol(currency.symbol);
    }
    // Fallback using Intl if not found in API list
    try {
        return (0).toLocaleString('en-US', { style: 'currency', currency: currencyCode }).replace(/\d|\.|,|\s/g, '');
    } catch {
        return currencyCode;
    }
  }, [currencies, parseSymbol]);

  const formatPrice = useCallback((amount: number, currencyCode: string): string => {
    const symbol = getSymbol(currencyCode);
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    
    return `${symbol} ${formattedAmount}`.trim();
  }, [getSymbol]);

  return (
    <CurrencyContext.Provider value={{ 
      currencies,
      rates, 
      isLoading, 
      selectedCurrency, 
      setCurrency, 
      formatPrice, 
      getSymbol 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
