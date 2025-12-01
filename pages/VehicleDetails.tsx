
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import { Vehicle } from '../types';
import { Button } from '../components/ui/Button';
import { MOCK_IMAGES } from '../constants';
import { VehicleImageGallery } from '../components/VehicleImageGallery';
import { formatVehiclePrice } from '../utils/price';

export const VehicleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) return;
      try {
        const response = await ApiService.get<{ vehicle: Vehicle }>(`/vehicle/${id}`);
        setVehicle(response.vehicle);
      } catch (err) {
        console.error("Failed to fetch vehicle details", err);
        setError("Vehicle not found or an error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

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
          <div>
            <VehicleImageGallery picture={vehicle.picture} altText={vehicle.name} />
          </div>

          {/* Vehicle Info */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{vehicle.name}</h1>
            
            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-slate-900 font-medium">
                {formatVehiclePrice(vehicle)} 
                <span className="text-lg text-slate-500 font-normal"> / day</span>
              </p>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-6">
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

            <div className="mt-10">
              <Button size="lg" className="w-full text-lg h-14" onClick={() => alert('Reservation flow coming soon!')}>
                Reserve this vehicle
              </Button>
              <p className="mt-2 text-center text-xs text-slate-500">You won't be charged yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};