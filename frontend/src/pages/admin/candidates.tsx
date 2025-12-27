import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '@/components/Logo';
import {
  CheckCircle, XCircle, Clock, User, MapPin, Mail, Calendar,
  Award, Filter, Search, X, Shield, AlertCircle, Users, Star, Trash2, FileText,
  Tag, Save, Plus, RotateCcw, AlertTriangle, MessageSquare
} from 'lucide-react';
import { getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, Timestamp, setDoc, deleteDoc } from 'firebase/firestore';
import { User as UserType } from '@/types';

interface CandidateWithProfile extends UserType {
  profile?: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    city?: string;
    country?: string;
    phone?: string;
  };
  assignedAgents?: string[];
  categories?: string[];
  rejectionReason?: string;
  rejectedAt?: Timestamp;
  rejectedBy?: string;
  isRejected?: boolean;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  rating: number;
  verified: boolean;
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

export default function AdminCandidates() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [candidates, setCandidates] = useState<CandidateWithProfile[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'date_range' | 'uncategorized'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);

  // Date range filtering
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  // Category management
  const [availableCategories, setAvailableCategories] = useState<string[]>([
    'Priority', 'High Potential', 'Needs Follow-up', 'Interview Ready', 'New Candidate'
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
  const [candidateToReject, setCandidateToReject] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchCandidates();
      loadSavedFilters();
      loadAvailableCategories();
    }
  }, [filter, isAdmin]);

  const loadSavedFilters = () => {
    try {
      const saved = localStorage.getItem('adminCandidateFilters');
      if (saved) {
        setSavedFilters(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
  };

  const loadAvailableCategories = () => {
    try {
      const saved = localStorage.getItem('adminCandidateCategories');
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
    localStorage.setItem('adminCandidateFilters', JSON.stringify(updated));
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
    localStorage.setItem('adminCandidateFilters', JSON.stringify(updated));
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    if (availableCategories.includes(newCategory.trim())) {
      alert('This category already exists');
      return;
    }
    const updated = [...availableCategories, newCategory.trim()];
    setAvailableCategories(updated);
    localStorage.setItem('adminCandidateCategories', JSON.stringify(updated));
    setNewCategory('');
    setShowCategoryInput(false);
  };

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

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const db = getFirebaseFirestore();

      // Get all users with role 'candidate'
      const usersQuery = query(collection(db, 'users'), where('role', '==', 'candidate'));
      const usersSnapshot = await getDocs(usersQuery);

      const candidateList: CandidateWithProfile[] = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data() as UserType;

        // Determine if this candidate is "rejected"
        const isRejected = (userData as any).isRejected === true;

        // Apply filter
        if (filter === 'rejected') {
          if (!isRejected) continue;
        } else if (filter === 'pending') {
          if (isRejected || userData.isCandidateApproved) continue;
        } else if (filter === 'approved') {
          if (isRejected || !userData.isCandidateApproved) continue;
        } else if (filter === 'date_range') {
          // Filter for users who joined within custom date range
          const userCreatedAt = userData.createdAt?.toDate?.() || new Date(0);

          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (userCreatedAt < start) continue;
          }

          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (userCreatedAt > end) continue;
          }

          // Exclude uncategorized candidates from date range filter
          const categories = (userData as any).categories || [];
          if (categories.length === 0) continue;
        } else if (filter === 'uncategorized') {
          // Filter for candidates without any categories assigned
          const categories = (userData as any).categories || [];
          if (categories.length > 0) continue;
          // Also exclude rejected candidates from uncategorized view
          if (isRejected) continue;
        } else if (filter === 'all') {
          // Show all except explicitly filter logic
        }

        // Try to get profile data if exists
        const profileDoc = await getDoc(doc(db, 'profiles', userData.uid));
        const profileData = profileDoc.exists() ? profileDoc.data() : {};

        candidateList.push({
          ...userData,
          ...profileData,
          profile: {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            bio: profileData.bio,
            city: profileData.city,
            country: profileData.country,
            phone: profileData.phone,
          },
          assignedAgents: (userData as any).assignedAgents || [],
          categories: (userData as any).categories || [],
          rejectionReason: (userData as any).rejectionReason,
          rejectedAt: (userData as any).rejectedAt,
          rejectedBy: (userData as any).rejectedBy,
          isRejected: isRejected
        });
      }

      setCandidates(candidateList);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (candidateUid: string) => {
    if (!confirm('Are you sure you want to approve this candidate?')) return;

    try {
      setActionLoading(true);
      const db = getFirebaseFirestore();

      // Update users collection
      await updateDoc(doc(db, 'users', candidateUid), {
        isCandidateApproved: true,
        candidateApprovedAt: Timestamp.now(),
        isRejected: false,
        rejectionReason: null,
        rejectedAt: null,
        rejectedBy: null,
        updatedAt: Timestamp.now(),
      });

      // Also update profiles collection for consistency
      await updateDoc(doc(db, 'profiles', candidateUid), {
        isVerified: true,
        verificationStatus: 'approved',
        candidateApprovedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      alert('Candidate approved successfully!');
      setSelectedCandidate(null);
      fetchCandidates();
    } catch (error: any) {
      console.error('Error approving candidate:', error);
      alert('Failed to approve candidate: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (candidateUid: string) => {
    setCandidateToReject(candidateUid);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!candidateToReject) return;

    try {
      setActionLoading(true);
      const db = getFirebaseFirestore();

      // Update users collection
      await updateDoc(doc(db, 'users', candidateToReject), {
        isCandidateApproved: false,
        isRejected: true,
        rejectionReason: rejectReason,
        rejectedAt: Timestamp.now(),
        rejectedBy: 'admin',
        updatedAt: Timestamp.now(),
      });

      // Also update profiles collection for consistency
      await updateDoc(doc(db, 'profiles', candidateToReject), {
        isVerified: false,
        verificationStatus: 'rejected',
        updatedAt: Timestamp.now(),
      });

      alert('Candidate rejected.');
      setShowRejectModal(false);
      setCandidateToReject(null);
      setRejectReason('');
      setSelectedCandidate(null);
      fetchCandidates();
    } catch (error: any) {
      console.error('Error rejecting candidate:', error);
      alert('Failed to reject candidate: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnreject = async (candidateUid: string) => {
    if (!confirm('Are you sure you want to unreject this candidate? They will be moved back to pending status.')) return;

    try {
      setActionLoading(true);
      const db = getFirebaseFirestore();

      // Update users collection
      await updateDoc(doc(db, 'users', candidateUid), {
        isCandidateApproved: false,
        isRejected: false,
        rejectionReason: null,
        rejectedAt: null,
        rejectedBy: null,
        updatedAt: Timestamp.now(),
      });

      // Also update profiles collection
      await updateDoc(doc(db, 'profiles', candidateUid), {
        isVerified: false,
        verificationStatus: 'pending',
        updatedAt: Timestamp.now(),
      });

      alert('Candidate moved back to pending status.');
      setSelectedCandidate(null);
      fetchCandidates();
    } catch (error: any) {
      console.error('Error unrejecting candidate:', error);
      alert('Failed to unreject candidate: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCategories = async () => {
    if (!selectedCandidate) return;

    try {
      setActionLoading(true);
      const db = getFirebaseFirestore();

      await updateDoc(doc(db, 'users', selectedCandidate.uid), {
        categories: selectedCategories,
        updatedAt: Timestamp.now(),
      });

      alert('Categories updated successfully!');
      setEditingCategories(false);
      fetchCandidates();
      // Update selected candidate
      setSelectedCandidate({ ...selectedCandidate, categories: selectedCategories });
    } catch (error: any) {
      console.error('Error updating categories:', error);
      alert('Failed to update categories: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchAvailableAgents = async () => {
    try {
      const db = getFirebaseFirestore();
      const agentsQuery = query(collection(db, 'users'), where('role', '==', 'agent'));
      const agentsSnapshot = await getDocs(agentsQuery);

      const agentsList: Agent[] = [];
      for (const userDoc of agentsSnapshot.docs) {
        const userData = userDoc.data();
        const profileDoc = await getDoc(doc(db, 'profiles', userDoc.id));
        const profileData = profileDoc.exists() ? profileDoc.data() : {};

        if (profileData.isAgentApproved || profileData.agentVerificationStatus === 'verified') {
          agentsList.push({
            id: userDoc.id,
            name: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || userData.email,
            email: userData.email,
            rating: profileData.averageRating || 0,
            verified: true
          });
        }
      }

      setAvailableAgents(agentsList);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const assignAgentToCandidate = async (candidateUid: string, agentId: string) => {
    if (!agentId) {
      alert('Please select an agent');
      return;
    }

    try {
      setActionLoading(true);
      const db = getFirebaseFirestore();

      // Get current assignments
      const candidateDoc = await getDoc(doc(db, 'users', candidateUid));
      const currentData = candidateDoc.data();
      const currentAssignments = currentData?.assignedAgents || [];

      // Check if already assigned
      if (currentAssignments.includes(agentId)) {
        alert('This agent is already assigned to this candidate');
        return;
      }

      // Add to assignments
      await updateDoc(doc(db, 'users', candidateUid), {
        assignedAgents: [...currentAssignments, agentId],
        updatedAt: Timestamp.now()
      });

      // Create assignment record for tracking
      await setDoc(doc(db, 'agentAssignments', `${candidateUid}_${agentId}`), {
        candidateId: candidateUid,
        agentId: agentId,
        assignedAt: Timestamp.now(),
        assignedBy: 'admin',
        status: 'active'
      });

      alert('Agent assigned successfully!');
      setSelectedAgentId('');
      fetchCandidates();
    } catch (error: any) {
      console.error('Error assigning agent:', error);
      alert('Failed to assign agent: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const unassignAgent = async (candidateUid: string, agentId: string) => {
    if (!confirm('Are you sure you want to unassign this agent?')) return;

    try {
      setActionLoading(true);
      const db = getFirebaseFirestore();

      const candidateDoc = await getDoc(doc(db, 'users', candidateUid));
      const currentData = candidateDoc.data();
      const currentAssignments = currentData?.assignedAgents || [];

      await updateDoc(doc(db, 'users', candidateUid), {
        assignedAgents: currentAssignments.filter((id: string) => id !== agentId),
        updatedAt: Timestamp.now()
      });

      alert('Agent unassigned successfully!');
      fetchCandidates();
    } catch (error: any) {
      console.error('Error unassigning agent:', error);
      alert('Failed to unassign agent: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCandidate = async (candidateUid: string) => {
    const confirmText = prompt(
      'WARNING: This will permanently delete this candidate account. They will need to register again for access.\n\nType "DELETE" to confirm:'
    );

    if (confirmText !== 'DELETE') return;

    try {
      setActionLoading(true);
      const db = getFirebaseFirestore();

      // Delete profile document
      await deleteDoc(doc(db, 'profiles', candidateUid));

      // Delete user document
      await deleteDoc(doc(db, 'users', candidateUid));

      // Delete any agent assignments
      const assignmentsQuery = query(
        collection(db, 'agentAssignments'),
        where('candidateId', '==', candidateUid)
      );
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      for (const assignmentDoc of assignmentsSnapshot.docs) {
        await deleteDoc(doc(db, 'agentAssignments', assignmentDoc.id));
      }

      alert('Candidate account deleted successfully. They will need to register again.');
      setSelectedCandidate(null);
      fetchCandidates();
    } catch (error: any) {
      console.error('Error deleting candidate:', error);
      alert('Failed to delete candidate: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && selectedCandidate) {
      fetchAvailableAgents();
    }
  }, [isAdmin, selectedCandidate]);

  // Get unique locations
  const uniqueLocations = Array.from(
    new Set(
      candidates
        .filter(c => c.profile?.city && c.profile?.country)
        .map(c => `${c.profile?.city}, ${c.profile?.country}`)
    )
  ).sort();

  const filteredCandidates = candidates.filter(candidate => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      candidate.email.toLowerCase().includes(searchLower) ||
      candidate.displayName?.toLowerCase().includes(searchLower) ||
      candidate.profile?.firstName?.toLowerCase().includes(searchLower) ||
      candidate.profile?.lastName?.toLowerCase().includes(searchLower);

    // Location filter
    const matchesLocation = locationFilter === 'all' ||
      `${candidate.profile?.city}, ${candidate.profile?.country}` === locationFilter;

    // Category filter
    const matchesCategory = categoryFilter.length === 0 ||
      categoryFilter.some(cat => candidate.categories?.includes(cat));

    return matchesSearch && matchesLocation && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin - Candidate Applications | RemoteWorks</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <Logo showText={false} size="lg" />
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Admin Panel</span>
                <button
                  onClick={() => router.push('/admin')}
                  className="text-sm font-medium text-black hover:text-gray-600"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">Candidate Applications</h1>
                <p className="text-gray-600">Review and approve candidate registrations</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-3">
                <button
                  onClick={() => router.push('/admin/candidates-export')}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Export Candidates</span>
                </button>
                <button
                  onClick={() => router.push('/admin/conversations')}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>View Conversations</span>
                </button>
              </div>
            </div>
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
                  { value: 'uncategorized', label: 'Uncategorized' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'date_range', label: 'Date Range' }
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

              {/* Date Range Inputs */}
              {filter === 'date_range' && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {/* Quick Presets */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quick Presets</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Last 7 Days', days: 7 },
                        { label: 'Last 30 Days', days: 30 },
                        { label: 'Last 90 Days', days: 90 },
                        { label: 'This Month', days: -1 },
                        { label: 'Last Month', days: -2 },
                        { label: 'This Year', days: -3 }
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => {
                            const today = new Date();
                            const todayStr = today.toISOString().split('T')[0];

                            if (preset.days > 0) {
                              // Last X days
                              const start = new Date();
                              start.setDate(start.getDate() - preset.days);
                              setStartDate(start.toISOString().split('T')[0]);
                              setEndDate(todayStr);
                            } else if (preset.days === -1) {
                              // This month
                              const start = new Date(today.getFullYear(), today.getMonth(), 1);
                              setStartDate(start.toISOString().split('T')[0]);
                              setEndDate(todayStr);
                            } else if (preset.days === -2) {
                              // Last month
                              const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                              const end = new Date(today.getFullYear(), today.getMonth(), 0);
                              setStartDate(start.toISOString().split('T')[0]);
                              setEndDate(end.toISOString().split('T')[0]);
                            } else if (preset.days === -3) {
                              // This year
                              const start = new Date(today.getFullYear(), 0, 1);
                              setStartDate(start.toISOString().split('T')[0]);
                              setEndDate(todayStr);
                            }
                          }}
                          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-all"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Date Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  {/* Apply and Clear Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => fetchCandidates()}
                      className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-all"
                    >
                      Apply Filter
                    </button>
                    <button
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                        fetchCandidates();
                      }}
                      className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all"
                    >
                      Clear Dates
                    </button>
                  </div>

                  {/* Display current filter info */}
                  {(startDate || endDate) && (
                    <div className="mt-3 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded px-3 py-2">
                      <strong>Filtering:</strong> {startDate ? `From ${new Date(startDate).toLocaleDateString()}` : 'Any start date'} {endDate ? `to ${new Date(endDate).toLocaleDateString()}` : 'to now'}
                    </div>
                  )}
                </div>
              )}

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

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-black">{candidates.length}</div>
                <div className="text-xs text-gray-600 mt-1">Total Candidates</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-700">
                  {(() => {
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    return candidates.filter(c => {
                      const createdAt = c.createdAt?.toDate?.() || new Date(0);
                      return createdAt >= sevenDaysAgo;
                    }).length;
                  })()}
                </div>
                <div className="text-xs text-gray-600 mt-1">New Users (7d)</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-700">
                  {candidates.filter(c => !c.isCandidateApproved && !c.isRejected).length}
                </div>
                <div className="text-xs text-gray-600 mt-1">Pending Approval</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700">
                  {candidates.filter(c => c.isCandidateApproved).length}
                </div>
                <div className="text-xs text-gray-600 mt-1">Approved</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-700">
                  {candidates.filter(c => c.isRejected).length}
                </div>
                <div className="text-xs text-gray-600 mt-1">Rejected</div>
              </div>
            </div>
          </div>

          {/* Candidates List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              <p className="mt-4 text-gray-600">Loading candidates...</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No candidates found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.uid}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedCandidate(candidate)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                          {(candidate.profile?.firstName?.[0] || candidate.displayName?.[0] || candidate.email[0]).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-black">
                            {candidate.profile?.firstName && candidate.profile?.lastName
                              ? `${candidate.profile.firstName} ${candidate.profile.lastName}`
                              : candidate.displayName || 'No Name'}
                          </h3>
                          <p className="text-sm text-gray-600">{candidate.email}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          candidate.isRejected
                            ? 'bg-red-100 text-red-800'
                            : candidate.isCandidateApproved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {candidate.isRejected ? 'Rejected' : (candidate.isCandidateApproved ? 'Approved' : 'Pending')}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Joined: {candidate.createdAt?.toDate().toLocaleDateString()}</span>
                        </div>
                        {candidate.profile?.city && candidate.profile?.country && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{candidate.profile.city}, {candidate.profile.country}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4" />
                          <span>Status: {candidate.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>

                      {/* Categories */}
                      {candidate.categories && candidate.categories.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {candidate.categories.map(category => (
                            <span key={category} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {category}
                            </span>
                          ))}
                        </div>
                      )}

                      {candidate.profile?.bio && (
                        <p className="mt-3 text-sm text-gray-700 line-clamp-2">{candidate.profile.bio}</p>
                      )}
                    </div>

                    {!candidate.isCandidateApproved && !candidate.isRejected && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(candidate.uid);
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
                            openRejectModal(candidate.uid);
                          }}
                          disabled={actionLoading}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {candidate.isRejected && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnreject(candidate.uid);
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
        {selectedCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-black">Candidate Details</h2>
                <button
                  onClick={() => setSelectedCandidate(null)}
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
                      <p className="font-medium">
                        {selectedCandidate.profile?.firstName && selectedCandidate.profile?.lastName
                          ? `${selectedCandidate.profile.firstName} ${selectedCandidate.profile.lastName}`
                          : selectedCandidate.displayName || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium">{selectedCandidate.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="font-medium">{selectedCandidate.profile?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <p className="font-medium">
                        {selectedCandidate.profile?.city && selectedCandidate.profile?.country
                          ? `${selectedCandidate.profile.city}, ${selectedCandidate.profile.country}`
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Joined:</span>
                      <p className="font-medium">
                        {selectedCandidate.createdAt?.toDate().toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className="font-medium">
                        {selectedCandidate.isActive ? 'Active' : 'Inactive'}
                      </p>
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
                          setSelectedCategories(selectedCandidate.categories || []);
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
                      {selectedCandidate.categories && selectedCandidate.categories.length > 0 ? (
                        selectedCandidate.categories.map(cat => (
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
                {selectedCandidate.profile?.bio && (
                  <div>
                    <h3 className="text-lg font-bold text-black mb-3">Bio</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedCandidate.profile.bio}</p>
                  </div>
                )}

                {/* Contact Method for Verification */}
                <div>
                  <h3 className="text-lg font-bold text-black mb-3">Contact Method for Verification</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Platform:</span>
                      <p className="font-medium capitalize">{(selectedCandidate as any).contactMethodType || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Contact:</span>
                      <p className="font-medium">{(selectedCandidate as any).contactMethodValue || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* ID Card Verification */}
                <div>
                  <h3 className="text-lg font-bold text-black mb-3">ID Card Verification</h3>
                  {(selectedCandidate as any).idCardUrl ? (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">ID Card Uploaded</p>
                            <p className="text-sm text-gray-600">Click to view verification document</p>
                          </div>
                        </div>
                        <a
                          href={(selectedCandidate as any).idCardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Shield className="w-4 h-4" />
                          View ID Card
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 italic">No ID card uploaded</p>
                  )}
                </div>

                {/* Approval/Rejection Status */}
                <div className={`p-4 rounded-lg ${
                  selectedCandidate.isRejected
                    ? 'bg-red-50 border border-red-200'
                    : selectedCandidate.isCandidateApproved
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <h4 className="font-semibold mb-2">
                    {selectedCandidate.isRejected ? (
                      <span className="text-red-900">Rejected Candidate</span>
                    ) : selectedCandidate.isCandidateApproved ? (
                      <span className="text-green-900">Approved Candidate</span>
                    ) : (
                      <span className="text-yellow-900">Pending Approval</span>
                    )}
                  </h4>
                  {selectedCandidate.candidateApprovedAt && (
                    <p className="text-sm text-gray-700">
                      Approved on: {selectedCandidate.candidateApprovedAt.toDate().toLocaleString()}
                    </p>
                  )}
                  {selectedCandidate.isRejected && selectedCandidate.rejectionReason && (
                    <>
                      <p className="text-sm text-red-700 mt-2 font-medium">Rejection Reason:</p>
                      <p className="text-sm text-red-600">{selectedCandidate.rejectionReason}</p>
                      {selectedCandidate.rejectedAt && (
                        <p className="text-xs text-red-600 mt-1">
                          Rejected on: {selectedCandidate.rejectedAt.toDate().toLocaleString()}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Agent Assignment Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-bold text-black mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Assigned Agents
                  </h3>

                  {/* Currently Assigned Agents */}
                  {selectedCandidate.assignedAgents && selectedCandidate.assignedAgents.length > 0 ? (
                    <div className="mb-4 space-y-2">
                      {selectedCandidate.assignedAgents.map((agentId: string) => {
                        const agent = availableAgents.find(a => a.id === agentId);
                        return (
                          <div key={agentId} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                {agent?.name?.[0] || '?'}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{agent?.name || agentId}</p>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span>{agent?.rating.toFixed(1) || 'N/A'}</span>
                                  <Shield className="w-3 h-3 text-green-600 ml-2" />
                                  <span>Verified</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => unassignAgent(selectedCandidate.uid, agentId)}
                              disabled={actionLoading}
                              className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-4 italic">No agents assigned yet</p>
                  )}

                  {/* Assign New Agent */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign New Agent
                    </label>
                    <div className="flex space-x-2">
                      <select
                        value={selectedAgentId}
                        onChange={(e) => setSelectedAgentId(e.target.value)}
                        disabled={actionLoading}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="">Select an agent...</option>
                        {availableAgents
                          .filter(agent => !selectedCandidate.assignedAgents?.includes(agent.id))
                          .map(agent => (
                            <option key={agent.id} value={agent.id}>
                              {agent.name} - Rating: {agent.rating.toFixed(1)}
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={() => assignAgentToCandidate(selectedCandidate.uid, selectedAgentId)}
                        disabled={actionLoading || !selectedAgentId}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {!selectedCandidate.isCandidateApproved && !selectedCandidate.isRejected && (
                  <div className="flex space-x-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApprove(selectedCandidate.uid)}
                      disabled={actionLoading}
                      className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Approve Candidate
                    </button>
                    <button
                      onClick={() => openRejectModal(selectedCandidate.uid)}
                      disabled={actionLoading}
                      className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Reject
                    </button>
                  </div>
                )}

                {selectedCandidate.isRejected && (
                  <div className="flex space-x-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleUnreject(selectedCandidate.uid)}
                      disabled={actionLoading}
                      className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Unreject (Move to Pending)
                    </button>
                  </div>
                )}

                {/* Delete Action - Available for all candidates */}
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <button
                    onClick={() => handleDeleteCandidate(selectedCandidate.uid)}
                    disabled={actionLoading}
                    className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Delete Candidate Account
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
                <h2 className="text-xl font-bold text-black">Reject Candidate</h2>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setCandidateToReject(null);
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
                    placeholder="Explain why this candidate is being rejected..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setCandidateToReject(null);
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
                        Reject Candidate
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
                    placeholder="e.g., High Priority Candidates"
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
