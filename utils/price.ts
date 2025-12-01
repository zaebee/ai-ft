
import { Vehicle, Rate } from '../types';

/**
 * Extracts the raw numeric daily price from the vehicle.
 * Prioritizes minimal_price if available and non-zero.
 * If targetCurrency is provided, it tries to find the converted price.
 * If conversion is missing in vehicle data but rates are provided, it calculates client-side.
 */
export const getVehicleRawPrice = (vehicle: Vehicle, targetCurrency?: string, rates?: Rate[]): number => {
  const basePrice = (vehicle.minimal_price && vehicle.minimal_price > 0) 
    ? vehicle.minimal_price 
    : vehicle.price;
    
  const baseCurrency = vehicle.currency;

  if (targetCurrency && targetCurrency !== baseCurrency) {
    const conversions = (vehicle.minimal_price && vehicle.minimal_price > 0)
      ? vehicle.minimal_price_conversions
      : vehicle.price_conversions;

    // 1. Try pre-calculated conversions
    if (conversions && conversions[targetCurrency]) {
      return conversions[targetCurrency].amount;
    }

    // 2. Try client-side conversion using global rates
    if (rates) {
        return convertCurrency(basePrice, baseCurrency, targetCurrency, rates);
    }
  }

  // Fallback to base price
  return basePrice;
};

/**
 * Helper to convert a specific amount between currencies using available rates.
 */
export const convertCurrency = (amount: number, baseCurrency: string, targetCurrency: string, rates: Rate[]): number => {
  if (baseCurrency === targetCurrency) return amount;

  const rateObj = rates.find(r => r.base_currency === baseCurrency && r.target_currency === targetCurrency);
  if (rateObj) {
      return amount * rateObj.rate;
  }
  
  // Try inverse
  const inverseRateObj = rates.find(r => r.base_currency === targetCurrency && r.target_currency === baseCurrency);
  if (inverseRateObj) {
      return amount * inverseRateObj.inverse_rate;
  }

  // If no direct rate, return original (or handling cross-rates could be added here)
  return amount;
};

/**
 * Resolves the currency code for the vehicle.
 * If targetCurrency conversion exists (server or client-side), returns targetCurrency.
 */
export const getVehicleCurrency = (vehicle: Vehicle, targetCurrency?: string, rates?: Rate[]): string => {
  if (targetCurrency) {
      const conversions = (vehicle.minimal_price && vehicle.minimal_price > 0)
      ? vehicle.minimal_price_conversions
      : vehicle.price_conversions;

      // 1. Check pre-calculated
      if (conversions && conversions[targetCurrency]) {
          return targetCurrency;
      }
      
      // 2. Check if client-side conversion is possible
      if (rates && vehicle.currency) {
          const hasRate = rates.some(r => 
              (r.base_currency === vehicle.currency && r.target_currency === targetCurrency) ||
              (r.base_currency === targetCurrency && r.target_currency === vehicle.currency)
          );
          if (hasRate) {
              return targetCurrency;
          }
      }
  }

  let currencyCode = vehicle.currency;
  
  // Fallback to finding ANY currency if base is missing (shouldn't happen on good data)
  if (!currencyCode) {
    const conversions = (vehicle.minimal_price && vehicle.minimal_price > 0)
      ? vehicle.minimal_price_conversions
      : vehicle.price_conversions;
      
    if (conversions) {
      const firstKey = Object.keys(conversions)[0];
      if (firstKey && conversions[firstKey]) {
        currencyCode = conversions[firstKey].currency;
      }
    }
  }
  return currencyCode || 'USD';
};

/**
 * Calculates the total price value.
 */
export const calculatePriceValue = (vehicle: Vehicle, days: number = 1, targetCurrency?: string, rates?: Rate[]): number => {
  const rawPrice = getVehicleRawPrice(vehicle, targetCurrency, rates);
  return rawPrice * (days > 0 ? days : 1);
};
