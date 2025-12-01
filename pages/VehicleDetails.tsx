

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ApiService from '../services/api';
import { Vehicle } from '../types';
import { Button } from '../components/ui/Button';
import { MOCK_IMAGES } from '../constants';
import { VehicleImageGallery } from '../components/VehicleImageGallery';
import { getVehicleRawPrice, getVehicleCurrency } from '../utils/price';
import { useCurrency } from '../context/CurrencyContext';
import { ReservationForm } from '../components/ReservationForm';
import { VehicleAvailabilityCalendar } from '../components/VehicleAvailabilityCalendar';

export const VehicleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { formatPrice, selectedCurrency, rates } = useCurrency();
  
  // Extract query params from search
  const ownerId = searchParams.get('owner_id');
  const dateFrom = searchParams.get('date_from');
  const dateTo = searchParams.get('date_to');

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) return;
      try {
        let response;
        if (ownerId) {
             // Use Rider-specific endpoint if we know the owner
             // GET /rider/vehicles/{owner_id}/{vehicle_id}?date_from=...&date_to=...
             response = await ApiService.get<{ vehicle: Vehicle }>(
                 `/rider/vehicles/${ownerId}/${id}`, 
                 { 
                     ...(dateFrom ? { date_from: dateFrom } : {}),
                     ...(dateTo ? { date_to: dateTo } : {})
                 }
             );
        } else {
             // Fallback for direct links or owner dashboard view
             response = await ApiService.get<{ vehicle: Vehicle }>(`/vehicle/${id}`);
        }
        
        // Handle potentially different response structures if API differs slightly
        const v = response.vehicle || (response as any);
        setVehicle(v);
      } catch (err) {
        console.error("Failed to fetch vehicle details", err);
        setError("Vehicle not found or an error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicle();
  }, [id, ownerId, dateFrom, dateTo]);

  const getPriceDisplay = (v: Vehicle) => {
    const price = getVehicleRawPrice(v, selectedCurrency, rates);
    const currency = getVehicleCurrency(v, selectedCurrency, rates);
    return formatPrice(price, currency);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-50 px-4">
        <h2 className="text-2xl font-bold text-slate-900">{error || "Vehicle Not Found"}</h2>
        <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Button onClick={() => navigate(-1)} variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-blue-600">
          ← Back to search
        </Button>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          {/* Image Gallery */}
          <div className="mb-8 lg:mb-0">
            <VehicleImageGallery picture={vehicle.picture} altText={vehicle.name} />
          </div>

          {/* Vehicle Info */}
          <div className="px-4 sm:px-0">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{vehicle.name}</h1>
            
            <div className="mt-3 mb-6">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-slate-900 font-medium">
                {getPriceDisplay(vehicle)} 
                <span className="text-lg text-slate-500 font-normal"> / day</span>
              </p>
            </div>

            {/* Reservation Form - Initialized with dates from search */}
            <div className="mb-8">
                <ReservationForm 
                    vehicle={vehicle} 
                    initialDateFrom={dateFrom || ''} 
                    initialDateTo={dateTo || ''}
                />
            </div>
            
            {/* Availability Calendar */}
            <div className="mb-8">
              <VehicleAvailabilityCalendar 
                vehicleId={vehicle.id} 
                ownerId={vehicle.owner_id || ownerId || 'owner-1'} 
              />
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-medium text-slate-900">Specifications</h3>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-slate-500">Brand</dt>
                  <dd className="mt-1 text-sm text-slate-900">{vehicle.general_info?.brand || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Model</dt>
                  <dd className="mt-1 text-sm text-slate-900">{vehicle.general_info?.model || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Year</dt>
                  <dd className="mt-1 text-sm text-slate-900">{vehicle.general_info?.year || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Color</dt>
                  <dd className="mt-1 text-sm text-slate-900">{vehicle.general_info?.color || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Transmission</dt>
                  <dd className="mt-1 text-sm text-slate-900">{vehicle.specification_info?.transmission || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Fuel Type</dt>
                  <dd className="mt-1 text-sm text-slate-900">{vehicle.specification_info?.fuel_type || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Seats</dt>
                  <dd className="mt-1 text-sm text-slate-900">{vehicle.specification_info?.number_of_seats || '-'}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-6">
               <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden">
                    <img src={MOCK_IMAGES.AVATAR_PLACEHOLDER} alt="Owner" className="h-full w-full object-cover" />
                 </div>
                 <div>
                    <p className="text-sm font-medium text-slate-900">Hosted by Owner</p>
                    <p className="text-xs text-slate-500">Joined in 2023</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
