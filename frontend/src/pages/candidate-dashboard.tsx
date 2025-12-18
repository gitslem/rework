import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Users, MessageSquare, Settings, LogOut,
  User, MapPin, Mail, Phone, Calendar, Star, Send, X,
  CheckCircle, Clock, Edit, Loader, FileText, Bookmark,
  BadgeCheck, Bot, Briefcase, TrendingUp, Award,
  Bell, Search, Home, Menu, ChevronDown, Globe,
  Heart, Shield, Zap, Target, Activity, BarChart3
} from 'lucide-react';
import Head from 'next/head';
import Logo from '@/components/Logo';
import { useAuthStore } from '@/lib/authStore';
import { getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, addDoc, Timestamp, updateDoc, limit, orderBy, onSnapshot } from 'firebase/firestore';
import { saveMessage, unsaveMessage, subscribeToNotifications, markNotificationAsRead } from '@/lib/firebase/firestore';

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
  const { logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'messages' | 'projects'>('overview');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Messages
  const [messages, setMessages] = useState<any[]>([]);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showMessageDetailModal, setShowMessageDetailModal] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [projectNotificationCount, setProjectNotificationCount] = useState(0);
  const [sendingReply, setSendingReply] = useState(false);
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Projects count
  const [projectsCount, setProjectsCount] = useState(0);

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  // Auto-load conversation messages when message is selected
  useEffect(() => {
    if (selectedMessage && showMessageDetailModal && user) {
      // Generate conversationId if it doesn't exist
      const senderId = selectedMessage.senderId;
      const recipientId = selectedMessage.recipientId || user.uid;
      const ids = [senderId, recipientId].sort();
      const conversationId = selectedMessage.conversationId || `conv_${ids[0]}_${ids[1]}`;

      console.log('[Candidate Dashboard] Auto-loading conversation messages for:', conversationId);
      // Clear previous conversation messages first
      setConversationMessages([]);
      // Then load new conversation with fallback to sender/recipient query
      loadConversationMessages(conversationId, senderId, recipientId);
    } else if (!showMessageDetailModal) {
      // Clear conversation messages when modal closes
      setConversationMessages([]);
    }
  }, [selectedMessage?.id, showMessageDetailModal, user]);

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
        const userApproved = userData.isCandidateApproved === true;
        const profileVerified = profileData.isVerified === true || profileData.verificationStatus === 'approved';
        const approved = userApproved || profileVerified;
        setIsApproved(approved);

        // Load agents if approved - FIXED: Pass userId explicitly
        // CRITICAL FIX: Set loading to false BEFORE any returns
        // Must be done for both approved and non-approved users
        setLoading(false);

        if (approved) {
          await loadAgents(db, firebaseUser.uid);
          await loadMessages(db, firebaseUser.uid);
          await loadProjectsCount(db, firebaseUser.uid);

          // Subscribe to real-time notifications
          console.log('🔔 Subscribing to notifications for user:', firebaseUser.uid);
          const unsubscribe = subscribeToNotifications(firebaseUser.uid, (notifs) => {
            console.log('🔔 Notification callback triggered! Total notifications:', notifs.length);
            console.log('📋 Notifications:', notifs);
            setNotifications(notifs);
            const unreadNotifs = notifs.filter(n => !n.isRead);
            console.log('🔔 Unread notifications:', unreadNotifs.length, unreadNotifs);
            setNotificationCount(unreadNotifs.length);

            // Count project-related notifications
            const projectNotifs = unreadNotifs.filter(n =>
              n.type === 'action_needed' ||
              n.type === 'action_status_changed' ||
              n.projectId
            );
            console.log('📊 Project notifications:', projectNotifs.length, projectNotifs);
            setProjectNotificationCount(projectNotifs.length);
          });

          // Cleanup subscription on unmount
          return () => unsubscribe();
        }
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const loadProjectsCount = async (db: any, candidateId: string) => {
    try {
      const projectsQuery = query(
        collection(db, 'candidate_projects'),
        where('candidate_id', '==', candidateId)
      );

      const projectsSnapshot = await getDocs(projectsQuery);
      // Filter out deleted projects
      const activeProjectsCount = projectsSnapshot.docs.filter(
        doc => doc.data().isDeleted !== true
      ).length;
      setProjectsCount(activeProjectsCount);
    } catch (error) {
      console.error('Error loading projects count:', error);
      setProjectsCount(0);
    }
  };

  const loadMessages = async (db: any, candidateId: string) => {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('recipientId', '==', candidateId),
        limit(200) // Increased limit to get more messages for grouping
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const allMessages: any[] = [];

      // Load all messages without any date filtering - unified persistent chat
      messagesSnapshot.forEach((doc) => {
        const data = doc.data();
        allMessages.push({
          id: doc.id,
          ...data
        });
      });

      // Sort all messages by time (newest first)
      allMessages.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      // Group messages by conversationId and keep only the latest message per conversation
      const conversationMap = new Map<string, any>();
      let unread = 0;

      allMessages.forEach((message) => {
        const convId = message.conversationId || message.id;

        // Count unread messages
        if (message.status === 'unread') unread++;

        // Only keep the latest message per conversation
        if (!conversationMap.has(convId)) {
          conversationMap.set(convId, message);
        }
      });

      // Convert map to array for display
      const groupedMessages = Array.from(conversationMap.values());

      setMessages(groupedMessages);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadConversationMessages = async (conversationId: string, senderId: string, recipientId: string) => {
    try {
      console.log(`[Candidate Dashboard] Loading conversation between ${senderId} and ${recipientId}`);
      const db = getFirebaseFirestore();

      // ALWAYS query by sender/recipient pairs (more reliable than conversationId)
      // Query messages where either:
      // (senderId == userA AND recipientId == userB) OR (senderId == userB AND recipientId == userA)
      const query1 = query(
        collection(db, 'messages'),
        where('senderId', '==', senderId),
        where('recipientId', '==', recipientId),
        orderBy('createdAt', 'asc')
      );

      const query2 = query(
        collection(db, 'messages'),
        where('senderId', '==', recipientId),
        where('recipientId', '==', senderId),
        orderBy('createdAt', 'asc')
      );

      console.log('[Candidate Dashboard] Running dual queries for conversation messages...');
      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(query1),
        getDocs(query2)
      ]);

      // Combine and sort by createdAt
      const allMessages: any[] = [];
      snapshot1.forEach(doc => allMessages.push({ id: doc.id, ...doc.data() }));
      snapshot2.forEach(doc => allMessages.push({ id: doc.id, ...doc.data() }));

      allMessages.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return aTime - bTime;
      });

      console.log(`[Candidate Dashboard] Found ${allMessages.length} messages in conversation`);

      // Update messages with conversationId if missing (for future reference)
      const messagesToUpdate = allMessages.filter(msg => !msg.conversationId);
      if (messagesToUpdate.length > 0) {
        console.log(`[Candidate Dashboard] Updating ${messagesToUpdate.length} messages with conversationId`);
        const updatePromises = messagesToUpdate.map(msg =>
          updateDoc(doc(db, 'messages', msg.id), {
            conversationId: conversationId,
            updatedAt: Timestamp.now()
          }).catch(err => console.error(`Failed to update message ${msg.id}:`, err))
        );
        await Promise.all(updatePromises);
      }

      setConversationMessages(allMessages);
      setSelectedConversationId(conversationId);
    } catch (error: any) {
      console.error('[Candidate Dashboard] Error loading conversation messages:', error);
      alert(`Failed to load conversation: ${error.message}\n\nPlease check the browser console for details.`);
      setConversationMessages([]);
    }
  };

  // FIXED: Accept userId as parameter instead of relying on state
  const loadAgents = async (db: any, userId: string) => {
    try {
      setLoadingAgents(true);
      console.log('Loading agents for user:', userId);

      // Get the current user's assigned agents
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        console.error('User document not found');
        setAgents([]);
        setLoadingAgents(false);
        return;
      }

      const userData = userDoc.data();
      const assignedAgentIds = userData?.assignedAgents || [];

      console.log('Assigned agent IDs:', assignedAgentIds);

      if (assignedAgentIds.length === 0) {
        console.log('No agents assigned to this candidate');
        setAgents([]);
        setLoadingAgents(false);
        return;
      }

      const agentsList: Agent[] = [];

      // Fetch each assigned agent
      for (const agentId of assignedAgentIds) {
        try {
          const agentUserDoc = await getDoc(doc(db, 'users', agentId));
          if (!agentUserDoc.exists()) {
            console.log('Agent user not found:', agentId);
            continue;
          }

          const profileDoc = await getDoc(doc(db, 'profiles', agentId));
          if (!profileDoc.exists()) {
            console.log('Agent profile not found:', agentId);
            continue;
          }

          const profileData = profileDoc.data();

          // Only show approved agents
          if (profileData.isAgentApproved === true || profileData.agentVerificationStatus === 'approved') {
            const agent: Agent = {
              id: agentId,
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
            agentsList.push(agent);
            console.log('Added agent:', agent.name);
          } else {
            console.log('Agent not approved:', agentId);
          }
        } catch (err) {
          console.error('Error loading agent:', agentId, err);
        }
      }

      console.log('Total agents loaded:', agentsList.length);
      setAgents(agentsList);
      setLoadingAgents(false);
    } catch (error) {
      console.error('Error loading agents:', error);
      setAgents([]);
      setLoadingAgents(false);
    }
  };

  const handleSendReply = async () => {
    const trimmedReply = replyText.trim();
    if (!trimmedReply || !selectedMessage || !user) {
      alert('Please enter a message');
      return;
    }

    if (trimmedReply.length > 5000) {
      alert('Reply is too long. Please keep it under 5000 characters.');
      return;
    }

    if (trimmedReply.length < 10) {
      alert('Reply is too short. Please enter at least 10 characters.');
      return;
    }

    try {
      setSendingReply(true);
      const db = getFirebaseFirestore();

      // Generate consistent conversationId based on sorted user IDs
      const ids = [user.uid, selectedMessage.senderId].sort();
      const conversationId = selectedMessage.conversationId || `conv_${ids[0]}_${ids[1]}`;

      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        senderName: `${profile?.firstName} ${profile?.lastName}`,
        recipientId: selectedMessage.senderId,
        recipientName: selectedMessage.senderName,
        message: trimmedReply,
        subject: selectedMessage.subject.replace(/^(Re:\s*)+/g, ''),
        status: 'unread',
        createdAt: Timestamp.now(),
        type: 'general',
        conversationId: conversationId,
        isReply: true
      });

      if (selectedMessage.status === 'unread') {
        await updateDoc(doc(db, 'messages', selectedMessage.id), {
          status: 'read',
          updatedAt: Timestamp.now()
        });
      }

      // Reload conversation messages to show the new reply
      await loadConversationMessages(conversationId);

      setReplyText('');
      // Don't close the modal or clear selected message - keep the conversation open

      await loadMessages(db, user.uid);
    } catch (error: any) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please try again later.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleRequestService = (agent: Agent) => {
    setSelectedAgent(agent);
    setMessageText('');
    setShowMessageModal(true);
  };

  const handleSendMessage = async () => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || !selectedAgent || !user) {
      alert('Please enter a message');
      return;
    }

    if (trimmedMessage.length > 5000) {
      alert('Message is too long. Please keep it under 5000 characters.');
      return;
    }

    if (trimmedMessage.length < 10) {
      alert('Message is too short. Please enter at least 10 characters.');
      return;
    }

    try {
      setSendingMessage(true);
      const db = getFirebaseFirestore();

      const ids = [user.uid, selectedAgent.id].sort();
      const conversationId = `conv_${ids[0]}_${ids[1]}`;

      const messageData = {
        senderId: user.uid,
        senderName: `${profile?.firstName} ${profile?.lastName}`,
        senderEmail: user.email || profile?.email || '',
        recipientId: selectedAgent.id,
        recipientName: selectedAgent.name,
        message: trimmedMessage,
        subject: 'Service Request',
        status: 'unread',
        createdAt: Timestamp.now(),
        type: 'service_request',
        conversationId: conversationId
      };

      await addDoc(collection(db, 'messages'), messageData);

      // Create notification for agent
      await addDoc(collection(db, 'notifications'), {
        userId: selectedAgent.id,
        type: 'new_message',
        title: 'New Service Request',
        message: `${profile?.firstName} ${profile?.lastName} sent you a service request: ${trimmedMessage.substring(0, 100)}${trimmedMessage.length > 100 ? '...' : ''}`,
        link: '/agent-dashboard?tab=messages',
        conversationId: conversationId,
        isRead: false,
        createdAt: Timestamp.now()
      });

      alert('Message sent successfully! The agent will contact you soon.');
      setShowMessageModal(false);
      setMessageText('');
      setSelectedAgent(null);
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again later.');
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

      if (user) {
        const db = getFirebaseFirestore();
        await loadMessages(db, user.uid);

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
    try {
      if (!timestamp) return 'Recently';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recently';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  if (!isApproved) {
    return (
      <>
        <Head>
          <title>Candidate Dashboard | Remote-Works</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16 md:h-20">
                <Logo showText={false} onClick={() => router.push('/')} />
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => router.push('/candidate-projects')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                  >
                    <FileText className="w-5 h-5" />
                    <span className="hidden md:inline">Projects</span>
                  </button>
                  <button
                    onClick={() => router.push('/profile-settings')}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6 md:p-8 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">⏳ Account Pending Approval</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Your account is being reviewed by our admin team. You'll be able to browse and connect with agents once your account is approved (usually within 24-48 hours).
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-7 h-7 text-blue-600" />
                Your Profile
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="text-gray-900 font-semibold text-lg">{profile.firstName || ''} {profile.lastName || ''}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-gray-900 font-semibold text-lg">{profile.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="text-gray-900 font-semibold text-lg">{profile.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="text-gray-900 font-semibold text-lg">{profile.location || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Joined</p>
                    <p className="text-gray-900 font-semibold text-lg">{formatDate(profile.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-yellow-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Account Status</p>
                    <p className="text-yellow-600 font-semibold text-lg">Pending Approval</p>
                  </div>
                </div>
              </div>

              {profile.bio && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Bio</h3>
                  <p className="text-gray-700 leading-relaxed">{profile.bio || ''}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  const stats = [
    { label: 'Active Agents', value: agents.length.toString(), icon: <Users className="w-6 h-6" />, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Messages', value: messages.length.toString(), icon: <MessageSquare className="w-6 h-6" />, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50' },
    { label: 'Unread', value: unreadCount.toString(), icon: <Bell className="w-6 h-6" />, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50' },
    { label: 'Projects', value: projectsCount.toString(), icon: <FileText className="w-6 h-6" />, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50' },
  ];

  return (
    <>
      <Head>
        <title>Dashboard | Remote-Works</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        {/* Top Navigation */}
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Menu className="w-6 h-6 text-gray-600" />
                </button>
                <Logo showText={false} onClick={() => router.push('/')} size="sm" />
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{profile.firstName || ''} {profile.lastName || ''}</p>
                    <p className="text-xs text-gray-500">Candidate</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {(profile.firstName?.[0] || '?').toUpperCase()}{(profile.lastName?.[0] || '?').toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex">
          {/* Sidebar */}
          <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out pt-16 lg:pt-0`}>
            <div className="h-full flex flex-col">
              <div className="flex-1 px-3 py-6 space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('overview');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'overview'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('agents');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'agents'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">My Agents</span>
                  {agents.length > 0 && (
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === 'agents' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {agents.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveTab('messages');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'messages'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">Messages</span>
                  {unreadCount > 0 && (
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === 'messages' ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
                    }`}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    router.push('/candidate-projects');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Projects</span>
                  {projectNotificationCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500 text-white">
                      {projectNotificationCount}
                    </span>
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="font-medium">Notifications</span>
                    {notificationCount > 0 && (
                      <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
                        {notificationCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Panel */}
                  {showNotificationPanel && (
                    <div className="fixed left-1/2 -translate-x-1/2 lg:left-64 lg:translate-x-0 top-20 w-[calc(100vw-1rem)] sm:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
                      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <button
                          onClick={() => setShowNotificationPanel(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <Bell className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">No notifications</p>
                            <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                onClick={async () => {
                                  // Mark as read
                                  if (!notification.isRead) {
                                    await markNotificationAsRead(notification.id);
                                  }

                                  // Navigate based on notification type
                                  if (notification.projectId) {
                                    router.push(`/candidate-projects?project=${notification.projectId}`);
                                  } else if (notification.link) {
                                    router.push(notification.link);
                                  }

                                  setShowNotificationPanel(false);
                                }}
                                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                                  !notification.isRead ? 'bg-blue-50/50' : ''
                                }`}
                              >
                                <div className="flex gap-3">
                                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                                    !notification.isRead ? 'bg-blue-500' : 'bg-gray-300'
                                  }`}></div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium text-gray-900 ${
                                      !notification.isRead ? 'font-semibold' : ''
                                    }`}>
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {notification.createdAt?.toDate?.() ?
                                        new Date(notification.createdAt.toDate()).toLocaleString() :
                                        'Just now'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                          <button
                            onClick={async () => {
                              // Mark all as read
                              for (const notif of notifications.filter(n => !n.isRead)) {
                                await markNotificationAsRead(notif.id);
                              }
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Mark all as read
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    router.push('/profile-settings');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </button>
              </div>

              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {profile.firstName || 'User'}! 👋</h1>
                      <p className="text-lg text-blue-100">Your account is active. Let's achieve your goals together!</p>
                    </div>
                    <div className="hidden lg:block">
                      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Target className="w-12 h-12" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                          <div className={`text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                            {stat.icon}
                          </div>
                        </div>
                        <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    Quick Actions
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <button
                      onClick={() => {
                        setActiveTab('agents');
                        setSidebarOpen(false);
                      }}
                      className="flex items-center gap-3 p-4 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                    >
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">View Agents</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('messages');
                        setSidebarOpen(false);
                      }}
                      className="flex items-center gap-3 p-4 rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all"
                    >
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900">Check Messages</span>
                    </button>
                    <button
                      onClick={() => {
                        setSidebarOpen(false);
                        router.push('/profile-settings');
                      }}
                      className="flex items-center gap-3 p-4 rounded-lg border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all"
                    >
                      <Edit className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900">Edit Profile</span>
                    </button>
                  </div>
                </div>

                {/* Profile Overview */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <User className="w-6 h-6 text-blue-600" />
                      Your Profile
                    </h2>
                    <button
                      onClick={() => router.push('/profile-settings')}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                      Edit
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Full Name</p>
                        <p className="text-gray-900 font-semibold">{profile.firstName || ''} {profile.lastName || ''}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Mail className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Email</p>
                        <p className="text-gray-900 font-semibold">{profile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Location</p>
                        <p className="text-gray-900 font-semibold">{profile.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Joined</p>
                        <p className="text-gray-900 font-semibold">{formatDate(profile.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Status</p>
                        <p className="text-green-600 font-semibold">Active</p>
                      </div>
                    </div>
                  </div>

                  {profile.bio && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">About Me</h3>
                      <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Agents Tab */}
            {activeTab === 'agents' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Agents</h1>
                    <p className="text-gray-600 mt-1">Agents assigned to help you succeed</p>
                  </div>
                  {loadingAgents && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Loader className="w-5 h-5 animate-spin" />
                      <span className="font-medium">Loading...</span>
                    </div>
                  )}
                </div>

                {/* AI Powered Banner */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                        AI-Powered Matching
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                          Smart
                        </span>
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Our advanced AI has intelligently matched you with verified agents based on your profile, goals, and platform preferences. These agents have proven track records and will work with you personally.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Agents List */}
                {loadingAgents ? (
                  <div className="bg-white rounded-xl p-12 text-center shadow-md">
                    <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your agents...</p>
                  </div>
                ) : agents.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center shadow-md">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Agents Assigned Yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Our admin team is reviewing your profile and will assign the best agents for your needs shortly.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <a
                        href="mailto:support@remote-works.io"
                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        Contact Support
                      </a>
                      <a
                        href="https://t.me/remote_worksio"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        Telegram
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {agents.map((agent) => (
                      <div key={agent.id} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all">
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Agent Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                  {agent.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-2xl font-bold text-gray-900">{agent.name}</h3>
                                    <BadgeCheck className="w-6 h-6 text-blue-500" />
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
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
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1">
                                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                  <span className="text-xl font-bold text-gray-900">{agent.rating.toFixed(1)}</span>
                                  {agent.reviews > 0 && (
                                    <span className="text-gray-500 text-sm">({agent.reviews})</span>
                                  )}
                                </div>
                                <span className="text-sm font-semibold text-green-600">{agent.successRate}% success</span>
                              </div>
                            </div>

                            {agent.bio && (
                              <p className="text-gray-600 mb-4 leading-relaxed">{agent.bio}</p>
                            )}

                            {/* Availability Schedule */}
                            {agent.agentWorkingHours && (
                              <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100">
                                <div className="flex items-center gap-2 mb-2">
                                  <Briefcase className="w-5 h-5 text-blue-600" />
                                  <span className="font-semibold text-gray-900">Availability</span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-700">
                                  <div>
                                    <span className="font-medium">Hours:</span> {agent.agentWorkingHours.start} - {agent.agentWorkingHours.end}
                                    {agent.agentWorkingHours.timezone && (
                                      <span className="text-gray-500 ml-1">({agent.agentWorkingHours.timezone})</span>
                                    )}
                                  </div>
                                  {agent.agentWorkingHours.days && agent.agentWorkingHours.days.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {agent.agentWorkingHours.days.map((day, idx) => (
                                        <span key={idx} className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                                          {day.substring(0, 3)}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Platforms */}
                            {agent.platforms.length > 0 && (
                              <div>
                                <p className="text-sm font-semibold text-gray-700 mb-2">Specializations</p>
                                <div className="flex flex-wrap gap-2">
                                  {agent.platforms.map((platform, idx) => (
                                    <span key={idx} className="bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-purple-200">
                                      {platform}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Side */}
                          <div className="lg:w-48 flex flex-col items-stretch gap-3">
                            {!agent.isFree && (
                              <div className="text-center px-4 py-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                                <p className="text-3xl font-bold text-gray-900">${agent.price}</p>
                                <p className="text-xs text-gray-600 font-medium mt-1">Per placement</p>
                              </div>
                            )}
                            <button
                              onClick={() => handleRequestService(agent)}
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                              <Send className="w-5 h-5" />
                              Contact
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Support Section */}
                {agents.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200 text-center">
                    <p className="text-gray-700 leading-relaxed">
                      <strong className="text-gray-900">Need more agents?</strong> Contact our support team at{' '}
                      <a href="mailto:support@remote-works.io" className="text-blue-600 font-semibold hover:underline">
                        support@remote-works.io
                      </a>{' '}
                      or via{' '}
                      <a href="https://t.me/remote_worksio" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">
                        Telegram
                      </a>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Messages Tab - WhatsApp Style */}
            {activeTab === 'messages' && (
              <div className="h-[calc(100vh-12rem)]">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 h-full flex flex-col lg:flex-row">
                  {/* Conversations List - Left Side */}
                  <div className={`w-full lg:w-96 border-r border-gray-200 flex flex-col ${selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 shadow-md">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-6 h-6" />
                        Chats
                      </h2>
                      {unreadCount > 0 && (
                        <p className="text-emerald-50 text-sm mt-1">{unreadCount} unread message{unreadCount > 1 ? 's' : ''}</p>
                      )}
                    </div>

                    {/* Search Bar */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search conversations..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMessageFilter('all')}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            messageFilter === 'all'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setMessageFilter('unread')}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            messageFilter === 'unread'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Unread {unreadCount > 0 && `(${unreadCount})`}
                        </button>
                      </div>
                    </div>

                    {/* Conversations */}
                    <div className="flex-1 overflow-y-auto">
                      {messages.filter(m => {
                        if (messageFilter === 'unread') return m.status === 'unread';
                        return true;
                      }).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-10 h-10 text-emerald-500" />
                          </div>
                          <p className="text-gray-600 font-medium mb-2">No messages yet</p>
                          <p className="text-sm text-gray-500">Start a conversation with an agent</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {messages.filter(m => {
                            if (messageFilter === 'unread') return m.status === 'unread';
                            return true;
                          }).map((message) => (
                            <div
                              key={message.id}
                              onClick={() => {
                                setSelectedMessage(message);
                                setShowMessageDetailModal(true);
                                // useEffect will handle loading conversation messages
                              }}
                              className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                                selectedMessage?.conversationId === message.conversationId ? 'bg-emerald-50' : ''
                              } ${message.status === 'unread' ? 'bg-blue-50/30' : ''}`}
                            >
                              <div className="flex gap-3">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                    {message.senderName?.charAt(0).toUpperCase() || 'A'}
                                  </div>
                                  {message.status === 'unread' && (
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white absolute mt-[-0.75rem] ml-9"></div>
                                  )}
                                </div>

                                {/* Message Preview */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-semibold text-gray-900 truncate ${message.status === 'unread' ? 'font-bold' : ''}`}>
                                      {message.senderName}
                                    </h3>
                                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                      {message.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}
                                    </span>
                                  </div>
                                  <p className={`text-sm truncate ${message.status === 'unread' ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                    {message.subject || message.message}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {message.status === 'accepted' && (
                                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Accepted</span>
                                    )}
                                    {message.saved && (
                                      <Bookmark className="w-3 h-3 text-yellow-500 fill-current" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chat Window - Right Side */}
                  <div className={`flex-1 flex flex-col ${!selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
                    {!selectedMessage ? (
                      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d9d9d9' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                        }}
                      >
                        <div className="text-center max-w-md px-6">
                          <div className="w-32 h-32 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                            <MessageSquare className="w-16 h-16 text-emerald-500" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-3">Welcome to Your Messages</h3>
                          <p className="text-gray-600">Select a conversation to start chatting with your agents</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Chat Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 shadow-md flex items-center gap-4">
                          <button
                            onClick={() => setSelectedMessage(null)}
                            className="lg:hidden text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                          >
                            <X className="w-6 h-6" />
                          </button>
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 font-bold text-lg shadow-md">
                            {selectedMessage.senderName?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">{selectedMessage.senderName}</h3>
                            <p className="text-emerald-50 text-xs">Agent</p>
                          </div>
                          <button
                            onClick={() => handleToggleSaveMessage(selectedMessage)}
                            className={`p-2 rounded-lg transition-colors ${selectedMessage.saved ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20 text-white hover:bg-white/30'}`}
                          >
                            <Bookmark className={`w-5 h-5 ${selectedMessage.saved ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        {/* Messages */}
                        <div
                          className="flex-1 overflow-y-auto px-6 py-6 space-y-4"
                          style={{
                            backgroundColor: '#efeae2',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d9d9d9' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                          }}
                        >
                          {/* Date Separator for first message */}
                          {conversationMessages.length > 0 && (
                            <div className="flex justify-center mb-4">
                              <div className="bg-white px-4 py-1 rounded-lg shadow-sm">
                                <p className="text-xs font-medium text-gray-600">
                                  {conversationMessages[0]?.createdAt?.toDate?.()?.toLocaleDateString() || 'Today'}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Display all messages in the conversation */}
                          {conversationMessages.length > 0 ? (
                            conversationMessages.map((msg, index) => {
                              const isOwnMessage = user && msg.senderId === user.uid;
                              const showDateSeparator = index > 0 &&
                                msg.createdAt?.toDate?.()?.toLocaleDateString() !==
                                conversationMessages[index - 1]?.createdAt?.toDate?.()?.toLocaleDateString();

                              return (
                                <div key={msg.id}>
                                  {/* Date separator for new days */}
                                  {showDateSeparator && (
                                    <div className="flex justify-center my-4">
                                      <div className="bg-white px-4 py-1 rounded-lg shadow-sm">
                                        <p className="text-xs font-medium text-gray-600">
                                          {msg.createdAt?.toDate?.()?.toLocaleDateString() || 'Today'}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Message bubble */}
                                  <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md rounded-2xl shadow-md px-4 py-3 ${
                                      isOwnMessage
                                        ? 'bg-emerald-500 text-white rounded-br-sm'
                                        : 'bg-white text-gray-800 rounded-tl-sm'
                                    }`}>
                                      {msg.subject && index === 0 && (
                                        <p className={`text-sm font-semibold mb-2 ${
                                          isOwnMessage ? 'text-emerald-100' : 'text-emerald-600'
                                        }`}>
                                          {msg.subject}
                                        </p>
                                      )}
                                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                      <div className="flex items-center justify-end gap-1 mt-2">
                                        <p className={`text-xs ${isOwnMessage ? 'text-emerald-100' : 'text-gray-500'}`}>
                                          {msg.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="flex justify-center items-center h-full">
                              <div className="bg-white rounded-2xl p-8 shadow-lg">
                                <Loader className="w-10 h-10 animate-spin text-emerald-500 mx-auto mb-4" />
                                <p className="text-gray-600 text-center">Loading conversation...</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Reply Input */}
                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                          <div className="flex items-end gap-2">
                            <div className="flex-1 bg-white rounded-full shadow-sm border border-gray-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 transition-all">
                              <div className="flex items-center px-4 py-2">
                                <input
                                  type="text"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSendReply();
                                    }
                                  }}
                                  placeholder="Type a message..."
                                  className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                                  disabled={sendingReply}
                                />
                              </div>
                            </div>
                            <button
                              onClick={handleSendReply}
                              disabled={sendingReply || !replyText.trim()}
                              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                                sendingReply || !replyText.trim()
                                  ? 'bg-gray-300 cursor-not-allowed'
                                  : 'bg-emerald-500 hover:bg-emerald-600 hover:scale-105 active:scale-95'
                              }`}
                            >
                              {sendingReply ? (
                                <Loader className="w-5 h-5 animate-spin text-white" />
                              ) : (
                                <Send className="w-5 h-5 text-white" />
                              )}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type your reply here..."
              />
            </div>

            <button
              onClick={handleSendReply}
              disabled={sendingReply || !replyText.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
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
      )}

      {/* Request Service Modal */}
      {showMessageModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Contact Agent</h3>
              <button onClick={() => setShowMessageModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 mb-2">Send a request to <span className="font-semibold">{selectedAgent.name}</span></p>
              {!selectedAgent.isFree && (
                <p className="text-sm text-gray-600 mb-4">Price: <span className="font-bold text-green-600">${selectedAgent.price}</span></p>
              )}
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Tell the agent which platform you need help with and any specific requirements..."
                className="w-full h-32 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
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
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
