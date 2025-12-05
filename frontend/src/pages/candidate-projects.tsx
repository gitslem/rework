import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { getFirebaseFirestore, getFirebaseAuth } from '../lib/firebase/config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Calendar, Clock } from 'lucide-react';
import {
  CandidateProjectStatus,
  ProjectActionStatus,
  ProjectActionPriority
} from '../types';
import { candidateProjectsAPI } from '../lib/api';

// Firestore Collections
const PROJECTS_COLLECTION = 'candidate_projects';
const UPDATES_COLLECTION = 'project_updates';
const ACTIONS_COLLECTION = 'project_actions';

// Get Firestore instance
const getDb = () => getFirebaseFirestore();

export default function CandidateProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<string>('candidate');
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [projectUpdates, setProjectUpdates] = useState<any[]>([]);
  const [projectActions, setProjectActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectedCandidates, setConnectedCandidates] = useState<any[]>([]);

  // Sorting and filtering states
  const [sortBy, setSortBy] = useState<'date' | 'budget' | 'deadline' | 'platform'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  // Modal states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Check Firebase authentication and get user role
  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getDb();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }

      setUser(firebaseUser);

      // Get user document to check role
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role || 'candidate');
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch projects in real-time
  useEffect(() => {
    if (!user) return;

    const projectsQuery = query(
      collection(getDb(), PROJECTS_COLLECTION),
      where('status', '==', activeTab),
      userRole === 'agent'
        ? where('agent_id', '==', user.uid)
        : where('candidate_id', '==', user.uid),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(
      projectsQuery,
      (snapshot) => {
        const projectsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjects(projectsList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching projects:', err);
        setError('Failed to fetch projects');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, userRole, activeTab]);

  // Fetch connected candidates for agents
  useEffect(() => {
    if (!user || userRole !== 'agent') return;

    const fetchConnections = async () => {
      try {
        const connectionsQuery = query(
          collection(getDb(), 'connections'),
          where('agentId', '==', user.uid),
          where('status', '==', 'connected')
        );

        const snapshot = await getDocs(connectionsQuery);

        // Deduplicate by candidateId and filter out invalid entries
        const candidatesMap = new Map();

        snapshot.docs.forEach(doc => {
          const data = doc.data();

          // Skip if missing required fields
          if (!data.candidateId || !data.candidateName) {
            console.warn('Skipping connection with missing candidateId or candidateName:', doc.id);
            return;
          }

          // Keep only one connection per candidateId (most recent)
          if (!candidatesMap.has(data.candidateId)) {
            candidatesMap.set(data.candidateId, {
              id: doc.id,
              candidateId: data.candidateId,
              candidateName: data.candidateName,
              candidateEmail: data.candidateEmail || '',
              agentId: data.agentId,
              status: data.status,
              conversationId: data.conversationId,
              createdAt: data.createdAt
            });
          } else {
            // If duplicate, keep the most recent one
            const existing = candidatesMap.get(data.candidateId);
            const existingTime = existing.createdAt?.toMillis() || 0;
            const currentTime = data.createdAt?.toMillis() || 0;

            if (currentTime > existingTime) {
              candidatesMap.set(data.candidateId, {
                id: doc.id,
                candidateId: data.candidateId,
                candidateName: data.candidateName,
                candidateEmail: data.candidateEmail || '',
                agentId: data.agentId,
                status: data.status,
                conversationId: data.conversationId,
                createdAt: data.createdAt
              });
            }
          }
        });

        const candidates = Array.from(candidatesMap.values());
        setConnectedCandidates(candidates);

        console.log(`Loaded ${candidates.length} connected candidates`);
      } catch (err: any) {
        console.error('Error fetching connected candidates:', err);

        // Check if it's a Firestore index error
        if (err.code === 'failed-precondition' || err.message?.includes('index')) {
          console.error('FIRESTORE INDEX ERROR: Create a composite index on connections collection with fields: agentId (ASC), status (ASC)');
          alert('Database configuration error. Please contact support.');
        }

        setConnectedCandidates([]);
      }
    };

    fetchConnections();
  }, [user, userRole]);

  // Fetch project details with real-time updates
  const fetchProjectDetails = async (projectId: string) => {
    try {
      // Get project
      const projectDoc = await getDoc(doc(getDb(), PROJECTS_COLLECTION, projectId));
      if (!projectDoc.exists()) {
        setError('Project not found');
        return;
      }

      const projectData = { id: projectDoc.id, ...projectDoc.data() };

      // Fetch initial updates
      const updatesQuery = query(
        collection(getDb(), UPDATES_COLLECTION),
        where('project_id', '==', projectId),
        orderBy('created_at', 'desc')
      );

      const updatesSnapshot = await getDocs(updatesQuery);
      const initialUpdates = updatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjectUpdates(initialUpdates);

      // Fetch initial actions
      const actionsQuery = query(
        collection(getDb(), ACTIONS_COLLECTION),
        where('project_id', '==', projectId),
        orderBy('created_at', 'desc')
      );

      const actionsSnapshot = await getDocs(actionsQuery);
      const initialActions = actionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjectActions(initialActions);

      // Calculate statistics with initial data
      const totalHours = initialUpdates.reduce((sum, u: any) => sum + (u.hours_completed || 0), 0);
      const totalScreenSharingHours = initialUpdates.reduce((sum, u: any) => sum + (u.screen_sharing_hours || 0), 0);
      const pendingActionsCount = initialActions.filter((a: any) => a.status === 'pending').length;
      const completedActionsCount = initialActions.filter((a: any) => a.status === 'completed').length;

      setSelectedProject({
        ...projectData,
        updates: initialUpdates,
        actions: initialActions,
        total_hours: totalHours,
        total_screen_sharing_hours: totalScreenSharingHours,
        pending_actions_count: pendingActionsCount,
        completed_actions_count: completedActionsCount
      });

      // Subscribe to real-time updates
      const unsubUpdates = onSnapshot(updatesQuery, (snapshot) => {
        const updates = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjectUpdates(updates);

        // Recalculate statistics
        const totalHours = updates.reduce((sum, u: any) => sum + (u.hours_completed || 0), 0);
        const totalScreenSharingHours = updates.reduce((sum, u: any) => sum + (u.screen_sharing_hours || 0), 0);

        setSelectedProject((prev: any) => prev ? {
          ...prev,
          updates,
          total_hours: totalHours,
          total_screen_sharing_hours: totalScreenSharingHours
        } : prev);
      });

      const unsubActions = onSnapshot(actionsQuery, (snapshot) => {
        const actions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjectActions(actions);

        // Recalculate statistics
        const pendingActionsCount = actions.filter((a: any) => a.status === 'pending').length;
        const completedActionsCount = actions.filter((a: any) => a.status === 'completed').length;

        setSelectedProject((prev: any) => prev ? {
          ...prev,
          actions,
          pending_actions_count: pendingActionsCount,
          completed_actions_count: completedActionsCount
        } : prev);
      });

      // Return cleanup function
      return () => {
        unsubUpdates();
        unsubActions();
      };
    } catch (err: any) {
      console.error('Error fetching project details:', err);
      setError(err.message || 'Failed to fetch project details');
    }
  };

  const createProject = async (projectData: any) => {
    if (!user) return;

    try {
      const projectRef = await addDoc(collection(getDb(), PROJECTS_COLLECTION), {
        ...projectData,
        agent_id: user.uid,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });

      // Create notification for candidate
      await addDoc(collection(getDb(), 'notifications'), {
        userId: projectData.candidate_id,
        type: 'project_created',
        title: 'New Project Assigned',
        message: `You have been assigned to a new project: ${projectData.title}`,
        projectId: projectRef.id,
        read: false,
        createdAt: Timestamp.now()
      });

      // Send email notification
      try {
        console.log('📧 Preparing to send email notification...');

        // Get agent profile
        const agentProfileDoc = await getDoc(doc(getDb(), 'profiles', user.uid));
        const agentProfile = agentProfileDoc.data();
        const agentName = agentProfile?.firstName && agentProfile?.lastName
          ? `${agentProfile.firstName} ${agentProfile.lastName}`
          : user.email?.split('@')[0] || 'Your Agent';

        console.log('Agent name:', agentName);

        // Get candidate profile
        const candidateDoc = await getDoc(doc(getDb(), 'users', projectData.candidate_id));
        const candidateData = candidateDoc.data();
        const candidateEmail = candidateData?.email || projectData.candidate_email;

        console.log('Candidate email:', candidateEmail);

        if (candidateEmail) {
          const emailData = {
            candidate_email: candidateEmail,
            candidate_name: projectData.candidate_name || 'Candidate',
            agent_name: agentName,
            project_title: projectData.title,
            project_description: projectData.description || '',
            project_id: projectRef.id,
            platform: projectData.platform
          };

          console.log('📤 Sending email with data:', emailData);

          const response = await candidateProjectsAPI.sendCreationEmail(emailData);

          console.log('📬 Email API response:', response.data);

          if (response.data.success) {
            console.log('✅ Email sent successfully!');
          } else {
            console.warn('⚠️ Email API returned success=false:', response.data.message);
          }
        } else {
          console.warn('⚠️ No candidate email found, skipping email notification');
        }
      } catch (emailErr: any) {
        console.error('❌ Failed to send email notification:', emailErr);
        console.error('Error details:', {
          message: emailErr.message,
          response: emailErr.response?.data,
          status: emailErr.response?.status
        });
        // Don't fail the project creation if email fails
      }

      setShowProjectModal(false);
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project');
    }
  };

  const createUpdate = async (updateData: any) => {
    if (!selectedProject || !user) return;

    try {
      await addDoc(collection(getDb(), UPDATES_COLLECTION), {
        ...updateData,
        project_id: selectedProject.id,
        agent_id: user.uid,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });

      // Send email notification
      try {
        console.log('📧 Preparing to send update email notification...');

        // Get agent profile
        const agentProfileDoc = await getDoc(doc(getDb(), 'profiles', user.uid));
        const agentProfile = agentProfileDoc.data();
        const agentName = agentProfile?.firstName && agentProfile?.lastName
          ? `${agentProfile.firstName} ${agentProfile.lastName}`
          : user.email?.split('@')[0] || 'Your Agent';

        console.log('Agent name:', agentName);

        // Get candidate info from selected project
        const candidateDoc = await getDoc(doc(getDb(), 'users', selectedProject.candidate_id));
        const candidateData = candidateDoc.data();
        const candidateEmail = candidateData?.email;

        const candidateProfileDoc = await getDoc(doc(getDb(), 'profiles', selectedProject.candidate_id));
        const candidateProfile = candidateProfileDoc.data();
        const candidateName = candidateProfile?.firstName || candidateData?.email?.split('@')[0] || 'Candidate';

        console.log('Candidate email:', candidateEmail);

        if (candidateEmail) {
          const updateSummary = updateData.update_title || updateData.update_content?.substring(0, 100) || 'New progress update';

          const emailData = {
            candidate_email: candidateEmail,
            candidate_name: candidateName,
            agent_name: agentName,
            project_title: selectedProject.title,
            project_id: selectedProject.id,
            update_summary: updateSummary
          };

          console.log('📤 Sending update email with data:', emailData);

          const response = await candidateProjectsAPI.sendUpdateEmail(emailData);

          console.log('📬 Update email API response:', response.data);

          if (response.data.success) {
            console.log('✅ Update email sent successfully!');
          } else {
            console.warn('⚠️ Update email API returned success=false:', response.data.message);
          }
        } else {
          console.warn('⚠️ No candidate email found, skipping update email notification');
        }
      } catch (emailErr: any) {
        console.error('❌ Failed to send update email notification:', emailErr);
        console.error('Error details:', {
          message: emailErr.message,
          response: emailErr.response?.data,
          status: emailErr.response?.status
        });
        // Don't fail the update creation if email fails
      }

      setShowUpdateModal(false);
    } catch (err: any) {
      console.error('Error creating update:', err);
      setError(err.message || 'Failed to create update');
    }
  };

  const createAction = async (actionData: any) => {
    if (!selectedProject || !user) return;

    try {
      await addDoc(collection(getDb(), ACTIONS_COLLECTION), {
        ...actionData,
        project_id: selectedProject.id,
        creator_id: user.uid,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });

      // Create notification for assigned user(s)
      if (actionData.assigned_to_candidate) {
        await addDoc(collection(getDb(), 'notifications'), {
          userId: selectedProject.candidate_id,
          type: 'action_needed',
          title: 'Action Required',
          message: `New action on project "${selectedProject.title}": ${actionData.title}`,
          projectId: selectedProject.id,
          priority: actionData.priority || 'medium',
          read: false,
          createdAt: Timestamp.now()
        });
      }

      setShowActionModal(false);
    } catch (err: any) {
      console.error('Error creating action:', err);
      setError(err.message || 'Failed to create action');
    }
  };

  const updateActionStatus = async (actionId: string, status: ProjectActionStatus) => {
    try {
      const actionRef = doc(getDb(), ACTIONS_COLLECTION, actionId);
      await updateDoc(actionRef, {
        status,
        ...(status === 'completed' ? { completed_at: Timestamp.now() } : {}),
        updated_at: Timestamp.now()
      });
    } catch (err: any) {
      console.error('Error updating action:', err);
      setError(err.message || 'Failed to update action');
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user || userRole !== 'agent') {
      setError('Only agents can delete projects');
      return;
    }

    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete project document
      await deleteDoc(doc(getDb(), PROJECTS_COLLECTION, projectId));

      // Delete associated updates
      const updatesQuery = query(
        collection(getDb(), UPDATES_COLLECTION),
        where('project_id', '==', projectId)
      );
      const updatesSnapshot = await getDocs(updatesQuery);
      const updateDeletePromises = updatesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(updateDeletePromises);

      // Delete associated actions
      const actionsQuery = query(
        collection(getDb(), ACTIONS_COLLECTION),
        where('project_id', '==', projectId)
      );
      const actionsSnapshot = await getDocs(actionsQuery);
      const actionDeletePromises = actionsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(actionDeletePromises);

      setSelectedProject(null);
      alert('Project deleted successfully');
    } catch (err: any) {
      console.error('Error deleting project:', err);
      setError(err.message || 'Failed to delete project');
      alert('Failed to delete project: ' + (err.message || 'Unknown error'));
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      active: 'bg-green-600',
      pending: 'bg-yellow-600',
      completed: 'bg-blue-600',
      cancelled: 'bg-red-600',
      in_progress: 'bg-purple-600'
    };
    return colors[status] || 'bg-gray-600';
  };

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      low: 'bg-gray-500',
      medium: 'bg-blue-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Get unique platforms for filter
  const uniquePlatforms = Array.from(new Set(projects.map(p => p.platform).filter(Boolean)));

  // Sort and filter projects
  const getSortedAndFilteredProjects = () => {
    let filtered = [...projects];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(p => p.platform === platformFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'date':
          const aTime = a.created_at?.toMillis?.() || 0;
          const bTime = b.created_at?.toMillis?.() || 0;
          compareValue = aTime - bTime;
          break;
        case 'budget':
          compareValue = (a.budget || 0) - (b.budget || 0);
          break;
        case 'deadline':
          const aDeadline = a.deadline?.toMillis?.() || 0;
          const bDeadline = b.deadline?.toMillis?.() || 0;
          compareValue = aDeadline - bDeadline;
          break;
        case 'platform':
          compareValue = (a.platform || '').localeCompare(b.platform || '');
          break;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  };

  const sortedAndFilteredProjects = getSortedAndFilteredProjects();

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Projects
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {userRole === 'agent'
                ? 'Manage candidate projects and provide updates'
                : 'View your projects and track progress'}
            </p>
          </div>
          <button
            onClick={() => router.push(userRole === 'agent' ? '/agent-dashboard' : '/candidate-dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('active')}
                className={`${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Active Projects
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Pending Projects
              </button>
            </nav>
          </div>
        </div>

        {/* Add Project Button for Agents */}
        {userRole === 'agent' && (
          <div className="mb-6">
            <button
              onClick={() => setShowProjectModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Add New Project
            </button>
          </div>
        )}

        {/* Sorting and Filtering Controls */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search Projects
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>

            {/* Platform Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Platform
              </label>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="all">All Platforms</option>
                {uniquePlatforms.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="date">Date Created</option>
                <option value="budget">Budget</option>
                <option value="deadline">Deadline</option>
                <option value="platform">Platform</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Showing {sortedAndFilteredProjects.length} of {projects.length} projects
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : sortedAndFilteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">
              {projects.length === 0 ? `No ${activeTab} projects found` : 'No projects match your filters'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAndFilteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => fetchProjectDetails(project.id)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {project.title}
                  </h3>
                  <span className={`${getStatusColor(project.status)} text-white text-xs px-2 py-1 rounded-full`}>
                    {project.status}
                  </span>
                </div>

                {project.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  {project.platform && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <span className="font-medium mr-2">Platform:</span>
                      {project.platform}
                    </div>
                  )}

                  {project.budget && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <span className="font-medium mr-2">Budget:</span>
                      ${project.budget}
                    </div>
                  )}

                  {project.deadline && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <span className="font-medium mr-2">Deadline:</span>
                      {formatDate(project.deadline)}
                    </div>
                  )}
                </div>

                {project.tags && project.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Project Detail Modal - Same as before but using Firebase data */}
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            updates={projectUpdates}
            actions={projectActions}
            userRole={userRole}
            onClose={() => setSelectedProject(null)}
            onAddUpdate={() => setShowUpdateModal(true)}
            onAddAction={() => setShowActionModal(true)}
            onUpdateActionStatus={updateActionStatus}
            onDeleteProject={deleteProject}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
            formatDate={formatDate}
          />
        )}

        {/* Modals */}
        {showUpdateModal && selectedProject && userRole === 'agent' && (
          <UpdateFormModal
            onClose={() => setShowUpdateModal(false)}
            onSubmit={createUpdate}
          />
        )}

        {showActionModal && selectedProject && (
          <ActionFormModal
            onClose={() => setShowActionModal(false)}
            onSubmit={createAction}
          />
        )}

        {showProjectModal && userRole === 'agent' && (
          <ProjectFormModal
            onClose={() => setShowProjectModal(false)}
            onSubmit={createProject}
            connectedCandidates={connectedCandidates}
          />
        )}
      </div>
    </div>
  );
}

// ProjectDetailModal component (extracted for clarity)
function ProjectDetailModal({ project, updates, actions, userRole, onClose, onAddUpdate, onAddAction, onUpdateActionStatus, onDeleteProject, getStatusColor, getPriorityColor, formatDate }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {project.title}
              </h2>
              <div className="flex items-center gap-3">
                <span className={`${getStatusColor(project.status)} text-white text-sm px-3 py-1 rounded-full`}>
                  {project.status}
                </span>
                {project.platform && (
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    Platform: {project.platform}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Action Buttons for Agents */}
          {userRole === 'agent' && (
            <div className="mt-4 flex gap-3 flex-wrap">
              <button
                onClick={onAddUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add Update
              </button>
              <button
                onClick={onAddAction}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add Action
              </button>
              <button
                onClick={() => onDeleteProject(project.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Delete Project
              </button>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Project Statistics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Project Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {project.total_hours || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Hours</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {project.total_screen_sharing_hours || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Screen Share</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {project.pending_actions_count || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending Actions</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {project.completed_actions_count || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
            </div>
          </div>

          {/* Updates Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Project Updates ({updates.length})
            </h3>
            {updates.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No updates yet</p>
            ) : (
              <div className="space-y-4">
                {updates.map((update: any) => (
                  <div key={update.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {update.update_title}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(update.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      {update.update_content}
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Hours:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {update.hours_completed || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Progress:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {update.progress_percentage || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scheduled Sessions Section */}
          {actions.filter((action: any) =>
            (action.action_type === 'screen_share' || action.action_type === 'work_session') &&
            action.status !== 'completed' &&
            action.status !== 'cancelled'
          ).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Scheduled Sessions
              </h3>
              <div className="space-y-3">
                {actions
                  .filter((action: any) =>
                    (action.action_type === 'screen_share' || action.action_type === 'work_session') &&
                    action.status !== 'completed' &&
                    action.status !== 'cancelled'
                  )
                  .map((action: any) => (
                    <div
                      key={action.id}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border-l-4 border-blue-500"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                              {action.title}
                            </h4>
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                              {action.action_type === 'screen_share' ? '🖥️ Screen Share' : '💼 Work Session'}
                            </span>
                            <span className={`${getStatusColor(action.status)} text-white text-xs px-2 py-1 rounded-full`}>
                              {action.status}
                            </span>
                          </div>

                          {action.description && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                              {action.description}
                            </p>
                          )}

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {action.scheduled_time && (
                              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <Clock className="w-4 h-4" />
                                <div>
                                  <div className="font-medium">Scheduled Time:</div>
                                  <div className="text-blue-600 dark:text-blue-400 font-semibold">
                                    {formatDate(action.scheduled_time)}
                                  </div>
                                </div>
                              </div>
                            )}
                            {action.duration_minutes && (
                              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <Clock className="w-4 h-4" />
                                <div>
                                  <div className="font-medium">Duration:</div>
                                  <div className="text-purple-600 dark:text-purple-400 font-semibold">
                                    {action.duration_minutes} minutes
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {action.assigned_to_candidate && (
                            <div className="mt-3 bg-white dark:bg-gray-800 p-2 rounded text-xs text-gray-600 dark:text-gray-400">
                              👤 Assigned to: Candidate
                            </div>
                          )}
                          {action.assigned_to_agent && (
                            <div className="mt-3 bg-white dark:bg-gray-800 p-2 rounded text-xs text-gray-600 dark:text-gray-400">
                              👤 Assigned to: Agent
                            </div>
                          )}
                        </div>

                        {action.status !== 'completed' && action.status !== 'cancelled' && (
                          <div className="flex flex-col gap-2">
                            {action.status === 'pending' && (
                              <button
                                onClick={() => onUpdateActionStatus(action.id, 'in_progress')}
                                className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-2 rounded transition-colors"
                              >
                                Start Session
                              </button>
                            )}
                            <button
                              onClick={() => onUpdateActionStatus(action.id, 'completed')}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded transition-colors"
                            >
                              Mark Complete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Actions Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Action Items ({actions.length})
            </h3>
            {actions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No actions yet</p>
            ) : (
              <div className="space-y-3">
                {actions.map((action: any) => (
                  <div key={action.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {action.title}
                          </h4>
                          <span className={`${getPriorityColor(action.priority)} text-white text-xs px-2 py-0.5 rounded`}>
                            {action.priority}
                          </span>
                          <span className={`${getStatusColor(action.status)} text-white text-xs px-2 py-0.5 rounded`}>
                            {action.status}
                          </span>
                        </div>
                        {action.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {action.description}
                          </p>
                        )}
                      </div>
                      {action.status !== 'completed' && action.status !== 'cancelled' && (
                        <div className="flex gap-2">
                          {action.status === 'pending' && (
                            <button
                              onClick={() => onUpdateActionStatus(action.id, 'in_progress')}
                              className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded transition-colors"
                            >
                              Start
                            </button>
                          )}
                          <button
                            onClick={() => onUpdateActionStatus(action.id, 'completed')}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded transition-colors"
                          >
                            Complete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Form modals remain similar but simpler (no API calls needed)
function UpdateFormModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    update_title: '',
    update_content: '',
    hours_completed: 0,
    screen_sharing_hours: 0,
    progress_percentage: 0,
    blockers: [] as string[],
    next_steps: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Project Update</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Update Title *
            </label>
            <input
              type="text"
              required
              value={formData.update_title}
              onChange={(e) => setFormData({ ...formData, update_title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Update Content *
            </label>
            <textarea
              required
              rows={4}
              value={formData.update_content}
              onChange={(e) => setFormData({ ...formData, update_content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hours Completed
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.hours_completed}
                onChange={(e) => setFormData({ ...formData, hours_completed: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Screen Share Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.screen_sharing_hours}
                onChange={(e) => setFormData({ ...formData, screen_sharing_hours: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Progress (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress_percentage}
                onChange={(e) => setFormData({ ...formData, progress_percentage: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ActionFormModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    action_type: 'task',
    assigned_to_candidate: false,
    assigned_to_agent: false,
    priority: 'medium' as ProjectActionPriority,
    status: 'pending' as ProjectActionStatus,
    platform: '',
    platform_url: '',
    scheduled_time: '',
    duration_minutes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Format the data for submission
    const submitData: any = {
      ...formData,
      // Convert scheduled_time to ISO string if provided
      scheduled_time: formData.scheduled_time ? new Date(formData.scheduled_time).toISOString() : null,
      // Convert duration to number if provided
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null
    };

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Action Item</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Action Type
              </label>
              <select
                value={formData.action_type}
                onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="task">Task</option>
                <option value="signup">Platform Signup</option>
                <option value="verification">Verification</option>
                <option value="exam">Exam</option>
                <option value="meeting">Meeting</option>
                <option value="screen_share">Screen Share Session</option>
                <option value="work_session">Work Session</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProjectActionPriority })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.assigned_to_candidate}
                onChange={(e) => setFormData({ ...formData, assigned_to_candidate: e.target.checked })}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Assign to Candidate</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.assigned_to_agent}
                onChange={(e) => setFormData({ ...formData, assigned_to_agent: e.target.checked })}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Assign to Agent</span>
            </label>
          </div>

          {/* Scheduling fields for screen share and work sessions */}
          {(formData.action_type === 'screen_share' || formData.action_type === 'work_session') && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 space-y-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Session Scheduling
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    When should this session take place?
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    placeholder="e.g., 60"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Expected session duration
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong className="text-blue-700 dark:text-blue-400">Note:</strong> {formData.action_type === 'screen_share'
                    ? 'The recipient will receive an email notification about this screen sharing request. Make sure both parties have screen sharing software ready.'
                    : 'The recipient will receive an email notification about this work session. Ensure both parties are available at the scheduled time.'}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Add Action
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProjectFormModal({ onClose, onSubmit, connectedCandidates }: any) {
  const [formData, setFormData] = useState({
    candidate_id: '',
    candidate_name: '',
    candidate_email: '',
    title: '',
    description: '',
    platform: '',
    status: 'pending' as CandidateProjectStatus,
    budget: 0,
    tags: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleCandidateSelect = (candidateId: string) => {
    const selected = connectedCandidates.find((c: any) => c.candidateId === candidateId);
    if (selected) {
      setFormData({
        ...formData,
        candidate_id: selected.candidateId,
        candidate_name: selected.candidateName,
        candidate_email: selected.candidateEmail
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Project</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Candidate *
            </label>
            {connectedCandidates && connectedCandidates.length > 0 ? (
              <select
                required
                value={formData.candidate_id}
                onChange={(e) => handleCandidateSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Choose a connected candidate...</option>
                {connectedCandidates.map((candidate: any) => (
                  <option key={candidate.candidateId} value={candidate.candidateId}>
                    {candidate.candidateName}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300">
                No connected candidates. Accept a service request to connect with candidates.
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Platform
              </label>
              <input
                type="text"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Upwork, Freelancer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CandidateProjectStatus })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
