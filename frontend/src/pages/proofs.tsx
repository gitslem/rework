import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/authStore';
import {
  Shield, Github, FileCheck, Award, Plus, Eye, Download,
  CheckCircle, Clock, XCircle, AlertCircle, ExternalLink
} from 'lucide-react';
import Head from 'next/head';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface Proof {
  id: number;
  proof_type: string;
  status: string;
  description: string;
  github_repo_name?: string;
  github_commit_hash?: string;
  github_pr_number?: number;
  file_name?: string;
  verified_at?: string;
  created_at: string;
}

interface Certificate {
  id: number;
  certificate_id: string;
  title: string;
  milestone_name: string;
  status: string;
  issued_at: string;
  verification_url?: string;
}

export default function ProofsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loadingProofs, setLoadingProofs] = useState(true);
  const [activeTab, setActiveTab] = useState<'proofs' | 'certificates'>('proofs');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // GitHub connection state
  const [githubConnected, setGithubConnected] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProofs();
      fetchCertificates();
      checkGithubConnection();
    }
  }, [isAuthenticated]);

  const checkGithubConnection = () => {
    // Check if user has GitHub connected
    // TODO: Implement GitHub OAuth integration
    // For now, GitHub is not connected until OAuth is implemented
    setGithubConnected(false);
  };

  const fetchProofs = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/proofs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProofs(response.data);
    } catch (error) {
      console.error('Failed to fetch proofs:', error);
    } finally {
      setLoadingProofs(false);
    }
  };

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/proofs/certificates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCertificates(response.data);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    }
  };

  const connectGithub = () => {
    // Redirect to GitHub OAuth
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/github/callback`;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user:email`;
  };

  const getStatusIcon = (status: string) => {
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

  if (isLoading || loadingProofs) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-accent-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Head>
        <title>Proof of Build - Relaywork</title>
      </Head>

      <div className="min-h-screen bg-accent-gray-100">
        {/* Header */}
        <header className="bg-white border-b border-accent-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-accent-dark flex items-center">
                <Shield className="w-8 h-8 text-primary-500 mr-3" />
                Proof of Build
              </h1>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-accent-gray-600 hover:text-primary-500"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* GitHub Connection Banner */}
          {!githubConnected && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <Github className="w-6 h-6 text-blue-600 mt-1 mr-4" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Connect Your GitHub Account
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Connect your GitHub account to verify commits, pull requests, and repositories as proof of work.
                  </p>
                  <button
                    onClick={connectGithub}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    Connect GitHub
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveTab('proofs')}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'proofs'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-accent-gray-600 hover:bg-accent-gray-50'
              }`}
            >
              <Shield className="w-5 h-5 inline mr-2" />
              Proofs ({proofs.length})
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'certificates'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-accent-gray-600 hover:bg-accent-gray-50'
              }`}
            >
              <Award className="w-5 h-5 inline mr-2" />
              Certificates ({certificates.length})
            </button>
          </div>

          {/* Proofs Tab */}
          {activeTab === 'proofs' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-accent-dark">Your Proofs</h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition flex items-center"
                  disabled={!githubConnected}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Proof
                </button>
              </div>

              {proofs.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <Shield className="w-16 h-16 text-accent-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-accent-dark mb-2">No Proofs Yet</h3>
                  <p className="text-accent-gray-600 mb-6">
                    Start creating proofs to verify your work delivery
                  </p>
                  {githubConnected && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition"
                    >
                      Create Your First Proof
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
                  {proofs.map((proof) => (
                    <div key={proof.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="p-3 bg-accent-gray-100 rounded-lg">
                            {getProofTypeIcon(proof.proof_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-accent-dark">{proof.description}</h3>
                              {getStatusIcon(proof.status)}
                            </div>
                            <div className="text-sm text-accent-gray-600 space-y-1">
                              <p>Type: <span className="font-medium">{proof.proof_type}</span></p>
                              {proof.github_repo_name && (
                                <p>Repository: <span className="font-medium">{proof.github_repo_name}</span></p>
                              )}
                              {proof.github_commit_hash && (
                                <p>Commit: <span className="font-mono text-xs">{proof.github_commit_hash.slice(0, 7)}</span></p>
                              )}
                              {proof.github_pr_number && (
                                <p>PR: <span className="font-medium">#{proof.github_pr_number}</span></p>
                              )}
                              {proof.file_name && (
                                <p>File: <span className="font-medium">{proof.file_name}</span></p>
                              )}
                              {proof.verified_at && (
                                <p>Verified: <span className="font-medium">{new Date(proof.verified_at).toLocaleDateString()}</span></p>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => router.push(`/proofs/${proof.id}`)}
                          className="text-primary-500 hover:text-primary-600 p-2"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Certificates Tab */}
          {activeTab === 'certificates' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-accent-dark">Your Certificates</h2>
                <button
                  onClick={() => router.push('/proofs/certificates/new')}
                  className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition flex items-center"
                  disabled={proofs.length === 0}
                >
                  <Award className="w-5 h-5 mr-2" />
                  Generate Certificate
                </button>
              </div>

              {certificates.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <Award className="w-16 h-16 text-accent-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-accent-dark mb-2">No Certificates Yet</h3>
                  <p className="text-accent-gray-600 mb-6">
                    Generate certificates from your verified proofs to showcase your achievements
                  </p>
                  {proofs.length > 0 && (
                    <button
                      onClick={() => router.push('/proofs/certificates/new')}
                      className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition"
                    >
                      Generate Your First Certificate
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="p-3 bg-yellow-100 rounded-lg">
                            <Award className="w-6 h-6 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-accent-dark mb-2">{cert.title}</h3>
                            <div className="text-sm text-accent-gray-600 space-y-1">
                              <p>Certificate ID: <span className="font-mono text-xs">{cert.certificate_id}</span></p>
                              <p>Milestone: <span className="font-medium">{cert.milestone_name}</span></p>
                              <p>Issued: <span className="font-medium">{new Date(cert.issued_at).toLocaleDateString()}</span></p>
                              <p>Status: <span className={`font-medium ${cert.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                                {cert.status}
                              </span></p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {cert.verification_url && (
                            <a
                              href={cert.verification_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-500 hover:text-primary-600 p-2"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          )}
                          <button className="text-primary-500 hover:text-primary-600 p-2">
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
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
