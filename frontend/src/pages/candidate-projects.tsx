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
import { db } from '../lib/firebase/config';
import { useAuthStore } from '../lib/authStore';
import {
  CandidateProjectStatus,
  ProjectActionStatus,
  ProjectActionPriority
} from '../types';

// Firestore Collections
const PROJECTS_COLLECTION = 'candidate_projects';
const UPDATES_COLLECTION = 'project_updates';
const ACTIONS_COLLECTION = 'project_actions';

export default function CandidateProjectsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [projectUpdates, setProjectUpdates] = useState<any[]>([]);
  const [projectActions, setProjectActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Fetch projects in real-time
  useEffect(() => {
    if (!user) return;

    const projectsQuery = query(
      collection(db, PROJECTS_COLLECTION),
      where('status', '==', activeTab),
      user.role === 'agent'
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
  }, [user, activeTab]);

  // Fetch project details with real-time updates
  const fetchProjectDetails = async (projectId: string) => {
    try {
      // Get project
      const projectDoc = await getDoc(doc(db, PROJECTS_COLLECTION, projectId));
      if (!projectDoc.exists()) {
        setError('Project not found');
        return;
      }

      const projectData = { id: projectDoc.id, ...projectDoc.data() };

      // Subscribe to updates
      const updatesQuery = query(
        collection(db, UPDATES_COLLECTION),
        where('project_id', '==', projectId),
        orderBy('created_at', 'desc')
      );

      const unsubUpdates = onSnapshot(updatesQuery, (snapshot) => {
        const updates = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjectUpdates(updates);
      });

      // Subscribe to actions
      const actionsQuery = query(
        collection(db, ACTIONS_COLLECTION),
        where('project_id', '==', projectId),
        orderBy('created_at', 'desc')
      );

      const unsubActions = onSnapshot(actionsQuery, (snapshot) => {
        const actions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjectActions(actions);
      });

      // Calculate statistics
      const totalHours = updates.reduce((sum, u) => sum + (u.hours_completed || 0), 0);
      const totalScreenSharingHours = updates.reduce((sum, u) => sum + (u.screen_sharing_hours || 0), 0);
      const pendingActionsCount = actions.filter(a => a.status === 'pending').length;
      const completedActionsCount = actions.filter(a => a.status === 'completed').length;

      setSelectedProject({
        ...projectData,
        updates,
        actions,
        total_hours: totalHours,
        total_screen_sharing_hours: totalScreenSharingHours,
        pending_actions_count: pendingActionsCount,
        completed_actions_count: completedActionsCount
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
      await addDoc(collection(db, PROJECTS_COLLECTION), {
        ...projectData,
        agent_id: user.uid,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });
      setShowProjectModal(false);
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project');
    }
  };

  const createUpdate = async (updateData: any) => {
    if (!selectedProject || !user) return;

    try {
      await addDoc(collection(db, UPDATES_COLLECTION), {
        ...updateData,
        project_id: selectedProject.id,
        agent_id: user.uid,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });
      setShowUpdateModal(false);
    } catch (err: any) {
      console.error('Error creating update:', err);
      setError(err.message || 'Failed to create update');
    }
  };

  const createAction = async (actionData: any) => {
    if (!selectedProject || !user) return;

    try {
      await addDoc(collection(db, ACTIONS_COLLECTION), {
        ...actionData,
        project_id: selectedProject.id,
        creator_id: user.uid,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });
      setShowActionModal(false);
    } catch (err: any) {
      console.error('Error creating action:', err);
      setError(err.message || 'Failed to create action');
    }
  };

  const updateActionStatus = async (actionId: string, status: ProjectActionStatus) => {
    try {
      const actionRef = doc(db, ACTIONS_COLLECTION, actionId);
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

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Projects
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {user.role === 'agent'
              ? 'Manage candidate projects and provide updates'
              : 'View your projects and track progress'}
          </p>
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
        {user.role === 'agent' && (
          <div className="mb-6">
            <button
              onClick={() => setShowProjectModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Add New Project
            </button>
          </div>
        )}

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
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">
              No {activeTab} projects found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
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
            userRole={user.role}
            onClose={() => setSelectedProject(null)}
            onAddUpdate={() => setShowUpdateModal(true)}
            onAddAction={() => setShowActionModal(true)}
            onUpdateActionStatus={updateActionStatus}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
            formatDate={formatDate}
          />
        )}

        {/* Modals */}
        {showUpdateModal && selectedProject && user.role === 'agent' && (
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

        {showProjectModal && user.role === 'agent' && (
          <ProjectFormModal
            onClose={() => setShowProjectModal(false)}
            onSubmit={createProject}
          />
        )}
      </div>
    </div>
  );
}

// ProjectDetailModal component (extracted for clarity)
function ProjectDetailModal({ project, updates, actions, userRole, onClose, onAddUpdate, onAddAction, onUpdateActionStatus, getStatusColor, getPriorityColor, formatDate }: any) {
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
            <div className="mt-4 flex gap-3">
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
    platform_url: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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

function ProjectFormModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    candidate_id: '',
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Project</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Candidate User ID *
            </label>
            <input
              type="text"
              required
              value={formData.candidate_id}
              onChange={(e) => setFormData({ ...formData, candidate_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter candidate's Firebase UID"
            />
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
