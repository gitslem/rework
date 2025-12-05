import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '@/components/Logo';
import { Trash2, AlertTriangle, ArrowLeft, CheckCircle, Loader2, User, Filter, Calendar } from 'lucide-react';
import { getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, getDocs, doc, deleteDoc, getDoc, where, orderBy, Timestamp } from 'firebase/firestore';

interface Project {
  id: string;
  title: string;
  description: string;
  platform: string;
  status: string;
  agent_id: string;
  candidate_id: string;
  candidate_name: string;
  created_at: Timestamp;
  agentName?: string;
  agentEmail?: string;
  [key: string]: any;
}

interface Agent {
  id: string;
  name: string;
  email: string;
}

export default function CleanupProjects() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState('');

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
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();

            if (userData.role === 'admin') {
              setIsAdmin(true);
            } else {
              router.push('/admin');
            }
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

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const db = getFirebaseFirestore();

      // Get ALL projects
      const projectsQuery = query(
        collection(db, 'candidate_projects'),
        orderBy('created_at', 'desc')
      );
      const projectsSnapshot = await getDocs(projectsQuery);

      const projectsList: Project[] = [];

      for (const projectDoc of projectsSnapshot.docs) {
        const projectData = projectDoc.data() as Project;

        // Fetch agent info
        let agentName = 'Unknown Agent';
        let agentEmail = '';
        if (projectData.agent_id) {
          const agentUserDoc = await getDoc(doc(db, 'users', projectData.agent_id));
          if (agentUserDoc.exists()) {
            agentEmail = agentUserDoc.data().email || '';
          }

          const agentProfileDoc = await getDoc(doc(db, 'profiles', projectData.agent_id));
          if (agentProfileDoc.exists()) {
            const agentProfile = agentProfileDoc.data();
            agentName = agentProfile.firstName && agentProfile.lastName
              ? `${agentProfile.firstName} ${agentProfile.lastName}`
              : agentEmail || 'Unknown Agent';
          }
        }

        projectsList.push({
          ...projectData,
          id: projectDoc.id,
          agentName,
          agentEmail
        });
      }

      setProjects(projectsList);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const db = getFirebaseFirestore();

      const agentsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'agent')
      );
      const agentsSnapshot = await getDocs(agentsQuery);

      const agentsList: Agent[] = [];

      for (const agentDoc of agentsSnapshot.docs) {
        const agentData = agentDoc.data();

        const profileDoc = await getDoc(doc(db, 'profiles', agentDoc.id));
        const profileData = profileDoc.exists() ? profileDoc.data() : {};

        agentsList.push({
          id: agentDoc.id,
          email: agentData.email,
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

  const deleteSelectedProjects = async () => {
    if (selectedProjects.size === 0) {
      alert('Please select at least one project to delete');
      return;
    }

    if (!confirm(`⚠️ WARNING: This will permanently delete ${selectedProjects.size} selected project(s) and their associated updates and actions. This cannot be undone!\n\nClick OK to confirm.`)) {
      return;
    }

    try {
      setDeleting(true);
      const db = getFirebaseFirestore();

      let deleteCount = 0;
      const totalCount = selectedProjects.size;

      for (const projectId of selectedProjects) {
        setDeleteProgress(`Deleting project ${deleteCount + 1}/${totalCount}...`);

        // Delete the project
        await deleteDoc(doc(db, 'candidate_projects', projectId));

        // Delete associated updates
        const updatesQuery = query(
          collection(db, 'project_updates'),
          where('project_id', '==', projectId)
        );
        const updatesSnapshot = await getDocs(updatesQuery);
        for (const updateDoc of updatesSnapshot.docs) {
          await deleteDoc(updateDoc.ref);
        }

        // Delete associated actions
        const actionsQuery = query(
          collection(db, 'project_actions'),
          where('project_id', '==', projectId)
        );
        const actionsSnapshot = await getDocs(actionsQuery);
        for (const actionDoc of actionsSnapshot.docs) {
          await deleteDoc(actionDoc.ref);
        }

        deleteCount++;
      }

      setDeleteProgress('Deletion complete!');
      alert(`✅ Successfully deleted ${deleteCount} project(s)`);

      // Reset and refresh
      setSelectedProjects(new Set());
      await fetchProjects();
    } catch (error: any) {
      console.error('Error deleting projects:', error);
      alert('Failed to delete projects: ' + error.message);
    } finally {
      setDeleting(false);
      setDeleteProgress('');
    }
  };

  const deleteAllProjects = async () => {
    if (projects.length === 0) {
      alert('No projects to delete');
      return;
    }

    if (!confirm(`⚠️ WARNING: This will permanently delete ALL ${projects.length} projects and their associated data. This cannot be undone!\n\nType "DELETE ALL" in the next prompt to confirm.`)) {
      return;
    }

    const confirmText = prompt('Type "DELETE ALL" (all caps with space) to confirm deletion:');
    if (confirmText !== 'DELETE ALL') {
      alert('Deletion cancelled.');
      return;
    }

    try {
      setDeleting(true);
      const db = getFirebaseFirestore();

      // Delete all projects
      setDeleteProgress('Deleting all projects...');
      const projectsSnapshot = await getDocs(collection(db, 'candidate_projects'));
      let deleteCount = 0;
      for (const projectDoc of projectsSnapshot.docs) {
        await deleteDoc(projectDoc.ref);
        deleteCount++;
        if (deleteCount % 5 === 0) {
          setDeleteProgress(`Deleted ${deleteCount}/${projectsSnapshot.size} projects...`);
        }
      }

      // Delete all updates
      setDeleteProgress('Deleting project updates...');
      const updatesSnapshot = await getDocs(collection(db, 'project_updates'));
      for (const updateDoc of updatesSnapshot.docs) {
        await deleteDoc(updateDoc.ref);
      }

      // Delete all actions
      setDeleteProgress('Deleting project actions...');
      const actionsSnapshot = await getDocs(collection(db, 'project_actions'));
      for (const actionDoc of actionsSnapshot.docs) {
        await deleteDoc(actionDoc.ref);
      }

      setDeleteProgress('Cleanup complete!');
      alert('✅ All projects deleted successfully!');

      setProjects([]);
      setSelectedProjects(new Set());
    } catch (error: any) {
      console.error('Error deleting all projects:', error);
      alert('Failed to delete projects: ' + error.message);
    } finally {
      setDeleting(false);
      setDeleteProgress('');
    }
  };

  const toggleProjectSelection = (projectId: string) => {
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId);
    } else {
      newSelected.add(projectId);
    }
    setSelectedProjects(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedProjects.size === filteredProjects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(filteredProjects.map(p => p.id)));
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Filter projects by selected agent
  const filteredProjects = selectedAgent === 'all'
    ? projects
    : projects.filter(p => p.agent_id === selectedAgent);

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
        <title>Cleanup Projects - Admin | RemoteWorks</title>
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
            <h1 className="text-3xl font-bold text-black mb-2">Project Cleanup</h1>
            <p className="text-gray-600">Select and delete specific projects or all projects</p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-3xl font-bold text-black mb-1">{projects.length}</div>
              <div className="text-gray-600 text-sm">Total Projects</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-3xl font-bold text-blue-600 mb-1">{filteredProjects.length}</div>
              <div className="text-gray-600 text-sm">Filtered Projects</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-3xl font-bold text-purple-600 mb-1">{selectedProjects.size}</div>
              <div className="text-gray-600 text-sm">Selected Projects</div>
            </div>
          </div>

          {/* Filter and Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <label className="text-sm font-medium text-gray-700">Filter by Agent:</label>
                </div>
                <select
                  value={selectedAgent}
                  onChange={(e) => {
                    setSelectedAgent(e.target.value);
                    setSelectedProjects(new Set());
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="all">All Agents ({projects.length})</option>
                  {agents.map(agent => {
                    const count = projects.filter(p => p.agent_id === agent.id).length;
                    return (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={deleteSelectedProjects}
                  disabled={selectedProjects.size === 0 || deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected ({selectedProjects.size})
                </button>
              </div>
            </div>
          </div>

          {/* Projects Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
              <p className="text-gray-600">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No projects found</p>
              <p className="text-gray-500 text-sm mt-2">
                {selectedAgent === 'all' ? 'The database is clean.' : 'This agent has no projects.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedProjects.size === filteredProjects.length && filteredProjects.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm font-semibold text-gray-700">Select All</span>
                </div>
              </div>

              {/* Projects List */}
              <div className="divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      selectedProjects.has(project.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedProjects.has(project.id)}
                        onChange={() => toggleProjectSelection(project.id)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                      />

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-black">{project.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            project.status === 'active' ? 'bg-green-100 text-green-800' :
                            project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mt-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <div>
                              <span className="font-medium">Agent:</span>
                              <span className="ml-1">{project.agentName}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <div>
                              <span className="font-medium">Candidate:</span>
                              <span className="ml-1">{project.candidate_name || 'N/A'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <div>
                              <span className="font-medium">Created:</span>
                              <span className="ml-1">{formatDate(project.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        {project.platform && (
                          <div className="mt-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {project.platform}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="mt-8 bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-4 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-red-900 mb-1">Danger Zone</h3>
                <p className="text-red-800 text-sm">
                  Delete ALL projects from all agents. This action is irreversible and will remove all projects, updates, and actions from the database.
                </p>
              </div>
            </div>
            <button
              onClick={deleteAllProjects}
              disabled={deleting || projects.length === 0}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{deleteProgress || 'Deleting...'}</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  <span>Delete All {projects.length} Projects</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
