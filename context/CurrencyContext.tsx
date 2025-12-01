
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ApiService from '../services/api';
import { Currency } from '../types';

interface CurrencyContextType {
  currencies: Currency[];
  isLoading: boolean;
  formatPrice: (amount: number, currencyCode: string) => string;
  getSymbol: (currencyCode: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const data = await ApiService.get<Currency[]>('/utils/currencies/');
        setCurrencies(data || []);
      } catch (error) {
        console.error("Failed to fetch currencies", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrencies();
  }, []);

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
    
    // Some symbols might prefer to be suffixes, but typical standard is prefix for most in the list ($, €, £, ฿)
    // VND usually has suffix ₫ but we can stick to prefix or space for consistency unless using full Intl
    return `${symbol} ${formattedAmount}`.trim();
  }, [getSymbol]);

  return (
    <CurrencyContext.Provider value={{ currencies, isLoading, formatPrice, getSymbol }}>
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
