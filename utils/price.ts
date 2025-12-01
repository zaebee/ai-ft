import { Vehicle } from '../types';

/**
 * Formats the vehicle price for display.
 * Prioritizes minimal_price if available and non-zero.
 * Handles missing base currency by looking up conversion maps.
 */
export const formatVehiclePrice = (vehicle: Vehicle): string => {
  // Use minimal_price if available and greater than 0, otherwise fallback to price
  const priceToUse = (vehicle.minimal_price && vehicle.minimal_price > 0) 
    ? vehicle.minimal_price 
    : vehicle.price;
    
  // Find standard currency code
  let currencyCode = vehicle.currency;
  
  // If base currency is empty, look into conversions to find a valid currency code
  if (!currencyCode) {
    const conversions = (vehicle.minimal_price && vehicle.minimal_price > 0)
      ? vehicle.minimal_price_conversions
      : vehicle.price_conversions;
      
    if (conversions) {
      // Try to find a currency code from keys or values. 
      // Assuming keys are currency codes or the object contains currency field.
      const firstKey = Object.keys(conversions)[0];
      if (firstKey && conversions[firstKey]) {
        currencyCode = conversions[firstKey].currency;
      }
    }
  }
  
  // Default fallback if still no currency found
  if (!currencyCode) currencyCode = '';

  // Format the number
  const formattedAmount = (priceToUse || 0).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  return `${currencyCode} ${formattedAmount}`.trim();
};
