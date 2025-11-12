import React from 'react';
import { Clock, Calendar } from 'lucide-react';

interface WorkingHoursSelectorProps {
  startHour: number;
  endHour: number;
  workingDays: number[];
  onStartHourChange: (hour: number) => void;
  onEndHourChange: (hour: number) => void;
  onWorkingDaysChange: (days: number[]) => void;
  className?: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export default function WorkingHoursSelector({
  startHour,
  endHour,
  workingDays,
  onStartHourChange,
  onEndHourChange,
  onWorkingDaysChange,
  className = ''
}: WorkingHoursSelectorProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const toggleDay = (day: number) => {
    if (workingDays.includes(day)) {
      onWorkingDaysChange(workingDays.filter(d => d !== day));
    } else {
      onWorkingDaysChange([...workingDays, day].sort());
    }
  };

  const selectWeekdays = () => {
    onWorkingDaysChange([1, 2, 3, 4, 5]); // Mon-Fri
  };

  const selectAllDays = () => {
    onWorkingDaysChange([0, 1, 2, 3, 4, 5, 6]); // All days
  };

  const calculateTotalHours = (): number => {
    const hoursPerDay = endHour > startHour ? endHour - startHour : (24 - startHour) + endHour;
    return hoursPerDay * workingDays.length;
  };

  return (
    <div className={className}>
      {/* Working Hours */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Working Hours
          </div>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start Time</label>
            <select
              value={startHour}
              onChange={(e) => onStartHourChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {hours.map(hour => (
                <option key={hour} value={hour}>
                  {formatHour(hour)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">End Time</label>
            <select
              value={endHour}
              onChange={(e) => onEndHourChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {hours.map(hour => (
                <option key={hour} value={hour}>
                  {formatHour(hour)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-2 text-sm text-gray-600">
          {formatHour(startHour)} - {formatHour(endHour)}
        </div>
      </div>

      {/* Working Days */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Working Days
          </div>
        </label>

        {/* Quick Select Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={selectWeekdays}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Weekdays
          </button>
          <button
            type="button"
            onClick={selectAllDays}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            All Days
          </button>
        </div>

        {/* Day Toggle Buttons */}
        <div className="grid grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map(day => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`
                py-3 text-sm font-medium rounded-lg transition-all
                ${workingDays.includes(day.value)
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {day.label}
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-800">
              {workingDays.length} {workingDays.length === 1 ? 'day' : 'days'} per week
            </span>
            <span className="font-semibold text-blue-900">
              {calculateTotalHours()} hours/week
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
