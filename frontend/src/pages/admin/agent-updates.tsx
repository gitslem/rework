import React, { useState, useEffect } from 'react';
import { getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebase/config';
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  orderBy,
  Timestamp,
  onSnapshot,
  where
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { X, Plus, Edit2, Trash2, Users, ExternalLink, Send, MapPin, Filter, ChevronRight, Inbox, MessageSquare } from 'lucide-react';

interface WeeklyUpdate {
  id: string;
  projectName: string;
  platform: string;
  link: string;
  location: string;
  notes: string;
  weekOf: string;
  createdBy: string;
  createdByEmail: string;
  createdAt: any;
  updatedAt: any;
}

interface AgentRequest {
  id: string;
  agentId: string;
  agentEmail: string;
  requestType: 'approval' | 'new_project' | 'suggestion';
  subject: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  respondedAt?: any;
  responseMessage?: string;
}

interface PageSettings {
  headOfAgentEmails: string[];
}

export default function AgentUpdates() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  const [updates, setUpdates] = useState<WeeklyUpdate[]>([]);
  const [agentRequests, setAgentRequests] = useState<AgentRequest[]>([]);
  const [pageSettings, setPageSettings] = useState<PageSettings>({ headOfAgentEmails: [] });

  // View state
  const [currentView, setCurrentView] = useState<'platforms' | 'projects' | 'inbox'>('platforms');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRequestDetailModal, setShowRequestDetailModal] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<WeeklyUpdate | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AgentRequest | null>(null);
  const [newHeadEmail, setNewHeadEmail] = useState('');

  const [formData, setFormData] = useState({
    projectName: '',
    platform: '',
    link: '',
    location: '',
    notes: '',
    weekOf: getCurrentWeek()
  });

  const [requestFormData, setRequestFormData] = useState({
    requestType: 'suggestion' as 'approval' | 'new_project' | 'suggestion',
    subject: '',
    message: ''
  });

  const [responseMessage, setResponseMessage] = useState('');

  function getCurrentWeek() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const auth = getFirebaseAuth();
    const db = getFirebaseFirestore();

    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const profileDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const profileData = profileDoc.exists() ? profileDoc.data() : null;

            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...userData });
            setProfile(profileData);

            // Admin has full access
            if (userData.role === 'admin') {
              setIsAdmin(true);
              setHasAccess(true);
              setCanEdit(true);
              await fetchUpdates();
              await fetchAgentRequests();
              await fetchPageSettings();
            }
            // Approved agents have read access
            else if (userData.role === 'agent' && profileData?.isAgentApproved) {
              setHasAccess(true);
              await fetchUpdates();
              await fetchAgentRequests();
              await fetchPageSettings();

              // Check if agent is head of agent
              const settingsDoc = await getDoc(doc(db, 'settings', 'agent-updates'));
              if (settingsDoc.exists()) {
                const settings = settingsDoc.data() as PageSettings;
                if (settings.headOfAgentEmails?.includes(firebaseUser.email || '')) {
                  setCanEdit(true);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error checking access:', error);
        }
      }
      setLoading(false);
    });
  };

  const fetchUpdates = async () => {
    const db = getFirebaseFirestore();
    const q = query(
      collection(db, 'agent_weekly_updates'),
      orderBy('weekOf', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WeeklyUpdate[];
      setUpdates(updatesData);
    });

    return unsubscribe;
  };

  const fetchAgentRequests = async () => {
    const db = getFirebaseFirestore();
    const q = query(
      collection(db, 'agent_requests'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AgentRequest[];
      setAgentRequests(requestsData);
    });

    return unsubscribe;
  };

  const fetchPageSettings = async () => {
    const db = getFirebaseFirestore();
    const settingsDoc = await getDoc(doc(db, 'settings', 'agent-updates'));
    if (settingsDoc.exists()) {
      setPageSettings(settingsDoc.data() as PageSettings);
    }
  };

  const handleAddUpdate = async () => {
    if (!canEdit || !user) {
      alert('You do not have permission to add updates');
      return;
    }

    if (!formData.projectName.trim() || !formData.platform.trim() || !formData.location.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const db = getFirebaseFirestore();
    try {
      await addDoc(collection(db, 'agent_weekly_updates'), {
        projectName: formData.projectName.trim(),
        platform: formData.platform.trim(),
        link: formData.link.trim(),
        location: formData.location.trim(),
        notes: formData.notes.trim(),
        weekOf: formData.weekOf,
        createdBy: user.uid,
        createdByEmail: user.email,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      setShowAddModal(false);
      resetForm();
      alert('Update added successfully!');
    } catch (error: any) {
      console.error('Error adding update:', error);
      alert(`Failed to add update: ${error.message || 'Unknown error'}`);
    }
  };

  const handleEditUpdate = async () => {
    if (!canEdit || !selectedUpdate) return;

    const db = getFirebaseFirestore();
    try {
      await updateDoc(doc(db, 'agent_weekly_updates', selectedUpdate.id), {
        projectName: formData.projectName.trim(),
        platform: formData.platform.trim(),
        link: formData.link.trim(),
        location: formData.location.trim(),
        notes: formData.notes.trim(),
        weekOf: formData.weekOf,
        updatedAt: Timestamp.now()
      });

      setShowEditModal(false);
      setSelectedUpdate(null);
      resetForm();
      alert('Update saved successfully!');
    } catch (error: any) {
      console.error('Error updating:', error);
      alert(`Failed to update: ${error.message}`);
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!isAdmin) return;
    if (!confirm('Are you sure you want to delete this update?')) return;

    const db = getFirebaseFirestore();
    try {
      await deleteDoc(doc(db, 'agent_weekly_updates', updateId));
      alert('Update deleted successfully');
    } catch (error: any) {
      console.error('Error deleting:', error);
      alert(`Failed to delete: ${error.message}`);
    }
  };

  const handleSubmitRequest = async () => {
    if (!user || !requestFormData.subject.trim() || !requestFormData.message.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const db = getFirebaseFirestore();
    try {
      await addDoc(collection(db, 'agent_requests'), {
        agentId: user.uid,
        agentEmail: user.email,
        requestType: requestFormData.requestType,
        subject: requestFormData.subject.trim(),
        message: requestFormData.message.trim(),
        status: 'pending',
        createdAt: Timestamp.now()
      });

      setShowRequestModal(false);
      setRequestFormData({ requestType: 'suggestion', subject: '', message: '' });
      alert('Request submitted successfully!');
    } catch (error: any) {
      console.error('Error submitting request:', error);
      alert(`Failed to submit request: ${error.message}`);
    }
  };

  const handleRespondToRequest = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    if (!isAdmin) return;

    const db = getFirebaseFirestore();
    try {
      await updateDoc(doc(db, 'agent_requests', requestId), {
        status: newStatus,
        respondedAt: Timestamp.now(),
        responseMessage: responseMessage.trim()
      });

      setShowRequestDetailModal(false);
      setSelectedRequest(null);
      setResponseMessage('');
      alert(`Request ${newStatus} successfully!`);
    } catch (error: any) {
      console.error('Error responding to request:', error);
      alert(`Failed to respond: ${error.message}`);
    }
  };

  const handleAddHeadOfAgent = async () => {
    if (!isAdmin || !newHeadEmail.trim()) return;

    const db = getFirebaseFirestore();
    try {
      const updatedEmails = [...pageSettings.headOfAgentEmails, newHeadEmail.trim()];
      await setDoc(doc(db, 'settings', 'agent-updates'), {
        headOfAgentEmails: updatedEmails
      }, { merge: true });

      setPageSettings({ headOfAgentEmails: updatedEmails });
      setNewHeadEmail('');
    } catch (error: any) {
      console.error('Error adding head of agent:', error);
      alert(`Failed to add editor: ${error.message}`);
    }
  };

  const handleRemoveHeadOfAgent = async (email: string) => {
    if (!isAdmin) return;

    const db = getFirebaseFirestore();
    try {
      const updatedEmails = pageSettings.headOfAgentEmails.filter(e => e !== email);
      await setDoc(doc(db, 'settings', 'agent-updates'), {
        headOfAgentEmails: updatedEmails
      }, { merge: true });

      setPageSettings({ headOfAgentEmails: updatedEmails });
    } catch (error: any) {
      console.error('Error removing head of agent:', error);
      alert(`Failed to remove editor: ${error.message}`);
    }
  };

  const openEditModal = (update: WeeklyUpdate) => {
    setSelectedUpdate(update);
    setFormData({
      projectName: update.projectName,
      platform: update.platform,
      link: update.link,
      location: update.location,
      notes: update.notes,
      weekOf: update.weekOf
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      projectName: '',
      platform: '',
      link: '',
      location: '',
      notes: '',
      weekOf: getCurrentWeek()
    });
  };

  // Get unique platforms with project counts
  const getPlatformStats = () => {
    const platformMap = new Map<string, { count: number; latestWeek: string }>();

    updates.forEach(update => {
      const existing = platformMap.get(update.platform);
      if (existing) {
        existing.count++;
        if (update.weekOf > existing.latestWeek) {
          existing.latestWeek = update.weekOf;
        }
      } else {
        platformMap.set(update.platform, { count: 1, latestWeek: update.weekOf });
      }
    });

    return Array.from(platformMap.entries()).map(([platform, stats]) => ({
      platform,
      ...stats
    }));
  };

  // Get unique locations
  const getUniqueLocations = () => {
    const locations = new Set(updates.map(u => u.location));
    return ['all', ...Array.from(locations)];
  };

  // Filter projects
  const getFilteredProjects = () => {
    let filtered = updates;

    if (selectedPlatform) {
      filtered = filtered.filter(u => u.platform === selectedPlatform);
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(u => u.location === selectedLocation);
    }

    return filtered;
  };

  // Get pending requests count
  const getPendingRequestsCount = () => {
    return agentRequests.filter(r => r.status === 'pending').length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border-2 border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access this page.</p>
          <a
            href="/auth/login"
            className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all inline-block"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border-2 border-red-200">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-2">This page is only accessible to:</p>
          <ul className="text-left text-gray-700 mb-6 space-y-2">
            <li className="flex items-center">
              <span className="mr-2">•</span>
              <span>Platform Administrators</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              <span>Approved Agents</span>
            </li>
          </ul>
          <p className="text-sm text-gray-500">
            Your current role: <span className="font-semibold">{user.role}</span>
          </p>
        </div>
      </div>
    );
  }

  const platformStats = getPlatformStats();
  const filteredProjects = getFilteredProjects();
  const locations = getUniqueLocations();
  const pendingRequestsCount = getPendingRequestsCount();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-8 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">Weekly Project Updates</h1>
              <p className="text-gray-600">
                Track weekly projects from different platforms across locations
              </p>
              <div className="mt-4 flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Role: <span className="font-semibold text-black">{user.role}</span>
                </span>
                {canEdit && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    Editor Access
                  </span>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              {isAdmin && (
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-all border-2 border-gray-300"
                >
                  <Users className="w-5 h-5" />
                  <span>Manage Editors</span>
                </button>
              )}
              {canEdit && (
                <button
                  onClick={() => {
                    resetForm();
                    setShowAddModal(true);
                  }}
                  className="flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Project</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => {
              setCurrentView('platforms');
              setSelectedPlatform(null);
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              currentView === 'platforms'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-400'
            }`}
          >
            Platforms ({platformStats.length})
          </button>
          <button
            onClick={() => setCurrentView('inbox')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all relative ${
              currentView === 'inbox'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Inbox className="w-5 h-5" />
              <span>Inbox</span>
              {pendingRequestsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {pendingRequestsCount}
                </span>
              )}
            </div>
          </button>
          {!isAdmin && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="ml-auto flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all"
            >
              <Send className="w-5 h-5" />
              <span>Submit Request</span>
            </button>
          )}
        </div>

        {/* Platforms View */}
        {currentView === 'platforms' && !selectedPlatform && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Platforms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platformStats.map(({ platform, count, latestWeek }) => (
                <div
                  key={platform}
                  onClick={() => {
                    setSelectedPlatform(platform);
                    setCurrentView('projects');
                  }}
                  className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-black hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold group-hover:text-black">{platform}</h3>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-black transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Projects</span>
                      <span className="font-semibold text-black">{count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Latest Update</span>
                      <span className="font-medium text-gray-700">
                        {new Date(latestWeek).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects View */}
        {currentView === 'projects' && selectedPlatform && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setSelectedPlatform(null);
                    setCurrentView('platforms');
                    setSelectedLocation('all');
                  }}
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  ← Back to Platforms
                </button>
                <h2 className="text-2xl font-bold">{selectedPlatform} Projects</h2>
              </div>

              {/* Location Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>
                      {loc === 'all' ? 'All Locations' : loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Week Of</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Project Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Link</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Notes</th>
                      {canEdit && (
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProjects.length === 0 ? (
                      <tr>
                        <td colSpan={canEdit ? 6 : 5} className="px-6 py-12 text-center text-gray-400">
                          No projects found
                        </td>
                      </tr>
                    ) : (
                      filteredProjects.map((update) => (
                        <tr key={update.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(update.weekOf).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-black">{update.projectName}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{update.location}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {update.link ? (
                              <a
                                href={update.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                <span>View</span>
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <p className="text-sm text-gray-600 truncate" title={update.notes}>
                              {update.notes || '-'}
                            </p>
                          </td>
                          {canEdit && (
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => openEditModal(update)}
                                  className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                {isAdmin && (
                                  <button
                                    onClick={() => handleDeleteUpdate(update.id)}
                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Inbox View */}
        {currentView === 'inbox' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Agent Requests & Suggestions</h2>

            <div className="space-y-4">
              {agentRequests.length === 0 ? (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
                  <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No requests yet</p>
                </div>
              ) : (
                agentRequests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowRequestDetailModal(true);
                    }}
                    className={`bg-white rounded-xl border-2 p-6 cursor-pointer hover:shadow-lg transition-all ${
                      request.status === 'pending'
                        ? 'border-yellow-300 bg-yellow-50'
                        : request.status === 'approved'
                        ? 'border-green-300 bg-green-50'
                        : 'border-red-300 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-3">
                        <MessageSquare className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-bold">{request.subject}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        request.status === 'pending'
                          ? 'bg-yellow-200 text-yellow-800'
                          : request.status === 'approved'
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span>From: {request.agentEmail}</span>
                      <span>•</span>
                      <span>Type: {request.requestType.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{new Date(request.createdAt?.toDate()).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{request.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-center border-b-2 border-gray-200 px-8 py-6">
              <h2 className="text-2xl font-bold">Add New Project</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Week Of</label>
                <input
                  type="date"
                  value={formData.weekOf}
                  onChange={(e) => setFormData({ ...formData, weekOf: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name *</label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="E.g., Website Redesign for Tech Startup"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Platform *</label>
                <input
                  type="text"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  placeholder="E.g., Upwork, Fiverr, Direct Client"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="E.g., San Francisco, CA or Remote"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Project Link</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional details..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-4 border-t-2 border-gray-200 px-8 py-6">
              <button
                onClick={handleAddUpdate}
                className="flex-1 bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all"
              >
                Add Project
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-white text-black px-6 py-3 rounded-full font-semibold border-2 border-gray-300 hover:border-black transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && selectedUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-center border-b-2 border-gray-200 px-8 py-6">
              <h2 className="text-2xl font-bold">Edit Project</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Week Of</label>
                <input
                  type="date"
                  value={formData.weekOf}
                  onChange={(e) => setFormData({ ...formData, weekOf: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name *</label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Platform *</label>
                <input
                  type="text"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Project Link</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-4 border-t-2 border-gray-200 px-8 py-6">
              <button
                onClick={handleEditUpdate}
                className="flex-1 bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-white text-black px-6 py-3 rounded-full font-semibold border-2 border-gray-300 hover:border-black transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-center border-b-2 border-gray-200 px-8 py-6">
              <h2 className="text-2xl font-bold">Submit Request</h2>
              <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Request Type</label>
                <select
                  value={requestFormData.requestType}
                  onChange={(e) => setRequestFormData({ ...requestFormData, requestType: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                >
                  <option value="suggestion">Suggestion</option>
                  <option value="new_project">New Project Idea</option>
                  <option value="approval">Request Approval</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                <input
                  type="text"
                  value={requestFormData.subject}
                  onChange={(e) => setRequestFormData({ ...requestFormData, subject: e.target.value })}
                  placeholder="Brief summary of your request"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                <textarea
                  value={requestFormData.message}
                  onChange={(e) => setRequestFormData({ ...requestFormData, message: e.target.value })}
                  placeholder="Provide details about your request..."
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-4 border-t-2 border-gray-200 px-8 py-6">
              <button
                onClick={handleSubmitRequest}
                className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition-all"
              >
                Submit Request
              </button>
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 bg-white text-black px-6 py-3 rounded-full font-semibold border-2 border-gray-300 hover:border-black transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {showRequestDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-center border-b-2 border-gray-200 px-8 py-6">
              <h2 className="text-2xl font-bold">Request Details</h2>
              <button onClick={() => setShowRequestDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedRequest.status === 'pending'
                    ? 'bg-yellow-200 text-yellow-800'
                    : selectedRequest.status === 'approved'
                    ? 'bg-green-200 text-green-800'
                    : 'bg-red-200 text-red-800'
                }`}>
                  {selectedRequest.status.toUpperCase()}
                </span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">From</label>
                <p className="text-gray-900">{selectedRequest.agentEmail}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                <p className="text-gray-900">{selectedRequest.requestType.replace('_', ' ')}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                <p className="text-gray-900 font-semibold">{selectedRequest.subject}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.message}</p>
              </div>

              {selectedRequest.responseMessage && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Response</label>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedRequest.responseMessage}</p>
                </div>
              )}

              {isAdmin && selectedRequest.status === 'pending' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Response (Optional)</label>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Add a message to the agent..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none resize-none"
                  />
                </div>
              )}
            </div>

            {isAdmin && selectedRequest.status === 'pending' ? (
              <div className="flex space-x-4 border-t-2 border-gray-200 px-8 py-6">
                <button
                  onClick={() => handleRespondToRequest(selectedRequest.id, 'approved')}
                  className="flex-1 bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-all"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleRespondToRequest(selectedRequest.id, 'rejected')}
                  className="flex-1 bg-red-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-all"
                >
                  Reject
                </button>
                <button
                  onClick={() => setShowRequestDetailModal(false)}
                  className="flex-1 bg-white text-black px-6 py-3 rounded-full font-semibold border-2 border-gray-300 hover:border-black transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="border-t-2 border-gray-200 px-8 py-6">
                <button
                  onClick={() => setShowRequestDetailModal(false)}
                  className="w-full bg-white text-black px-6 py-3 rounded-full font-semibold border-2 border-gray-300 hover:border-black transition-all"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manage Editors Modal */}
      {showSettingsModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-center border-b-2 border-gray-200 px-8 py-6">
              <div>
                <h2 className="text-2xl font-bold">Manage Editors</h2>
                <p className="text-sm text-gray-600 mt-1">Assign agents who can update this page</p>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Add Editor Email</label>
                <div className="flex space-x-3">
                  <input
                    type="email"
                    value={newHeadEmail}
                    onChange={(e) => setNewHeadEmail(e.target.value)}
                    placeholder="agent@example.com"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                  />
                  <button
                    onClick={handleAddHeadOfAgent}
                    disabled={!newHeadEmail.trim()}
                    className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Current Editors ({pageSettings.headOfAgentEmails.length})
                </h3>
                {pageSettings.headOfAgentEmails.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No additional editors assigned</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pageSettings.headOfAgentEmails.map((email) => (
                      <div
                        key={email}
                        className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg border-2 border-gray-200"
                      >
                        <span className="text-sm font-medium text-gray-700">{email}</span>
                        <button
                          onClick={() => handleRemoveHeadOfAgent(email)}
                          className="text-red-600 hover:text-red-800 text-sm font-semibold transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t-2 border-gray-200 px-8 py-6">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full bg-white text-black px-6 py-3 rounded-full font-semibold border-2 border-gray-300 hover:border-black transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
