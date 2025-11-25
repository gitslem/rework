import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Globe2, Users, Search, MessageSquare, Settings, LogOut, ArrowRight,
  User, MapPin, Mail, Phone, Calendar, Star, Send, Filter, X, Menu,
  CheckCircle, Clock, DollarSign
} from 'lucide-react';
import Head from 'next/head';
import Logo from '@/components/Logo';

interface Agent {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  successRate: number;
  price: number;
  platforms: string[];
  location: string;
  responseTime: string;
}

interface ServiceRequest {
  id: string;
  agentName: string;
  platform: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  createdAt: string;
  price: number;
}

interface Message {
  id: string;
  from: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function CandidateDashboard() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, search, requests, messages
  const [isApproved, setIsApproved] = useState(true); // Set to true to show full dashboard
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Mock user data
  const userData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'Toronto, ON, Canada',
    joinedDate: 'January 2025',
    platformsInterested: ['Outlier AI', 'Alignerr', 'Mindrift AI']
  };

  // Mock agents data
  const mockAgents: Agent[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      rating: 4.9,
      reviews: 234,
      successRate: 98,
      price: 150,
      platforms: ['Outlier AI', 'Alignerr', 'Mindrift AI'],
      location: 'United States',
      responseTime: '< 2 hours'
    },
    {
      id: '2',
      name: 'Michael Chen',
      rating: 4.8,
      reviews: 189,
      successRate: 97,
      price: 120,
      platforms: ['OneForma', 'Appen', 'TELUS Digital'],
      location: 'Canada',
      responseTime: '< 4 hours'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      rating: 5.0,
      reviews: 156,
      successRate: 99,
      price: 180,
      platforms: ['Outlier AI', 'RWS', 'DataAnnotation'],
      location: 'United Kingdom',
      responseTime: '< 1 hour'
    }
  ];

  // Mock service requests
  const mockRequests: ServiceRequest[] = [
    {
      id: '1',
      agentName: 'Sarah Johnson',
      platform: 'Outlier AI',
      status: 'in_progress',
      createdAt: '2025-01-15',
      price: 150
    },
    {
      id: '2',
      agentName: 'Michael Chen',
      platform: 'OneForma',
      status: 'completed',
      createdAt: '2025-01-10',
      price: 120
    }
  ];

  // Mock messages
  const mockMessages: Message[] = [
    {
      id: '1',
      from: 'Sarah Johnson',
      message: 'Hi! I have reviewed your profile and I can definitely help you get approved for Outlier AI.',
      timestamp: '2 hours ago',
      read: false
    },
    {
      id: '2',
      from: 'Michael Chen',
      message: 'Your application has been submitted! I will keep you updated on the progress.',
      timestamp: '1 day ago',
      read: true
    }
  ];

  const platforms = ['all', 'Outlier AI', 'Alignerr', 'OneForma', 'Appen', 'RWS', 'Mindrift AI', 'TELUS Digital'];

  const filteredAgents = mockAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.platforms.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPlatform = selectedPlatform === 'all' || agent.platforms.includes(selectedPlatform);
    return matchesSearch && matchesPlatform;
  });

  const handleRequestService = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowMessageModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (!isApproved) {
    // Show pending approval state
    return (
      <>
        <Head>
          <title>Candidate Dashboard | Remote-Works</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          {/* Pending approval UI - same as before */}
          <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16 md:h-20">
                <Logo showText={false} onClick={() => router.push('/')} />
                <div className="flex items-center space-x-4">
                  <button onClick={() => router.push('/login')} className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="hidden md:inline">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold text-yellow-900 mb-2">⚠️ Account Pending Approval</h3>
              <p className="text-yellow-800">
                Your account is being reviewed by our admin team. You'll be able to browse and hire agents once your account is approved (usually within 24-48 hours).
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">Welcome to Remote-Works! 👋</h1>
              <p className="text-xl text-blue-100">We're reviewing your account. Soon you'll be able to browse verified agents.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Candidate Dashboard | Remote-Works</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              <Logo showText={false} onClick={() => router.push('/')} />

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-2 transition-colors ${activeTab === 'overview' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}>
                  <User className="w-5 h-5" />
                  Profile
                </button>
                <button onClick={() => setActiveTab('search')} className={`flex items-center gap-2 transition-colors ${activeTab === 'search' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}>
                  <Search className="w-5 h-5" />
                  Find Agents
                </button>
                <button onClick={() => setActiveTab('requests')} className={`flex items-center gap-2 transition-colors ${activeTab === 'requests' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}>
                  <Calendar className="w-5 h-5" />
                  My Requests
                  {mockRequests.filter(r => r.status === 'pending' || r.status === 'accepted').length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {mockRequests.filter(r => r.status === 'pending' || r.status === 'accepted').length}
                    </span>
                  )}
                </button>
                <button onClick={() => setActiveTab('messages')} className={`flex items-center gap-2 transition-colors ${activeTab === 'messages' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}>
                  <MessageSquare className="w-5 h-5" />
                  Messages
                  {mockMessages.filter(m => !m.read).length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {mockMessages.filter(m => !m.read).length}
                    </span>
                  )}
                </button>
                <button onClick={() => router.push('/profile-settings')} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
                <button onClick={() => router.push('/login')} className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 space-y-2 border-t border-gray-200">
                <button onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors">Profile</button>
                <button onClick={() => { setActiveTab('search'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors">Find Agents</button>
                <button onClick={() => { setActiveTab('requests'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors">My Requests</button>
                <button onClick={() => { setActiveTab('messages'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors">Messages</button>
                <button onClick={() => { router.push('/profile-settings'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors">Settings</button>
                <button onClick={() => router.push('/login')} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors">Logout</button>
              </div>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {userData.name}! 👋</h1>
                <p className="text-lg md:text-xl text-blue-100">Your account is approved. Start searching for agents to help you succeed.</p>
              </div>

              {/* Profile Information */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-600" />
                  Your Profile
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Full Name</p>
                      <p className="text-gray-900 font-semibold">{userData.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="text-gray-900 font-semibold">{userData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Phone</p>
                      <p className="text-gray-900 font-semibold">{userData.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Location</p>
                      <p className="text-gray-900 font-semibold">{userData.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Joined</p>
                      <p className="text-gray-900 font-semibold">{userData.joinedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Account Status</p>
                      <p className="text-green-600 font-semibold">Approved</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Interested Platforms</h3>
                  <div className="flex flex-wrap gap-2">
                    {userData.platformsInterested.map((platform, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-600 font-medium">Active Requests</h3>
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{mockRequests.filter(r => r.status !== 'completed').length}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-600 font-medium">Completed</h3>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{mockRequests.filter(r => r.status === 'completed').length}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-600 font-medium">Unread Messages</h3>
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{mockMessages.filter(m => !m.read).length}</p>
                </div>
              </div>
            </div>
          )}

          {/* Agent Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Search className="w-6 h-6 text-blue-600" />
                  Find Verified Agents
                </h2>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by agent name or platform..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="relative min-w-[200px]">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                    >
                      {platforms.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform === 'all' ? 'All Platforms' : platform}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Agents List */}
                <div className="space-y-4">
                  {filteredAgents.map((agent) => (
                    <div key={agent.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-blue-300">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{agent.name}</h3>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {agent.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {agent.responseTime}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-yellow-500 mb-1">
                                <Star className="w-5 h-5 fill-current" />
                                <span className="font-bold text-gray-900">{agent.rating}</span>
                                <span className="text-gray-500 text-sm">({agent.reviews})</span>
                              </div>
                              <p className="text-sm text-gray-600">{agent.successRate}% success rate</p>
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-2">Specializes in:</p>
                            <div className="flex flex-wrap gap-2">
                              {agent.platforms.map((platform, idx) => (
                                <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                  {platform}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between items-end min-w-[150px]">
                          <div className="text-right mb-4">
                            <p className="text-3xl font-bold text-gray-900">${agent.price}</p>
                            <p className="text-sm text-gray-600">per application</p>
                          </div>
                          <button
                            onClick={() => handleRequestService(agent)}
                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            Request Service
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Service Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  My Service Requests
                </h2>

                <div className="space-y-4">
                  {mockRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{request.agentName}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                              {request.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">Platform: <span className="font-semibold">{request.platform}</span></p>
                          <p className="text-sm text-gray-500">Created on {request.createdAt}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-2xl font-bold text-gray-900">${request.price}</p>
                          {request.status === 'in_progress' && (
                            <button
                              onClick={() => setActiveTab('messages')}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Message Agent
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                  Messages
                </h2>

                <div className="space-y-4">
                  {mockMessages.map((message) => (
                    <div key={message.id} className={`border rounded-xl p-6 ${!message.read ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{message.from}</h3>
                          <p className="text-sm text-gray-500">{message.timestamp}</p>
                        </div>
                        {!message.read && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">New</span>
                        )}
                      </div>
                      <p className="text-gray-700">{message.message}</p>
                      <button className="mt-4 text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Reply
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Request Service Modal */}
      {showMessageModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Request Service</h3>
              <button onClick={() => setShowMessageModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 mb-2">Send a request to <span className="font-semibold">{selectedAgent.name}</span></p>
              <p className="text-sm text-gray-600 mb-4">Price: <span className="font-bold">${selectedAgent.price}</span></p>
              <textarea
                placeholder="Tell the agent which platform you need help with and any specific requirements..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowMessageModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Service request sent!');
                  setShowMessageModal(false);
                  setActiveTab('requests');
                }}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
