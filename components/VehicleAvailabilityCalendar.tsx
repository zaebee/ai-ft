
import React, { useState, useEffect, useMemo } from 'react';
import { AvailabilityResponse, BookedDateRange } from '../types';
import ApiService from '../services/api';

interface VehicleAvailabilityCalendarProps {
  vehicleId: string;
  ownerId?: string; // Optional if we are in owner view, but typically required for API
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const VehicleAvailabilityCalendar: React.FC<VehicleAvailabilityCalendarProps> = ({ vehicleId, ownerId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState<BookedDateRange[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Derive calendar grid data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const startingDayIndex = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    const totalDays = lastDayOfMonth.getDate();

    // Previous month padding
    const prevMonthDays = [];
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      prevMonthDays.push(prevMonthLastDate - i);
    }

    // Current month days
    const currentMonthDays = [];
    for (let i = 1; i <= totalDays; i++) {
      currentMonthDays.push(i);
    }

    return { year, month, prevMonthDays, currentMonthDays };
  }, [currentDate]);

  useEffect(() => {
    const fetchAvailability = async () => {
      // In a real app, we might pass year/month filters. 
      // For now, fetching general future availability.
      if (!ownerId && !vehicleId) return;
      
      setIsLoading(true);
      try {
        const oId = ownerId || 'owner-1'; // Fallback
        const response = await ApiService.post<AvailabilityResponse>(
           `/rider/vehicles/${oId}/${vehicleId}/availability`, 
           { date_from: new Date().toISOString() } // simplified body
        );
        setBlockedDates(response.blocked_dates || []);
      } catch (e) {
        console.warn("Failed to fetch calendar availability", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [vehicleId, ownerId, currentDate]); // Re-fetch if month changes? Maybe caching is better, but this is fine for now.

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDayStatus = (day: number) => {
    // Construct the date object for this specific cell
    const cellDate = new Date(calendarData.year, calendarData.month, day);
    const cellTime = cellDate.getTime();
    
    // Check "today" to gray out past dates
    const today = new Date();
    today.setHours(0,0,0,0);
    if (cellTime < today.getTime()) {
        return 'past';
    }

    // Check availability
    const isBlocked = blockedDates.some(range => {
        const start = new Date(range.start).setHours(0,0,0,0);
        const end = new Date(range.end).setHours(23,59,59,999);
        return cellTime >= start && cellTime <= end;
    });

    return isBlocked ? 'booked' : 'free';
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Availability</h3>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-full">
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-slate-900 w-32 text-center">
            {monthName} {calendarData.year}
          </span>
          <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-full">
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2 text-center">
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="text-xs font-medium text-slate-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Padding for prev month */}
        {calendarData.prevMonthDays.map(day => (
          <div key={`prev-${day}`} className="h-10 flex items-center justify-center text-slate-300 text-sm">
            {day}
          </div>
        ))}

        {/* Current Month Days */}
        {calendarData.currentMonthDays.map(day => {
          const status = getDayStatus(day);
          
          let styles = '';
          if (status === 'past') {
             styles = 'bg-slate-50 text-slate-300 cursor-not-allowed';
          } else if (status === 'booked') {
             styles = 'bg-red-50 text-red-400 line-through decoration-red-400 cursor-not-allowed';
          } else {
             styles = 'bg-white text-slate-700 hover:bg-blue-50 cursor-pointer font-medium';
          }

          return (
            <div 
              key={`curr-${day}`} 
              className={`h-10 rounded-md flex items-center justify-center text-sm transition-colors ${styles}`}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white border border-slate-200"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-50 border border-red-100"></div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
};
