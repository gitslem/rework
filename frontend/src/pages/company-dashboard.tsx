import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/authStore';
import { usersAPI } from '@/lib/api';
import {
  Building2, Briefcase, DollarSign, Users, LogOut, Globe2,
  Plus, Clock, CheckCircle, Settings, Bell, TrendingUp,
  FileText, Code2, Shield, Search
} from 'lucide-react';
import Head from 'next/head';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface Project {
  id: number;
  title: string;
  status: string;
  budget: number;
  created_at: string;
}

export default function CompanyDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect non-business users to regular dashboard
      if (user.role !== 'business') {
        router.push('/dashboard');
        return;
      }
      fetchStats();
      fetchProjects();
    }
  }, [isAuthenticated, user, router]);

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

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/projects/my/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data.slice(0, 5)); // Show latest 5
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoadingProjects(false);
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

  if (!user || user.role !== 'business') return null;

  return (
    <>
      <Head>
        <title>Company Dashboard - Remote-Works</title>
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
                    My Projects
                  </button>
                  <button
                    onClick={() => router.push('/sandboxes')}
                    className="text-accent-gray-600 hover:text-primary-500 transition font-medium"
                  >
                    Sandboxes
                  </button>
                  <button
                    onClick={() => router.push('/proofs')}
                    className="text-accent-gray-600 hover:text-primary-500 transition font-medium"
                  >
                    Proof of Build
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
            <div className="flex items-center mb-4">
              <Building2 className="w-10 h-10 text-primary-500 mr-3" />
              <div>
                <h2 className="text-4xl font-bold text-accent-dark">
                  Company Dashboard
                </h2>
                <p className="text-accent-gray-600 text-lg">
                  Welcome back, {user.email.split('@')[0]}! Manage your projects and team.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/create-project')}
              className="bg-gradient-to-r from-primary-500 to-accent-purple text-white px-6 py-4 rounded-lg hover:shadow-lg transition flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Project with AI
            </button>
            <button
              onClick={() => router.push('/sandboxes')}
              className="bg-white border-2 border-primary-500 text-primary-500 px-6 py-4 rounded-lg hover:bg-primary-50 transition flex items-center justify-center"
            >
              <Code2 className="w-5 h-5 mr-2" />
              Shared Sandboxes
            </button>
            <button
              onClick={() => router.push('/proofs')}
              className="bg-white border-2 border-accent-purple text-accent-purple px-6 py-4 rounded-lg hover:bg-purple-50 transition flex items-center justify-center"
            >
              <Shield className="w-5 h-5 mr-2" />
              Verify Deliverables
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm text-accent-gray-500">Total</span>
              </div>
              <div className="text-3xl font-bold text-accent-dark mb-1">
                {stats?.active_projects || 0}
              </div>
              <div className="text-sm text-accent-gray-600">Active Projects</div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm text-accent-gray-500">Done</span>
              </div>
              <div className="text-3xl font-bold text-accent-dark mb-1">
                {stats?.completed_projects || 0}
              </div>
              <div className="text-sm text-accent-gray-600">Completed</div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-sm text-accent-gray-500">Review</span>
              </div>
              <div className="text-3xl font-bold text-accent-dark mb-1">
                {stats?.pending_applications || 0}
              </div>
              <div className="text-sm text-accent-gray-600">Applications</div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm text-accent-gray-500">Budget</span>
              </div>
              <div className="text-3xl font-bold text-accent-dark mb-1">
                ${stats?.total_earnings?.toFixed(0) || 0}
              </div>
              <div className="text-sm text-accent-gray-600">Total Spent</div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* AI Project Briefs */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-primary-500">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-primary-100 rounded-lg mr-4">
                  <FileText className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold text-accent-dark">AI Project Briefs</h3>
              </div>
              <p className="text-accent-gray-600 mb-4">
                Generate detailed project specifications using AI. Get budget estimates, timelines, and tech stack recommendations.
              </p>
              <button
                onClick={() => router.push('/create-project')}
                className="text-primary-500 font-medium hover:text-primary-600 flex items-center"
              >
                Create Brief
                <Plus className="w-4 h-4 ml-2" />
              </button>
            </div>

            {/* Shared Sandboxes */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-blue-500">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <Code2 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-accent-dark">Shared Sandboxes</h3>
              </div>
              <p className="text-accent-gray-600 mb-4">
                Collaborate with your team in real-time code environments. Test implementations before accepting deliverables.
              </p>
              <button
                onClick={() => router.push('/sandboxes')}
                className="text-blue-500 font-medium hover:text-blue-600 flex items-center"
              >
                Open Sandbox
                <Code2 className="w-4 h-4 ml-2" />
              </button>
            </div>

            {/* Proof of Build */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-purple-500">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-accent-dark">Proof of Build</h3>
              </div>
              <p className="text-accent-gray-600 mb-4">
                Verify work delivery through GitHub commits, PRs, and file verification. Generate signed certificates for milestones.
              </p>
              <button
                onClick={() => router.push('/proofs')}
                className="text-purple-500 font-medium hover:text-purple-600 flex items-center"
              >
                View Proofs
                <Shield className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-accent-dark">Recent Projects</h3>
              <button
                onClick={() => router.push('/projects')}
                className="text-primary-500 font-medium hover:text-primary-600"
              >
                View All
              </button>
            </div>

            {loadingProjects ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-accent-gray-300 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-accent-dark mb-2">No Projects Yet</h4>
                <p className="text-accent-gray-600 mb-6">
                  Create your first project to get started
                </p>
                <button
                  onClick={() => router.push('/create-project')}
                  className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition"
                >
                  Create Project
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="border border-accent-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-accent-dark mb-1">{project.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-accent-gray-600">
                          <span className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            ${project.budget.toFixed(0)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            project.status === 'open'
                              ? 'bg-green-100 text-green-700'
                              : project.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-700'
                              : project.status === 'completed'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
