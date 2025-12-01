
import React, { useState, useEffect, useMemo } from 'react';
import { AvailabilityResponse, BookedDateRange } from '../types';
import ApiService from '../services/api';

interface VehicleAvailabilityCalendarProps {
  vehicleId: string;
  ownerId?: string; // Optional if we are in owner view, but typically required for API
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

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
      if (!ownerId && !vehicleId) return;
      
      setIsLoading(true);
      try {
        const oId = ownerId || 'owner-1'; // Fallback
        
        // Calculate range based on current view
        const firstDay = new Date(calendarData.year, calendarData.month, 1);
        const lastDay = new Date(calendarData.year, calendarData.month + 1, 0); // Last day of month

        const response = await ApiService.post<AvailabilityResponse>(
           `/rider/vehicles/${oId}/${vehicleId}/availability`, 
           { 
             date_from: firstDay.toISOString(),
             date_to: lastDay.toISOString()
           }
        );
        setBlockedDates(response.blocked_dates || []);
      } catch (e) {
        console.warn("Failed to fetch calendar availability", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [vehicleId, ownerId, calendarData.year, calendarData.month]); 

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const getDayStatus = (day: number) => {
    // Construct the date object for this specific cell
    const cellDate = new Date(calendarData.year, calendarData.month, day);
    const cellTime = cellDate.getTime();
    
    // Check "today" to gray out past dates
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const isToday = isSameDay(cellDate, today);

    if (cellTime < today.getTime()) {
        return { status: 'past', isToday };
    }

    // Check availability
    const isBlocked = blockedDates.some(range => {
        const start = new Date(range.start).setHours(0,0,0,0);
        const end = new Date(range.end).setHours(23,59,59,999);
        return cellTime >= start && cellTime <= end;
    });

    return { status: isBlocked ? 'booked' : 'free', isToday };
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-slate-900">Availability</h3>
        <div className="flex items-center gap-4 bg-slate-50 rounded-lg p-1">
          <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-bold text-slate-900 w-32 text-center select-none">
            {monthName} {calendarData.year}
          </span>
          <button onClick={handleNextMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-4">
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="text-xs font-semibold text-slate-400 text-center uppercase tracking-wider">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {/* Padding for prev month */}
        {calendarData.prevMonthDays.map(day => (
          <div key={`prev-${day}`} className="aspect-square flex items-center justify-center text-slate-200 text-sm font-medium select-none">
            {day}
          </div>
        ))}

        {/* Current Month Days */}
        {calendarData.currentMonthDays.map(day => {
          const { status, isToday } = getDayStatus(day);
          
          let containerClasses = 'aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200 relative';
          
          if (status === 'past') {
             containerClasses += ' text-slate-300 bg-slate-50 cursor-not-allowed';
          } else if (status === 'booked') {
             containerClasses += ' bg-red-50 text-red-700 cursor-not-allowed border border-transparent';
          } else {
             containerClasses += ' bg-white text-slate-700 border border-slate-100 hover:border-blue-500 hover:text-blue-600 hover:shadow-md cursor-pointer hover:-translate-y-0.5';
          }

          if (isToday) {
            containerClasses += ' ring-2 ring-blue-500 ring-offset-2 z-10';
          }

          return (
            <div 
              key={`curr-${day}`} 
              className={containerClasses}
              title={status === 'booked' ? 'Booked' : status === 'past' ? 'Past date' : 'Available'}
            >
              {day}
              {status === 'booked' && (
                <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-red-400"></div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-center gap-6 border-t border-slate-100 pt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white border border-slate-200"></div>
          <span className="text-xs text-slate-500 font-medium">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-50 border border-red-100 relative">
             <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full bg-red-400"></div>
          </div>
          <span className="text-xs text-slate-500 font-medium">Booked</span>
        </div>
      </div>
    </div>
  );
};
