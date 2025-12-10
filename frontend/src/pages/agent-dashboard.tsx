import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Users, DollarSign, Star, TrendingUp, Settings, MessageSquare, LogOut,
  User, MapPin, Mail, Phone, Calendar, CheckCircle, Clock, X, Edit, Upload as UploadIcon, Plus, Trash2,
  Bell, Send, Loader, FileText, CreditCard, Percent, DollarSign as Dollar, CalendarClock, Bookmark, Search
} from 'lucide-react';
import Head from 'next/head';
import Logo from '@/components/Logo';
import { useAuthStore } from '@/lib/authStore';
import { getFirebaseAuth, getFirebaseFirestore, getFirebaseStorage } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, Timestamp, collection, query, where, getDocs, orderBy, addDoc, limit, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { saveMessage, unsaveMessage, subscribeToNotifications, markNotificationAsRead } from '@/lib/firebase/firestore';

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
  saved?: boolean;
  isReply?: boolean;
  updatedAt?: any;
}

export default function AgentDashboard() {
  const router = useRouter();
  const { logout } = useAuthStore();
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
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [projectNotificationCount, setProjectNotificationCount] = useState(0);

  // Enhanced settings
  const [agentTerms, setAgentTerms] = useState('');
  const [serviceType, setServiceType] = useState<'full' | 'partial' | 'approval_only'>('full');
  const [percentageCharge, setPercentageCharge] = useState<number>(0);
  const [oneTimeApprovalFee, setOneTimeApprovalFee] = useState<number>(0);
  const [workingHoursStart, setWorkingHoursStart] = useState('09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('17:00');
  const [workingDays, setWorkingDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);

  // Ref to track if we've processed query params
  const queryParamsProcessedRef = useRef(false);

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

  // Handle URL query parameters for navigation from connections page
  useEffect(() => {
    if (router.isReady && !queryParamsProcessedRef.current) {
      const { tab, conversationId, newMessage, candidateId, candidateName } = router.query;

      console.log('[Agent Dashboard] Query params:', { tab, conversationId, newMessage, candidateId, candidateName });
      console.log('[Agent Dashboard] User loaded:', !!user, 'Profile loaded:', !!profile);

      // Switch to messages tab if specified
      if (tab === 'messages') {
        setActiveTab('messages');

        // Handle new message composition when no conversation exists
        if (newMessage === 'true' && candidateId && typeof candidateId === 'string') {
          console.log('[Agent Dashboard] New message requested for candidate:', candidateId);

          // Wait for user and profile to be loaded before creating new message
          if (user && profile) {
            console.log('[Agent Dashboard] User and profile loaded, creating new message object');

            // Create a temporary message object for composing new message
            const candidateNameStr = (typeof candidateName === 'string' ? candidateName : '') || 'Candidate';
            const newMessageObj: Message = {
              id: 'new',
              senderId: user.uid,
              senderName: `${profile.firstName} ${profile.lastName}`,
              senderEmail: user.email || '',
              recipientId: candidateId,
              recipientName: candidateNameStr,
              message: '',
              subject: `Message to ${candidateNameStr}`,
              status: 'unread',
              createdAt: new Date(),
              type: 'general',
              conversationId: undefined
            };

            console.log('[Agent Dashboard] Setting selected message and showing modal');
            setSelectedMessage(newMessageObj);
            setShowMessageModal(true);

            // Mark as processed and clear query parameters
            queryParamsProcessedRef.current = true;
            router.replace('/agent-dashboard', undefined, { shallow: true });
          } else {
            console.log('[Agent Dashboard] Waiting for user and profile to load...');
          }
        }
        // Open specific conversation if conversationId is provided
        else if (conversationId && typeof conversationId === 'string' && messages.length > 0) {
          const message = messages.find(m => m.conversationId === conversationId || m.id === conversationId);
          if (message) {
            setSelectedMessage(message);
            setShowMessageModal(true);

            // Mark as processed and clear query parameters
            queryParamsProcessedRef.current = true;
            router.replace('/agent-dashboard', undefined, { shallow: true });
          }
        }
        // If no new message or conversationId, just clear params
        else if (newMessage !== 'true' && !conversationId) {
          queryParamsProcessedRef.current = true;
          router.replace('/agent-dashboard', undefined, { shallow: true });
        }
      }
    }
  }, [router.isReady, router.query, messages, user, profile]);

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
        await loadMessages(db, firebaseUser.uid);

        // Subscribe to real-time notifications
        const unsubscribe = subscribeToNotifications(firebaseUser.uid, (notifs) => {
          setNotifications(notifs);
          const unreadNotifs = notifs.filter(n => !n.isRead);
          setNotificationCount(unreadNotifs.length);

          // Count project-related notifications
          const projectNotifs = unreadNotifs.filter(n =>
            n.type === 'action_needed' ||
            n.type === 'action_status_changed' ||
            n.projectId
          );
          setProjectNotificationCount(projectNotifs.length);
        });

        setLoading(false);

        // Cleanup subscription on unmount
        return () => unsubscribe();
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

  const loadMessages = async (db: any, agentId: string) => {
    try {
      // Query messages - removed orderBy to avoid composite index requirement
      const messagesQuery = query(
        collection(db, 'messages'),
        where('recipientId', '==', agentId),
        limit(50)
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const messagesList: Message[] = [];
      let unread = 0;

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
          } as Message);
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

      // Use existing conversation ID from message, or create consistent one
      // Sort IDs to ensure same conversation ID regardless of who initiated
      const ids = [message.senderId, user.uid].sort();
      const conversationId = message.conversationId || `conv_${ids[0]}_${ids[1]}`;

      // Check if connection already exists to prevent duplicates
      try {
        const existingConnectionQuery = query(
          collection(db, 'connections'),
          where('agentId', '==', user.uid),
          where('candidateId', '==', message.senderId)
        );
        const existingConnectionSnapshot = await getDocs(existingConnectionQuery);

        // Only create connection if it doesn't already exist
        if (existingConnectionSnapshot.empty) {
          await addDoc(collection(db, 'connections'), {
            agentId: user.uid,
            agentName: `${profile?.firstName} ${profile?.lastName}`,
            agentEmail: profile?.email || user.email,
            candidateId: message.senderId,
            candidateName: message.senderName,
            candidateEmail: message.senderEmail,
            conversationId: conversationId,
            status: 'connected',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
          console.log(`Connection created with ${message.senderName}`);
        } else {
          // Update existing connection to ensure status is 'connected'
          const existingConnectionDoc = existingConnectionSnapshot.docs[0];
          await updateDoc(doc(db, 'connections', existingConnectionDoc.id), {
            status: 'connected',
            conversationId: conversationId,
            updatedAt: Timestamp.now()
          });
          console.log(`Connection updated with ${message.senderName}`);
        }
      } catch (queryError: any) {
        console.error('Error managing connection:', queryError);

        // If query fails (e.g., missing index), fall back to creating connection
        // This ensures connections are still created even if duplicate check fails
        await addDoc(collection(db, 'connections'), {
          agentId: user.uid,
          agentName: `${profile?.firstName} ${profile?.lastName}`,
          agentEmail: profile?.email || user.email,
          candidateId: message.senderId,
          candidateName: message.senderName,
          candidateEmail: message.senderEmail,
          conversationId: conversationId,
          status: 'connected',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        console.log(`Connection created (fallback) with ${message.senderName}`);
      }

      // Send acceptance message to candidate
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        senderName: `${profile?.firstName} ${profile?.lastName}`,
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

      // Determine if this is a new message or a reply
      const isNewMessage = selectedMessage.id === 'new';

      // For new messages, recipient is in recipientId field
      // For replies, recipient is the original sender
      const recipientId = isNewMessage ? selectedMessage.recipientId : selectedMessage.senderId;
      const recipientName = isNewMessage ? selectedMessage.recipientName : selectedMessage.senderName;

      // Get or create conversation ID
      // Sort IDs to ensure same conversation ID regardless of who initiated
      const ids = [user.uid, recipientId].sort();
      const conversationId = selectedMessage.conversationId || `conv_${ids[0]}_${ids[1]}`;

      // If this is a new conversation, update the connection with the conversationId
      if (!selectedMessage.conversationId) {
        try {
          const existingConnectionQuery = query(
            collection(db, 'connections'),
            where('agentId', '==', user.uid),
            where('candidateId', '==', recipientId)
          );
          const existingConnectionSnapshot = await getDocs(existingConnectionQuery);

          if (!existingConnectionSnapshot.empty) {
            const existingConnectionDoc = existingConnectionSnapshot.docs[0];
            await updateDoc(doc(db, 'connections', existingConnectionDoc.id), {
              conversationId: conversationId,
              updatedAt: Timestamp.now()
            });
            console.log(`Connection updated with conversationId: ${conversationId}`);
          }
        } catch (queryError: any) {
          console.error('Error updating connection with conversationId:', queryError);
          // Don't fail the message send if connection update fails
        }
      }

      // Determine subject - for new messages use a default, for replies use original
      const subject = isNewMessage
        ? (selectedMessage.subject || 'New Message')
        : selectedMessage.subject.replace(/^(Re:\s*)+/g, '');

      // Send message
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        senderName: `${profile?.firstName} ${profile?.lastName}`,
        recipientId: recipientId,
        recipientName: recipientName,
        message: replyText,
        subject: subject,
        status: 'unread',
        createdAt: Timestamp.now(),
        type: 'general',
        conversationId: conversationId,
        isReply: !isNewMessage
      });

      // Mark original as read if unread
      if (selectedMessage.status === 'unread' && selectedMessage.id !== 'new') {
        await updateDoc(doc(db, 'messages', selectedMessage.id), {
          status: 'read',
          updatedAt: Timestamp.now()
        });
      }

      alert(isNewMessage ? 'Message sent successfully!' : 'Reply sent successfully!');
      setReplyText('');
      setShowMessageModal(false);
      setSelectedMessage(null);

      // Refresh messages
      await loadMessages(db, user.uid);
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
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

  const handleToggleSaveMessage = async (message: Message) => {
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
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <button
                      onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                      className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                      title="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {notificationCount > 0 && (
                        <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {notificationCount}
                        </span>
                      )}
                    </button>

                    {/* Notification Dropdown Panel */}
                    {showNotificationPanel && (
                      <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
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
                    onClick={() => router.push('/candidate-projects')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all relative"
                    title="Projects"
                  >
                    <FileText className="w-5 h-5" />
                    <span className="hidden md:inline">Projects</span>
                    {projectNotificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {projectNotificationCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => router.push('/agent-connections')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                    title="Connected Candidates"
                  >
                    <Users className="w-5 h-5" />
                    <span className="hidden md:inline">Candidates</span>
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
        <title>Agent Dashboard | Remote-Works</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white border-b-2 border-gradient shadow-lg sticky top-0 z-50" style={{borderImage: 'linear-gradient(to right, #2563eb, #9333ea) 1'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              <Logo showText={false} onClick={() => router.push('/')} size="sm" />
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button
                    onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                    className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {notificationCount > 0 && (
                      <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {notificationCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Panel - Reusing same component */}
                  {showNotificationPanel && (
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
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
                                  if (!notification.isRead) {
                                    await markNotificationAsRead(notification.id);
                                  }
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
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Profile"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline">Profile</span>
                </button>
                <button
                  onClick={() => router.push('/candidate-projects')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all relative"
                  title="Projects"
                >
                  <FileText className="w-5 h-5" />
                  <span className="hidden md:inline">Projects</span>
                  {projectNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {projectNotificationCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => router.push('/agent-connections')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                  title="Connected Candidates"
                >
                  <Users className="w-5 h-5" />
                  <span className="hidden md:inline">Candidates</span>
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all relative ${activeTab === 'messages' ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="hidden md:inline">Messages</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
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

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-black to-gray-800 rounded-2xl p-6 md:p-8 mb-8 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {profile.firstName}! 👋</h1>
            <p className="text-lg md:text-xl text-gray-200">Your agent account is active and ready to help candidates</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-black text-white shadow-md'
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
                  ? 'bg-black text-white shadow-md'
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
                className="flex items-center gap-2 text-black hover:text-gray-900 font-semibold"
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
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-blue-800 rounded-full text-sm">
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
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
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
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
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
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
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
                      Messages
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
                        <p className="text-sm text-gray-500">Service requests from candidates will appear here</p>
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
                              setShowMessageModal(true);
                            }}
                            className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                              selectedMessage?.id === message.id ? 'bg-emerald-50' : ''
                            } ${message.status === 'unread' ? 'bg-blue-50/30' : ''}`}
                          >
                            <div className="flex gap-3">
                              {/* Avatar */}
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                  {message.senderName?.charAt(0).toUpperCase() || 'C'}
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
                                  {message.status === 'rejected' && (
                                    <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">Rejected</span>
                                  )}
                                  {message.saved && (
                                    <Bookmark className="w-3 h-3 text-yellow-500 fill-current" />
                                  )}
                                  {message.type === 'service_request' && message.status === 'unread' && (
                                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">New Request</span>
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
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">Welcome to Your Inbox</h3>
                        <p className="text-gray-600">Select a conversation to start chatting with candidates</p>
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
                          {selectedMessage.senderName?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{selectedMessage.senderName}</h3>
                          <p className="text-emerald-50 text-xs">Candidate</p>
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
                        {/* Date Separator */}
                        <div className="flex justify-center mb-4">
                          <div className="bg-white px-4 py-1 rounded-lg shadow-sm">
                            <p className="text-xs font-medium text-gray-600">
                              {selectedMessage.createdAt?.toDate?.()?.toLocaleDateString() || 'Today'}
                            </p>
                          </div>
                        </div>

                        {/* Original Message */}
                        <div className="flex justify-start">
                          <div className="max-w-xs lg:max-w-md bg-white rounded-2xl rounded-tl-sm shadow-md px-4 py-3">
                            {selectedMessage.subject && (
                              <p className="text-sm font-semibold text-emerald-600 mb-2">{selectedMessage.subject}</p>
                            )}
                            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{selectedMessage.message}</p>
                            <div className="flex items-center justify-end gap-1 mt-2">
                              <p className="text-xs text-gray-500">
                                {selectedMessage.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}
                              </p>
                            </div>
                            {selectedMessage.type === 'service_request' && selectedMessage.status === 'unread' && (
                              <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-2">
                                <button
                                  onClick={() => handleAcceptRequest(selectedMessage)}
                                  className="flex-1 min-w-[100px] bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-semibold"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleRejectRequest(selectedMessage)}
                                  className="flex-1 min-w-[100px] bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 text-sm font-semibold"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Reply Messages would appear here */}
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
        </div>
      </div>

      {/* Message Detail/Reply Modal */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedMessage.id === 'new'
                    ? `New Message to ${selectedMessage.recipientName}`
                    : `Message from ${selectedMessage.senderName}`}
                </h3>
                {selectedMessage.saved && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Bookmark className="w-3 h-3" />
                    Saved
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedMessage.id !== 'new' && (
                  <button
                    onClick={() => handleToggleSaveMessage(selectedMessage)}
                    className={`p-2 rounded-lg transition-colors ${selectedMessage.saved ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    title={selectedMessage.saved ? 'Unsave message' : 'Save message'}
                  >
                    <Bookmark className={`w-5 h-5 ${selectedMessage.saved ? 'fill-current' : ''}`} />
                  </button>
                )}
                <button onClick={() => { setShowMessageModal(false); setSelectedMessage(null); setReplyText(''); }} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Only show original message for replies, not for new messages */}
            {selectedMessage.id !== 'new' && (
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
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectedMessage.id === 'new' ? 'Your Message' : 'Your Reply'}
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={selectedMessage.id === 'new' ? 'Type your message here...' : 'Type your reply here...'}
              />
            </div>

            <div className="flex gap-3">
              {selectedMessage.status === 'unread' && selectedMessage.type === 'service_request' && selectedMessage.id !== 'new' && (
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
                className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sendingReply ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {selectedMessage.id === 'new' ? 'Send Message' : 'Send Reply'}
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
                className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
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
                className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all disabled:opacity-50"
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
                className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all disabled:opacity-50"
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
                <p className="text-sm text-black mt-2 text-center">Uploading...</p>
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
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-black hover:underline">View</a>
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
