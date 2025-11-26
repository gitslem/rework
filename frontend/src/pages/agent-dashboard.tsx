import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Users, DollarSign, Star, TrendingUp, Settings, MessageSquare, LogOut,
  User, MapPin, Mail, Phone, Calendar, CheckCircle, Clock, X, Edit, Upload as UploadIcon, Plus, Trash2,
  Bell, Send, Loader, FileText, CreditCard, Percent, DollarSign as Dollar, CalendarClock
} from 'lucide-react';
import Head from 'next/head';
import Logo from '@/components/Logo';
import { getFirebaseAuth, getFirebaseFirestore, getFirebaseStorage } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, Timestamp, collection, query, where, getDocs, orderBy, addDoc, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface AgentProfile {
  uid: string;
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
  agentVerificationStatus: string;
  isAgentApproved: boolean;
  agentServices: string[];
  agentPricing: {
    [key: string]: number | undefined;
    basePrice?: number;
    percentageCharge?: number;
    oneTimeApprovalFee?: number;
  };
  agentPortfolio: string[];
  agentTotalClients: number;
  agentSuccessRate: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  agentTerms?: string;
  agentWorkingHours?: {
    start: string;
    end: string;
    timezone: string;
    days: string[];
  };
  agentServiceType?: 'full' | 'partial' | 'approval_only';
  createdAt: any;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  recipientId: string;
  recipientName: string;
  message: string;
  subject: string;
  status: 'unread' | 'read' | 'accepted' | 'rejected';
  createdAt: any;
  type: 'service_request' | 'general' | 'payment_confirmation';
  conversationId?: string;
}

