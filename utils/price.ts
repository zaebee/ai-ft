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
 * Formats the vehicle price for display.
 * If days > 1, returns the Total Price.
 * Otherwise returns the Daily Rate.
 */
export const formatVehiclePrice = (vehicle: Vehicle, days: number = 1): string => {
  const rawPrice = getVehicleRawPrice(vehicle);
  const currencyCode = getVehicleCurrency(vehicle);
  
  // Calculate total if specific days are requested, otherwise default to 1 day (daily rate)
  const totalAmount = rawPrice * (days > 0 ? days : 1);

  const formattedAmount = (totalAmount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  return `${currencyCode} ${formattedAmount}`.trim();
};
