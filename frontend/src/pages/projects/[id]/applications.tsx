import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/authStore';
import Head from 'next/head';
import {
  Globe2,
  ArrowLeft,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Star,
  DollarSign,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Applicant {
  application_id: number;
  user_id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  skills?: string[];
  hourly_rate?: number;
  status: string;
  cover_letter: string;
  proposed_rate?: number;
  project_duration?: string;
  total_cost?: number;
  revisions_included?: number;
  additional_info?: string;
  ai_match_score?: number;
  applied_at: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  owner_id: number;
}

export default function ProjectApplications() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (id && isAuthenticated) {
      fetchProjectAndApplications();
    }
  }, [id, isAuthenticated]);

  const fetchProjectAndApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      // Fetch project
      const projectResponse = await axios.get(`${API_URL}/api/v1/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(projectResponse.data);

      // Verify ownership
      if (projectResponse.data.owner_id !== user?.id) {
        setError('You are not authorized to view applications for this project');
        setLoading(false);
        return;
      }

      // Fetch applications
      const applicantsResponse = await axios.get(
        `${API_URL}/api/v1/applications/project/${id}/applicants`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setApplicants(applicantsResponse.data.applicants || []);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      setError(error.response?.data?.detail || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: number, newStatus: 'accepted' | 'rejected') => {
    try {
      setUpdating(applicationId);
      const token = localStorage.getItem('access_token');

      await axios.patch(
        `${API_URL}/api/v1/applications/${applicationId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update local state
      setApplicants(prev =>
        prev.map(app =>
          app.application_id === applicationId
            ? { ...app, status: newStatus }
            : app
        )
      );
    } catch (error: any) {
      console.error('Error updating application:', error);
      alert(error.response?.data?.detail || 'Failed to update application');
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      accepted: 'bg-green-100 text-green-700 border-green-300',
      rejected: 'bg-red-100 text-red-700 border-red-300',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  if (!isAuthenticated || user?.role !== 'business') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Only company accounts can view applications</p>
          <button onClick={() => router.push('/login')} className="btn-primary">
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => router.back()} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Applications - {project?.title} - Relaywork</title>
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-accent-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
                <Globe2 className="w-8 h-8 text-primary-500 mr-2" />
                <div className="text-2xl font-bold text-accent-dark">
                  Relay<span className="gradient-text">work</span>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => router.push(`/projects/${id}`)}
                  className="text-accent-gray-600 hover:text-primary-500 transition font-medium flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Project
                </button>
                <button onClick={() => router.push('/dashboard')} className="btn-primary">
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-accent-dark mb-2 flex items-center gap-3">
              <Users className="w-10 h-10 text-primary-500" />
              Applications
            </h1>
            <p className="text-xl text-accent-gray-600">
              {project?.title}
            </p>
            <p className="text-accent-gray-500 mt-2">
              {applicants.length} {applicants.length === 1 ? 'application' : 'applications'} received
            </p>
          </div>

          {/* Applications List */}
          {applicants.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Applications Yet
              </h3>
              <p className="text-gray-600">
                Applications will appear here once freelancers apply to your project
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {applicants.map((applicant) => (
                <div
                  key={applicant.application_id}
                  className="bg-white border-2 border-accent-gray-200 rounded-xl p-6 hover:shadow-lg transition"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary-600">
                          {(applicant.first_name || applicant.email)[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-accent-dark">
                          {applicant.first_name && applicant.last_name
                            ? `${applicant.first_name} ${applicant.last_name}`
                            : applicant.email.split('@')[0]}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-accent-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {applicant.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Applied {formatDate(applicant.applied_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 capitalize ${getStatusBadge(
                          applicant.status
                        )}`}
                      >
                        {applicant.status}
                      </span>
                      {applicant.ai_match_score && (
                        <div className="flex items-center gap-1 text-sm text-accent-gray-600">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          {applicant.ai_match_score.toFixed(0)}% Match
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Proposal Details */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    {applicant.total_cost && (
                      <div>
                        <p className="text-xs text-accent-gray-500 mb-1">Total Cost</p>
                        <p className="text-lg font-bold text-accent-dark flex items-center gap-1">
                          <DollarSign className="w-5 h-5" />
                          {applicant.total_cost.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {applicant.proposed_rate && (
                      <div>
                        <p className="text-xs text-accent-gray-500 mb-1">Hourly Rate</p>
                        <p className="text-lg font-bold text-accent-dark">
                          ${applicant.proposed_rate}/hr
                        </p>
                      </div>
                    )}
                    {applicant.project_duration && (
                      <div>
                        <p className="text-xs text-accent-gray-500 mb-1">Duration</p>
                        <p className="text-lg font-bold text-accent-dark flex items-center gap-1">
                          <Clock className="w-5 h-5" />
                          {applicant.project_duration}
                        </p>
                      </div>
                    )}
                    {applicant.revisions_included !== null && applicant.revisions_included !== undefined && (
                      <div>
                        <p className="text-xs text-accent-gray-500 mb-1">Revisions</p>
                        <p className="text-lg font-bold text-accent-dark">
                          {applicant.revisions_included} included
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Cover Letter */}
                  {applicant.cover_letter && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-accent-dark mb-2">Cover Letter</h4>
                      <p className="text-accent-gray-700 whitespace-pre-wrap">
                        {applicant.cover_letter}
                      </p>
                    </div>
                  )}

                  {/* Additional Info */}
                  {applicant.additional_info && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-accent-dark mb-2">Additional Information</h4>
                      <p className="text-accent-gray-700 whitespace-pre-wrap">
                        {applicant.additional_info}
                      </p>
                    </div>
                  )}

                  {/* Skills */}
                  {applicant.skills && applicant.skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-accent-dark mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {applicant.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium border border-primary-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {applicant.status === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t border-accent-gray-200">
                      <button
                        onClick={() => handleUpdateStatus(applicant.application_id, 'accepted')}
                        disabled={updating === applicant.application_id}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                      >
                        <CheckCircle className="w-5 h-5" />
                        {updating === applicant.application_id ? 'Accepting...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(applicant.application_id, 'rejected')}
                        disabled={updating === applicant.application_id}
                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                      >
                        <XCircle className="w-5 h-5" />
                        {updating === applicant.application_id ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
