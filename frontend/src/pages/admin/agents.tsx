import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '@/components/Logo';
import {
  CheckCircle, XCircle, Clock, User, MapPin, Briefcase, Monitor,
  Mail, Phone, Globe, Calendar, Award, Filter, Search, X, ArrowLeft
} from 'lucide-react';
import { getFirebaseFirestore } from '@/lib/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { Profile } from '@/types';

interface AgentApplication extends Profile {
  user: {
    email: string;
    createdAt: Timestamp;
  };
}

export default function AdminAgents() {
  const router = useRouter();
  const [applications, setApplications] = useState<AgentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<AgentApplication | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [filter]);

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

          // Filter by verification status if needed
          if (filter === 'all' || profileData.agentVerificationStatus === filter) {
            apps.push({
              ...profileData,
              user: {
                email: userData.email,
                createdAt: userData.createdAt,
              }
            });
          }
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

      // Also update user document - set isAgentApproved for agents
      await updateDoc(doc(db, 'users', agentUid), {
        isAgentApproved: true,
        agentApprovedAt: Timestamp.now(),
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

  const handleReject = async (agentUid: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      setActionLoading(true);
      const db = getFirebaseFirestore();

      await updateDoc(doc(db, 'profiles', agentUid), {
        agentVerificationStatus: 'rejected',
        isAgentApproved: false,
        agentRejectedReason: reason,
        updatedAt: Timestamp.now(),
      });

      alert('Agent rejected.');
      setSelectedAgent(null);
      fetchApplications();
    } catch (error: any) {
      console.error('Error rejecting agent:', error);
      alert('Failed to reject agent: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApplications = applications.filter(app =>
    app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

          {/* Filters and Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Filter Tabs */}
              <div className="flex space-x-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'verified', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' }
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
                            handleReject(app.uid);
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
        {selectedAgent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h3 className="text-lg font-bold text-black mb-3">Bio</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedAgent.bio}</p>
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
                      <span className="text-gray-600">Internet Speed:</span>
                      <p className="font-medium">{selectedAgent.internetSpeed || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Working Hours:</span>
                      <p className="font-medium">{selectedAgent.workingHours || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Platforms & Specializations */}
                <div>
                  <h3 className="text-lg font-bold text-black mb-3">Expertise</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-600 text-sm block mb-2">Platforms:</span>
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
                      onClick={() => handleReject(selectedAgent.uid)}
                      disabled={actionLoading}
                      className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Reject Agent
                    </button>
                  </div>
                )}

                {selectedAgent.agentVerificationStatus === 'rejected' && selectedAgent.agentRejectedReason && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">Rejection Reason:</h4>
                    <p className="text-sm text-red-700">{selectedAgent.agentRejectedReason}</p>
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
