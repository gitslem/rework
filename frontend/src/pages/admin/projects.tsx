import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '@/components/Logo';
import {
  Briefcase, Search, Filter, ArrowLeft, User, Users, Calendar,
  MapPin, DollarSign, X, RefreshCw, CheckCircle, AlertCircle, Eye
} from 'lucide-react';
import { getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection, query, getDocs, doc, updateDoc, getDoc,
  Timestamp, addDoc, where, orderBy
} from 'firebase/firestore';

interface Project {
  id: string;
  title: string;
  description: string;
  platform: string;
  status: string;
  budget: number;
  agent_id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  deadline?: Timestamp;
  tags?: string[];
  [key: string]: any;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export default function AdminProjects() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [reassignLoading, setReassignLoading] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchProjects();
      fetchAgents();
    }
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseFirestore();

      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          console.log('🔐 Checking admin access for user:', firebaseUser.uid);
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('👤 User data:', { uid: firebaseUser.uid, role: userData.role, email: firebaseUser.email });

            if (userData.role === 'admin') {
              console.log('✅ Admin access granted');
              setIsAdmin(true);
            } else {
              console.log('❌ User is not admin, role:', userData.role);
              router.push('/admin');
            }
          } else {
            console.log('❌ User document does not exist');
            router.push('/admin');
          }
        } else {
          console.log('❌ No authenticated user');
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

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const db = getFirebaseFirestore();

      console.log('🔍 Admin fetching all projects...');

      // Get ALL projects (no filtering by agent_id)
      const projectsQuery = query(
        collection(db, 'candidate_projects'),
        orderBy('created_at', 'desc')
      );
      const projectsSnapshot = await getDocs(projectsQuery);

      console.log('✅ Found', projectsSnapshot.size, 'projects');

      const projectsList: Project[] = [];

      for (const projectDoc of projectsSnapshot.docs) {
        const projectData = projectDoc.data() as Project;

        // Fetch agent profile for name
        let agentName = 'Unknown Agent';
        if (projectData.agent_id) {
          const agentProfileDoc = await getDoc(doc(db, 'profiles', projectData.agent_id));
          if (agentProfileDoc.exists()) {
            const agentProfile = agentProfileDoc.data();
            agentName = agentProfile.firstName && agentProfile.lastName
              ? `${agentProfile.firstName} ${agentProfile.lastName}`
              : 'Unknown Agent';
          }
        }

        projectsList.push({
          ...projectData,
          id: projectDoc.id, // Override with document ID
          agentName // Add agent name for display
        });
      }

      console.log('✅ Loaded', projectsList.length, 'projects with agent names');
      setProjects(projectsList);
    } catch (error: any) {
      console.error('❌ Error fetching projects:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      if (error.code === 'permission-denied') {
        alert('⚠️ PERMISSION DENIED: Firestore rules need to be deployed!\n\nThe local firestore.rules file has been updated, but the rules must be deployed to Firebase.\n\nPlease run: firebase deploy --only firestore:rules');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const db = getFirebaseFirestore();

      // Get all users with role 'agent'
      const agentsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'agent')
      );
      const agentsSnapshot = await getDocs(agentsQuery);

      const agentsList: Agent[] = [];

      for (const agentDoc of agentsSnapshot.docs) {
        const agentData = agentDoc.data();

        // Get agent profile for name
        const profileDoc = await getDoc(doc(db, 'profiles', agentDoc.id));
        const profileData = profileDoc.exists() ? profileDoc.data() : {};

        agentsList.push({
          id: agentDoc.id,
          email: agentData.email,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          name: profileData.firstName && profileData.lastName
            ? `${profileData.firstName} ${profileData.lastName}`
            : agentData.email
        });
      }

      setAgents(agentsList);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleReassignProject = async () => {
    if (!selectedProject || !selectedAgent) {
      alert('Please select an agent');
      return;
    }

    if (selectedAgent === selectedProject.agent_id) {
      alert('This agent is already assigned to this project');
      return;
    }

    if (!confirm('Are you sure you want to reassign this project? The current agent will lose access to it.')) {
      return;
    }

    try {
      setReassignLoading(true);
      const db = getFirebaseFirestore();

      // Update project with new agent_id
      await updateDoc(doc(db, 'candidate_projects', selectedProject.id), {
        agent_id: selectedAgent,
        updated_at: Timestamp.now(),
        reassigned_at: Timestamp.now(),
        reassigned_by: 'admin'
      });

      // Get new agent name
      const newAgentProfileDoc = await getDoc(doc(db, 'profiles', selectedAgent));
      const newAgentProfile = newAgentProfileDoc.data();
      const newAgentName = newAgentProfile?.firstName && newAgentProfile?.lastName
        ? `${newAgentProfile.firstName} ${newAgentProfile.lastName}`
        : 'Agent';

      // Create notification for new agent
      await addDoc(collection(db, 'notifications'), {
        userId: selectedAgent,
        type: 'project_assigned',
        title: 'Project Assigned to You',
        message: `You have been assigned to manage project "${selectedProject.title}" for ${selectedProject.candidate_name}`,
        projectId: selectedProject.id,
        read: false,
        createdAt: Timestamp.now()
      });

      // Optionally create notification for old agent (that they lost access)
      if (selectedProject.agent_id) {
        await addDoc(collection(db, 'notifications'), {
          userId: selectedProject.agent_id,
          type: 'project_reassigned',
          title: 'Project Reassigned',
          message: `Project "${selectedProject.title}" has been reassigned to another agent`,
          projectId: selectedProject.id,
          read: false,
          createdAt: Timestamp.now()
        });
      }

      alert('Project reassigned successfully!');
      setShowReassignModal(false);
      setSelectedProject(null);
      setSelectedAgent('');
      fetchProjects(); // Refresh projects list
    } catch (error: any) {
      console.error('Error reassigning project:', error);
      alert('Failed to reassign project: ' + error.message);
    } finally {
      setReassignLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      active: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      in_progress: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Get unique platforms and statuses for filters
  const uniquePlatforms = Array.from(new Set(projects.map(p => p.platform).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(projects.map(p => p.status).filter(Boolean)));

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchTerm === '' ||
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.agentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.platform?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || project.platform === platformFilter;

    return matchesSearch && matchesStatus && matchesPlatform;
  });

  if (!isAdmin || loading) {
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
        <title>Admin - Project Management | RemoteWorks</title>
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
            <h1 className="text-3xl font-bold text-black mb-2 flex items-center gap-3">
              <Briefcase className="w-8 h-8" />
              Project Management
            </h1>
            <p className="text-gray-600">View and reassign projects between agents</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Projects</p>
                  <p className="text-3xl font-bold text-black mt-1">{projects.length}</p>
                </div>
                <Briefcase className="w-10 h-10 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Projects</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {projects.filter(p => p.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Projects</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">
                    {projects.filter(p => p.status === 'pending').length}
                  </p>
                </div>
                <AlertCircle className="w-10 h-10 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Agents</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{agents.length}</p>
                </div>
                <Users className="w-10 h-10 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Projects
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, candidate, agent..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="all">All Statuses</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Platform Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Platform
                </label>
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="all">All Platforms</option>
                  {uniquePlatforms.map(platform => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
          </div>

          {/* Projects List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              <p className="mt-4 text-gray-600">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {projects.length === 0 ? 'No projects found' : 'No projects match your filters'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-black">{project.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>

                      {project.description && (
                        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{project.description}</p>
                      )}

                      <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <div>
                            <span className="font-medium">Agent:</span>
                            <span className="ml-1">{project.agentName || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <div>
                            <span className="font-medium">Candidate:</span>
                            <span className="ml-1">{project.candidate_name || 'N/A'}</span>
                          </div>
                        </div>
                        {project.platform && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <div>
                              <span className="font-medium">Platform:</span>
                              <span className="ml-1">{project.platform}</span>
                            </div>
                          </div>
                        )}
                        {project.budget && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4" />
                            <div>
                              <span className="font-medium">Budget:</span>
                              <span className="ml-1">${project.budget}</span>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <div>
                            <span className="font-medium">Created:</span>
                            <span className="ml-1">{formatDate(project.created_at)}</span>
                          </div>
                        </div>
                        {project.deadline && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <div>
                              <span className="font-medium">Deadline:</span>
                              <span className="ml-1">{formatDate(project.deadline)}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {project.tags && project.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {project.tags.map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setShowReassignModal(true);
                        }}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        title="Reassign Project"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => router.push(`/candidate-projects?project=${project.id}`)}
                        className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        title="View Project"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reassign Modal */}
        {showReassignModal && selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-black">Reassign Project</h2>
                <button
                  onClick={() => {
                    setShowReassignModal(false);
                    setSelectedProject(null);
                    setSelectedAgent('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="font-semibold text-black mb-2">Project: {selectedProject.title}</h3>
                  <p className="text-sm text-gray-600">
                    Current Agent: <span className="font-medium">{selectedProject.agentName}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Candidate: <span className="font-medium">{selectedProject.candidate_name}</span>
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select New Agent *
                  </label>
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">Choose an agent...</option>
                    {agents
                      .filter(agent => agent.id !== selectedProject.agent_id)
                      .map(agent => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name} ({agent.email})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> The current agent will lose access to this project and won't see it in their dashboard anymore.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowReassignModal(false);
                      setSelectedProject(null);
                      setSelectedAgent('');
                    }}
                    disabled={reassignLoading}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReassignProject}
                    disabled={reassignLoading || !selectedAgent}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {reassignLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Reassigning...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reassign Project
                      </>
                    )}
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
