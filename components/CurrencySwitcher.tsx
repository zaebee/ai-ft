import React from 'react';
import { useCurrency } from '../context/CurrencyContext';

export const CurrencySwitcher: React.FC = () => {
  const { currencies, selectedCurrency, setCurrency, isLoading } = useCurrency();

  if (isLoading || currencies.length === 0) return null;

  return (
    <div className="relative">
      <select
        value={selectedCurrency}
        onChange={(e) => setCurrency(e.target.value)}
        className="h-9 rounded-md border-none bg-slate-100 py-0 pl-3 pr-8 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-200 transition-colors"
        aria-label="Select Currency"
      >
        {currencies.map((c) => (
          <option key={c.currency} value={c.currency}>
            {c.currency}
          </option>
        ))}
      </select>
    </div>
  );
};