import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/authStore';
import { getFirebaseFirestore } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import Head from 'next/head';
import {
  Globe2,
  ArrowLeft,
  Briefcase,
  Clock,
  DollarSign,
  Calendar,
  BadgeCheck,
  MapPin,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  Shield,
  Github,
  FileCheck,
  Eye,
  Download,
  XCircle,
} from 'lucide-react';
import axios from 'axios';

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: string;
  status: string;
  required_skills: string[];
  created_at: string;
  owner_id: number;
  owner: {
    id: number;
    email: string;
    profile?: {
      first_name?: string;
      last_name?: string;
      company_name?: string;
    };
  };
}

interface Application {
  id: number;
  project_id: number;
  applicant_id: number;
  status: string;
  created_at: string;
}

interface Proof {
  id: number;
  user_id: number;
  project_id: number;
  proof_type: string;
  status: string;
  description: string;
  github_repo_name?: string;
  github_commit_hash?: string;
  github_pr_number?: number;
  github_pr_url?: string;
  file_name?: string;
  file_url?: string;
  verified_at?: string;
  created_at: string;
  verification_metadata?: any;
}

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'proofs'>('overview');
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loadingProofs, setLoadingProofs] = useState(false);
  const [canViewProofs, setCanViewProofs] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProject();
      if (isAuthenticated) {
        checkApplication();
        fetchUserRole();
      }
    }
  }, [id, isAuthenticated]);

  const fetchUserRole = async () => {
    if (!user?.id) return;

    try {
      const db = getFirebaseFirestore();
      const userDoc = await getDoc(doc(db, 'users', String(user.id)));
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role || null);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  useEffect(() => {
    // Check if user is project owner
    if (project && user && project.owner_id === user.id) {
      setCanViewProofs(true);
    }
  }, [project, user]);

  useEffect(() => {
    // Fetch proofs when switching to proofs tab
    if (activeTab === 'proofs' && canViewProofs && isAuthenticated) {
      fetchProofs();
    }
  }, [activeTab, canViewProofs, isAuthenticated, id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_URL}/api/v1/projects/${id}`);
      setProject(response.data);
    } catch (error: any) {
      console.error('Error fetching project:', error);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const checkApplication = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('access_token');

      if (!token) return;

      // Get user's applications
      const response = await axios.get(`${API_URL}/api/v1/applications/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Check if user has applied to this project
      const userApplication = response.data.find(
        (app: Application) => app.project_id === Number(id)
      );

      if (userApplication) {
        setHasApplied(true);
        setApplication(userApplication);

        // Can view proofs if accepted
        if (userApplication.status === 'accepted') {
          setCanViewProofs(true);
        }
      }
    } catch (error) {
      console.error('Error checking application:', error);
    }
  };

  const fetchProofs = async () => {
    try {
      setLoadingProofs(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('access_token');

      if (!token) return;

      const response = await axios.get(`${API_URL}/api/v1/projects/${id}/proofs`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProofs(response.data);
    } catch (error: any) {
      console.error('Error fetching proofs:', error);
      // If 403, user doesn't have access to proofs
      if (error.response?.status === 403) {
        setCanViewProofs(false);
      }
    } finally {
      setLoadingProofs(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      ai_development: 'bg-blue-100 text-blue-700',
      automation: 'bg-purple-100 text-purple-700',
      prompt_engineering: 'bg-pink-100 text-pink-700',
      ml_training: 'bg-green-100 text-green-700',
      integration: 'bg-orange-100 text-orange-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      withdrawn: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/projects/' + id);
      return;
    }

    if (user?.role === 'company') {
      setError('Companies cannot apply to projects. Please switch to a freelancer account.');
      return;
    }

    router.push(`/projects/${id}/apply`);
  };

  const getProofStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getProofTypeIcon = (type: string) => {
    switch (type) {
      case 'commit':
      case 'pull_request':
      case 'repository':
        return <Github className="w-5 h-5" />;
      case 'file':
      case 'screenshot':
        return <FileCheck className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Project</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/projects')}
            className="btn-primary"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-6">The project you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/projects')}
            className="btn-primary"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const isOwnProject = user?.id === project.owner_id;

  return (
    <>
      <Head>
        <title>{project.title} - Remote-Works</title>
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
                  onClick={() => {
                    // Navigate back to user's profile if authenticated, otherwise to projects
                    if (isAuthenticated && userRole) {
                      if (userRole === 'agent') {
                        router.push('/agent-info');
                      } else if (userRole === 'candidate') {
                        router.push('/candidate-info');
                      } else {
                        router.push('/projects');
                      }
                    } else {
                      router.push('/projects');
                    }
                  }}
                  className="text-accent-gray-600 hover:text-primary-500 transition font-medium flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {isAuthenticated && userRole ? 'Back to Profile' : 'All Projects'}
                </button>
                {isAuthenticated ? (
                  <button onClick={() => router.push('/dashboard')} className="btn-primary">
                    Dashboard
                  </button>
                ) : (
                  <>
                    <button onClick={() => router.push('/login')} className="text-accent-gray-600 hover:text-primary-500 transition font-medium">
                      Login
                    </button>
                    <button onClick={() => router.push('/register')} className="btn-primary">
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="mb-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
                      project.category
                    )}`}
                  >
                    {project.category.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-accent-dark mb-4">
                  {project.title}
                </h1>
              </div>
            </div>

            {/* Company Info */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <BadgeCheck className="w-7 h-7 text-primary-500" />
              </div>
              <div>
                <p className="text-lg font-semibold text-accent-dark">
                  {project.owner?.profile?.company_name || 'Company'}
                </p>
                <p className="text-sm text-accent-gray-600">Posted {formatDate(project.created_at)}</p>
              </div>
            </div>

            {/* Key Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-8 h-8 text-primary-600" />
                  <div>
                    <p className="text-sm text-accent-gray-600">Budget</p>
                    <p className="text-2xl font-bold text-accent-dark">
                      ${project.budget.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-accent-gray-600">Deadline</p>
                    <p className="text-lg font-bold text-accent-dark">
                      {formatDate(project.deadline)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-accent-gray-600">Status</p>
                    <p className="text-lg font-bold text-accent-dark capitalize">
                      {project.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Status Alert */}
            {hasApplied && application && (
              <div className={`rounded-xl p-4 border-2 mb-6 ${
                application.status === 'accepted'
                  ? 'bg-green-50 border-green-300'
                  : application.status === 'rejected'
                  ? 'bg-red-50 border-red-300'
                  : 'bg-yellow-50 border-yellow-300'
              }`}>
                <div className="flex items-center space-x-3">
                  <CheckCircle className={`w-6 h-6 ${
                    application.status === 'accepted'
                      ? 'text-green-600'
                      : application.status === 'rejected'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`} />
                  <div>
                    <p className="font-semibold text-accent-dark">
                      {application.status === 'accepted' && 'Application Accepted!'}
                      {application.status === 'rejected' && 'Application Not Selected'}
                      {application.status === 'pending' && 'Application Submitted'}
                    </p>
                    <p className="text-sm text-accent-gray-600">
                      {application.status === 'accepted' && 'You can now start working on this project. Check your dashboard for details.'}
                      {application.status === 'rejected' && 'Thank you for your interest. Keep exploring other opportunities!'}
                      {application.status === 'pending' && 'Your application is being reviewed by the company.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tabs - Only show if user can view proofs */}
          {canViewProofs && (
            <div className="flex space-x-4 mb-8 border-b border-accent-gray-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 font-medium transition border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-accent-gray-600 hover:text-primary-500'
                }`}
              >
                <FileText className="w-5 h-5 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('proofs')}
                className={`px-6 py-3 font-medium transition border-b-2 ${
                  activeTab === 'proofs'
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-accent-gray-600 hover:text-primary-500'
                }`}
              >
                <Shield className="w-5 h-5 inline mr-2" />
                Proofs ({proofs.length})
              </button>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Description */}
              <div className="bg-white rounded-2xl border-2 border-accent-gray-200 p-8 mb-6">
            <h2 className="text-2xl font-bold text-accent-dark mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary-500" />
              Project Description
            </h2>
            <p className="text-accent-gray-700 leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>

          {/* Required Skills */}
          {project.required_skills && project.required_skills.length > 0 && (
            <div className="bg-white rounded-2xl border-2 border-accent-gray-200 p-8 mb-6">
              <h2 className="text-2xl font-bold text-accent-dark mb-4 flex items-center gap-2">
                <BadgeCheck className="w-6 h-6 text-primary-500" />
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-3">
                {project.required_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-semibold border border-primary-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Apply Button */}
          <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl border-2 border-primary-200 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-accent-dark mb-4">
                Interested in this project?
              </h2>
              {!isAuthenticated ? (
                <>
                  <p className="text-accent-gray-600 mb-6">
                    Sign in to submit your application and showcase your AI expertise.
                  </p>
                  <button
                    onClick={() => router.push('/login?redirect=/projects/' + id)}
                    className="btn-primary text-lg px-8 py-4"
                  >
                    Sign In to Apply
                  </button>
                </>
              ) : isOwnProject ? (
                <>
                  <p className="text-accent-gray-600 mb-6">
                    This is your project. Review and manage applications from freelancers.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => router.push(`/projects/${id}/applications`)}
                      className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
                    >
                      <Users className="w-5 h-5" />
                      View Applications
                    </button>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="bg-accent-gray-600 hover:bg-accent-gray-700 text-white px-8 py-4 rounded-lg font-bold transition text-lg"
                    >
                      Dashboard
                    </button>
                  </div>
                </>
              ) : hasApplied ? (
                <>
                  <p className="text-accent-gray-600 mb-6">
                    You've already applied to this project. Check your dashboard for updates.
                  </p>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-accent-gray-600 hover:bg-accent-gray-700 text-white px-8 py-4 rounded-lg font-bold transition text-lg"
                  >
                    View Dashboard
                  </button>
                </>
              ) : (
                <>
                  <p className="text-accent-gray-600 mb-6">
                    Submit your application with a cover letter and proposed rate.
                  </p>
                  <button
                    onClick={handleApplyClick}
                    className="btn-primary text-lg px-8 py-4 transform hover:scale-105 transition"
                  >
                    Apply Now
                  </button>
                </>
              )}
            </div>
          </div>
            </>
          )}

          {/* Proofs Tab */}
          {activeTab === 'proofs' && (
            <div>
              {loadingProofs ? (
                <div className="bg-white rounded-2xl border-2 border-accent-gray-200 p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="mt-4 text-accent-gray-600">Loading proofs...</p>
                </div>
              ) : proofs.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-accent-gray-200 p-12 text-center">
                  <Shield className="w-16 h-16 text-accent-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-accent-dark mb-2">No Proofs Yet</h3>
                  <p className="text-accent-gray-600">
                    {user?.id === project?.owner_id
                      ? 'No proofs have been submitted for this project yet.'
                      : 'Submit proofs to verify your work delivery.'}
                  </p>
                  {user?.id !== project?.owner_id && (
                    <button
                      onClick={() => router.push('/proofs')}
                      className="mt-6 btn-primary"
                    >
                      Create Proof
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-accent-dark">
                      Project Proofs ({proofs.length})
                    </h2>
                    {user?.id !== project?.owner_id && (
                      <button
                        onClick={() => router.push('/proofs')}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Shield className="w-5 h-5" />
                        Add Proof
                      </button>
                    )}
                  </div>

                  {proofs.map((proof) => (
                    <div
                      key={proof.id}
                      className="bg-white rounded-2xl border-2 border-accent-gray-200 p-6 hover:shadow-lg transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="p-3 bg-accent-gray-100 rounded-lg">
                            {getProofTypeIcon(proof.proof_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-accent-dark text-lg">
                                {proof.description}
                              </h3>
                              {getProofStatusIcon(proof.status)}
                            </div>
                            <div className="text-sm text-accent-gray-600 space-y-1">
                              <p>
                                Type:{' '}
                                <span className="font-medium">
                                  {proof.proof_type.replace('_', ' ').toUpperCase()}
                                </span>
                              </p>
                              {proof.github_repo_name && (
                                <p>
                                  Repository:{' '}
                                  <span className="font-medium">{proof.github_repo_name}</span>
                                </p>
                              )}
                              {proof.github_commit_hash && (
                                <p className="flex items-center gap-2">
                                  Commit:{' '}
                                  <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                                    {proof.github_commit_hash.slice(0, 7)}
                                  </code>
                                </p>
                              )}
                              {proof.github_pr_number && (
                                <p>
                                  Pull Request:{' '}
                                  <a
                                    href={proof.github_pr_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-primary-500 hover:underline"
                                  >
                                    #{proof.github_pr_number}
                                  </a>
                                </p>
                              )}
                              {proof.file_name && (
                                <p>
                                  File: <span className="font-medium">{proof.file_name}</span>
                                </p>
                              )}
                              {proof.verified_at && (
                                <p>
                                  Verified:{' '}
                                  <span className="font-medium text-green-600">
                                    {formatDate(proof.verified_at)}
                                  </span>
                                </p>
                              )}
                              <p className="text-xs text-accent-gray-500">
                                Submitted: {formatDate(proof.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => router.push(`/proofs/${proof.id}`)}
                          className="text-primary-500 hover:text-primary-600 p-2 ml-4"
                          title="View details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Metadata Display */}
                      {proof.verification_metadata && (
                        <div className="mt-4 pt-4 border-t border-accent-gray-200">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            {proof.verification_metadata.additions !== undefined && (
                              <div>
                                <span className="text-accent-gray-600">Additions:</span>
                                <span className="ml-2 font-semibold text-green-600">
                                  +{proof.verification_metadata.additions}
                                </span>
                              </div>
                            )}
                            {proof.verification_metadata.deletions !== undefined && (
                              <div>
                                <span className="text-accent-gray-600">Deletions:</span>
                                <span className="ml-2 font-semibold text-red-600">
                                  -{proof.verification_metadata.deletions}
                                </span>
                              </div>
                            )}
                            {proof.verification_metadata.files_changed !== undefined && (
                              <div>
                                <span className="text-accent-gray-600">Files:</span>
                                <span className="ml-2 font-semibold">
                                  {proof.verification_metadata.files_changed}
                                </span>
                              </div>
                            )}
                            {proof.verification_metadata.author && (
                              <div>
                                <span className="text-accent-gray-600">Author:</span>
                                <span className="ml-2 font-semibold">
                                  {proof.verification_metadata.author}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
