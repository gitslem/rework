import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/authStore';
import { usersAPI, projectsAPI } from '@/lib/api';
import { TrendingUp, Briefcase, DollarSign, Star, LogOut } from 'lucide-react';
import Head from 'next/head';

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  const fetchStats = async () => {
    try {
      const response = await usersAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading || loadingStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Head>
        <title>Dashboard - Remote Works</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Remote Works
                </h1>
                <nav className="hidden md:flex space-x-6">
                  <button className="text-blue-600 font-semibold">Dashboard</button>
                  <button className="text-gray-600 hover:text-blue-600">Projects</button>
                  <button className="text-gray-600 hover:text-blue-600">Applications</button>
                  <button className="text-gray-600 hover:text-blue-600">Profile</button>
                </nav>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back! 👋
            </h2>
            <p className="text-gray-600">
              Here&apos;s what&apos;s happening with your account today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                ${stats?.total_earnings?.toFixed(2) || '0.00'}
              </h3>
              <p className="text-gray-600 text-sm">Total Earnings</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats?.active_projects || 0}
              </h3>
              <p className="text-gray-600 text-sm">Active Projects</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats?.completed_projects || 0}
              </h3>
              <p className="text-gray-600 text-sm">Completed Projects</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats?.average_rating?.toFixed(1) || '0.0'}
              </h3>
              <p className="text-gray-600 text-sm">Average Rating</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No recent activity yet</p>
              <button
                onClick={() => router.push('/projects')}
                className="btn-primary"
              >
                Browse Projects
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <h4 className="text-xl font-bold mb-2">Find Projects</h4>
              <p className="text-blue-100 mb-4">
                Browse and apply to available projects
              </p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition">
                Browse Now
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <h4 className="text-xl font-bold mb-2">Update Profile</h4>
              <p className="text-purple-100 mb-4">
                Complete your profile to get more matches
              </p>
              <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition">
                Edit Profile
              </button>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <h4 className="text-xl font-bold mb-2">View Earnings</h4>
              <p className="text-green-100 mb-4">
                Check your payment history
              </p>
              <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition">
                View Details
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
