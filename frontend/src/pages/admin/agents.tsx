import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '@/components/Logo';
import {
  CheckCircle, XCircle, Clock, User, MapPin, Briefcase, Monitor,
  Mail, Phone, Globe, Calendar, Award, Filter, Search, X, ArrowLeft, Trash2,
  Tag, Save, Plus, RotateCcw, AlertTriangle
} from 'lucide-react';
import { getFirebaseFirestore } from '@/lib/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, Timestamp, deleteDoc } from 'firebase/firestore';
import { Profile } from '@/types';

interface AgentApplication extends Profile {
  user: {
    email: string;
    createdAt: Timestamp;
  };
  categories?: string[];
  rejectionReason?: string;
  rejectedAt?: Timestamp;
  rejectedBy?: string;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: {
    status: string;
    location: string;
    categories: string[];
  };
}

export default function AdminAgents() {
  const router = useRouter();
  const [applications, setApplications] = useState<AgentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentApplication | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingStats, setEditingStats] = useState(false);
  const [agentStats, setAgentStats] = useState({
    successRate: 0,
    totalClients: 0,
    rating: 0,
    isFree: true,
    basePrice: 100,
    responseTime: '< 24 hours'
  });

  // Category management
  const [availableCategories, setAvailableCategories] = useState<string[]>([
    'Priority', 'High Potential', 'Needs Follow-up', 'Top Performer', 'New Agent'
  ]);
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [editingCategories, setEditingCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Saved filters
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
  const [filterName, setFilterName] = useState('');

  // Rejection
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [agentToReject, setAgentToReject] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
    loadSavedFilters();
    loadAvailableCategories();
  }, [filter]);

  const loadSavedFilters = () => {
    try {
      const saved = localStorage.getItem('adminAgentFilters');
      if (saved) {
        setSavedFilters(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
  };

  const loadAvailableCategories = () => {
    try {
      const saved = localStorage.getItem('adminAgentCategories');
      if (saved) {
        setAvailableCategories(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const saveFilterGroup = () => {
    if (!filterName.trim()) {
      alert('Please enter a filter name');
      return;
    }

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName,
      filters: {
        status: filter,
        location: locationFilter,
        categories: categoryFilter
      }
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem('adminAgentFilters', JSON.stringify(updated));
    setFilterName('');
    setShowSaveFilterModal(false);
    alert('Filter saved successfully!');
  };

  const applySavedFilter = (savedFilter: SavedFilter) => {
    setFilter(savedFilter.filters.status as any);
    setLocationFilter(savedFilter.filters.location);
    setCategoryFilter(savedFilter.filters.categories);
  };

  const deleteSavedFilter = (filterId: string) => {
    if (!confirm('Delete this saved filter?')) return;
    const updated = savedFilters.filter(f => f.id !== filterId);
    setSavedFilters(updated);
    localStorage.setItem('adminAgentFilters', JSON.stringify(updated));
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    if (availableCategories.includes(newCategory.trim())) {
      alert('This category already exists');
      return;
    }
    const updated = [...availableCategories, newCategory.trim()];
    setAvailableCategories(updated);
    localStorage.setItem('adminAgentCategories', JSON.stringify(updated));
    setNewCategory('');
    setShowCategoryInput(false);
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const db = getFirebaseFirestore();

      // First, get all users with role === 'agent'
      const usersQuery = query(collection(db, 'users'), where('role', '==', 'agent'));
      const usersSnapshot = await getDocs(usersQuery);

      const apps: AgentApplication[] = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();

        // Get the profile for this agent
        const profileDoc = await getDoc(doc(db, 'profiles', userDoc.id));

        if (profileDoc.exists()) {
          const profileData = profileDoc.data() as Profile;

          // Determine if this agent is "rejected"
          const isRejected = profileData.agentVerificationStatus === 'rejected' ||
                           (userData as any).isRejected === true;

          // Filter by verification status if needed
          if (filter === 'rejected') {
            if (!isRejected) continue;
          } else if (filter === 'all') {
            // Show all
          } else {
            // For pending/verified, exclude rejected
            if (isRejected) continue;
            if (profileData.agentVerificationStatus !== filter) continue;
          }

          apps.push({
            ...profileData,
            user: {
              email: userData.email,
              createdAt: userData.createdAt,
            },
            categories: (userData as any).categories || [],
            rejectionReason: (userData as any).rejectionReason || profileData.agentRejectedReason,
            rejectedAt: (userData as any).rejectedAt,
            rejectedBy: (userData as any).rejectedBy
          });
        }
      }

      setApplications(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (agentUid: string) => {
    if (!confirm('Are you sure you want to approve this agent?')) return;

    try {
      setActionLoading(true);
      const db = getFirebaseFirestore();

      await updateDoc(doc(db, 'profiles', agentUid), {
        agentVerificationStatus: 'verified',
        isAgentApproved: true,
        agentVerifiedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Also update user document - set isAgentApproved for agents and clear rejection
      await updateDoc(doc(db, 'users', agentUid), {
        isAgentApproved: true,
        agentApprovedAt: Timestamp.now(),
        isRejected: false,
        rejectionReason: null,
        rejectedAt: null,
        rejectedBy: null,
        updatedAt: Timestamp.now(),
      });

      alert('Agent approved successfully!');
      setSelectedAgent(null);
      fetchApplications();
    } catch (error: any) {
      console.error('Error approving agent:', error);
      alert('Failed to approve agent: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (agentUid: string) => {
    setAgentToReject(agentUid);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!agentToReject) return;

    try {
      setActionLoading(true);
      const db = getFirebaseFirestore();

      await updateDoc(doc(db, 'profiles', agentToReject), {
        agentVerificationStatus: 'rejected',
        isAgentApproved: false,
        agentRejectedReason: rejectReason,
        updatedAt: Timestamp.now(),
      });

      await updateDoc(doc(db, 'users', agentToReject), {
        isRejected: true,
        rejectionReason: rejectReason,
        rejectedAt: Timestamp.now(),
        rejectedBy: 'admin',
        updatedAt: Timestamp.now(),
      });

      alert('Agent rejected.');
      setShowRejectModal(false);
      setAgentToReject(null);
      setRejectReason('');
      setSelectedAgent(null);
      fetchApplications();
    } catch (error: any) {
      console.error('Error rejecting agent:', error);
      alert('Failed to reject agent: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnreject = async (agentUid: string) => {
    if (!confirm('Are you sure you want to unreject this agent? They will be moved back to pending status.')) return;

    try {
      setActionLoading(true);
      const db = getFirebaseFirestore();

      await updateDoc(doc(db, 'profiles', agentUid), {
        agentVerificationStatus: 'pending',
        isAgentApproved: false,
        agentRejectedReason: null,
        updatedAt: Timestamp.now(),
      });

      await updateDoc(doc(db, 'users', agentUid), {
        isRejected: false,
        rejectionReason: null,
        rejectedAt: null,
        rejectedBy: null,
        updatedAt: Timestamp.now(),
      });

      alert('Agent moved back to pending status.');
      setSelectedAgent(null);
      fetchApplications();
    } catch (error: any) {
      console.error('Error unrejecting agent:', error);
      alert('Failed to unreject agent: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAgent = async (agentUid: string) => {
    const confirmText = prompt(
      'WARNING: This will permanently delete this agent account. They will need to register again for access.\n\nType "DELETE" to confirm:'
    );

    if (confirmText !== 'DELETE') return;

    try {
      setActionLoading(true);
      const db = getFirebaseFirestore();

      // Delete profile document
      await deleteDoc(doc(db, 'profiles', agentUid));

      // Delete user document
      await deleteDoc(doc(db, 'users', agentUid));

      // Delete any agent assignments
      const assignmentsQuery = query(
        collection(db, 'agentAssignments'),
        where('agentId', '==', agentUid)
      );
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      for (const assignmentDoc of assignmentsSnapshot.docs) {
        await deleteDoc(doc(db, 'agentAssignments', assignmentDoc.id));
      }

      alert('Agent account deleted successfully. They will need to register again.');
      setSelectedAgent(null);
      fetchApplications();
    } catch (error: any) {
      console.error('Error deleting agent:', error);
      alert('Failed to delete agent: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStats = async () => {
    if (!selectedAgent) return;

    try {
      setActionLoading(true);
      const db = getFirebaseFirestore();

      await updateDoc(doc(db, 'profiles', selectedAgent.uid), {
        agentSuccessRate: agentStats.successRate,
        agentTotalClients: agentStats.totalClients,
        averageRating: agentStats.rating,
        isFree: agentStats.isFree,
        agentPricing: {
          basePrice: agentStats.basePrice,
          currency: 'USD'
        },
        agentResponseTime: agentStats.responseTime,
        updatedAt: Timestamp.now(),
      });

      alert('Agent stats updated successfully!');
      setEditingStats(false);
      fetchApplications();
    } catch (error: any) {
      console.error('Error updating agent stats:', error);
      alert('Failed to update stats: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCategories = async () => {
    if (!selectedAgent) return;

    try {
      setActionLoading(true);
      const db = getFirebaseFirestore();

      await updateDoc(doc(db, 'users', selectedAgent.uid), {
        categories: selectedCategories,
        updatedAt: Timestamp.now(),
      });

      alert('Categories updated successfully!');
      setEditingCategories(false);
      fetchApplications();
      // Update selected agent
      setSelectedAgent({ ...selectedAgent, categories: selectedCategories });
    } catch (error: any) {
      console.error('Error updating categories:', error);
      alert('Failed to update categories: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Get unique locations
  const uniqueLocations = Array.from(
    new Set(
      applications
        .filter(app => app.city && app.country)
        .map(app => `${app.city}, ${app.country}`)
    )
  ).sort();

  const filteredApplications = applications.filter(app => {
    // Search filter
    const matchesSearch =
      app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Location filter
    const matchesLocation = locationFilter === 'all' ||
      `${app.city}, ${app.country}` === locationFilter;

    // Category filter
    const matchesCategory = categoryFilter.length === 0 ||
      categoryFilter.some(cat => app.categories?.includes(cat));

    return matchesSearch && matchesLocation && matchesCategory;
  });

  return (
    <>
      <Head>
        <title>Admin - Agent Applications | RemoteWorks</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Logo showText={false} size="lg" />
                <button
                  onClick={() => router.push('/admin')}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Admin Panel</span>
                <button
                  onClick={() => router.push('/')}
                  className="text-sm font-medium text-black hover:text-gray-600"
                >
                  Exit Admin
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Agent Applications</h1>
            <p className="text-gray-600">Review and manage agent verification requests</p>
          </div>

          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-black text-sm">Quick Filters</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {savedFilters.map(sf => (
                  <div key={sf.id} className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1">
                    <button
                      onClick={() => applySavedFilter(sf)}
                      className="text-sm font-medium text-blue-700 hover:text-blue-800"
                    >
                      {sf.name}
                    </button>
                    <button
                      onClick={() => deleteSavedFilter(sf.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col gap-4">
              {/* Filter Tabs */}
              <div className="flex space-x-2 overflow-x-auto">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'verified', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' }
                ].map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setFilter(tab.value as any)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                      filter === tab.value
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search and Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="all">All Locations</option>
                    {uniqueLocations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                  <div className="relative">
                    <select
                      multiple
                      value={categoryFilter}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        setCategoryFilter(selected);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      size={1}
                    >
                      <option value="">All Categories</option>
                      {availableCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {(categoryFilter.length > 0 || locationFilter !== 'all') && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {locationFilter !== 'all' && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {locationFilter}
                      <button onClick={() => setLocationFilter('all')} className="hover:text-purple-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {categoryFilter.map(cat => (
                    <span key={cat} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {cat}
                      <button onClick={() => setCategoryFilter(categoryFilter.filter(c => c !== cat))} className="hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => {
                      setLocationFilter('all');
                      setCategoryFilter([]);
                    }}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Save Current Filter */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowSaveFilterModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save Current Filters
                </button>
              </div>
            </div>
          </div>

          {/* Applications List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              <p className="mt-4 text-gray-600">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-600">No applications found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredApplications.map((app) => (
                <div
                  key={app.uid}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedAgent(app)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-black">
                          {app.firstName} {app.lastName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          app.agentVerificationStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : app.agentVerificationStatus === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {app.agentVerificationStatus}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>{app.user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{app.city}, {app.country}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Briefcase className="w-4 h-4" />
                          <span>{app.yearsOfExperience} years experience</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4" />
                          <span>{app.education}</span>
                        </div>
                      </div>

                      {/* Categories */}
                      {app.categories && app.categories.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {app.categories.map(category => (
                            <span key={category} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {category}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {app.platformsExperience?.slice(0, 3).map(platform => (
                          <span key={platform} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {platform}
                          </span>
                        ))}
                        {app.platformsExperience && app.platformsExperience.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{app.platformsExperience.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {app.agentVerificationStatus === 'pending' && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(app.uid);
                          }}
                          disabled={actionLoading}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openRejectModal(app.uid);
                          }}
                          disabled={actionLoading}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {app.agentVerificationStatus === 'rejected' && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnreject(app.uid);
                          }}
                          disabled={actionLoading}
                          className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                          title="Unreject (Move to Pending)"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedAgent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-black">Agent Details</h2>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-bold text-black mb-3">Basic Information</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <p className="font-medium">{selectedAgent.firstName} {selectedAgent.lastName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium">{selectedAgent.user.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="font-medium">{selectedAgent.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <p className="font-medium">{selectedAgent.city}, {selectedAgent.country}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Timezone:</span>
                      <p className="font-medium">{selectedAgent.timezone?.trim() || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Signup Date:</span>
                      <p className="font-medium">{selectedAgent.user.createdAt.toDate().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Category Management */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold text-black flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      Categories
                    </h3>
                    {!editingCategories ? (
                      <button
                        onClick={() => {
                          setSelectedCategories(selectedAgent.categories || []);
                          setEditingCategories(true);
                        }}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Edit Categories
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateCategories}
                          disabled={actionLoading}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingCategories(false)}
                          disabled={actionLoading}
                          className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {editingCategories ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {availableCategories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => {
                              if (selectedCategories.includes(cat)) {
                                setSelectedCategories(selectedCategories.filter(c => c !== cat));
                              } else {
                                setSelectedCategories([...selectedCategories, cat]);
                              }
                            }}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                              selectedCategories.includes(cat)
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-purple-600 border border-purple-300 hover:border-purple-600'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {showCategoryInput ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="New category name..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                          />
                          <button
                            onClick={addCategory}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setShowCategoryInput(false);
                              setNewCategory('');
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowCategoryInput(true)}
                          className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Create New Category
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedAgent.categories && selectedAgent.categories.length > 0 ? (
                        selectedAgent.categories.map(cat => (
                          <span key={cat} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                            {cat}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">No categories assigned</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <h3 className="text-lg font-bold text-black mb-3">Bio</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedAgent.bio}</p>
                </div>

                {/* Verification Documents */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-black mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Verification Documents
                  </h3>
                  <div className="space-y-4">
                    {/* ID Verification */}
                    <div>
                      <span className="text-gray-600 text-sm block mb-2">ID Verification / Selfie:</span>
                      {selectedAgent.idVerificationURL ? (
                        <div className="bg-white p-3 rounded-lg border border-yellow-100">
                          <a
                            href={selectedAgent.idVerificationURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-2"
                          >
                            <Globe className="w-4 h-4" />
                            View ID Document
                          </a>
                          <img
                            src={selectedAgent.idVerificationURL}
                            alt="ID Verification"
                            className="mt-2 max-w-md rounded-lg border border-gray-200"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Not uploaded</p>
                      )}
                    </div>

                    {/* Proof of Experience */}
                    <div>
                      <span className="text-gray-600 text-sm block mb-2">Proof of Experience:</span>
                      {selectedAgent.proofOfExperienceURLs && selectedAgent.proofOfExperienceURLs.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-3">
                          {selectedAgent.proofOfExperienceURLs.map((url, index) => (
                            <div key={index} className="bg-white p-3 rounded-lg border border-yellow-100">
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-2 mb-2"
                              >
                                <Globe className="w-4 h-4" />
                                Document {index + 1}
                              </a>
                              <img
                                src={url}
                                alt={`Proof ${index + 1}`}
                                className="max-w-full rounded-lg border border-gray-200"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Not uploaded</p>
                      )}
                    </div>

                    {/* Certifications */}
                    <div>
                      <span className="text-gray-600 text-sm block mb-2">Certifications:</span>
                      {selectedAgent.certificationURLs && selectedAgent.certificationURLs.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-3">
                          {selectedAgent.certificationURLs.map((url, index) => (
                            <div key={index} className="bg-white p-3 rounded-lg border border-yellow-100">
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-2 mb-2"
                              >
                                <Globe className="w-4 h-4" />
                                Certificate {index + 1}
                              </a>
                              <img
                                src={url}
                                alt={`Certificate ${index + 1}`}
                                className="max-w-full rounded-lg border border-gray-200"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Not uploaded</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Professional Info */}
                <div>
                  <h3 className="text-lg font-bold text-black mb-3">Professional Background</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Experience:</span>
                      <p className="font-medium">{selectedAgent.yearsOfExperience} years</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Education:</span>
                      <p className="font-medium">{selectedAgent.education}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Languages:</span>
                      <p className="font-medium">{selectedAgent.languagesSpoken?.join(', ') || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Technical Setup */}
                <div>
                  <h3 className="text-lg font-bold text-black mb-3">Technical Setup</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Devices:</span>
                      <p className="font-medium">{selectedAgent.devices?.join(', ') || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Website/Portfolio:</span>
                      <p className="font-medium">
                        {selectedAgent.website ? (
                          <a href={selectedAgent.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {selectedAgent.website}
                          </a>
                        ) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">LinkedIn:</span>
                      <p className="font-medium">
                        {selectedAgent.linkedin ? (
                          <a href={selectedAgent.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {selectedAgent.linkedin}
                          </a>
                        ) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">PayPal Email:</span>
                      <p className="font-medium">{selectedAgent.paypalEmail || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Platforms & Specializations */}
                <div>
                  <h3 className="text-lg font-bold text-black mb-3">Expertise</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-600 text-sm block mb-2">Platforms Experience:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedAgent.platformsExperience?.map(platform => (
                          <span key={platform} className="px-3 py-1 bg-black text-white text-xs rounded-full">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm block mb-2">Specializations:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedAgent.specializations?.map(spec => (
                          <span key={spec} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Accounts Status */}
                {selectedAgent.platformsAccounts && Object.keys(selectedAgent.platformsAccounts).length > 0 && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-black mb-3 flex items-center gap-2">
                      <Monitor className="w-5 h-5" />
                      Platform Accounts & Status
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {Object.entries(selectedAgent.platformsAccounts).map(([platform, status]) => (
                        <div key={platform} className="bg-white p-3 rounded-lg border border-indigo-100 flex items-center justify-between">
                          <span className="font-medium text-gray-900">{platform}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {String(status).toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability & Rates */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-black mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Availability & Working Hours
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-3 rounded-lg">
                      <span className="text-gray-600 block mb-1">Working Hours:</span>
                      <p className="font-medium text-lg">{selectedAgent.workingHours?.trim() || 'Not specified'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <span className="text-gray-600 block mb-1">Response Time:</span>
                      <p className="font-medium text-lg">{selectedAgent.agentResponseTime?.trim() || 'Not specified'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <span className="text-gray-600 block mb-1">Timezone:</span>
                      <p className="font-medium text-lg">{selectedAgent.timezone?.trim() || 'Not specified'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <span className="text-gray-600 block mb-1">Internet Speed:</span>
                      <p className="font-medium text-lg">{selectedAgent.internetSpeed?.trim() || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Agent Stats (Editable by Admin) */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold text-black">Agent Performance Stats</h3>
                    {!editingStats ? (
                      <button
                        onClick={() => {
                          setAgentStats({
                            successRate: selectedAgent.agentSuccessRate || 0,
                            totalClients: selectedAgent.agentTotalClients || 0,
                            rating: selectedAgent.averageRating || 0,
                            isFree: selectedAgent.isFree !== undefined ? selectedAgent.isFree : true,
                            basePrice: selectedAgent.agentPricing?.basePrice || 100,
                            responseTime: selectedAgent.agentResponseTime || '< 24 hours'
                          });
                          setEditingStats(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Edit Stats
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateStats}
                          disabled={actionLoading}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingStats(false)}
                          disabled={actionLoading}
                          className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {editingStats ? (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Success Rate (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={agentStats.successRate}
                            onChange={(e) => setAgentStats({ ...agentStats, successRate: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total Clients
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={agentStats.totalClients}
                            onChange={(e) => setAgentStats({ ...agentStats, totalClients: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rating (0-5)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={agentStats.rating}
                            onChange={(e) => setAgentStats({ ...agentStats, rating: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Response Time
                          </label>
                          <input
                            type="text"
                            value={agentStats.responseTime}
                            onChange={(e) => setAgentStats({ ...agentStats, responseTime: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="< 24 hours"
                          />
                        </div>
                      </div>

                      {/* Pricing Section */}
                      <div className="border-t border-blue-300 pt-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Service Type
                            </label>
                            <div className="flex items-center space-x-4">
                              <button
                                type="button"
                                onClick={() => setAgentStats({ ...agentStats, isFree: true })}
                                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                                  agentStats.isFree
                                    ? 'bg-green-600 text-white border-2 border-green-700'
                                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                100% Free
                              </button>
                              <button
                                type="button"
                                onClick={() => setAgentStats({ ...agentStats, isFree: false })}
                                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                                  !agentStats.isFree
                                    ? 'bg-blue-600 text-white border-2 border-blue-700'
                                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                Paid Service
                              </button>
                            </div>
                          </div>

                          {!agentStats.isFree && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Base Price (USD)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={agentStats.basePrice}
                                onChange={(e) => setAgentStats({ ...agentStats, basePrice: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Per successful placement"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white p-3 rounded-lg">
                          <span className="text-gray-600 text-sm">Success Rate:</span>
                          <p className="text-2xl font-bold text-green-600">{selectedAgent.agentSuccessRate || 0}%</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <span className="text-gray-600 text-sm">Total Clients:</span>
                          <p className="text-2xl font-bold text-blue-600">{selectedAgent.agentTotalClients || 0}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <span className="text-gray-600 text-sm">Rating:</span>
                          <p className="text-2xl font-bold text-yellow-600">{selectedAgent.averageRating || 0}/5</p>
                        </div>
                      </div>

                      {/* Pricing Display */}
                      <div className="bg-white p-4 rounded-lg border-t border-blue-300">
                        <span className="text-gray-600 text-sm block mb-2">Service Type:</span>
                        {(selectedAgent.isFree !== undefined ? selectedAgent.isFree : true) ? (
                          <div className="inline-flex items-center px-4 py-2 bg-green-50 border-2 border-green-200 rounded-lg">
                            <p className="text-lg font-bold text-green-700">100% Free</p>
                            <span className="ml-2 text-xs text-green-600">No charges - Complimentary service</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg">
                            <p className="text-lg font-bold text-blue-700">${selectedAgent.agentPricing?.basePrice || 100}</p>
                            <span className="ml-2 text-xs text-blue-600">Per successful placement</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {selectedAgent.agentVerificationStatus === 'pending' && (
                  <div className="flex space-x-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApprove(selectedAgent.uid)}
                      disabled={actionLoading}
                      className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Approve Agent
                    </button>
                    <button
                      onClick={() => openRejectModal(selectedAgent.uid)}
                      disabled={actionLoading}
                      className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Reject Agent
                    </button>
                  </div>
                )}

                {selectedAgent.agentVerificationStatus === 'rejected' && (
                  <>
                    {selectedAgent.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          Rejection Reason:
                        </h4>
                        <p className="text-sm text-red-700">{selectedAgent.rejectionReason}</p>
                        {selectedAgent.rejectedAt && (
                          <p className="text-xs text-red-600 mt-2">
                            Rejected on: {selectedAgent.rejectedAt.toDate().toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="flex space-x-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleUnreject(selectedAgent.uid)}
                        disabled={actionLoading}
                        className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Unreject (Move to Pending)
                      </button>
                    </div>
                  </>
                )}

                {/* Delete Action - Available for all agents */}
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <button
                    onClick={() => handleDeleteAgent(selectedAgent.uid)}
                    disabled={actionLoading}
                    className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Delete Agent Account
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    This will permanently delete the account. They will need to re-register.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-black">Reject Agent</h2>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setAgentToReject(null);
                    setRejectReason('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason (Optional)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Explain why this agent is being rejected..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setAgentToReject(null);
                      setRejectReason('');
                    }}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {actionLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Agent
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Filter Modal */}
        {showSaveFilterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-black">Save Filter Group</h2>
                <button
                  onClick={() => {
                    setShowSaveFilterModal(false);
                    setFilterName('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter Group Name
                  </label>
                  <input
                    type="text"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    placeholder="e.g., High Priority Agents"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Current Filters:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Status: <span className="font-medium">{filter}</span></li>
                    <li>Location: <span className="font-medium">{locationFilter === 'all' ? 'All' : locationFilter}</span></li>
                    <li>Categories: <span className="font-medium">{categoryFilter.length === 0 ? 'All' : categoryFilter.join(', ')}</span></li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowSaveFilterModal(false);
                      setFilterName('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveFilterGroup}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Filter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
