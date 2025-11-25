import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '@/components/Logo';
import {
  Users, TrendingUp, DollarSign, CheckCircle, Activity,
  Calendar, BarChart3, PieChart, ArrowUp, ArrowDown, Star
} from 'lucide-react';
import { getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where, doc, getDoc, orderBy, limit } from 'firebase/firestore';

interface AnalyticsStats {
  totalUsers: number;
  totalCandidates: number;
  totalAgents: number;
  pendingCandidates: number;
  pendingAgents: number;
  approvedCandidates: number;
  approvedAgents: number;
  totalServiceRequests: number;
  completedServiceRequests: number;
  totalRevenue: number;
  activeUsers: number;
}

interface RecentActivity {
  type: string;
  description: string;
  timestamp: Date;
}

export default function AdminAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<AnalyticsStats>({
    totalUsers: 0,
    totalCandidates: 0,
    totalAgents: 0,
    pendingCandidates: 0,
    pendingAgents: 0,
    approvedCandidates: 0,
    approvedAgents: 0,
    totalServiceRequests: 0,
    completedServiceRequests: 0,
    totalRevenue: 0,
    activeUsers: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseFirestore();

      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
          } else {
            router.push('/admin');
          }
        } else {
          router.push('/admin');
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error checking admin access:', error);
      setLoading(false);
      router.push('/admin');
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const db = getFirebaseFirestore();

      // Fetch all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate user stats
      const totalUsers = users.length;
      const candidates = users.filter((u: any) => u.role === 'candidate');
      const agents = users.filter((u: any) => u.role === 'agent');
      const activeUsers = users.filter((u: any) => u.isActive).length;

      const totalCandidates = candidates.length;
      const totalAgents = agents.length;
      const pendingCandidates = candidates.filter((u: any) => !u.isCandidateApproved).length;
      const approvedCandidates = candidates.filter((u: any) => u.isCandidateApproved).length;

      // Get agent profiles for approval status
      const profilesSnapshot = await getDocs(collection(db, 'profiles'));
      const profiles = profilesSnapshot.docs.map(doc => doc.data());

      const pendingAgents = profiles.filter((p: any) => p.agentVerificationStatus === 'pending').length;
      const approvedAgents = profiles.filter((p: any) => p.agentVerificationStatus === 'verified').length;

      // Fetch service requests
      const serviceRequestsSnapshot = await getDocs(collection(db, 'serviceRequests'));
      const serviceRequests = serviceRequestsSnapshot.docs.map(doc => doc.data());

      const totalServiceRequests = serviceRequests.length;
      const completedServiceRequests = serviceRequests.filter((sr: any) => sr.status === 'completed').length;

      // Calculate revenue (sum of completed service requests)
      const totalRevenue = serviceRequests
        .filter((sr: any) => sr.status === 'completed')
        .reduce((sum: number, sr: any) => sum + (sr.amount || 0), 0);

      setStats({
        totalUsers,
        totalCandidates,
        totalAgents,
        pendingCandidates,
        pendingAgents,
        approvedCandidates,
        approvedAgents,
        totalServiceRequests,
        completedServiceRequests,
        totalRevenue,
        activeUsers,
      });

      // Generate recent activity (last 10 user registrations)
      const recentUsers = users
        .filter((u: any) => u.createdAt)
        .sort((a: any, b: any) => b.createdAt.toMillis() - a.createdAt.toMillis())
        .slice(0, 10);

      const activity: RecentActivity[] = recentUsers.map((u: any) => ({
        type: u.role,
        description: `New ${u.role} registered: ${u.email}`,
        timestamp: u.createdAt.toDate(),
      }));

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Total Candidates',
      value: stats.totalCandidates,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-500',
      subtitle: `${stats.approvedCandidates} approved, ${stats.pendingCandidates} pending`,
    },
    {
      title: 'Total Agents',
      value: stats.totalAgents,
      icon: <Star className="w-6 h-6" />,
      color: 'bg-yellow-500',
      subtitle: `${stats.approvedAgents} verified, ${stats.pendingAgents} pending`,
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-green-500',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Service Requests',
      value: stats.totalServiceRequests,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-indigo-500',
      subtitle: `${stats.completedServiceRequests} completed`,
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-emerald-500',
      trend: '+24%',
      trendUp: true,
    },
  ];

  return (
    <>
      <Head>
        <title>Admin - Analytics | RemoteWorks</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <Logo showText={false} size="lg" />
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Admin Panel</span>
                <button
                  onClick={() => router.push('/admin')}
                  className="text-sm font-medium text-black hover:text-gray-600"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Platform Analytics</h1>
              <p className="text-gray-600">Overview of platform metrics and user activity</p>
            </div>
            <button
              onClick={fetchAnalytics}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center"
            >
              <Activity className="w-4 h-4 mr-2" />
              Refresh Data
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statCards.map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`${card.color} text-white p-3 rounded-lg`}>
                    {card.icon}
                  </div>
                  {card.trend && (
                    <div className={`flex items-center text-sm font-semibold ${
                      card.trendUp ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.trendUp ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                      {card.trend}
                    </div>
                  )}
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
                <div className="text-3xl font-bold text-black mb-2">{card.value}</div>
                {card.subtitle && (
                  <p className="text-xs text-gray-500">{card.subtitle}</p>
                )}
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* User Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <PieChart className="w-5 h-5 mr-2" />
                <h2 className="text-xl font-bold text-black">User Distribution</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">Candidates</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-black">{stats.totalCandidates}</div>
                    <div className="text-xs text-gray-500">
                      {stats.totalUsers > 0 ? ((stats.totalCandidates / stats.totalUsers) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">Agents</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-black">{stats.totalAgents}</div>
                    <div className="text-xs text-gray-500">
                      {stats.totalUsers > 0 ? ((stats.totalAgents / stats.totalUsers) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">Admins</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-black">
                      {stats.totalUsers - stats.totalCandidates - stats.totalAgents}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stats.totalUsers > 0 ? (((stats.totalUsers - stats.totalCandidates - stats.totalAgents) / stats.totalUsers) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual bar representation */}
              <div className="mt-6 h-4 bg-gray-200 rounded-full overflow-hidden flex">
                <div
                  className="bg-purple-500 h-full"
                  style={{ width: `${stats.totalUsers > 0 ? (stats.totalCandidates / stats.totalUsers) * 100 : 0}%` }}
                ></div>
                <div
                  className="bg-yellow-500 h-full"
                  style={{ width: `${stats.totalUsers > 0 ? (stats.totalAgents / stats.totalUsers) * 100 : 0}%` }}
                ></div>
                <div
                  className="bg-blue-500 h-full"
                  style={{ width: `${stats.totalUsers > 0 ? ((stats.totalUsers - stats.totalCandidates - stats.totalAgents) / stats.totalUsers) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Approval Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <BarChart3 className="w-5 h-5 mr-2" />
                <h2 className="text-xl font-bold text-black">Approval Status</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Candidates</span>
                    <span className="text-sm text-gray-500">
                      {stats.approvedCandidates}/{stats.totalCandidates}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{
                        width: `${stats.totalCandidates > 0 ? (stats.approvedCandidates / stats.totalCandidates) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {stats.pendingCandidates} pending approval
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Agents</span>
                    <span className="text-sm text-gray-500">
                      {stats.approvedAgents}/{stats.totalAgents}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{
                        width: `${stats.totalAgents > 0 ? (stats.approvedAgents / stats.totalAgents) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {stats.pendingAgents} pending verification
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Service Requests</span>
                    <span className="text-sm text-gray-500">
                      {stats.completedServiceRequests}/{stats.totalServiceRequests}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{
                        width: `${stats.totalServiceRequests > 0 ? (stats.completedServiceRequests / stats.totalServiceRequests) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {stats.totalServiceRequests - stats.completedServiceRequests} in progress
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Calendar className="w-5 h-5 mr-2" />
              <h2 className="text-xl font-bold text-black">Recent Activity</h2>
            </div>
            {recentActivity.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'candidate' ? 'bg-purple-100 text-purple-700' :
                      activity.type === 'agent' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/admin/candidates')}
              className="bg-purple-500 text-white p-6 rounded-xl font-semibold hover:bg-purple-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span>Manage Candidates</span>
                {stats.pendingCandidates > 0 && (
                  <span className="bg-white text-purple-600 px-3 py-1 rounded-full text-sm">
                    {stats.pendingCandidates} pending
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => router.push('/admin/agents')}
              className="bg-yellow-500 text-white p-6 rounded-xl font-semibold hover:bg-yellow-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span>Manage Agents</span>
                {stats.pendingAgents > 0 && (
                  <span className="bg-white text-yellow-600 px-3 py-1 rounded-full text-sm">
                    {stats.pendingAgents} pending
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => router.push('/admin')}
              className="bg-black text-white p-6 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Dashboard Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
