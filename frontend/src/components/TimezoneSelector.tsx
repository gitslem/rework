import React, { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';
import api from '../lib/api';

interface Timezone {
  value: string;
  label: string;
  offset: string;
}

interface TimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
  className?: string;
}

export default function TimezoneSelector({ value, onChange, className = '' }: TimezoneSelectorProps) {
  const [timezones, setTimezones] = useState<Timezone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTimezones();
  }, []);

  const fetchTimezones = async () => {
    try {
      const response = await api.get('/api/v1/collaboration/timezones/list');
      setTimezones(response.data);
    } catch (error) {
      console.error('Failed to fetch timezones:', error);
      // Fallback to basic list
      setTimezones([
        { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: 'UTC+0' },
        { value: 'America/New_York', label: 'Eastern Time (New York)', offset: 'UTC-5/-4' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)', offset: 'UTC-8/-7' },
        { value: 'Europe/London', label: 'London (GMT/BST)', offset: 'UTC+0/+1' },
        { value: 'Asia/Tokyo', label: 'Japan Standard Time', offset: 'UTC+9' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTimezones = timezones.filter(tz =>
    tz.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tz.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCurrentTime = (timezone: string): string => {
    try {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      return new Intl.DateTimeFormat('en-US', options).format(now);
    } catch (e) {
      return '--:--';
    }
  };

  const selectedTimezone = timezones.find(tz => tz.value === value);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Timezone
        </div>
      </label>

      {/* Current Selection Display */}
      {selectedTimezone && (
        <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div>
            <p className="font-medium text-blue-900">{selectedTimezone.label}</p>
            <p className="text-sm text-blue-700">{selectedTimezone.offset}</p>
          </div>
          <div className="flex items-center gap-2 text-blue-800">
            <Clock className="w-4 h-4" />
            <span className="font-mono font-semibold">{getCurrentTime(value)}</span>
          </div>
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search timezones..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Timezone Dropdown */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      >
        {loading ? (
          <option>Loading timezones...</option>
        ) : (
          <>
            <option value="">Select a timezone</option>
            {filteredTimezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label} ({tz.offset})
              </option>
            ))}
          </>
        )}
      </select>

      {searchTerm && filteredTimezones.length === 0 && (
        <p className="mt-2 text-sm text-gray-500">No timezones found matching "{searchTerm}"</p>
      )}
    </div>
  );
}
