import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/authStore';
import { usersAPI } from '@/lib/api';
import {
  TrendingUp, Briefcase, DollarSign, Star, LogOut, Globe2,
  Plus, Clock, CheckCircle, Users, Settings, Bell, Search
} from 'lucide-react';
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-accent-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isFreelancer = user.role === 'freelancer' || user.role === 'agent';
  const isBusiness = user.role === 'business';

  return (
    <>
      <Head>
        <title>Dashboard - Relaywork</title>
      </Head>

      <div className="min-h-screen bg-accent-gray-100">
        {/* Header */}
        <header className="bg-white border-b border-accent-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-8">
                <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
                  <Globe2 className="w-8 h-8 text-primary-500 mr-2" />
                  <div className="text-2xl font-bold text-accent-dark">
                    Relay<span className="gradient-text">work</span>
                  </div>
                </div>
                <nav className="hidden md:flex space-x-6">
                  <button className="text-primary-500 font-semibold">Dashboard</button>
                  <button
                    onClick={() => router.push('/projects')}
                    className="text-accent-gray-600 hover:text-primary-500 transition font-medium"
                  >
                    {isFreelancer ? 'Browse Projects' : 'My Projects'}
                  </button>
                  <button className="text-accent-gray-600 hover:text-primary-500 transition font-medium">
                    Messages
                  </button>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-accent-gray-600 hover:text-primary-500 transition">
                  <Bell className="w-6 h-6" />
                </button>
                <button className="p-2 text-accent-gray-600 hover:text-primary-500 transition">
                  <Settings className="w-6 h-6" />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-accent-gray-600 hover:text-red-600 transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-accent-dark mb-2">
              Welcome back, {user.email.split('@')[0]}! 👋
            </h2>
            <p className="text-accent-gray-600 text-lg">
              {isFreelancer
                ? "Here's your async AI workspace. Projects are moving while you rest."
                : "Manage your projects and team across time zones."}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mb-8 flex gap-4">
            {isBusiness && (
              <button className="btn-primary inline-flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Post New Project
              </button>
            )}
            {isFreelancer && (
              <button
                onClick={() => router.push('/projects')}
                className="btn-primary inline-flex items-center"
              >
                <Search className="w-5 h-5 mr-2" />
                Browse Projects
              </button>
            )}
            <button className="btn-secondary">
              Complete Profile
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {isFreelancer && (
              <>
                <div className="bg-white rounded-2xl p-6 border border-accent-gray-200 card-hover">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-purple w-12 h-12 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="text-3xl font-bold text-accent-dark mb-1">
                    ${stats?.total_earnings?.toLocaleString() || '0'}
                  </h3>
                  <p className="text-accent-gray-600 text-sm">Total Earnings</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-accent-gray-200 card-hover">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-accent-dark mb-1">
                    {stats?.completed_projects || 0}
                  </h3>
                  <p className="text-accent-gray-600 text-sm">Completed Projects</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-accent-gray-200 card-hover">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 w-12 h-12 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-accent-dark mb-1">
                    {stats?.average_rating?.toFixed(1) || '0.0'} ⭐
                  </h3>
                  <p className="text-accent-gray-600 text-sm">Average Rating</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-accent-gray-200 card-hover">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 w-12 h-12 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-accent-dark mb-1">
                    {stats?.active_projects || 0}
                  </h3>
                  <p className="text-accent-gray-600 text-sm">Active Projects</p>
                </div>
              </>
            )}

            {isBusiness && (
              <>
                <div className="bg-white rounded-2xl p-6 border border-accent-gray-200 card-hover">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-purple w-12 h-12 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-accent-dark mb-1">
                    {stats?.total_projects || 0}
                  </h3>
                  <p className="text-accent-gray-600 text-sm">Total Projects</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-accent-gray-200 card-hover">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-accent-dark mb-1">
                    {stats?.active_projects || 0}
                  </h3>
                  <p className="text-accent-gray-600 text-sm">Active Projects</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-accent-gray-200 card-hover">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 w-12 h-12 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-accent-dark mb-1">
                    {stats?.total_freelancers || 0}
                  </h3>
                  <p className="text-accent-gray-600 text-sm">Hired Freelancers</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-accent-gray-200 card-hover">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-accent-dark mb-1">
                    ${stats?.total_spent?.toLocaleString() || '0'}
                  </h3>
                  <p className="text-accent-gray-600 text-sm">Total Spent</p>
                </div>
              </>
            )}
          </div>

          {/* Recent Activity / Projects */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Projects */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-accent-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-accent-dark">
                    {isFreelancer ? 'Recent Applications' : 'Recent Projects'}
                  </h3>
                  <button className="text-primary-500 hover:text-primary-600 font-semibold text-sm">
                    View All →
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Placeholder for projects */}
                  <div className="text-center py-12">
                    <Briefcase className="w-12 h-12 text-accent-gray-300 mx-auto mb-3" />
                    <p className="text-accent-gray-500">No recent activity yet</p>
                    <button
                      onClick={() => router.push('/projects')}
                      className="mt-4 text-primary-500 hover:text-primary-600 font-semibold"
                    >
                      {isFreelancer ? 'Browse Projects' : 'Post a Project'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats / Profile */}
            <div className="space-y-6">
              {/* Profile Completion */}
              <div className="bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Profile Strength</h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>60% Complete</span>
                    <span>Good</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2 w-3/5"></div>
                  </div>
                </div>
                <p className="text-sm text-white/80 mb-4">
                  Complete your profile to get more {isFreelancer ? 'project matches' : 'freelancer recommendations'}
                </p>
                <button className="bg-white text-primary-500 px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition w-full">
                  Complete Profile
                </button>
              </div>

              {/* Tips */}
              <div className="bg-white rounded-2xl border border-accent-gray-200 p-6">
                <h3 className="text-xl font-bold text-accent-dark mb-4">💡 Quick Tip</h3>
                <p className="text-accent-gray-600 mb-4">
                  {isFreelancer
                    ? 'Update your skills and portfolio to get matched with better projects. Verified badges increase your chances by 3x.'
                    : 'Projects with clear deliverables and milestones get 5x more quality applications.'}
                </p>
                <button className="text-primary-500 hover:text-primary-600 font-semibold text-sm">
                  Learn More →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
