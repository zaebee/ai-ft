
import React, { useState, useEffect } from 'react';
import { Vehicle, CreateReservationRequest } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import ApiService from '../services/api';
import { calculatePriceValue, getVehicleCurrency } from '../utils/price';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants';

interface ReservationFormProps {
  vehicle: Vehicle;
}

export const ReservationForm: React.FC<ReservationFormProps> = ({ vehicle }) => {
  const { user, isAuthenticated } = useAuth();
  const { formatPrice, selectedCurrency, rates } = useCurrency();
  const navigate = useNavigate();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [timeFrom, setTimeFrom] = useState('10:00');
  const [timeTo, setTimeTo] = useState('10:00');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Calculate Duration
  const duration = React.useMemo(() => {
    if (!dateFrom || !dateTo) return 0;
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [dateFrom, dateTo]);

  // Calculate Price
  const totalPrice = React.useMemo(() => {
    return calculatePriceValue(vehicle, duration, selectedCurrency, rates);
  }, [vehicle, duration, selectedCurrency, rates]);

  const currencyCode = React.useMemo(() => {
      return getVehicleCurrency(vehicle, selectedCurrency, rates);
  }, [vehicle, selectedCurrency, rates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
        // In a real app, redirect to login with return_url
        if (confirm("You need to sign in to make a reservation. Go to login?")) {
            navigate(ROUTES.LOGIN);
        }
        return;
    }

    if (duration <= 0) {
        setError("Invalid dates selected.");
        return;
    }

    setIsLoading(true);

    try {
        const payload: CreateReservationRequest = {
            vehicle_id: vehicle.id,
            rider_id: user?.id || 'unknown',
            date_from: new Date(`${dateFrom}T${timeFrom}`).toISOString(),
            date_to: new Date(`${dateTo}T${timeTo}`).toISOString(),
            pick_up_time: timeFrom,
            drop_off_time: timeTo,
            selected_extra_options: { ids: [] } // Support extras later
        };

        await ApiService.post('/rider/reservations', payload);
        setSuccess(true);
    } catch (err) {
        console.error("Reservation failed", err);
        setError("Failed to create reservation. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  if (success) {
      return (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
              <h3 className="text-lg font-bold text-green-800">Reservation Requested!</h3>
              <p className="mt-2 text-green-700">The owner has been notified. Check your email for details.</p>
              <Button className="mt-4" onClick={() => setSuccess(false)} variant="outline">
                  Make another booking
              </Button>
          </div>
      );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 border-b border-slate-100 pb-4">
        <span className="text-2xl font-bold text-slate-900">
            {formatPrice(calculatePriceValue(vehicle, 1, selectedCurrency, rates), currencyCode)}
        </span>
        <span className="text-slate-500"> / day</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Pick-up</label>
                <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} required className="mb-2" />
                <Input type="time" value={timeFrom} onChange={e => setTimeFrom(e.target.value)} required />
            </div>
            <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Drop-off</label>
                <Input type="date" value={dateTo} min={dateFrom} onChange={e => setDateTo(e.target.value)} required className="mb-2" />
                <Input type="time" value={timeTo} onChange={e => setTimeTo(e.target.value)} required />
            </div>
        </div>

        {duration > 0 && (
            <div className="rounded-lg bg-slate-50 p-4">
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                    <span>{formatPrice(calculatePriceValue(vehicle, 1, selectedCurrency, rates), currencyCode)} x {duration} days</span>
                    <span>{formatPrice(totalPrice, currencyCode)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice, currencyCode)}</span>
                </div>
            </div>
        )}

        {error && <div className="text-sm text-red-600">{error}</div>}

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading} disabled={duration <= 0}>
            Reserve
        </Button>
      </form>
    </div>
  );
};
