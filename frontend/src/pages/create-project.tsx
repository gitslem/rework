import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/authStore';
import Head from 'next/head';
import {
  Globe2, ArrowLeft, Sparkles, Loader2, CheckCircle, Clock,
  DollarSign, Wrench, Target, TrendingUp, RefreshCw
} from 'lucide-react';
import axios from 'axios';

interface AIBriefResult {
  goal: string;
  deliverables: string[];
  tech_stack: string[];
  steps: string[];
  estimated_timeline: string;
  estimated_budget_min: number;
  estimated_budget_max: number;
  required_skills: string[];
  confidence_score: number;
}

export default function CreateProject() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(1);

  // Form data
  const [rawDescription, setRawDescription] = useState('');
  const [projectType, setProjectType] = useState('chatbot');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // AI result
  const [aiBrief, setAiBrief] = useState<AIBriefResult | null>(null);

  const projectTypes = [
    { value: 'chatbot', label: 'AI Chatbot', description: 'Build conversational AI interfaces' },
    { value: 'automation', label: 'Automation', description: 'Workflow automation & integrations' },
    { value: 'fine-tune', label: 'Model Fine-tuning', description: 'Custom AI model training' },
    { value: 'integration', label: 'API Integration', description: 'Connect AI services to your app' },
    { value: 'rag', label: 'RAG System', description: 'Retrieval-augmented generation' },
    { value: 'other', label: 'Other AI Project', description: 'Custom AI development' }
  ];

  const handleGenerateBrief = async () => {
    if (!rawDescription || rawDescription.length < 20) {
      setError('Please provide a detailed description (at least 20 characters)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('access_token');

      const response = await axios.post(
        `${API_URL}/api/v1/ai-briefs/generate`,
        {
          raw_description: rawDescription,
          project_type: projectType,
          reference_files: []
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setAiBrief(response.data);
      setStep(2);
    } catch (err: any) {
      console.error('Error generating brief:', err);
      setError(err.response?.data?.detail || 'Failed to generate project brief. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    setAiBrief(null);
    setStep(1);
  };

  const handlePostProject = async () => {
    if (!aiBrief) return;

    setLoading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('access_token');

      // Call the new post-project endpoint that saves brief and creates project
      await axios.post(
        `${API_URL}/api/v1/ai-briefs/post-project`,
        {
          brief_data: {
            raw_description: rawDescription,
            project_type: projectType,
            reference_files: []
          },
          ai_data: aiBrief
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Redirect to dashboard on success
      router.push('/company-dashboard?posted=true');
    } catch (err: any) {
      console.error('Error posting project:', err);
      setError(err.response?.data?.detail || 'Failed to post project. Please try again.');
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-accent-dark mb-4">Please log in</h2>
          <button onClick={() => router.push('/login')} className="btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (user?.role !== 'business' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-accent-dark mb-4">Access Denied</h2>
          <p className="text-accent-gray-600 mb-6">Only business users can create projects.</p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Create Project with AI - Remote-Works</title>
      </Head>

      <div className="min-h-screen bg-accent-gray-100">
        {/* Header */}
        <header className="bg-white border-b border-accent-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
                <Globe2 className="w-8 h-8 text-primary-500 mr-2" />
                <div className="text-2xl font-bold text-accent-dark">
                  Relay<span className="gradient-text">work</span>
                </div>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-outline inline-flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-primary-100 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-5 h-5 text-primary-700" />
              <span className="text-primary-700 font-semibold">Smart Project Brief</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-accent-dark mb-4">
              AI-Powered Project Creation
            </h1>
            <p className="text-xl text-accent-gray-600 max-w-2xl mx-auto">
              Describe what you want built, and our AI transforms it into a clear project brief with deliverables, timeline, and budget.
            </p>
          </div>

          {step === 1 && (
            <div className="bg-white rounded-2xl border-2 border-accent-gray-200 p-8 md:p-12">
              <h2 className="text-2xl font-bold text-accent-dark mb-6">
                Step 1: Describe Your Project
              </h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {/* Project Type Selection */}
              <div className="mb-8">
                <label className="block text-accent-dark font-semibold mb-4">
                  What type of AI project do you need?
                </label>
                <div className="grid md:grid-cols-3 gap-4">
                  {projectTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setProjectType(type.value)}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        projectType === type.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-accent-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="font-bold text-accent-dark mb-1">{type.label}</div>
                      <div className="text-sm text-accent-gray-600">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Textarea */}
              <div className="mb-8">
                <label className="block text-accent-dark font-semibold mb-2">
                  Describe what you want built
                  <span className="text-accent-gray-500 text-sm font-normal ml-2">
                    (Be as detailed as possible)
                  </span>
                </label>
                <textarea
                  value={rawDescription}
                  onChange={(e) => setRawDescription(e.target.value)}
                  placeholder="Example: I need an AI chatbot for my e-commerce website that can help customers find products, answer questions about shipping and returns, and process simple orders. It should integrate with our existing Shopify store and support multiple languages."
                  rows={8}
                  className="input-field resize-none"
                />
                <div className="text-sm text-accent-gray-500 mt-2">
                  {rawDescription.length} / 5000 characters
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateBrief}
                disabled={loading || rawDescription.length < 20}
                className="btn-primary w-full text-lg inline-flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Project Brief with AI
                  </>
                )}
              </button>

              <p className="text-center text-sm text-accent-gray-500 mt-4">
                Our AI will analyze your description and create a structured project brief with deliverables, timeline, and budget estimate.
              </p>
            </div>
          )}

          {step === 2 && aiBrief && (
            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* AI Confidence Score */}
              <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">AI Brief Generated!</h3>
                    <p className="text-white/90">
                      Review the generated project brief below and make any adjustments.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold">{(aiBrief.confidence_score * 100).toFixed(0)}%</div>
                    <div className="text-sm text-white/80">Confidence</div>
                  </div>
                </div>
              </div>

              {/* Goal */}
              <div className="bg-white rounded-2xl border-2 border-accent-gray-200 p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="w-8 h-8 text-primary-500" />
                  <h3 className="text-2xl font-bold text-accent-dark">Project Goal</h3>
                </div>
                <p className="text-lg text-accent-gray-700">{aiBrief.goal}</p>
              </div>

              {/* Budget & Timeline */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border-2 border-accent-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <DollarSign className="w-6 h-6 text-green-500" />
                    <h3 className="text-xl font-bold text-accent-dark">Estimated Budget</h3>
                  </div>
                  <div className="text-3xl font-bold text-accent-dark">
                    ${aiBrief.estimated_budget_min.toLocaleString()} - ${aiBrief.estimated_budget_max.toLocaleString()}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-accent-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Clock className="w-6 h-6 text-blue-500" />
                    <h3 className="text-xl font-bold text-accent-dark">Timeline</h3>
                  </div>
                  <div className="text-3xl font-bold text-accent-dark">
                    {aiBrief.estimated_timeline}
                  </div>
                </div>
              </div>

              {/* Deliverables */}
              <div className="bg-white rounded-2xl border-2 border-accent-gray-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h3 className="text-2xl font-bold text-accent-dark">Deliverables</h3>
                </div>
                <ul className="space-y-3">
                  {aiBrief.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span className="text-accent-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tech Stack */}
              <div className="bg-white rounded-2xl border-2 border-accent-gray-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Wrench className="w-6 h-6 text-purple-500" />
                  <h3 className="text-2xl font-bold text-accent-dark">Recommended Tech Stack</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {aiBrief.tech_stack.map((tech, idx) => (
                    <span key={idx} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Implementation Steps */}
              <div className="bg-white rounded-2xl border-2 border-accent-gray-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                  <h3 className="text-2xl font-bold text-accent-dark">Implementation Steps</h3>
                </div>
                <ol className="space-y-4">
                  {aiBrief.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-accent-gray-700 pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Required Skills */}
              <div className="bg-white rounded-2xl border-2 border-accent-gray-200 p-8">
                <h3 className="text-2xl font-bold text-accent-dark mb-6">Required Skills</h3>
                <div className="flex flex-wrap gap-3">
                  {aiBrief.required_skills.map((skill, idx) => (
                    <span key={idx} className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleRegenerate}
                  className="btn-outline flex-1 inline-flex items-center justify-center"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Regenerate Brief
                </button>
                <button
                  onClick={handlePostProject}
                  disabled={loading}
                  className="btn-primary flex-1 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Post Project
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
