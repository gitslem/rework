import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Globe2, Users, Search, MessageSquare, Settings, LogOut, ArrowRight,
  User, MapPin, Mail, Phone, Calendar, Star, Send, Filter, X, Menu,
  CheckCircle, Clock, DollarSign, Edit, Loader, BookOpen, FileText, Bookmark, BadgeCheck, Bot, Briefcase, Monitor
} from 'lucide-react';
import Head from 'next/head';
import Logo from '@/components/Logo';
import { getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, addDoc, Timestamp, updateDoc, orderBy, limit } from 'firebase/firestore';
import { saveMessage, unsaveMessage } from '@/lib/firebase/firestore';

interface Agent {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  successRate: number;
  price: number;
  isFree: boolean;
  platforms: string[];
  location: string;
  responseTime: string;
  bio?: string;
  workingHours?: string;
  agentWorkingHours?: {
    start: string;
    end: string;
    timezone: string;
    days: string[];
  };
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
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'read'>('all');

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
      console.log('Loading messages for candidate:', candidateId);

      // Query messages - removed orderBy to avoid composite index requirement
      const messagesQuery = query(
        collection(db, 'messages'),
        where('recipientId', '==', candidateId),
        limit(50)
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const messagesList: any[] = [];
      let unread = 0;

      console.log('Messages found:', messagesSnapshot.size);

      // Calculate cutoff date (3 days ago for recent messages)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 3);

      messagesSnapshot.forEach((doc) => {
        const data = doc.data();
        const messageDate = data.createdAt?.toDate?.() || new Date(0);

        // Only include messages that are either:
        // 1. Saved, OR
        // 2. Created within the last 3 days (recent messages only)
        if (data.saved === true || messageDate >= cutoffDate) {
          messagesList.push({
            id: doc.id,
            ...data
          });
          if (data.status === 'unread') unread++;
        }
      });

      // Sort messages by createdAt in JavaScript instead of Firestore
      messagesList.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime; // Descending order (newest first)
      });

      setMessages(messagesList);
      setUnreadCount(unread);
      console.log('Messages loaded successfully:', messagesList.length, 'unread:', unread);
    } catch (error) {
      console.error('Error loading messages:', error);
      alert('Error loading messages. Please refresh the page.');
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

      // Get or create conversation ID
      const conversationId = selectedMessage.conversationId || selectedMessage.id;

      // Send reply - use original subject without adding "Re:"
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        senderName: `${profile?.firstName} ${profile?.lastName}`,
        recipientId: selectedMessage.senderId,
        recipientName: selectedMessage.senderName,
        message: replyText,
        subject: selectedMessage.subject.replace(/^(Re:\s*)+/g, ''), // Remove any existing "Re:" prefixes
        status: 'unread',
        createdAt: Timestamp.now(),
        type: 'general',
        conversationId: conversationId,
        isReply: true
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
      console.log('Loading agents...');

      // Get all users with role 'agent' and approved status
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'agent')
      );
      const usersSnapshot = await getDocs(usersQuery);

      console.log('Found', usersSnapshot.size, 'agent users');

      const agentsList: Agent[] = [];

      for (const userDoc of usersSnapshot.docs) {
        // Get the agent's profile
        const profileDoc = await getDoc(doc(db, 'profiles', userDoc.id));

        if (profileDoc.exists()) {
          const profileData = profileDoc.data();

          // Only show approved agents
          if (profileData.isAgentApproved === true || profileData.agentVerificationStatus === 'approved') {
            const agent = {
              id: userDoc.id,
              name: `${profileData.firstName} ${profileData.lastName}`,
              rating: profileData.averageRating || 4.5,
              reviews: profileData.totalReviews || 0,
              successRate: profileData.agentSuccessRate || 95,
              price: profileData.agentPricing?.basePrice || 100,
              isFree: profileData.isFree !== undefined ? profileData.isFree : true,
              platforms: profileData.agentServices || [],
              location: profileData.location || 'Unknown',
              responseTime: profileData.agentResponseTime || '< 24 hours',
              bio: profileData.bio || '',
              workingHours: profileData.workingHours || 'Flexible',
              agentWorkingHours: profileData.agentWorkingHours
            };
            console.log('Added approved agent:', agent.name, 'ID:', agent.id);
            agentsList.push(agent);
          } else {
            console.log('Skipping unapproved agent:', profileData.firstName, profileData.lastName);
          }
        }
      }

      console.log('Total approved agents loaded:', agentsList.length);
      setAgents(agentsList);
    } catch (error) {
      console.error('Error loading agents:', error);
      alert('Error loading agents. Please refresh the page.');
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

      // Create consistent conversation ID for the same sender-recipient pair
      // Sort IDs to ensure same conversation ID regardless of who initiated
      const ids = [user.uid, selectedAgent.id].sort();
      const conversationId = `conv_${ids[0]}_${ids[1]}`;

      const messageData = {
        senderId: user.uid,
        senderName: `${profile?.firstName} ${profile?.lastName}`,
        senderEmail: user.email || profile?.email || '',
        recipientId: selectedAgent.id,
        recipientName: selectedAgent.name,
        message: messageText,
        subject: 'Service Request',
        status: 'unread',
        createdAt: Timestamp.now(),
        type: 'service_request',
        conversationId: conversationId
      };

      console.log('Sending message to agent:', messageData);

      // Create a message document
      const docRef = await addDoc(collection(db, 'messages'), messageData);

      console.log('Message sent successfully with ID:', docRef.id);

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

  const handleToggleSaveMessage = async (message: any) => {
    try {
      if (message.saved) {
        await unsaveMessage(message.id);
        alert('Message unsaved');
      } else {
        await saveMessage(message.id);
        alert('Message saved');
      }

      // Refresh messages
      if (user) {
        const db = getFirebaseFirestore();
        await loadMessages(db, user.uid);

        // Update selected message if it's the one being toggled
        if (selectedMessage?.id === message.id) {
          setSelectedMessage({ ...message, saved: !message.saved });
        }
      }
    } catch (error: any) {
      console.error('Error toggling save message:', error);
      alert('Failed to save/unsave message: ' + error.message);
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
                  <button onClick={() => router.push('/candidate-projects')} className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                    <FileText className="w-5 h-5" />
                    <span className="hidden md:inline">Projects</span>
                  </button>
                  <button onClick={() => router.push('/profile-settings')} className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                    <Settings className="w-5 h-5" />
                    <span className="hidden md:inline">Settings</span>
                  </button>
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
                <User className="w-6 h-6 text-black" />
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
        <nav className="bg-white border-b-2 border-gradient shadow-lg sticky top-0 z-50" style={{borderImage: 'linear-gradient(to right, #2563eb, #9333ea) 1'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              <Logo showText={false} onClick={() => router.push('/')} size="sm" />

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-black text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Profile"
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${activeTab === 'search' ? 'bg-black text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Assigned Agents"
                >
                  <Search className="w-5 h-5" />
                  <span>Assigned Agents</span>
                </button>
                <button
                  onClick={() => router.push('/candidate-projects')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                  title="Projects"
                >
                  <FileText className="w-5 h-5" />
                  <span>Projects</span>
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all relative ${activeTab === 'messages' ? 'bg-black text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Messages</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => router.push('/candidate-info')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                  title="Info"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Info</span>
                </button>
                <button
                  onClick={() => router.push('/candidate-screen')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                  title="Screen Sharing"
                >
                  <Monitor className="w-5 h-5" />
                  <span>Screen</span>
                </button>
                <div className="h-8 w-px bg-gray-300 mx-2"></div>
                <button
                  onClick={() => router.push('/profile-settings')}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                  title="Logout"
                >
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
                <button onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </button>
                <button onClick={() => { setActiveTab('search'); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  <Search className="w-5 h-5" />
                  <span>Assigned Agents</span>
                </button>
                <button onClick={() => { router.push('/candidate-projects'); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  <FileText className="w-5 h-5" />
                  <span>Projects</span>
                </button>
                <button onClick={() => { setActiveTab('messages'); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  <span>Messages {unreadCount > 0 && `(${unreadCount})`}</span>
                </button>
                <button onClick={() => { router.push('/candidate-info'); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  <BookOpen className="w-5 h-5" />
                  <span>Info</span>
                </button>
                <button onClick={() => { router.push('/candidate-screen'); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  <Monitor className="w-5 h-5" />
                  <span>Screen Sharing</span>
                </button>
                <div className="border-t border-gray-200 my-2"></div>
                <button onClick={() => { router.push('/profile-settings'); setMobileMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
                <button onClick={() => router.push('/login')} className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
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

          {/* Assigned Agents Tab */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              {/* Info Banner */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex flex-col lg:flex-row items-start gap-6">
                  {/* AI Flow Illustration */}
                  <div className="flex-shrink-0">
                    <svg width="240" height="120" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="hidden lg:block">
                      {/* Candidate Circle */}
                      <circle cx="30" cy="60" r="20" fill="#3B82F6" opacity="0.2"/>
                      <circle cx="30" cy="60" r="15" fill="#3B82F6"/>
                      <path d="M30 55 L30 60 L35 65" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="30" cy="52" r="4" stroke="white" strokeWidth="2" fill="none"/>
                      <text x="30" y="95" textAnchor="middle" fontSize="11" fill="#1F2937" fontWeight="600">You</text>

                      {/* AI Brain Center */}
                      <circle cx="120" cy="60" r="25" fill="url(#gradient1)"/>
                      <path d="M115 55 Q120 50 125 55 M115 65 Q120 70 125 65 M110 60 L115 60 M125 60 L130 60" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="117" cy="58" r="2" fill="white"/>
                      <circle cx="123" cy="58" r="2" fill="white"/>
                      <text x="120" y="95" textAnchor="middle" fontSize="11" fill="#1F2937" fontWeight="600">AI Match</text>

                      {/* Agent Circle */}
                      <circle cx="210" cy="60" r="20" fill="#10B981" opacity="0.2"/>
                      <circle cx="210" cy="60" r="15" fill="#10B981"/>
                      <path d="M210 55 L210 60 L205 65" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="210" cy="52" r="4" stroke="white" strokeWidth="2" fill="none"/>
                      <path d="M206 67 L214 67" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <text x="210" y="95" textAnchor="middle" fontSize="11" fill="#1F2937" fontWeight="600">Agent</text>

                      {/* Connecting Lines with Animation Effect */}
                      <path d="M50 60 L95 60" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 4" opacity="0.6">
                        <animate attributeName="stroke-dashoffset" from="8" to="0" dur="1s" repeatCount="indefinite"/>
                      </path>
                      <path d="M145 60 L190 60" stroke="#10B981" strokeWidth="2" strokeDasharray="4 4" opacity="0.6">
                        <animate attributeName="stroke-dashoffset" from="8" to="0" dur="1s" repeatCount="indefinite"/>
                      </path>

                      {/* Gradient Definition */}
                      <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8B5CF6"/>
                          <stop offset="100%" stopColor="#3B82F6"/>
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Mobile Version - Simpler Icon */}
                    <div className="lg:hidden w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      Your Assigned Agents
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                        AI Powered
                      </span>
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Our advanced AI has intelligently matched you with verified agents based on your profile, goals, and platform preferences.
                      These carefully selected agents have proven track records and will work with you personally to maximize your approval chances.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <BadgeCheck className="w-6 h-6 text-black" />
                  Agents Assigned to You
                </h2>

                {/* Agents List */}
                <div className="space-y-4">
                  {filteredAgents.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No Agents Assigned Yet</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Our admin team is reviewing your profile and will assign the best agents for your needs shortly.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                          href="mailto:support@remote-works.io"
                          className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all"
                        >
                          <Mail className="w-4 h-4" />
                          Contact Support
                        </a>
                        <a
                          href="https://t.me/remote_worksio"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-all"
                        >
                          <Send className="w-4 h-4" />
                          Telegram
                        </a>
                      </div>
                    </div>
                  ) : (
                    filteredAgents.map((agent) => (
                      <div key={agent.id} className="border-2 border-gray-200 bg-white rounded-xl p-6 hover:shadow-2xl transition-all hover:border-gray-400">
                        <div className="flex flex-col lg:flex-row justify-between gap-6">
                          <div className="flex-1">
                            {/* Header Section */}
                            <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                  <h3 className="text-2xl font-bold text-gray-900">{agent.name}</h3>
                                  <span className="bg-black text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Verified
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                  <span className="flex items-center gap-2 text-gray-700">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium">{agent.location}</span>
                                  </span>
                                  <span className="flex items-center gap-2 text-gray-700">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium">{agent.responseTime}</span>
                                  </span>
                                </div>
                                {/* Detailed Availability Schedule */}
                                {agent.agentWorkingHours && (
                                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Briefcase className="w-4 h-4 text-gray-600" />
                                      <span className="text-sm font-semibold text-gray-800">Availability Schedule</span>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-700">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">Time:</span>
                                        <span>{agent.agentWorkingHours.start} - {agent.agentWorkingHours.end}</span>
                                        {agent.agentWorkingHours.timezone && (
                                          <span className="text-xs text-gray-500">({agent.agentWorkingHours.timezone})</span>
                                        )}
                                      </div>
                                      {agent.agentWorkingHours.days && agent.agentWorkingHours.days.length > 0 && (
                                        <div className="flex items-start gap-2">
                                          <span className="font-medium">Days:</span>
                                          <div className="flex flex-wrap gap-1">
                                            {agent.agentWorkingHours.days.map((day, idx) => (
                                              <span key={idx} className="bg-black text-white px-2 py-0.5 rounded text-xs font-medium">
                                                {day.substring(0, 3)}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <div className="flex items-center gap-1 text-yellow-500 mb-1">
                                  <Star className="w-5 h-5 fill-current" />
                                  <span className="font-bold text-gray-900 text-lg">{agent.rating.toFixed(1)}</span>
                                  {agent.reviews > 0 && (
                                    <span className="text-gray-500 text-sm">({agent.reviews})</span>
                                  )}
                                </div>
                                <p className="text-sm font-semibold text-gray-700">{agent.successRate}% success</p>
                              </div>
                            </div>

                            {/* Bio Section */}
                            {agent.bio && (
                              <div className="mb-4 pb-4 border-b border-gray-200">
                                <p className="text-sm text-gray-600 mb-2 font-semibold uppercase tracking-wide">About</p>
                                <p className="text-sm text-gray-700 leading-relaxed">{agent.bio}</p>
                              </div>
                            )}

                            {/* Platforms Section */}
                            {agent.platforms.length > 0 && (
                              <div>
                                <p className="text-sm text-gray-600 mb-2 font-semibold uppercase tracking-wide">Specializations</p>
                                <div className="flex flex-wrap gap-2">
                                  {agent.platforms.map((platform, idx) => (
                                    <span key={idx} className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-200 transition-colors">
                                      {platform}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right Side - Pricing & Action */}
                          <div className="flex flex-col justify-between items-center lg:items-end min-w-[200px] space-y-4">
                            {!agent.isFree && (
                              <div className="text-center px-5 py-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-300 shadow-sm">
                                <p className="text-3xl font-bold text-gray-900">${agent.price}</p>
                                <p className="text-xs text-gray-600 font-medium mt-1">Per placement</p>
                              </div>
                            )}
                            <button
                              onClick={() => handleRequestService(agent)}
                              className="w-full bg-black text-white px-6 py-3.5 rounded-lg font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                            >
                              <Send className="w-4 h-4" />
                              Contact Agent
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Support Contact Section */}
                {filteredAgents.length > 0 && (
                  <div className="mt-8 bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      <strong className="text-gray-900">Need more agents?</strong> Contact our support team at{' '}
                      <a
                        href="mailto:support@remote-works.io"
                        className="text-black font-semibold hover:underline"
                      >
                        support@remote-works.io
                      </a>{' '}
                      or via{' '}
                      <a
                        href="https://t.me/remote_worksio"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black font-semibold hover:underline"
                      >
                        Telegram
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-black" />
                  Messages
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </h2>

                {/* Message Filters */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setMessageFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      messageFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All ({messages.length})
                  </button>
                  <button
                    onClick={() => setMessageFilter('unread')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      messageFilter === 'unread'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                  <button
                    onClick={() => setMessageFilter('read')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      messageFilter === 'read'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Read ({messages.length - unreadCount})
                  </button>
                </div>

                {messages.filter(m => {
                  if (messageFilter === 'unread') return m.status === 'unread';
                  if (messageFilter === 'read') return m.status !== 'unread';
                  return true;
                }).length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No messages yet</p>
                    <p className="text-gray-400 text-sm mt-2">Responses from agents will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.filter(m => {
                      if (messageFilter === 'unread') return m.status === 'unread';
                      if (messageFilter === 'read') return m.status !== 'unread';
                      return true;
                    }).map((message) => (
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
                              {message.saved && (
                                <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Bookmark className="w-3 h-3" />
                                  Saved
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSaveMessage(message);
                              }}
                              className={`p-1 rounded transition-colors ${message.saved ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'}`}
                              title={message.saved ? 'Unsave message' : 'Save message'}
                            >
                              <Bookmark className={`w-4 h-4 ${message.saved ? 'fill-current' : ''}`} />
                            </button>
                            <span className="text-xs text-gray-500">
                              {message.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                            </span>
                          </div>
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
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-gray-900">Message from {selectedMessage.senderName}</h3>
                {selectedMessage.saved && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Bookmark className="w-3 h-3" />
                    Saved
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleSaveMessage(selectedMessage)}
                  className={`p-2 rounded-lg transition-colors ${selectedMessage.saved ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  title={selectedMessage.saved ? 'Unsave message' : 'Save message'}
                >
                  <Bookmark className={`w-5 h-5 ${selectedMessage.saved ? 'fill-current' : ''}`} />
                </button>
                <button onClick={() => { setShowMessageDetailModal(false); setSelectedMessage(null); setReplyText(''); }} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <p className="font-semibold text-gray-900">{selectedMessage.senderName}</p>
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