export default function AgentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'messages'>('overview');

  // Profile modals
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showRatesModal, setShowRatesModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showEnhancedSettingsModal, setShowEnhancedSettingsModal] = useState(false);

  // Profile data
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [pricing, setPricing] = useState<{[key: string]: number | undefined}>({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Messaging
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Enhanced settings
  const [agentTerms, setAgentTerms] = useState('');
  const [serviceType, setServiceType] = useState<'full' | 'partial' | 'approval_only'>('full');
  const [percentageCharge, setPercentageCharge] = useState<number>(0);
  const [oneTimeApprovalFee, setOneTimeApprovalFee] = useState<number>(0);
  const [workingHoursStart, setWorkingHoursStart] = useState('09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('17:00');
  const [workingDays, setWorkingDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);

  const availablePlatforms = [
    'Outlier AI',
    'Alignerr',
    'Mindrift AI',
    'OneForma',
    'Appen',
    'TELUS Digital',
    'RWS',
    'DataAnnotation',
    'Lionbridge',
    'Clickworker'
  ];

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

        // Redirect candidates to their dashboard
        if (userData.role === 'candidate') {
          router.push('/candidate-dashboard');
          return;
        }

        // Get profile document
        const profileDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
        if (!profileDoc.exists()) {
          router.push('/complete-profile');
          return;
        }

        const profileData = profileDoc.data() as AgentProfile;
        profileData.email = firebaseUser.email || '';
        profileData.uid = firebaseUser.uid;
        setProfile(profileData);

        // Check if agent is approved
        // Check both the profile and user document for approval status
        const userApproved = userData.isAgentApproved === true;
        const profileApproved = profileData.isAgentApproved === true || profileData.agentVerificationStatus === 'verified' || profileData.agentVerificationStatus === 'approved';
        const approved = userApproved || profileApproved;
        setIsApproved(approved);

        // Load current services and pricing
        if (profileData.agentServices) {
          setSelectedServices(profileData.agentServices);
        }
        if (profileData.agentPricing) {
          setPricing(profileData.agentPricing);
        }

        // Load enhanced settings if exists
        if (profileData.agentTerms) setAgentTerms(profileData.agentTerms);
        if (profileData.agentServiceType) setServiceType(profileData.agentServiceType);
        if (profileData.agentPricing?.percentageCharge) setPercentageCharge(profileData.agentPricing.percentageCharge);
        if (profileData.agentPricing?.oneTimeApprovalFee) setOneTimeApprovalFee(profileData.agentPricing.oneTimeApprovalFee);
        if (profileData.agentWorkingHours) {
          setWorkingHoursStart(profileData.agentWorkingHours.start || '09:00');
          setWorkingHoursEnd(profileData.agentWorkingHours.end || '17:00');
          setWorkingDays(profileData.agentWorkingHours.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
        }

        // Load messages regardless of approval status (so agents can see why they can't get messages)
        console.log('Agent approval status:', approved);
        await loadMessages(db, firebaseUser.uid);

        setLoading(false);
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    }
  };

  const loadMessages = async (db: any, agentId: string) => {
    try {
      console.log('Loading messages for agent:', agentId);

      // Query messages - removed orderBy to avoid composite index requirement
      const messagesQuery = query(
        collection(db, 'messages'),
        where('recipientId', '==', agentId),
        limit(50)
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const messagesList: Message[] = [];
      let unread = 0;

      console.log('Messages found:', messagesSnapshot.size);

      messagesSnapshot.forEach((doc) => {
        const data = doc.data();
        messagesList.push({
          id: doc.id,
          ...data
        } as Message);
        if (data.status === 'unread') unread++;
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

  const handleAcceptRequest = async (message: Message) => {
    if (!user) return;

    try {
      setSaving(true);
      const db = getFirebaseFirestore();

      // Update message status to accepted
      await updateDoc(doc(db, 'messages', message.id), {
        status: 'accepted',
        updatedAt: Timestamp.now()
      });

      // Create a conversation/thread ID for ongoing communication
      const conversationId = `conv_${message.senderId}_${user.uid}_${Date.now()}`;

      // Send acceptance message to candidate
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        senderName: `${profile?.firstName} ${profile?.lastName}`,
        senderEmail: user.email,
        recipientId: message.senderId,
        recipientName: message.senderName,
        message: `I've accepted your service request. Let's discuss the details. ${profile?.agentTerms ? '\n\nTerms: ' + profile.agentTerms : ''}`,
        subject: 'Service Request Accepted',
        status: 'unread',
        createdAt: Timestamp.now(),
        type: 'general',
        conversationId
      });

      // Refresh messages
      await loadMessages(db, user.uid);

      alert('Request accepted! You can now message the candidate.');
      setShowMessageModal(false);
      setSelectedMessage(null);
    } catch (error: any) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request: ' + error.message);
    } finally {
      setSaving(false);
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
      setShowMessageModal(false);
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

  const handleRejectRequest = async (message: Message) => {
    if (!user) return;

    if (!confirm('Are you sure you want to reject this service request?')) {
      return;
    }

    try {
      setSaving(true);
      const db = getFirebaseFirestore();

      // Update message status to rejected
      await updateDoc(doc(db, 'messages', message.id), {
        status: 'rejected',
        updatedAt: Timestamp.now()
      });

      // Send rejection message to candidate
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        senderName: `${profile?.firstName} ${profile?.lastName}`,
        senderEmail: user.email,
        recipientId: message.senderId,
        recipientName: message.senderName,
        message: 'Thank you for your interest. Unfortunately, I am unable to accept your service request at this time.',
        subject: 'Service Request Declined',
        status: 'unread',
        createdAt: Timestamp.now(),
        type: 'general'
      });

      // Refresh messages
      await loadMessages(db, user.uid);

      alert('Request declined. A notification has been sent to the candidate.');
      setShowMessageModal(false);
      setSelectedMessage(null);
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEnhancedSettings = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      const db = getFirebaseFirestore();

      await updateDoc(doc(db, 'profiles', profile.uid), {
        agentTerms,
        agentServiceType: serviceType,
        agentPricing: {
          ...pricing,
          percentageCharge,
          oneTimeApprovalFee
        },
        agentWorkingHours: {
          start: workingHoursStart,
          end: workingHoursEnd,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          days: workingDays
        },
        updatedAt: Timestamp.now()
      });

      alert('Enhanced settings saved successfully!');
      setShowEnhancedSettingsModal(false);

      // Refresh profile
      const updatedProfile = await getDoc(doc(db, 'profiles', profile.uid));
      if (updatedProfile.exists()) {
        const updatedData = updatedProfile.data() as AgentProfile;
        updatedData.email = user.email || '';
        updatedData.uid = user.uid;
        setProfile(updatedData);
      }
    } catch (error: any) {
      console.error('Error saving enhanced settings:', error);
      alert('Failed to save settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveServices = async () => {
    if (!profile || selectedServices.length === 0) {
      alert('Please select at least one service');
      return;
    }

    try {
      setSaving(true);
      const db = getFirebaseFirestore();

      await updateDoc(doc(db, 'profiles', profile.uid), {
        agentServices: selectedServices,
        updatedAt: Timestamp.now()
      });

      setProfile({ ...profile, agentServices: selectedServices });
      setShowServicesModal(false);
      alert('Services updated successfully!');
    } catch (error: any) {
      console.error('Error saving services:', error);
      alert('Failed to save services: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRates = async () => {
    if (!profile || Object.keys(pricing).length === 0) {
      alert('Please set at least one rate');
      return;
    }

    try {
      setSaving(true);
      const db = getFirebaseFirestore();

      await updateDoc(doc(db, 'profiles', profile.uid), {
        agentPricing: pricing,
        updatedAt: Timestamp.now()
      });

      setProfile({ ...profile, agentPricing: pricing });
      setShowRatesModal(false);
      alert('Rates updated successfully!');
    } catch (error: any) {
      console.error('Error saving rates:', error);
      alert('Failed to save rates: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadCredential = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('File must be an image (JPEG, PNG, WebP) or PDF');
      return;
    }

    try {
      setUploading(true);
      const storage = getFirebaseStorage();
      const db = getFirebaseFirestore();

      // Upload file
      const credentialRef = ref(storage, `portfolio/${profile.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(credentialRef, file);
      const credentialUrl = await getDownloadURL(credentialRef);

      // Update profile with new credential
      const updatedPortfolio = [...(profile.agentPortfolio || []), credentialUrl];
      await updateDoc(doc(db, 'profiles', profile.uid), {
        agentPortfolio: updatedPortfolio,
        updatedAt: Timestamp.now()
      });

      setProfile({ ...profile, agentPortfolio: updatedPortfolio });
      alert('Credential uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading credential:', error);
      alert('Failed to upload credential: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCredential = async (urlToDelete: string) => {
    if (!profile || !confirm('Are you sure you want to delete this credential?')) return;

    try {
      const db = getFirebaseFirestore();
      const updatedPortfolio = profile.agentPortfolio.filter(url => url !== urlToDelete);

      await updateDoc(doc(db, 'profiles', profile.uid), {
        agentPortfolio: updatedPortfolio,
        updatedAt: Timestamp.now()
      });

      setProfile({ ...profile, agentPortfolio: updatedPortfolio });
      alert('Credential deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting credential:', error);
      alert('Failed to delete credential: ' + error.message);
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

  const stats = [
    { label: 'Total Clients', value: profile.agentTotalClients || 0, icon: <Users className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500' },
    { label: 'Success Rate', value: `${profile.agentSuccessRate || 0}%`, icon: <TrendingUp className="w-6 h-6" />, color: 'from-green-500 to-emerald-500' },
    { label: 'Total Earnings', value: `$${profile.totalEarnings || 0}`, icon: <DollarSign className="w-6 h-6" />, color: 'from-purple-500 to-pink-500' },
    { label: 'Rating', value: (profile.averageRating || 0).toFixed(1), icon: <Star className="w-6 h-6" />, color: 'from-orange-500 to-red-500' },
  ];

  if (!isApproved) {
    return (
      <>
        <Head>
          <title>Agent Dashboard | Remote-Works</title>
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
              <h3 className="text-xl font-bold text-yellow-900 mb-2">⚠️ Pending Verification</h3>
              <p className="text-yellow-800">
                Your agent account is pending verification. Our team will review your credentials within 24-48 hours.
                You'll receive an email notification once you're approved.
              </p>
            </div>

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
        <title>Agent Dashboard | Remote-Works</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white border-b-2 border-gradient shadow-lg sticky top-0 z-50" style={{borderImage: 'linear-gradient(to right, #2563eb, #9333ea) 1'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              <Logo showText={true} onClick={() => router.push('/')} size="sm" />
              <div className="flex items-center space-x-4">
                <button onClick={() => router.push('/profile-settings')} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
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

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 md:p-8 mb-8 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {profile.firstName}! 👋</h1>
            <p className="text-lg md:text-xl text-blue-100">Your agent account is active and ready to help candidates</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User className="w-5 h-5" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all relative ${
                activeTab === 'messages'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              Messages
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl text-white mb-4`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Profile Management */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gray-200 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Agent Profile</h2>
              <button
                onClick={() => router.push('/profile-settings')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
              >
                <Edit className="w-5 h-5" />
                Edit Profile
              </button>
            </div>

            <div className="space-y-4">
              {/* Services */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Services</h3>
                  <p className="text-sm text-gray-600 mb-2">Platforms you help with</p>
                  {profile.agentServices && profile.agentServices.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.agentServices.map((service, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {service}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No services added yet</p>
                  )}
                </div>
                <button
                  onClick={() => setShowServicesModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {profile.agentServices?.length > 0 ? 'Edit' : 'Add'}
                </button>
              </div>

              {/* Rates */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Pricing</h3>
                  <p className="text-sm text-gray-600 mb-2">Your rates for each service</p>
                  {profile.agentPricing && Object.keys(profile.agentPricing).length > 0 ? (
                    <div className="space-y-1">
                      {Object.entries(profile.agentPricing).map(([service, price]) => (
                        <p key={service} className="text-sm text-gray-700">
                          <span className="font-medium">{service}:</span> ${price}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No rates set yet</p>
                  )}
                </div>
                <button
                  onClick={() => setShowRatesModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {Object.keys(profile.agentPricing || {}).length > 0 ? 'Edit' : 'Set'}
                </button>
              </div>

              {/* Credentials */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Credentials & Portfolio</h3>
                  <p className="text-sm text-gray-600 mb-2">Proof of successful placements</p>
                  {profile.agentPortfolio && profile.agentPortfolio.length > 0 ? (
                    <p className="text-sm text-gray-700">{profile.agentPortfolio.length} credential(s) uploaded</p>
                  ) : (
                    <p className="text-sm text-gray-500">No credentials uploaded yet</p>
                  )}
                </div>
                <button
                  onClick={() => setShowCredentialsModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <UploadIcon className="w-4 h-4" />
                  Manage
                </button>
              </div>

              {/* Enhanced Settings Button */}
              <div className="mt-4">
                <button
                  onClick={() => setShowEnhancedSettingsModal(true)}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <Settings className="w-5 h-5" />
                  Enhanced Settings (Pricing, Terms, Availability)
                </button>
              </div>
            </div>
          </div>
            </>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                  Inbox
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
                    <p className="text-gray-400 text-sm mt-2">Service requests from candidates will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => {
                          setSelectedMessage(message);
                          setShowMessageModal(true);
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
                              {message.status === 'rejected' && (
                                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">Rejected</span>
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
                        {message.type === 'service_request' && message.status === 'unread' && (
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptRequest(message);
                              }}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-semibold"
                            >
                              Accept
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectRequest(message);
                              }}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-semibold"
                            >
                              Reject
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMessage(message);
                                setShowMessageModal(true);
                              }}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold"
                            >
                              View & Reply
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Detail/Reply Modal */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Message from {selectedMessage.senderName}</h3>
              <button onClick={() => { setShowMessageModal(false); setSelectedMessage(null); setReplyText(''); }} className="text-gray-500 hover:text-gray-700">
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
              {selectedMessage.status === 'unread' && selectedMessage.type === 'service_request' && (
                <>
                  <button
                    onClick={() => handleAcceptRequest(selectedMessage)}
                    disabled={saving}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? 'Processing...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleRejectRequest(selectedMessage)}
                    disabled={saving}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                  >
                    {saving ? 'Processing...' : 'Reject'}
                  </button>
                </>
              )}
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

      {/* Enhanced Settings Modal */}
      {showEnhancedSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Enhanced Agent Settings</h3>
              <button onClick={() => setShowEnhancedSettingsModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="full">Full Service - Handle all tasks</option>
                  <option value="partial">Partial Service - Handle some tasks</option>
                  <option value="approval_only">Approval Only - Help get approved</option>
                </select>
              </div>

              {/* Percentage Charge */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Percent className="w-4 h-4 inline mr-1" />
                  Percentage Charge (per project)
                </label>
                <input
                  type="number"
                  value={percentageCharge}
                  onChange={(e) => setPercentageCharge(Number(e.target.value))}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10 for 10%"
                />
                <p className="text-sm text-gray-500 mt-1">Charge a percentage of project earnings (if handling some/all tasks)</p>
              </div>

              {/* One-Time Approval Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Dollar className="w-4 h-4 inline mr-1" />
                  One-Time Approval Fee ($)
                </label>
                <input
                  type="number"
                  value={oneTimeApprovalFee}
                  onChange={(e) => setOneTimeApprovalFee(Number(e.target.value))}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 100"
                />
                <p className="text-sm text-gray-500 mt-1">One-time fee to help candidate get approved for a platform</p>
              </div>

              {/* Working Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarClock className="w-4 h-4 inline mr-1" />
                  Availability Hours
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={workingHoursStart}
                      onChange={(e) => setWorkingHoursStart(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End Time</label>
                    <input
                      type="time"
                      value={workingHoursEnd}
                      onChange={(e) => setWorkingHoursEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Working Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <label key={day} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={workingDays.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWorkingDays([...workingDays, day]);
                          } else {
                            setWorkingDays(workingDays.filter(d => d !== day));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{day.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Your Terms & Conditions
                </label>
                <textarea
                  value={agentTerms}
                  onChange={(e) => setAgentTerms(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your service terms, payment conditions, cancellation policy, etc..."
                />
                <p className="text-sm text-gray-500 mt-1">These will be shown to candidates when they request your services</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEnhancedSettingsModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEnhancedSettings}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services Modal */}
      {showServicesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Select Your Services</h3>
              <button onClick={() => setShowServicesModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">Choose the platforms you can help candidates with</p>
            <div className="grid md:grid-cols-2 gap-3 mb-6">
              {availablePlatforms.map((platform) => (
                <label key={platform} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(platform)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedServices([...selectedServices, platform]);
                      } else {
                        setSelectedServices(selectedServices.filter(s => s !== platform));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-900">{platform}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowServicesModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveServices}
                disabled={saving || selectedServices.length === 0}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Services'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rates Modal */}
      {showRatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Set Your Rates</h3>
              <button onClick={() => setShowRatesModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">Define your pricing for each platform you support</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Base Price (applies to all services)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    value={pricing.basePrice || ''}
                    onChange={(e) => setPricing({ ...pricing, basePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="100"
                  />
                </div>
              </div>
              {selectedServices.map((service) => (
                <div key={service}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {service}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      min="0"
                      value={pricing[service] || pricing.basePrice || ''}
                      onChange={(e) => setPricing({ ...pricing, [service]: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder={`${pricing.basePrice || 100}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRatesModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRates}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Rates'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredentialsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Manage Credentials</h3>
              <button onClick={() => setShowCredentialsModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">Upload proof of successful placements and credentials</p>

            {/* Upload Section */}
            <div className="mb-6">
              <label className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-colors">
                <UploadIcon className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, WebP or PDF (max. 10MB)</p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleUploadCredential}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              {uploading && (
                <p className="text-sm text-blue-600 mt-2 text-center">Uploading...</p>
              )}
            </div>

            {/* Existing Credentials */}
            {profile.agentPortfolio && profile.agentPortfolio.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Your Credentials ({profile.agentPortfolio.length})</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {profile.agentPortfolio.map((url, idx) => (
                    <div key={idx} className="relative border border-gray-200 rounded-lg p-3">
                      {url.endsWith('.pdf') ? (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center">
                            <span className="text-red-600 text-xs font-bold">PDF</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 truncate">Document {idx + 1}</p>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View</a>
                          </div>
                        </div>
                      ) : (
                        <img src={url} alt={`Credential ${idx + 1}`} className="w-full h-32 object-cover rounded" />
                      )}
                      <button
                        onClick={() => handleDeleteCredential(url)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
