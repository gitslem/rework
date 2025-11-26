import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, Star, TrendingUp, Users, MessageSquare, Filter } from 'lucide-react';
import Head from 'next/head';
import Logo from '@/components/Logo';
import { getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function Agents() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<any[]>([]);

  // Check authentication
  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        // Not logged in, redirect to login
        router.push('/login?redirect=/agents');
      } else {
        setUser(firebaseUser);
        loadAgents();
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadAgents = async () => {
    try {
      const db = getFirebaseFirestore();

      // Get verified agent profiles
      const profilesQuery = query(
        collection(db, 'profiles'),
        where('isAgentApproved', '==', true),
        where('agentVerificationStatus', '==', 'verified')
      );

      const profilesSnapshot = await getDocs(profilesQuery);
      const agentsList = profilesSnapshot.docs.map(doc => {
        const data = doc.data();

        // Calculate price range with proper type casting
        let priceRange = 'N/A';
        if (data.agentPricing && typeof data.agentPricing === 'object') {
          const prices = Object.values(data.agentPricing).filter((p): p is number => typeof p === 'number');
          if (prices.length > 0) {
            priceRange = `$${Math.min(...prices)} - $${Math.max(...prices)}`;
          }
        }

        return {
          id: doc.id,
          name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Anonymous Agent',
          avatar: `${data.firstName?.[0] || 'A'}${data.lastName?.[0] || 'A'}`,
          rating: data.agentRating || 0,
          totalClients: data.agentTotalClients || 0,
          successRate: data.agentSuccessRate || 0,
          platforms: data.agentServices || [],
          priceRange,
          bio: data.agentBio || 'Experienced agent ready to help you succeed.',
          avatarURL: data.avatarURL
        };
      });

      setAgents(agentsList);
      console.log('Loaded agents:', agentsList.length);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Get unique platforms from all agents
  const allPlatforms = agents.reduce((acc: string[], agent) => {
    agent.platforms.forEach((platform: string) => {
      if (!acc.includes(platform)) {
        acc.push(platform);
      }
    });
    return acc;
  }, []);
  const platforms = ['All Platforms', ...allPlatforms];

  // Filter agents based on search and platform
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          agent.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = selectedPlatform === 'all' ||
                            agent.platforms.includes(selectedPlatform);
    return matchesSearch && matchesPlatform;
  });

  return (
    <>
      <Head>
        <title>Browse Agents | Remote-Works</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Logo showText={true} onClick={() => router.push('/')} size="md" />
              <div className="flex items-center space-x-4">
                <button onClick={() => router.push('/candidate-dashboard')} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                  Dashboard
                </button>
                <button onClick={() => router.push('/login')} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl font-bold text-white mb-4">Browse Verified Agents</h1>
            <p className="text-xl text-blue-100">Find the perfect expert to help you get approved</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search agents by name or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors appearance-none"
                >
                  {platforms.map((platform) => (
                    <option key={platform} value={platform.toLowerCase()}>{platform}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {filteredAgents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No agents found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAgents.map((agent) => (
              <div key={agent.id} className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all border border-gray-200 overflow-hidden group cursor-pointer">
                <div className="p-8">
                  {/* Agent Header */}
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mr-4">
                      {agent.avatar}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{agent.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-gray-900">{agent.rating}</span>
                        <span className="text-gray-600 text-sm">({agent.totalClients} clients)</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-700 font-semibold">Success Rate</span>
                      </div>
                      <div className="text-2xl font-bold text-green-900">{agent.successRate}%</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-blue-700 font-semibold">Clients</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-900">{agent.totalClients}</div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-600 mb-4 line-clamp-2">{agent.bio}</p>

                  {/* Platforms */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">SPECIALIZES IN:</p>
                    <div className="flex flex-wrap gap-2">
                      {agent.platforms.map((platform, idx) => (
                        <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-500 mb-1">PRICE RANGE:</p>
                    <p className="text-lg font-bold text-gray-900">{agent.priceRange}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                      View Profile
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                      <MessageSquare className="w-5 h-5" />
                    </button>
                  </div>
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
