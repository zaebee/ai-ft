import { Vehicle } from '../types';

/**
 * Extracts the raw numeric daily price from the vehicle.
 * Prioritizes minimal_price if available and non-zero.
 * If targetCurrency is provided, it tries to find the converted price.
 */
export const getVehicleRawPrice = (vehicle: Vehicle, targetCurrency?: string): number => {
  // Check conversions if target currency matches
  if (targetCurrency) {
    const conversions = (vehicle.minimal_price && vehicle.minimal_price > 0)
      ? vehicle.minimal_price_conversions
      : vehicle.price_conversions;

    if (conversions && conversions[targetCurrency]) {
      return conversions[targetCurrency].amount;
    }
  }

  // Fallback to base price
  return (vehicle.minimal_price && vehicle.minimal_price > 0) 
    ? vehicle.minimal_price 
    : vehicle.price;
};

/**
 * Resolves the currency code for the vehicle.
 * If targetCurrency conversion exists, returns targetCurrency.
 */
export const getVehicleCurrency = (vehicle: Vehicle, targetCurrency?: string): string => {
  if (targetCurrency) {
      const conversions = (vehicle.minimal_price && vehicle.minimal_price > 0)
      ? vehicle.minimal_price_conversions
      : vehicle.price_conversions;

      if (conversions && conversions[targetCurrency]) {
          return targetCurrency;
      }
  }

  let currencyCode = vehicle.currency;
  
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
  return currencyCode || '';
};

/**
 * Calculates the total price value.
 */
export const calculatePriceValue = (vehicle: Vehicle, days: number = 1, targetCurrency?: string): number => {
  const rawPrice = getVehicleRawPrice(vehicle, targetCurrency);
  return rawPrice * (days > 0 ? days : 1);
};