
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import { Vehicle } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { resolveImageUrl } from '../utils/image';
import { getVehicleRawPrice, getVehicleCurrency, calculatePriceValue } from '../utils/price';
import { useCurrency } from '../context/CurrencyContext';

export const RiderHome: React.FC = () => {
  const [location, setLocation] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [ownerId, setOwnerId] = useState('owner-1');
  const [searchResults, setSearchResults] = useState<Vehicle[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);
    
    try {
        const response = await ApiService.get<{ vehicles: Vehicle[] }>(`/rider/vehicles/${ownerId}/search`, { location });
        setSearchResults(response.vehicles || []);
    } catch (error) {
        console.error("Search failed", error);
        setSearchResults([]); 
    } finally {
        setIsLoading(false);
    }
  };

  const getDisplayPrice = (vehicle: Vehicle, days: number = 1) => {
    const total = calculatePriceValue(vehicle, days);
    const currency = getVehicleCurrency(vehicle);
    return formatPrice(total, currency);
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
             <form onSubmit={handleSearch} className="flex flex-col gap-2 md:flex-row md:items-end">
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
             <div key={vehicle.id} className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm border border-slate-200 transition-all hover:shadow-md hover:-translate-y-1">
               <div className="aspect-[3/2] overflow-hidden bg-slate-100 relative">
                 <img 
                   src={resolveImageUrl(vehicle.picture?.cover)} 
                   alt={vehicle.name} 
                   className="h-full w-full object-cover"
                 />
                 <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-semibold">
                   {vehicle.general_info?.year}
                 </div>
               </div>
               <div className="flex flex-1 flex-col p-4">
                 <div className="flex-1">
                   <h3 className="text-base font-semibold text-slate-900">
                     {vehicle.name}
                   </h3>
                   <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                     {vehicle.specification_info?.transmission || 'Automatic'} • {vehicle.specification_info?.fuel_type || 'Gasoline'}
                   </p>
                 </div>
                 <div className="mt-4 flex items-center justify-between">
                   <div>
                     {searchDuration > 0 ? (
                       // Show Total Price
                       <div className="flex flex-col">
                         <span className="text-lg font-bold text-slate-900">
                           {getDisplayPrice(vehicle, searchDuration)}
                         </span>
                         <span className="text-xs text-slate-500">
                           total for {searchDuration} days
                         </span>
                       </div>
                     ) : (
                       // Show Daily Rate
                       <div>
                         <span className="text-lg font-bold text-slate-900">
                           {getDisplayPrice(vehicle, 1)}
                         </span>
                         <span className="text-xs text-slate-500"> / day</span>
                       </div>
                     )}
                   </div>
                   <Button size="sm" variant="primary" onClick={() => navigate(`/vehicle/${vehicle.id}`)}>Details</Button>
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
