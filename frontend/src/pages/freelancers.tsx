import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, MapPin, DollarSign, Star, Award, Loader, Github, User as UserIcon } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../lib/authStore';

interface VerifiedSkill {
  skill: string;
  verified: boolean;
  verified_at?: string;
  verified_by?: number;
}

interface Freelancer {
  user_id: number;
  profile_id: number;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_url?: string;
  skills: string[];
  verified_skills: VerifiedSkill[];
  location?: string;
  hourly_rate?: number;
  timezone: string;
  average_rating: number;
  total_reviews: number;
  completed_projects: number;
  portfolio_items_count: number;
  github_username?: string;
  huggingface_username?: string;
}

export default function FreelancersPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [minRate, setMinRate] = useState<number | ''>('');
  const [maxRate, setMaxRate] = useState<number | ''>('');
  const [minRating, setMinRating] = useState<number | ''>('');
  const [verifiedSkillsOnly, setVerifiedSkillsOnly] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFreelancers();
    }
  }, [user]);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (searchQuery) params.search_query = searchQuery;
      if (skillsFilter) params.skills = skillsFilter;
      if (locationFilter) params.location = locationFilter;
      if (minRate !== '') params.min_hourly_rate = minRate;
      if (maxRate !== '') params.max_hourly_rate = maxRate;
      if (minRating !== '') params.min_rating = minRating;
      if (verifiedSkillsOnly) params.verified_skills_only = true;

      const response = await api.get('/api/v1/freelancers/search', { params });
      setFreelancers(response.data);
    } catch (err: any) {
      console.error('Error fetching freelancers:', err);
      setError(err.response?.data?.detail || 'Failed to load freelancers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchFreelancers();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSkillsFilter('');
    setLocationFilter('');
    setMinRate('');
    setMaxRate('');
    setMinRating('');
    setVerifiedSkillsOnly(false);
    setTimeout(() => fetchFreelancers(), 100);
  };

  const getFullName = (freelancer: Freelancer) => {
    if (freelancer.first_name && freelancer.last_name) {
      return `${freelancer.first_name} ${freelancer.last_name}`;
    } else if (freelancer.first_name) {
      return freelancer.first_name;
    }
    return 'Freelancer';
  };

  const getVerifiedSkillsCount = (freelancer: Freelancer) => {
    return freelancer.verified_skills?.filter(vs => vs.verified).length || 0;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to browse freelancers</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Browse Freelancers</h1>
          <p className="mt-2 text-gray-600">
            Find verified freelancers with the skills you need
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search by name, bio, or skills..."
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Search
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                value={skillsFilter}
                onChange={(e) => setSkillsFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Python, React, AI"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Rating
              </label>
              <input
                type="number"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="4.0"
                min="0"
                max="5"
                step="0.1"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Rate (USD/hr)
                </label>
                <input
                  type="number"
                  value={minRate}
                  onChange={(e) => setMinRate(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Rate (USD/hr)
                </label>
                <input
                  type="number"
                  value={maxRate}
                  onChange={(e) => setMaxRate(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="200"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedSkillsOnly}
                  onChange={(e) => setVerifiedSkillsOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Verified Skills Only
                </span>
              </label>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-4">
              <p className="text-gray-600">
                {freelancers.length} freelancer{freelancers.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Freelancers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {freelancers.map((freelancer) => (
                <div
                  key={freelancer.user_id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/freelancer/${freelancer.user_id}`)}
                >
                  <div className="p-6">
                    {/* Avatar and Name */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        {freelancer.avatar_url ? (
                          <img
                            src={freelancer.avatar_url}
                            alt={getFullName(freelancer)}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <UserIcon className="w-8 h-8 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getFullName(freelancer)}
                        </h3>
                        {freelancer.location && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <MapPin className="w-4 h-4" />
                            {freelancer.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    {freelancer.bio && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {freelancer.bio}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">
                          {freelancer.average_rating.toFixed(1)} ({freelancer.total_reviews})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">
                          {freelancer.completed_projects} projects
                        </span>
                      </div>
                    </div>

                    {/* Hourly Rate */}
                    {freelancer.hourly_rate && (
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">
                          ${freelancer.hourly_rate}/hr
                        </span>
                      </div>
                    )}

                    {/* Skills */}
                    {freelancer.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {freelancer.skills.slice(0, 4).map((skill, idx) => {
                            const isVerified = freelancer.verified_skills?.some(
                              vs => vs.skill === skill && vs.verified
                            );
                            return (
                              <span
                                key={idx}
                                className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                                  isVerified
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {skill}
                                {isVerified && (
                                  <Award className="w-3 h-3" />
                                )}
                              </span>
                            );
                          })}
                          {freelancer.skills.length > 4 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                              +{freelancer.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Social Links */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                      {freelancer.github_username && (
                        <a
                          href={`https://github.com/${freelancer.github_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-600 hover:text-gray-900"
                          title="GitHub"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                      {freelancer.huggingface_username && (
                        <a
                          href={`https://huggingface.co/${freelancer.huggingface_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-600 hover:text-gray-900"
                          title="Hugging Face"
                        >
                          🤗
                        </a>
                      )}
                      {getVerifiedSkillsCount(freelancer) > 0 && (
                        <span className="ml-auto text-xs text-green-600 font-medium flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          {getVerifiedSkillsCount(freelancer)} verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {freelancers.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  No freelancers found matching your criteria.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
