
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import { Vehicle } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { resolveImageUrl } from '../utils/image';
import { getVehicleCurrency, calculatePriceValue } from '../utils/price';
import { useCurrency } from '../context/CurrencyContext';

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const RiderHome: React.FC = () => {
  const [location, setLocation] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [ownerId, setOwnerId] = useState('owner-1');
  
  // Debounce search inputs to prevent API spam while typing
  const debouncedLocation = useDebounce(location, 800);
  const debouncedOwnerId = useDebounce(ownerId, 800);

  const [searchResults, setSearchResults] = useState<Vehicle[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { formatPrice, selectedCurrency, rates } = useCurrency();

  // Calculate duration in days
  const searchDuration = useMemo(() => {
    if (!dateFrom || !dateTo) return 0;
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    
    // Calculate difference in milliseconds
    const diffTime = end.getTime() - start.getTime();
    // Convert to days (1000ms * 60s * 60m * 24h)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Minimum 1 day if dates are same or invalid logic
    return diffDays > 0 ? diffDays : 0;
  }, [dateFrom, dateTo]);

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    // Don't mark as "hasSearched" until we actually get results or valid search attempt
    if (!debouncedOwnerId) {
      setIsLoading(false);
      return;
    }

    try {
        const response = await ApiService.get<{ vehicles: Vehicle[] }>(`/rider/vehicles/${debouncedOwnerId}/search`, { location: debouncedLocation });
        setSearchResults(response.vehicles || []);
        setHasSearched(true);
    } catch (error) {
        console.error("Search failed", error);
        setSearchResults([]); 
    } finally {
        setIsLoading(false);
    }
  }, [debouncedOwnerId, debouncedLocation]);

  // Trigger search when debounced values or dates change
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles, dateFrom, dateTo]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVehicles();
  };

  const getDisplayPrice = (vehicle: Vehicle, days: number = 1) => {
    const total = calculatePriceValue(vehicle, days, selectedCurrency, rates);
    const currency = getVehicleCurrency(vehicle, selectedCurrency, rates);
    return formatPrice(total, currency);
  };

  const handleDetailsClick = (vehicle: Vehicle) => {
    const params = new URLSearchParams();
    // Use the searched ownerId if vehicle doesn't have one explicitly (though it should)
    const oId = vehicle.owner_id || debouncedOwnerId;
    if (oId) params.append('owner_id', oId);
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    
    navigate(`/vehicle/${vehicle.id}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
       {/* Hero Section */}
       <div className="relative bg-slate-900 py-24 sm:py-32">
         <div className="absolute inset-0 overflow-hidden">
           <img 
             src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
             alt="Background" 
             className="h-full w-full object-cover opacity-20"
           />
         </div>
         <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
           <div className="max-w-2xl text-center mx-auto">
             <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
               Find the perfect ride
             </h1>
             <p className="mt-6 text-lg leading-8 text-slate-300">
               From city runabouts to luxury cruisers. Rent directly from local owners.
             </p>
           </div>
           
           <div className="mt-10 mx-auto max-w-5xl rounded-2xl bg-white p-2 shadow-xl">
             <form onSubmit={handleManualSearch} className="flex flex-col gap-2 md:flex-row md:items-end">
               <div className="flex-1 px-2 pb-2">
                 <Input 
                   label="Owner ID (Dev)" 
                   placeholder="e.g. owner-1" 
                   value={ownerId}
                   onChange={(e) => setOwnerId(e.target.value)}
                 />
               </div>
               <div className="flex-[1.5] px-2 pb-2">
                 <Input 
                   label="Location" 
                   placeholder="City, Airport, or Address" 
                   value={location}
                   onChange={(e) => setLocation(e.target.value)}
                 />
               </div>
               <div className="flex-1 px-2 pb-2">
                 <Input 
                   label="Pick-up Date" 
                   type="date"
                   value={dateFrom}
                   onChange={(e) => setDateFrom(e.target.value)}
                 />
               </div>
               <div className="flex-1 px-2 pb-2">
                 <Input 
                   label="Drop-off Date" 
                   type="date"
                   min={dateFrom} // Ensure drop-off is after pick-up
                   value={dateTo}
                   onChange={(e) => setDateTo(e.target.value)}
                 />
               </div>
               <div className="px-2 pb-2">
                 <Button size="lg" type="submit" isLoading={isLoading} className="w-full md:w-auto">
                   Search Cars
                 </Button>
               </div>
             </form>
           </div>
         </div>
       </div>

       {/* Results Section */}
       <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full">
         {hasSearched && (
           <div className="mb-6">
             <h2 className="text-xl font-semibold text-slate-900">
               {isLoading ? 'Searching...' : `${searchResults.length} vehicles found`}
             </h2>
             {searchDuration > 0 && !isLoading && (
               <p className="text-sm text-slate-500">
                 Showing total price for {searchDuration} day{searchDuration > 1 ? 's' : ''}
               </p>
             )}
           </div>
         )}
         
         <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
           {searchResults.map((vehicle) => (
             <div key={vehicle.id} className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-blue-200">
               {/* Image Section */}
               <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                 <img 
                   src={resolveImageUrl(vehicle.picture?.cover)} 
                   alt={vehicle.name} 
                   className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                 />
                 <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center rounded-md bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-slate-900 shadow-sm">
                      {vehicle.general_info?.year || 'N/A'}
                    </span>
                 </div>
               </div>

               {/* Content Section */}
               <div className="flex flex-1 flex-col p-5">
                 <div className="flex-1">
                   <h3 className="text-lg font-bold text-slate-900 leading-tight">
                     {vehicle.name}
                   </h3>
                   
                   {/* Specs Row */}
                   <div className="mt-3 flex flex-wrap gap-2">
                     <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                       {vehicle.specification_info?.transmission || 'Auto'}
                     </span>
                     <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                       {vehicle.specification_info?.fuel_type || 'Gasoline'}
                     </span>
                     <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                       {vehicle.specification_info?.number_of_seats || 5} Seats
                     </span>
                   </div>
                 </div>

                 {/* Price & Action */}
                 <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
                   <div>
                     {searchDuration > 0 ? (
                       <div className="flex flex-col">
                         <span className="text-xs font-medium text-slate-500 mb-0.5">Total for {searchDuration} days</span>
                         <span className="text-xl font-bold text-blue-600">
                           {getDisplayPrice(vehicle, searchDuration)}
                         </span>
                       </div>
                     ) : (
                       <div className="flex flex-col">
                         <span className="text-xs font-medium text-slate-500 mb-0.5">Daily Rate</span>
                         <span className="text-xl font-bold text-slate-900">
                           {getDisplayPrice(vehicle, 1)}
                         </span>
                       </div>
                     )}
                   </div>
                   <Button size="sm" onClick={() => handleDetailsClick(vehicle)} className="px-5">
                     Details
                   </Button>
                 </div>
               </div>
             </div>
           ))}
         </div>

         {!hasSearched && (
           <div className="text-center py-20">
             <h3 className="text-lg font-medium text-slate-900">Featured Categories</h3>
             <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                {['SUV', 'Sedan', 'Sports', 'Electric'].map(cat => (
                  <div key={cat} className="flex h-32 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <span className="font-semibold text-slate-700">{cat}</span>
                  </div>
                ))}
             </div>
           </div>
         )}
       </div>
    </div>
  );
};
