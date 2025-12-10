import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/authStore';
import { getFirebaseFirestore } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import Head from 'next/head';
import Logo from '@/components/Logo';
import {
  Users, MessageSquare, Calendar, Search, ArrowLeft, Home,
  Settings, LogOut, User, UserCheck, Bell, MapPin, FileText
} from 'lucide-react';

interface Connection {
  id: string;
  agentId: string;
  candidateId: string;
  agentName: string;
  candidateName: string;
  agentEmail: string;
  candidateEmail: string;
  conversationId?: string;
  status: string;
  createdAt: any;
  updatedAt?: any;
  // Candidate profile data
  candidateLocation?: string;
  candidateBio?: string;
  candidatePhone?: string;
}

export default function AgentConnections() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConnections, setFilteredConnections] = useState<Connection[]>([]);

  useEffect(() => {
    checkAuthAndLoadConnections();
  }, []);

  useEffect(() => {
    // Filter connections based on search query
    if (searchQuery.trim() === '') {
      setFilteredConnections(connections);
    } else {
      const filtered = connections.filter(conn =>
        conn.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conn.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConnections(filtered);
    }
  }, [searchQuery, connections]);

  const checkAuthAndLoadConnections = async () => {
    try {
      const { getFirebaseAuth } = await import('@/lib/firebase/config');
      const auth = getFirebaseAuth();
      const { onAuthStateChanged } = await import('firebase/auth');

      onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          router.push('/login');
          return;
        }

        setUser(firebaseUser);

        const db = getFirebaseFirestore();
        const { doc, getDoc } = await import('firebase/firestore');

        // Get user document to check role
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (!userDoc.exists()) {
          router.push('/complete-profile');
          return;
        }

        const userData = userDoc.data();

        // Redirect candidates to their dashboard
        if (userData.role === 'candidate') {
          router.push('/candidate-dashboard');
          return;
        }

        // Check if agent is approved
        const profileDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
        if (!profileDoc.exists()) {
          router.push('/complete-profile');
          return;
        }

        const profileData = profileDoc.data();
        const userApproved = userData.isAgentApproved === true;
        const profileApproved = profileData.isAgentApproved === true ||
                                profileData.agentVerificationStatus === 'verified' ||
                                profileData.agentVerificationStatus === 'approved';
        const approved = userApproved || profileApproved;

        if (!approved) {
          router.push('/agent-dashboard');
          return;
        }

        // Load connections
        await loadConnections(db, firebaseUser.uid);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error loading connections:', error);
      setLoading(false);
    }
  };

  const loadConnections = async (db: any, agentId: string) => {
    try {
      const connectionsQuery = query(
        collection(db, 'connections'),
        where('agentId', '==', agentId),
        where('status', '==', 'connected')
      );

      const connectionsSnapshot = await getDocs(connectionsQuery);
      const connectionsList: Connection[] = [];

      // Fetch each connection with candidate profile data
      for (const connectionDoc of connectionsSnapshot.docs) {
        const connectionData = connectionDoc.data();
        const connection: Connection = {
          id: connectionDoc.id,
          ...connectionData
        } as Connection;

        // Fetch candidate profile data
        try {
          const candidateProfileRef = doc(db, 'profiles', connectionData.candidateId);
          const candidateProfileSnap = await getDoc(candidateProfileRef);

          if (candidateProfileSnap.exists()) {
            const profileData = candidateProfileSnap.data();
            connection.candidateLocation = profileData.location || profileData.city || '';
            connection.candidateBio = profileData.bio || '';
            connection.candidatePhone = profileData.phone || '';
          }
        } catch (profileError) {
          console.error('Error fetching candidate profile:', profileError);
        }

        connectionsList.push(connection);
      }

      // Sort by most recent first
      connectionsList.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      setConnections(connectionsList);
      setFilteredConnections(connectionsList);
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  const handleMessage = (connection: Connection) => {
    // Navigate to agent dashboard messages tab with conversation or candidate info
    if (connection.conversationId) {
      router.push({
        pathname: '/agent-dashboard',
        query: {
          tab: 'messages',
          conversationId: connection.conversationId,
          candidateId: connection.candidateId,
          candidateName: connection.candidateName
        }
      });
    } else {
      // If no conversation exists yet, pass candidate info to create new message
      router.push({
        pathname: '/agent-dashboard',
        query: {
          tab: 'messages',
          candidateId: connection.candidateId,
          candidateName: connection.candidateName,
          newMessage: 'true'
        }
      });
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
          <p className="text-gray-600">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Connected Candidates | Remote-Works</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              <Logo showText={false} onClick={() => router.push('/')} />
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push('/agent-dashboard')}
                  className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span className="hidden md:inline">Dashboard</span>
                </button>
                <div className="h-8 w-px bg-gray-300 mx-2 hidden md:block"></div>
                <button
                  onClick={() => router.push('/profile-settings')}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => router.push('/agent-dashboard')}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Connected Candidates</h1>
                <p className="text-lg text-amber-100">
                  Manage your client relationships and stay connected
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Stats and Search Bar */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{connections.length}</p>
                  <p className="text-sm text-gray-600">Total Connected Candidates</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Connections Grid */}
          {filteredConnections.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery ? 'No Results Found' : 'No Connected Candidates Yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Once you accept service requests, your connected candidates will appear here'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => router.push('/agent-dashboard')}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all"
                >
                  Go to Dashboard
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConnections.map((connection) => (
                <div
                  key={connection.id}
                  className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all"
                >
                  {/* Avatar and Name */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-md flex-shrink-0">
                      {connection.candidateName?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                        {connection.candidateName}
                      </h3>
                      {connection.candidateLocation && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="w-4 h-4 flex-shrink-0 text-amber-600" />
                          {connection.candidateLocation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {connection.candidateBio && (
                    <div className="mb-4">
                      <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <FileText className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
                        <p className="line-clamp-2">{connection.candidateBio}</p>
                      </div>
                    </div>
                  )}

                  {/* Connection Info */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span>Connected {formatDate(connection.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                        <UserCheck className="w-3 h-3" />
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMessage(connection)}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
