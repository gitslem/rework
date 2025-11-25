import { useState } from 'react';
import { useRouter } from 'next/router';
import { Globe2, Search, Star, TrendingUp, Users, MessageSquare, Filter } from 'lucide-react';
import Head from 'next/head';

export default function Agents() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  // Mock data - in production, this would come from API
  const agents = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "SJ",
      rating: 4.9,
      totalClients: 127,
      successRate: 98,
      platforms: ['Outlier AI', 'Alignerr', 'OneForma'],
      priceRange: '$75 - $150',
      bio: "Specialized in getting candidates approved for AI training platforms. 5+ years experience."
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "MC",
      rating: 5.0,
      totalClients: 89,
      successRate: 100,
      platforms: ['Appen', 'RWS', 'TELUS Digital'],
      priceRange: '$100 - $200',
      bio: "Expert in data annotation and localization platforms. Perfect track record."
    },
    {
      id: 3,
      name: "Maria Rodriguez",
      avatar: "MR",
      rating: 4.8,
      totalClients: 156,
      successRate: 96,
      platforms: ['Outlier AI', 'Mindrift AI', 'Appen'],
      priceRange: '$50 - $120',
      bio: "Helping candidates succeed since 2020. Multilingual support available."
    }
  ];

  const platforms = ['All Platforms', 'Outlier AI', 'Alignerr', 'OneForma', 'Appen', 'RWS', 'Mindrift AI', 'TELUS Digital'];

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
              <div className="flex items-center cursor-pointer group" onClick={() => router.push('/')}>
                <Globe2 className="w-9 h-9 text-blue-600" />
                <div className="ml-3 text-2xl font-bold text-gray-900">
                  Remote-<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Works</span>
                </div>
              </div>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map((agent) => (
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

          {/* Empty State */}
          {agents.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No agents found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
