import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  CandidateProject,
  CandidateProjectDetail,
  ProjectUpdate,
  ProjectAction,
  CandidateProjectStatus,
  ProjectActionStatus,
  ProjectActionPriority
} from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function CandidateProjectsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [projects, setProjects] = useState<CandidateProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<CandidateProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'candidate' | 'agent'>('candidate');

  // Modal states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  useEffect(() => {
    fetchProjects();
    checkUserRole();
  }, [activeTab]);

  const checkUserRole = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserRole(response.data.role === 'agent' ? 'agent' : 'candidate');
    } catch (err) {
      console.error('Error fetching user role:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('access_token');
      const endpoint = activeTab === 'active' ? '/active' : '/pending';

      const response = await axios.get(
        `${API_URL}/api/v1/candidate-projects${endpoint}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setProjects(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async (projectId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${API_URL}/api/v1/candidate-projects/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSelectedProject(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch project details');
      console.error('Error fetching project details:', err);
    }
  };

  const createUpdate = async (updateData: any) => {
    if (!selectedProject) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_URL}/api/v1/candidate-projects/${selectedProject.id}/updates`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchProjectDetails(selectedProject.id);
      setShowUpdateModal(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create update');
      console.error('Error creating update:', err);
    }
  };

  const createAction = async (actionData: any) => {
    if (!selectedProject) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_URL}/api/v1/candidate-projects/${selectedProject.id}/actions`,
        actionData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchProjectDetails(selectedProject.id);
      setShowActionModal(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create action');
      console.error('Error creating action:', err);
    }
  };

  const updateActionStatus = async (actionId: number, status: ProjectActionStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(
        `${API_URL}/api/v1/candidate-projects/actions/${actionId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (selectedProject) {
        fetchProjectDetails(selectedProject.id);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update action');
      console.error('Error updating action:', err);
    }
  };

  const getStatusColor = (status: CandidateProjectStatus | ProjectActionStatus) => {
    const colors = {
      active: 'bg-green-600',
      pending: 'bg-yellow-600',
      completed: 'bg-blue-600',
      cancelled: 'bg-red-600',
      in_progress: 'bg-purple-600'
    };
    return colors[status] || 'bg-gray-600';
  };

  const getPriorityColor = (priority: ProjectActionPriority) => {
    const colors = {
      low: 'bg-gray-500',
      medium: 'bg-blue-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Projects
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {userRole === 'agent'
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
                      {new Date(project.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {project.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
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

        {/* Project Detail Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedProject.title}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className={`${getStatusColor(selectedProject.status)} text-white text-sm px-3 py-1 rounded-full`}>
                        {selectedProject.status}
                      </span>
                      {selectedProject.platform && (
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          Platform: {selectedProject.platform}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProject(null)}
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
                      onClick={() => setShowUpdateModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Add Update
                    </button>
                    <button
                      onClick={() => setShowActionModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Add Action
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-6">
                {/* Project Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Project Information
                  </h3>
                  {selectedProject.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {selectedProject.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Total Hours:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedProject.total_hours}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Screen Sharing Hours:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedProject.total_screen_sharing_hours}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Pending Actions:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedProject.pending_actions_count}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Completed Actions:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedProject.completed_actions_count}</span>
                    </div>
                  </div>
                </div>

                {/* Updates Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Project Updates ({selectedProject.updates.length})
                  </h3>
                  {selectedProject.updates.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No updates yet</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedProject.updates.map((update) => (
                        <div
                          key={update.id}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {update.update_title}
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(update.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                            {update.update_content}
                          </p>

                          <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Hours:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {update.hours_completed}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Screen Share:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {update.screen_sharing_hours}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Progress:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {update.progress_percentage}%
                              </span>
                            </div>
                          </div>

                          {update.blockers.length > 0 && (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-red-600 dark:text-red-400">Blockers:</span>
                              <ul className="mt-1 text-sm text-gray-600 dark:text-gray-300 list-disc list-inside">
                                {update.blockers.map((blocker, idx) => (
                                  <li key={idx}>{blocker}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {update.next_steps.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Next Steps:</span>
                              <ul className="mt-1 text-sm text-gray-600 dark:text-gray-300 list-disc list-inside">
                                {update.next_steps.map((step, idx) => (
                                  <li key={idx}>{step}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Action Items ({selectedProject.actions.length})
                  </h3>
                  {selectedProject.actions.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No actions yet</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedProject.actions.map((action) => (
                        <div
                          key={action.id}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
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

                              <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                                {action.assigned_to_candidate && (
                                  <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Assigned to Candidate
                                  </span>
                                )}
                                {action.assigned_to_agent && (
                                  <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Assigned to Agent
                                  </span>
                                )}
                                {action.due_date && (
                                  <span>Due: {new Date(action.due_date).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>

                            {/* Status Change Buttons */}
                            {action.status !== 'completed' && action.status !== 'cancelled' && (
                              <div className="flex gap-2">
                                {action.status === 'pending' && (
                                  <button
                                    onClick={() => updateActionStatus(action.id, 'in_progress')}
                                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded transition-colors"
                                  >
                                    Start
                                  </button>
                                )}
                                <button
                                  onClick={() => updateActionStatus(action.id, 'completed')}
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
        )}

        {/* Add Update Modal */}
        {showUpdateModal && selectedProject && userRole === 'agent' && (
          <UpdateFormModal
            projectId={selectedProject.id}
            onClose={() => setShowUpdateModal(false)}
            onSubmit={createUpdate}
          />
        )}

        {/* Add Action Modal */}
        {showActionModal && selectedProject && (
          <ActionFormModal
            projectId={selectedProject.id}
            onClose={() => setShowActionModal(false)}
            onSubmit={createAction}
          />
        )}
      </div>
    </div>
  );
}

// Update Form Modal Component
function UpdateFormModal({
  projectId,
  onClose,
  onSubmit
}: {
  projectId: number;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    project_id: projectId,
    update_title: '',
    update_content: '',
    hours_completed: 0,
    screen_sharing_hours: 0,
    progress_percentage: 0,
    blockers: '',
    concerns: '',
    next_steps: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      blockers: formData.blockers.split('\n').filter(b => b.trim()),
      next_steps: formData.next_steps.split('\n').filter(s => s.trim())
    });
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Blockers (one per line)
            </label>
            <textarea
              rows={3}
              value={formData.blockers}
              onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Next Steps (one per line)
            </label>
            <textarea
              rows={3}
              value={formData.next_steps}
              onChange={(e) => setFormData({ ...formData, next_steps: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
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

// Action Form Modal Component
function ActionFormModal({
  projectId,
  onClose,
  onSubmit
}: {
  projectId: number;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    project_id: projectId,
    title: '',
    description: '',
    action_type: 'task',
    assigned_to_candidate: false,
    assigned_to_agent: false,
    priority: 'medium' as ProjectActionPriority,
    due_date: '',
    scheduled_time: '',
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
                <option value="document">Document</option>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Scheduled Time
              </label>
              <input
                type="datetime-local"
                value={formData.scheduled_time}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Platform (optional)
              </label>
              <input
                type="text"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Platform URL (optional)
              </label>
              <input
                type="url"
                value={formData.platform_url}
                onChange={(e) => setFormData({ ...formData, platform_url: e.target.value })}
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
