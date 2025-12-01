
import { Vehicle } from '../types';

/**
 * Extracts the raw numeric daily price from the vehicle.
 * Prioritizes minimal_price if available and non-zero.
 */
export const getVehicleRawPrice = (vehicle: Vehicle): number => {
  return (vehicle.minimal_price && vehicle.minimal_price > 0) 
    ? vehicle.minimal_price 
    : vehicle.price;
};

/**
 * Resolves the currency code for the vehicle.
 */
export const getVehicleCurrency = (vehicle: Vehicle): string => {
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
export const calculatePriceValue = (vehicle: Vehicle, days: number = 1): number => {
  const rawPrice = getVehicleRawPrice(vehicle);
  return rawPrice * (days > 0 ? days : 1);
};
