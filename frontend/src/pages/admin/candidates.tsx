import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '@/components/Logo';
import {
  CheckCircle, XCircle, Clock, User, MapPin, Mail, Calendar,
  Award, Filter, Search, X, Shield, AlertCircle, Users, Star
} from 'lucide-react';
import { getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, Timestamp, setDoc } from 'firebase/firestore';
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
}

interface Agent {
  id: string;
  name: string;
  email: string;
  rating: number;
  verified: boolean;
}

export default function AdminCandidates() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [candidates, setCandidates] = useState<CandidateWithProfile[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchCandidates();
    }
  }, [filter, isAdmin]);

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

        // Apply filter
        if (filter === 'pending' && userData.isCandidateApproved) continue;
        if (filter === 'approved' && !userData.isCandidateApproved) continue;

        // Try to get profile data if exists
        const profileDoc = await getDoc(doc(db, 'profiles', userData.uid));
        const profileData = profileDoc.exists() ? profileDoc.data() : {};

        candidateList.push({
          ...userData,
          profile: {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            bio: profileData.bio,
            city: profileData.city,
            country: profileData.country,
            phone: profileData.phone,
          },
          assignedAgents: (userData as any).assignedAgents || []
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

  const handleReject = async (candidateUid: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return; // User clicked cancel

    try {
      setActionLoading(true);
      const db = getFirebaseFirestore();

      // Update users collection
      await updateDoc(doc(db, 'users', candidateUid), {
        isCandidateApproved: false,
        updatedAt: Timestamp.now(),
      });

      // Also update profiles collection for consistency
      await updateDoc(doc(db, 'profiles', candidateUid), {
        isVerified: false,
        verificationStatus: 'rejected',
        updatedAt: Timestamp.now(),
      });

      alert('Candidate rejected.');
      setSelectedCandidate(null);
      fetchCandidates();
    } catch (error: any) {
      console.error('Error rejecting candidate:', error);
      alert('Failed to reject candidate: ' + error.message);
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

  useEffect(() => {
    if (isAdmin && selectedCandidate) {
      fetchAvailableAgents();
    }
  }, [isAdmin, selectedCandidate]);

  const filteredCandidates = candidates.filter(candidate => {
    const searchLower = searchTerm.toLowerCase();
    return (
      candidate.email.toLowerCase().includes(searchLower) ||
      candidate.displayName?.toLowerCase().includes(searchLower) ||
      candidate.profile?.firstName?.toLowerCase().includes(searchLower) ||
      candidate.profile?.lastName?.toLowerCase().includes(searchLower)
    );
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
            <h1 className="text-3xl font-bold text-black mb-2">Candidate Applications</h1>
            <p className="text-gray-600">Review and approve candidate registrations</p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Filter Tabs */}
              <div className="flex space-x-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'approved', label: 'Approved' },
                ].map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setFilter(tab.value as any)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      filter === tab.value
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="flex-1">
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
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-black">{candidates.length}</div>
                <div className="text-xs text-gray-600 mt-1">Total Candidates</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-700">
                  {candidates.filter(c => !c.isCandidateApproved).length}
                </div>
                <div className="text-xs text-gray-600 mt-1">Pending Approval</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700">
                  {candidates.filter(c => c.isCandidateApproved).length}
                </div>
                <div className="text-xs text-gray-600 mt-1">Approved</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-700">
                  {candidates.filter(c => c.isActive).length}
                </div>
                <div className="text-xs text-gray-600 mt-1">Active Users</div>
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
                          candidate.isCandidateApproved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {candidate.isCandidateApproved ? 'Approved' : 'Pending'}
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

                      {candidate.profile?.bio && (
                        <p className="mt-3 text-sm text-gray-700 line-clamp-2">{candidate.profile.bio}</p>
                      )}
                    </div>

                    {!candidate.isCandidateApproved && (
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
                            handleReject(candidate.uid);
                          }}
                          disabled={actionLoading}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

                {/* Bio */}
                {selectedCandidate.profile?.bio && (
                  <div>
                    <h3 className="text-lg font-bold text-black mb-3">Bio</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedCandidate.profile.bio}</p>
                  </div>
                )}

                {/* Approval Status */}
                <div className={`p-4 rounded-lg ${
                  selectedCandidate.isCandidateApproved ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <h4 className="font-semibold mb-2">
                    {selectedCandidate.isCandidateApproved ? (
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
                {!selectedCandidate.isCandidateApproved && (
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
                      onClick={() => handleReject(selectedCandidate.uid)}
                      disabled={actionLoading}
                      className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
