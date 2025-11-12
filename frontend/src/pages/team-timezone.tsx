import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Users, AlertCircle, Loader } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../lib/authStore';
import TimezoneTimeline from '../components/TimezoneTimeline';

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

interface TeamOverlapResponse {
  user_timezones: UserTimezoneInfo[];
  overlap_windows: OverlapWindow[];
  best_meeting_times: OverlapWindow[];
  total_overlap_hours_per_week: number;
  timezone_span_hours: number;
}

export default function TeamTimezonePage() {
  const router = useRouter();
  const { projectId } = router.query;
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamData, setTeamData] = useState<TeamOverlapResponse | null>(null);
  const [customUserIds, setCustomUserIds] = useState<string>('');
  const [mode, setMode] = useState<'project' | 'custom'>('project');

  useEffect(() => {
    if (projectId) {
      setMode('project');
      fetchProjectTeamOverlap(parseInt(projectId as string));
    }
  }, [projectId]);

  const fetchProjectTeamOverlap = async (projectIdNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/api/v1/collaboration/overlap/project', {
        project_id: projectIdNum,
        include_applicants: false
      });
      setTeamData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch team overlap data');
      console.error('Error fetching team overlap:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomTeamOverlap = async () => {
    try {
      setLoading(true);
      setError(null);

      // Parse user IDs from comma-separated string
      const userIds = customUserIds
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));

      if (userIds.length === 0) {
        setError('Please enter at least one user ID');
        setLoading(false);
        return;
      }

      const response = await api.post('/api/v1/collaboration/overlap/custom', {
        user_ids: userIds
      });
      setTeamData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch team overlap data');
      console.error('Error fetching custom team overlap:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode: 'project' | 'custom') => {
    setMode(newMode);
    setTeamData(null);
    setError(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view team timezones</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8" />
            Team Timezone Collaboration
          </h1>
          <p className="mt-2 text-gray-600">
            Visualize your team's working hours and find the best time for collaboration
          </p>
        </div>

        {/* Mode Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => handleModeChange('project')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'project'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Project Team
            </button>
            <button
              onClick={() => handleModeChange('custom')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Custom Team
            </button>
          </div>

          {/* Project Mode Input */}
          {mode === 'project' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project ID
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Enter project ID"
                  value={projectId || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    router.push(`/team-timezone?projectId=${value}`, undefined, { shallow: true });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => projectId && fetchProjectTeamOverlap(parseInt(projectId as string))}
                  disabled={!projectId || loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Load'}
                </button>
              </div>
            </div>
          )}

          {/* Custom Mode Input */}
          {mode === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User IDs (comma-separated)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., 1, 2, 3"
                  value={customUserIds}
                  onChange={(e) => setCustomUserIds(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={fetchCustomTeamOverlap}
                  disabled={loading || !customUserIds.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Calculate'}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Enter user IDs separated by commas to see their timezone overlap
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-12 flex items-center justify-center">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading team timezone data...</p>
            </div>
          </div>
        )}

        {/* Team Data */}
        {!loading && teamData && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">Team Members</p>
                <p className="text-3xl font-bold text-gray-900">
                  {teamData.user_timezones.length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">Weekly Overlap</p>
                <p className="text-3xl font-bold text-blue-600">
                  {teamData.total_overlap_hours_per_week.toFixed(1)}h
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">Timezone Span</p>
                <p className="text-3xl font-bold text-purple-600">
                  {teamData.timezone_span_hours}h
                </p>
              </div>
            </div>

            {/* Timeline Visualization */}
            <TimezoneTimeline
              users={teamData.user_timezones}
              overlapWindows={teamData.best_meeting_times}
              currentUserTimezone={user.timezone || 'UTC'}
            />
          </>
        )}

        {/* Empty State */}
        {!loading && !teamData && !error && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {mode === 'project'
                ? 'Enter a project ID to view team timezone overlap'
                : 'Enter user IDs to calculate custom team overlap'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
