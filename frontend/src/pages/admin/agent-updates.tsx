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
  orderBy,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { X, Plus, Edit2, Trash2, Save, Users, ExternalLink } from 'lucide-react';

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
  const [pageSettings, setPageSettings] = useState<PageSettings>({ headOfAgentEmails: [] });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<WeeklyUpdate | null>(null);
  const [newHeadEmail, setNewHeadEmail] = useState('');

  const [formData, setFormData] = useState({
    projectName: '',
    platform: '',
    link: '',
    location: '',
    notes: '',
    weekOf: getCurrentWeek()
  });

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
              await fetchPageSettings();
            }
            // Approved agents have read access
            else if (userData.role === 'agent' && profileData?.isAgentApproved) {
              setHasAccess(true);
              await fetchUpdates();
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

  const fetchPageSettings = async () => {
    const db = getFirebaseFirestore();
    const settingsDoc = await getDoc(doc(db, 'settings', 'agent-updates'));
    if (settingsDoc.exists()) {
      setPageSettings(settingsDoc.data() as PageSettings);
    }
  };

  const handleAddUpdate = async () => {
    if (!canEdit || !user) return;

    const db = getFirebaseFirestore();
    try {
      await addDoc(collection(db, 'agent_weekly_updates'), {
        ...formData,
        createdBy: user.uid,
        createdByEmail: user.email,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding update:', error);
      alert('Failed to add update');
    }
  };

  const handleEditUpdate = async () => {
    if (!canEdit || !selectedUpdate) return;

    const db = getFirebaseFirestore();
    try {
      await updateDoc(doc(db, 'agent_weekly_updates', selectedUpdate.id), {
        ...formData,
        updatedAt: Timestamp.now()
      });

      setShowEditModal(false);
      setSelectedUpdate(null);
      resetForm();
    } catch (error) {
      console.error('Error updating:', error);
      alert('Failed to update');
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!isAdmin) return;

    if (!confirm('Are you sure you want to delete this update?')) return;

    const db = getFirebaseFirestore();
    try {
      await deleteDoc(doc(db, 'agent_weekly_updates', updateId));
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete');
    }
  };

  const handleAddHeadOfAgent = async () => {
    if (!isAdmin || !newHeadEmail.trim()) return;

    const db = getFirebaseFirestore();
    try {
      const updatedEmails = [...pageSettings.headOfAgentEmails, newHeadEmail.trim()];
      await updateDoc(doc(db, 'settings', 'agent-updates'), {
        headOfAgentEmails: updatedEmails
      });

      setPageSettings({ headOfAgentEmails: updatedEmails });
      setNewHeadEmail('');
    } catch (error) {
      // Settings doc might not exist yet, create it
      try {
        await addDoc(collection(db, 'settings'), {
          headOfAgentEmails: [newHeadEmail.trim()]
        });
        setPageSettings({ headOfAgentEmails: [newHeadEmail.trim()] });
        setNewHeadEmail('');
      } catch (createError) {
        console.error('Error adding head of agent:', createError);
        alert('Failed to add head of agent');
      }
    }
  };

  const handleRemoveHeadOfAgent = async (email: string) => {
    if (!isAdmin) return;

    const db = getFirebaseFirestore();
    try {
      const updatedEmails = pageSettings.headOfAgentEmails.filter(e => e !== email);
      await updateDoc(doc(db, 'settings', 'agent-updates'), {
        headOfAgentEmails: updatedEmails
      });

      setPageSettings({ headOfAgentEmails: updatedEmails });
    } catch (error) {
      console.error('Error removing head of agent:', error);
      alert('Failed to remove head of agent');
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
          {user.role === 'agent' && !profile?.isAgentApproved && (
            <p className="text-sm text-orange-600 mt-2">
              Your agent profile is pending approval.
            </p>
          )}
        </div>
      </div>
    );
  }

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
                  <span>Add Update</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Updates Table */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Week Of
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Project Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Link
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Added By
                  </th>
                  {canEdit && (
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {updates.length === 0 ? (
                  <tr>
                    <td colSpan={canEdit ? 8 : 7} className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        <p className="text-lg font-medium mb-2">No updates yet</p>
                        <p className="text-sm">
                          {canEdit ? 'Click "Add Update" to create the first entry' : 'Check back later for updates'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  updates.map((update) => (
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
                        <span className="text-sm font-semibold text-black">
                          {update.projectName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                          {update.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{update.location}</span>
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
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500">
                          {update.createdByEmail}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(update)}
                              className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteUpdate(update.id)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete"
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

      {/* Add Update Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-center border-b-2 border-gray-200 px-8 py-6">
              <h2 className="text-2xl font-bold">Add Weekly Update</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Week Of
                </label>
                <input
                  type="date"
                  value={formData.weekOf}
                  onChange={(e) => setFormData({ ...formData, weekOf: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="E.g., Website Redesign for Tech Startup"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Platform *
                </label>
                <input
                  type="text"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  placeholder="E.g., Upwork, Fiverr, Direct Client"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="E.g., San Francisco, CA or Remote"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Link
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional details, status updates, or important information..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-4 border-t-2 border-gray-200 px-8 py-6">
              <button
                onClick={handleAddUpdate}
                disabled={!formData.projectName || !formData.platform || !formData.location}
                className="flex-1 bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Update
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

      {/* Edit Update Modal */}
      {showEditModal && selectedUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-center border-b-2 border-gray-200 px-8 py-6">
              <h2 className="text-2xl font-bold">Edit Update</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Week Of
                </label>
                <input
                  type="date"
                  value={formData.weekOf}
                  onChange={(e) => setFormData({ ...formData, weekOf: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Platform *
                </label>
                <input
                  type="text"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Link
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-4 border-t-2 border-gray-200 px-8 py-6">
              <button
                onClick={handleEditUpdate}
                disabled={!formData.projectName || !formData.platform || !formData.location}
                className="flex-1 bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
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

      {/* Manage Editors Modal (Admin Only) */}
      {showSettingsModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-center border-b-2 border-gray-200 px-8 py-6">
              <div>
                <h2 className="text-2xl font-bold">Manage Editors</h2>
                <p className="text-sm text-gray-600 mt-1">Assign agents who can update this page</p>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Add Head of Agent Email
                </label>
                <div className="flex space-x-3">
                  <input
                    type="email"
                    value={newHeadEmail}
                    onChange={(e) => setNewHeadEmail(e.target.value)}
                    placeholder="agent@example.com"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
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
