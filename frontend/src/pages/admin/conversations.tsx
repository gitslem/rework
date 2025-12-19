import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '@/components/Logo';
import { MessageSquare, ArrowLeft, Search, User, Mail, Calendar, Users, ChevronRight, X } from 'lucide-react';
import { getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, getDocs, doc, getDoc, orderBy, Timestamp } from 'firebase/firestore';
import { Message } from '@/types';

interface Conversation {
  conversationId: string;
  participantIds: string[];
  participants: {
    uid: string;
    name: string;
    email: string;
    role: string;
  }[];
  messages: Message[];
  lastMessageAt: Date;
  messageCount: number;
}

export default function AdminConversations() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchConversations();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterConversations();
  }, [searchTerm, conversations]);

  const checkAdminAccess = async () => {
    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseFirestore();

      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
          } else {
            router.push('/admin');
          }
        } else {
          router.push('/admin');
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error checking admin access:', error);
      setLoading(false);
      router.push('/admin');
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const db = getFirebaseFirestore();

      // Fetch all messages
      const messagesQuery = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      const messagesSnapshot = await getDocs(messagesQuery);

      const messagesData: Message[] = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt || Timestamp.now(),
      })) as Message[];

      // Group messages by conversationId or by participant pairs
      const conversationMap = new Map<string, Message[]>();

      for (const message of messagesData) {
        let conversationKey: string;

        if (message.conversationId) {
          conversationKey = message.conversationId;
        } else {
          // Create a consistent key for sender-recipient pairs
          const ids = [message.senderId, message.recipientId].sort();
          conversationKey = ids.join('_');
        }

        if (!conversationMap.has(conversationKey)) {
          conversationMap.set(conversationKey, []);
        }
        conversationMap.get(conversationKey)!.push(message);
      }

      // Build conversation objects
      const conversationsData: Conversation[] = [];

      for (const [conversationId, messages] of Array.from(conversationMap.entries())) {
        // Get unique participant IDs
        const participantIdsSet = new Set<string>();
        messages.forEach(msg => {
          participantIdsSet.add(msg.senderId);
          participantIdsSet.add(msg.recipientId);
        });
        const participantIds = Array.from(participantIdsSet);

        // Fetch participant details
        const participants = [];
        for (const uid of participantIds) {
          try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            const profileDoc = await getDoc(doc(db, 'profiles', uid));

            if (userDoc.exists()) {
              const userData = userDoc.data();
              const profileData = profileDoc.exists() ? profileDoc.data() : {};

              participants.push({
                uid,
                name: [profileData.firstName, profileData.lastName].filter(n => n).join(' ') || userData.email || 'Unknown User',
                email: userData.email || '',
                role: userData.role || 'unknown',
              });
            } else {
              participants.push({
                uid,
                name: 'Unknown User',
                email: '',
                role: 'unknown',
              });
            }
          } catch (error) {
            console.error(`Error fetching user ${uid}:`, error);
            participants.push({
              uid,
              name: 'Unknown User',
              email: '',
              role: 'unknown',
            });
          }
        }

        // Sort messages by date
        const sortedMessages = messages.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
          const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
          return aTime - bTime;
        });

        const lastMessage = sortedMessages[sortedMessages.length - 1];
        const lastMessageAt = lastMessage?.createdAt?.toDate() || new Date();

        conversationsData.push({
          conversationId,
          participantIds,
          participants,
          messages: sortedMessages,
          lastMessageAt,
          messageCount: messages.length,
        });
      }

      // Sort conversations by last message date
      conversationsData.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

      setConversations(conversationsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const filterConversations = () => {
    if (!searchTerm.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = conversations.filter(conv => {
      // Search in participant names and emails
      const participantMatch = conv.participants.some(p =>
        p.name.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term)
      );

      // Search in message content
      const messageMatch = conv.messages.some(m =>
        m.message.toLowerCase().includes(term) ||
        m.subject?.toLowerCase().includes(term)
      );

      return participantMatch || messageMatch;
    });

    setFilteredConversations(filtered);
  };

  const openConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedConversation(null);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'candidate':
        return 'bg-blue-100 text-blue-800';
      case 'agent':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Conversations - Admin Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Logo />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Message Conversations</h1>
                  <p className="text-sm text-gray-600">View all conversations between candidates and agents</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/admin/candidates')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Admin</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Conversations</p>
                  <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {conversations.reduce((sum, conv) => sum + conv.messageCount, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or message content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="bg-white rounded-lg shadow-sm">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  {searchTerm ? 'No conversations found matching your search' : 'No conversations yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.conversationId}
                    onClick={() => openConversation(conversation)}
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Users className="w-5 h-5 text-gray-400" />
                          <div className="flex items-center space-x-2">
                            {conversation.participants.map((participant, idx) => (
                              <span key={participant.uid} className="flex items-center space-x-1">
                                <span className="font-medium text-gray-900">{participant.name}</span>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${getRoleBadgeColor(participant.role)}`}>
                                  {participant.role}
                                </span>
                                {idx < conversation.participants.length - 1 && (
                                  <span className="text-gray-400 mx-1">↔</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          {conversation.participants.map((participant) => (
                            <span key={participant.uid} className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{participant.email}</span>
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{conversation.messageCount} message{conversation.messageCount !== 1 ? 's' : ''}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Last message: {conversation.lastMessageAt.toLocaleDateString()}</span>
                          </span>
                        </div>

                        {/* Preview of last message */}
                        {conversation.messages.length > 0 && (
                          <div className="mt-2 text-sm text-gray-600 truncate">
                            <span className="font-medium">Last message:</span>{' '}
                            {conversation.messages[conversation.messages.length - 1].message.substring(0, 100)}
                            {conversation.messages[conversation.messages.length - 1].message.length > 100 ? '...' : ''}
                          </div>
                        )}
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Conversation Modal */}
      {showModal && selectedConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Conversation Details</h2>
                <div className="flex items-center space-x-2 mt-1">
                  {selectedConversation.participants.map((participant, idx) => (
                    <span key={participant.uid} className="flex items-center space-x-1 text-sm">
                      <span className="text-gray-700">{participant.name}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getRoleBadgeColor(participant.role)}`}>
                        {participant.role}
                      </span>
                      {idx < selectedConversation.participants.length - 1 && (
                        <span className="text-gray-400 mx-1">↔</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedConversation.messages.map((message) => {
                const sender = selectedConversation.participants.find(p => p.uid === message.senderId);
                const isCandidate = sender?.role === 'candidate';

                return (
                  <div
                    key={message.id}
                    className={`flex ${isCandidate ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[70%] ${isCandidate ? 'bg-gray-100' : 'bg-blue-100'} rounded-lg p-4`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold text-sm text-gray-900">
                          {sender?.name || 'Unknown User'}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getRoleBadgeColor(sender?.role || 'unknown')}`}>
                          {sender?.role || 'unknown'}
                        </span>
                      </div>

                      {message.subject && (
                        <div className="text-sm font-medium text-gray-900 mb-2">
                          Subject: {message.subject}
                        </div>
                      )}

                      <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                        {message.message}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          {message.createdAt?.toDate?.()?.toLocaleString() || 'Unknown date'}
                        </span>
                        {message.type && (
                          <span className="text-xs text-gray-500 capitalize">
                            {message.type.replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      {message.status && message.status !== 'unread' && message.status !== 'read' && (
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            message.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            message.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {message.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{selectedConversation.messageCount} total messages</span>
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
