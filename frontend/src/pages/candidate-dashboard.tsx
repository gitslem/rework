import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Globe2, Users, Search, MessageSquare, Settings, LogOut, ArrowRight,
  User, MapPin, Mail, Phone, Calendar, Star, Send, Filter, X, Menu,
  CheckCircle, Clock, DollarSign, Edit, Loader
} from 'lucide-react';
import Head from 'next/head';
import Logo from '@/components/Logo';
import { getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, addDoc, Timestamp, updateDoc, orderBy, limit } from 'firebase/firestore';

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

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  location: string;
  bio: string;
  socialLinks: {
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
  };
  verificationStatus: string;
  isVerified: boolean;
  createdAt: any;
}

export default function CandidateDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'search' | 'messages'>('overview');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Messages
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [showMessageDetailModal, setShowMessageDetailModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  const checkAuthAndLoadProfile = async () => {
    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseFirestore();

      onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          router.push('/login');
          return;
        }

        setUser(firebaseUser);

        // Get user document to check role
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (!userDoc.exists()) {
          router.push('/complete-profile');
          return;
        }

        const userData = userDoc.data();

        // Redirect agents to their dashboard
        if (userData.role === 'agent') {
          router.push('/agent-dashboard');
          return;
        }

        // Get profile document
        const profileDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
        if (!profileDoc.exists()) {
          router.push('/complete-profile');
          return;
        }

        const profileData = profileDoc.data() as UserProfile;
        profileData.email = firebaseUser.email || '';
        setProfile(profileData);

        // Check if user is verified/approved
        // Check both the profile and user document for approval status
        const userApproved = userData.isCandidateApproved === true;
        const profileVerified = profileData.isVerified === true || profileData.verificationStatus === 'approved';
        const approved = userApproved || profileVerified;
        setIsApproved(approved);

        // Load agents if approved
        if (approved) {
          await loadAgents(db);
          await loadMessages(db, firebaseUser.uid);
        }

        setLoading(false);
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    }
  };

  const loadMessages = async (db: any, candidateId: string) => {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('recipientId', '==', candidateId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const messagesList: any[] = [];
      let unread = 0;

      messagesSnapshot.forEach((doc) => {
        const data = doc.data();
        messagesList.push({
          id: doc.id,
          ...data
        });
        if (data.status === 'unread') unread++;
      });

      setMessages(messagesList);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage || !user) {
      alert('Please enter a message');
      return;
    }

    try {
      setSendingReply(true);
      const db = getFirebaseFirestore();

      // Send reply
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        senderName: `${profile?.firstName} ${profile?.lastName}`,
        senderEmail: user.email,
        recipientId: selectedMessage.senderId,
        recipientName: selectedMessage.senderName,
        message: replyText,
        subject: `Re: ${selectedMessage.subject}`,
        status: 'unread',
        createdAt: Timestamp.now(),
        type: 'general',
        conversationId: selectedMessage.conversationId || selectedMessage.id
      });

      // Mark original as read if unread
      if (selectedMessage.status === 'unread') {
        await updateDoc(doc(db, 'messages', selectedMessage.id), {
          status: 'read',
          updatedAt: Timestamp.now()
        });
      }

      alert('Reply sent successfully!');
      setReplyText('');
      setShowMessageDetailModal(false);
      setSelectedMessage(null);

      // Refresh messages
      await loadMessages(db, user.uid);
    } catch (error: any) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply: ' + error.message);
    } finally {
      setSendingReply(false);
    }
  };

  const loadAgents = async (db: any) => {
    try {
      // Get all users with role 'agent' and approved status
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'agent')
      );
      const usersSnapshot = await getDocs(usersQuery);

      const agentsList: Agent[] = [];

      for (const userDoc of usersSnapshot.docs) {
        // Get the agent's profile
        const profileDoc = await getDoc(doc(db, 'profiles', userDoc.id));

        if (profileDoc.exists()) {
          const profileData = profileDoc.data();

          // Only show approved agents
          if (profileData.isAgentApproved === true || profileData.agentVerificationStatus === 'approved') {
            agentsList.push({
              id: userDoc.id,
              name: `${profileData.firstName} ${profileData.lastName}`,
              rating: profileData.averageRating || 4.5,
              reviews: profileData.totalReviews || 0,
              successRate: profileData.agentSuccessRate || 95,
              price: profileData.agentPricing?.basePrice || 100,
              platforms: profileData.agentServices || [],
              location: profileData.location || 'Unknown',
              responseTime: '< 24 hours'
            });
          }
        }
      }

      setAgents(agentsList);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const platforms = ['all', 'Outlier AI', 'Alignerr', 'OneForma', 'Appen', 'RWS', 'Mindrift AI', 'TELUS Digital'];

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.platforms.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPlatform = selectedPlatform === 'all' || agent.platforms.includes(selectedPlatform);
    return matchesSearch && matchesPlatform;
  });

  const handleRequestService = (agent: Agent) => {
    setSelectedAgent(agent);
    setMessageText('');
    setShowMessageModal(true);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedAgent || !user) {
      alert('Please enter a message');
      return;
    }

    try {
      setSendingMessage(true);
      const db = getFirebaseFirestore();

      // Create a message document
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        senderName: `${profile?.firstName} ${profile?.lastName}`,
        senderEmail: user.email,
        recipientId: selectedAgent.id,
        recipientName: selectedAgent.name,
        message: messageText,
        subject: 'Service Request',
        status: 'unread',
        createdAt: Timestamp.now(),
        type: 'service_request'
      });

      alert('Message sent successfully! The agent will contact you soon.');
      setShowMessageModal(false);
      setMessageText('');
      setSelectedAgent(null);
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  if (!isApproved) {
    // Show pending approval state
    return (
      <>
        <Head>
          <title>Candidate Dashboard | Remote-Works</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
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

            {/* Show user's profile while waiting */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                Your Profile
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="text-gray-900 font-semibold">{profile.firstName} {profile.lastName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-gray-900 font-semibold">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="text-gray-900 font-semibold">{profile.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="text-gray-900 font-semibold">{profile.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Joined</p>
                    <p className="text-gray-900 font-semibold">{formatDate(profile.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-yellow-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Account Status</p>
                    <p className="text-yellow-600 font-semibold">Pending Approval</p>
                  </div>
                </div>
              </div>

              {profile.bio && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Bio</h3>
                  <p className="text-gray-700">{profile.bio}</p>
                </div>
              )}
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
                <button onClick={() => setActiveTab('messages')} className={`flex items-center gap-2 transition-colors relative ${activeTab === 'messages' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}>
                  <MessageSquare className="w-5 h-5" />
                  Messages
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
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
                <button onClick={() => { setActiveTab('messages'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors">
                  Messages {unreadCount > 0 && `(${unreadCount})`}
                </button>
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
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {profile.firstName}! 👋</h1>
                <p className="text-lg md:text-xl text-blue-100">Your account is approved. Start searching for agents to help you succeed.</p>
              </div>

              {/* Profile Information */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <User className="w-6 h-6 text-blue-600" />
                    Your Profile
                  </h2>
                  <button
                    onClick={() => router.push('/profile-settings')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    <Edit className="w-5 h-5" />
                    Edit Profile
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Full Name</p>
                      <p className="text-gray-900 font-semibold">{profile.firstName} {profile.lastName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="text-gray-900 font-semibold">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Phone</p>
                      <p className="text-gray-900 font-semibold">{profile.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Location</p>
                      <p className="text-gray-900 font-semibold">{profile.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Joined</p>
                      <p className="text-gray-900 font-semibold">{formatDate(profile.createdAt)}</p>
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

                {profile.bio && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Bio</h3>
                    <p className="text-gray-700">{profile.bio}</p>
                  </div>
                )}

                {/* Social Links */}
                {(profile.socialLinks?.linkedin || profile.socialLinks?.twitter || profile.socialLinks?.facebook || profile.socialLinks?.instagram) && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Social Links</h3>
                    <div className="flex flex-wrap gap-3">
                      {profile.socialLinks?.linkedin && (
                        <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                          LinkedIn
                        </a>
                      )}
                      {profile.socialLinks?.twitter && (
                        <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500">
                          Twitter
                        </a>
                      )}
                      {profile.socialLinks?.facebook && (
                        <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-800">
                          Facebook
                        </a>
                      )}
                      {profile.socialLinks?.instagram && (
                        <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">
                          Instagram
                        </a>
                      )}
                    </div>
                  </div>
                )}
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
                  {filteredAgents.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No agents found. Check back later!</p>
                    </div>
                  ) : (
                    filteredAgents.map((agent) => (
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
                                  <span className="font-bold text-gray-900">{agent.rating.toFixed(1)}</span>
                                  {agent.reviews > 0 && (
                                    <span className="text-gray-500 text-sm">({agent.reviews})</span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{agent.successRate}% success rate</p>
                              </div>
                            </div>

                            {agent.platforms.length > 0 && (
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
                            )}
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
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                  Messages
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </h2>

                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No messages yet</p>
                    <p className="text-gray-400 text-sm mt-2">Responses from agents will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => {
                          setSelectedMessage(message);
                          setShowMessageDetailModal(true);
                        }}
                        className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          message.status === 'unread'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{message.senderName}</h3>
                              {message.status === 'unread' && (
                                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">New</span>
                              )}
                              {message.status === 'accepted' && (
                                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">Accepted</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{message.senderEmail}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {message.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900 mb-2">{message.subject}</p>
                        <p className="text-gray-700 line-clamp-2">{message.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Detail Modal */}
      {showMessageDetailModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Message from {selectedMessage.senderName}</h3>
              <button onClick={() => { setShowMessageDetailModal(false); setSelectedMessage(null); setReplyText(''); }} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{selectedMessage.senderName}</p>
                  <p className="text-sm text-gray-600">{selectedMessage.senderEmail}</p>
                </div>
                <p className="text-sm text-gray-500">
                  {selectedMessage.createdAt?.toDate?.()?.toLocaleString() || 'Recently'}
                </p>
              </div>
              <p className="font-medium text-gray-900 mb-2">{selectedMessage.subject}</p>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Reply</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your reply here..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSendReply}
                disabled={sendingReply || !replyText.trim()}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sendingReply ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Tell the agent which platform you need help with and any specific requirements..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                disabled={sendingMessage}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowMessageModal(false)}
                disabled={sendingMessage}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !messageText.trim()}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingMessage ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
