import React from 'react';
import { Clock, Users } from 'lucide-react';

interface UserTimezoneInfo {
  user_id: number;
  name: string;
  timezone: string;
  working_hours_start: number;
  working_hours_end: number;
  working_days: number[];
  avatar_url?: string;
}

interface OverlapWindow {
  start_utc: string;
  end_utc: string;
  start_hour_local: number;
  end_hour_local: number;
  duration_hours: number;
  participating_users: number[];
  day_of_week: number;
}

interface TimezoneTimelineProps {
  users: UserTimezoneInfo[];
  overlapWindows: OverlapWindow[];
  currentUserTimezone: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS_IN_DAY = 24;

export default function TimezoneTimeline({ users, overlapWindows, currentUserTimezone }: TimezoneTimelineProps) {
  const getCurrentHourInTimezone = (timezone: string): number => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(now);
    const hourPart = parts.find(part => part.type === 'hour');
    return hourPart ? parseInt(hourPart.value) : 0;
  };

  const isWorkingHour = (user: UserTimezoneInfo, hour: number): boolean => {
    if (user.working_hours_end > user.working_hours_start) {
      return hour >= user.working_hours_start && hour < user.working_hours_end;
    } else {
      // Crosses midnight
      return hour >= user.working_hours_start || hour < user.working_hours_end;
    }
  };

  const getHourColor = (user: UserTimezoneInfo, hour: number, isCurrentHour: boolean): string => {
    if (isCurrentHour) {
      return isWorkingHour(user, hour)
        ? 'bg-green-500 border-2 border-green-700'
        : 'bg-gray-400 border-2 border-gray-600';
    }
    return isWorkingHour(user, hour) ? 'bg-blue-400' : 'bg-gray-200';
  };

  const findOverlapForHour = (hour: number, userIds: number[]): OverlapWindow | null => {
    for (const window of overlapWindows) {
      if (window.start_hour_local <= hour && hour < window.end_hour_local) {
        // Check if all these users are in this overlap
        const allUsersInWindow = userIds.every(id => window.participating_users.includes(id));
        if (allUsersInWindow) {
          return window;
        }
      }
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Team Working Hours Timeline
        </h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-400 rounded"></div>
            <span>Working Hours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span>Off Hours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 border-2 border-green-700 rounded"></div>
            <span>Current Time</span>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Hour Labels */}
          <div className="flex mb-2">
            <div className="w-48 flex-shrink-0"></div>
            <div className="flex-1 flex">
              {Array.from({ length: HOURS_IN_DAY }, (_, i) => (
                <div key={i} className="flex-1 text-center text-xs text-gray-600 min-w-[30px]">
                  {i.toString().padStart(2, '0')}
                </div>
              ))}
            </div>
          </div>

          {/* User Timeline Rows */}
          {users.map((user) => {
            const currentHour = getCurrentHourInTimezone(user.timezone);

            return (
              <div key={user.user_id} className="flex items-center mb-4">
                {/* User Info */}
                <div className="w-48 flex-shrink-0 pr-4">
                  <div className="flex items-center gap-2">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.timezone}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline Blocks */}
                <div className="flex-1 flex gap-1">
                  {Array.from({ length: HOURS_IN_DAY }, (_, hour) => {
                    const isCurrentHour = hour === currentHour;
                    const color = getHourColor(user, hour, isCurrentHour);

                    return (
                      <div
                        key={hour}
                        className={`flex-1 h-12 rounded min-w-[30px] transition-all hover:opacity-80 ${color}`}
                        title={`${hour}:00 - ${isWorkingHour(user, hour) ? 'Working' : 'Off'} ${isCurrentHour ? '(Now)' : ''}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Overlap Indicators */}
          {overlapWindows.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Best Collaboration Windows
              </h3>
              <div className="space-y-2">
                {overlapWindows.slice(0, 5).map((window, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-green-600">
                        {window.duration_hours.toFixed(1)}h
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {DAYS[window.day_of_week]}: {window.start_hour_local}:00 - {window.end_hour_local}:00
                        </p>
                        <p className="text-sm text-gray-600">
                          {window.participating_users.length} team members available
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-green-700 font-medium">
                      {index === 0 ? '🌟 Best Time' : `#${index + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Overlap Message */}
          {overlapWindows.length === 0 && users.length >= 2 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <p className="text-yellow-800">
                No overlapping working hours found. Consider async communication or flexible scheduling.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
