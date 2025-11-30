import React, { useEffect, useState } from 'react';
import ApiService from '../services/api';
import { Vehicle, VehicleStatus } from '../types';
import { Button } from '../components/ui/Button';
import { MOCK_IMAGES } from '../constants';

export const Dashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await ApiService.get<{ vehicles: Vehicle[] }>('/vehicle');
        setVehicles(response.vehicles || []);
      } catch (error) {
        console.error("Failed to fetch vehicles", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const getStatusBadge = (status: VehicleStatus) => {
    const styles = {
      [VehicleStatus.FREE]: 'bg-green-100 text-green-700',
      [VehicleStatus.COLLECTED]: 'bg-blue-100 text-blue-700',
      [VehicleStatus.MAINTENANCE]: 'bg-yellow-100 text-yellow-700',
      [VehicleStatus.ARCHIVED]: 'bg-gray-100 text-gray-700',
      [VehicleStatus.DRAFT]: 'bg-purple-100 text-purple-700',
    };
    const labels = ['Available', 'Rented', 'Archived', 'Maintenance', 'Draft'];
    
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles[0]}`}>
        {labels[status] || 'Unknown'}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fleet Dashboard</h1>
          <p className="text-slate-600">Manage your vehicles and availability.</p>
        </div>
        <Button onClick={() => alert('Feature coming soon: Create Vehicle')}>
           <span className="mr-2">+</span> Add Vehicle
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-200"></div>
          ))}
        </div>
      ) : vehicles.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="group overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200 transition-all hover:shadow-md">
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                <img 
                  src={vehicle.picture?.cover || MOCK_IMAGES.CAR_PLACEHOLDER} 
                  alt={vehicle.name} 
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                   {getStatusBadge(vehicle.status)}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-slate-900">{vehicle.name}</h3>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <span>{vehicle.general_info?.year}</span>
                  <span>•</span>
                  <span>{vehicle.specification_info?.transmission || 'Auto'}</span>
                  <span>•</span>
                  <span>{vehicle.specification_info?.fuel_type || 'Petrol'}</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500">Daily Rate</span>
                    <span className="font-bold text-slate-900">{vehicle.currency} {vehicle.price}</span>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
          <div className="text-center">
             <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
             </svg>
             <h3 className="mt-2 text-sm font-medium text-slate-900">No vehicles</h3>
             <p className="mt-1 text-sm text-slate-500">Get started by creating a new vehicle.</p>
          </div>
        </div>
      )}
    </div>
  );
};
