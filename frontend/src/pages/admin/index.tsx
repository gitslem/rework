import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '@/components/Logo';
import { Shield, Users, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { getFirebaseAuth } from '../../../firebase.config';
import { getFirebaseFirestore } from '../../../firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseFirestore();

      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Check if user is admin
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser(userData);

            if (userData.role === 'admin') {
              setIsAdmin(true);
            }
          }
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error checking admin status:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Head>
          <title>Admin Access - RemoteWorks</title>
        </Head>

        <div className="min-h-screen bg-white">
          <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <Logo />
            </div>
          </nav>

          <div className="max-w-2xl mx-auto px-6 py-16 text-center">
            <Shield className="w-16 h-16 text-black mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-black mb-4">Admin Access Required</h1>
            <p className="text-gray-600 mb-8">
              Please sign in to access the admin dashboard.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all inline-flex items-center"
            >
              Sign In
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Head>
          <title>Access Denied - RemoteWorks</title>
        </Head>

        <div className="min-h-screen bg-white">
          <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <Logo />
            </div>
          </nav>

          <div className="max-w-2xl mx-auto px-6 py-16 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-black mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-8">
              You don't have permission to access the admin dashboard.
              <br />
              Your account role: <span className="font-semibold">{user.role}</span>
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </>
    );
  }

  // Admin Dashboard Home
  return (
    <>
      <Head>
        <title>Admin Dashboard - RemoteWorks</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <Logo />
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Admin Panel</span>
                <button
                  onClick={() => router.push('/')}
                  className="text-sm font-medium text-black hover:text-gray-600"
                >
                  Exit Admin
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-black mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.displayName || user.email}</p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <button
              onClick={() => router.push('/admin/agents')}
              className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-left hover:border-black transition-all group"
            >
              <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Agent Applications</h3>
              <p className="text-gray-600 text-sm mb-4">
                Review and approve agent verification requests
              </p>
              <div className="flex items-center text-black font-semibold text-sm">
                Manage Applications
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/candidates')}
              className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-left hover:border-black transition-all group"
            >
              <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Candidate Applications</h3>
              <p className="text-gray-600 text-sm mb-4">
                Approve or reject candidate sign-ups
              </p>
              <div className="flex items-center text-black font-semibold text-sm">
                Manage Candidates
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/analytics')}
              className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-left hover:border-black transition-all group"
            >
              <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm mb-4">
                View platform statistics and insights
              </p>
              <div className="flex items-center text-black font-semibold text-sm">
                View Analytics
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-12 bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-black mb-6">Admin Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-black mb-2">Agent Management</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Review agent applications with detailed profiles</li>
                  <li>• Approve or reject with reasons</li>
                  <li>• Filter by verification status</li>
                  <li>• Search by name or email</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-2">Candidate Management</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Approve candidate sign-ups</li>
                  <li>• View candidate profiles</li>
                  <li>• Manage account status</li>
                  <li>• Track approval history</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
