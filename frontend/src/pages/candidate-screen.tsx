import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  ArrowLeft,
  Menu,
  X,
  Monitor,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Video,
  Lock,
  UserCheck,
  Calendar,
  FileCheck,
  Eye,
  Users,
  Award,
  Zap,
  TrendingUp,
  Settings,
  PlayCircle,
  Download,
  Smartphone,
  Laptop
} from 'lucide-react';
import { auth } from '../utils/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export default function CandidateScreen() {
  const router = useRouter();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'how-it-works' | 'security'>('overview');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUser(user);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Screen Sharing Guide - Remote-Works</title>
        <meta name="description" content="Learn how secure screen sharing helps you maximize earnings and manage multiple gigs efficiently" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Back Button */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/candidate-dashboard')}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline font-medium">Back to Dashboard</span>
                </button>
                <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Screen Sharing Guide
                </h1>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={() => router.push('/candidate-info')}
                  className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                >
                  Learn Center
                </button>
                <button
                  onClick={() => router.push('/candidate-projects')}
                  className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                >
                  Projects
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-4 py-3 space-y-2">
                <button
                  onClick={() => router.push('/candidate-info')}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Learn Center
                </button>
                <button
                  onClick={() => router.push('/candidate-projects')}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Projects
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                  <Monitor className="w-5 h-5" />
                  <span className="font-semibold">Powered by Google Remote Desktop</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-4">
                  Secure Screen Sharing for Maximum Earnings
                </h1>
                <p className="text-lg md:text-xl text-blue-100 max-w-2xl">
                  Let our trained agents help you manage multiple gigs efficiently while you stay in complete control
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="bg-white rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Monitor className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">Google Remote Desktop</div>
                      <div className="text-sm text-gray-600">Official Partner</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Verified & Trusted
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-4 md:gap-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-4 md:px-6 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-blue-600'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                Why Screen Sharing
              </button>
              <button
                onClick={() => setActiveTab('how-it-works')}
                className={`flex items-center gap-2 px-4 md:px-6 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'how-it-works'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-blue-600'
                }`}
              >
                <PlayCircle className="w-5 h-5" />
                How It Works
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-4 md:px-6 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-blue-600'
                }`}
              >
                <Shield className="w-5 h-5" />
                Security & Privacy
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-12">
              {/* Why Screen Sharing Matters */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Screen Sharing Matters</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Maximize Your Earnings</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Can't handle all your approved gigs alone? Our trained agents help you manage multiple projects
                      simultaneously from different platforms, ensuring you never miss earning opportunities.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Efficient Task Management</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Our professional team handles routine tasks on platforms you authorize, freeing you to focus on
                      high-value work while we ensure deadlines are met across all your gigs.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Support Team</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Access a trained team of professionals who specialize in managing gigs across multiple platforms.
                      They know the ins and outs of registration, testing, exams, and project execution.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 border border-orange-200">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible Scheduling</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Schedule screen sharing sessions at your convenience. Both you and assigned agents can coordinate
                      timing through the project page to ensure optimal workflow.
                    </p>
                  </div>
                </div>
              </section>

              {/* When Screen Sharing is Needed */}
              <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FileCheck className="w-7 h-7 text-blue-600" />
                  When Screen Sharing is Essential
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Platform Registration</h4>
                      <p className="text-gray-600 text-sm">
                        Agents help you register on multiple freelance platforms simultaneously, completing
                        verification processes and profile optimization.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileCheck className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Skills Testing & Exams</h4>
                      <p className="text-gray-600 text-sm">
                        Get support during platform qualification tests, skills assessments, and certification
                        exams to improve your profile ranking.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Award className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Project Execution</h4>
                      <p className="text-gray-600 text-sm">
                        Agents work on authorized platforms to deliver projects when you're managing multiple
                        gigs and need additional hands to meet deadlines.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Settings className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Account Management</h4>
                      <p className="text-gray-600 text-sm">
                        Routine tasks like responding to messages, submitting deliverables, and updating
                        project statuses across your authorized platforms.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Disadvantages of Not Using Screen Sharing */}
              <section className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 border border-red-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <AlertTriangle className="w-7 h-7 text-red-600" />
                  What You Miss Without Screen Sharing
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-white rounded-lg p-4 border border-red-100">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Limited Earning Potential</h4>
                      <p className="text-gray-600 text-sm">
                        You can only handle a few gigs at a time, leaving approved projects unattended and missing
                        income opportunities from multiple platforms.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white rounded-lg p-4 border border-red-100">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Overwhelmed by Tasks</h4>
                      <p className="text-gray-600 text-sm">
                        Managing registrations, tests, and multiple projects alone leads to burnout, missed
                        deadlines, and poor quality work.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white rounded-lg p-4 border border-red-100">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">No Expert Support</h4>
                      <p className="text-gray-600 text-sm">
                        Without trained agents, you lack specialized knowledge for platform-specific requirements,
                        reducing your success rate on tests and project approvals.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white rounded-lg p-4 border border-red-100">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Slower Growth</h4>
                      <p className="text-gray-600 text-sm">
                        Your profile growth stagnates when you can't complete enough projects or pass platform
                        assessments that unlock higher-paying opportunities.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* How It Works Tab */}
          {activeTab === 'how-it-works' && (
            <div className="space-y-12">
              {/* Getting Started Section */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Getting Started with Google Remote Desktop</h2>

                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Monitor className="w-9 h-9 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Google Remote Desktop</h3>
                      <p className="text-blue-100">Trusted by millions worldwide for secure remote access</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Free to Use</span>
                      </div>
                      <p className="text-sm text-blue-100">No cost for personal use</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-5 h-5" />
                        <span className="font-semibold">End-to-End Encrypted</span>
                      </div>
                      <p className="text-sm text-blue-100">Military-grade security</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="w-5 h-5" />
                        <span className="font-semibold">Cross-Platform</span>
                      </div>
                      <p className="text-sm text-blue-100">Works on all devices</p>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Setup */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Setup Instructions</h3>

                  <div className="relative">
                    {/* Step 1 */}
                    <div className="flex gap-6 mb-8">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          1
                        </div>
                      </div>
                      <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-xl font-bold text-gray-900">Download & Install</h4>
                          <Download className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-gray-700 mb-4">
                          Visit <a href="https://remotedesktop.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">remotedesktop.google.com</a> and
                          download the Chrome Remote Desktop extension or desktop app for your device.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                            <Laptop className="w-4 h-4" />
                            Windows
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                            <Laptop className="w-4 h-4" />
                            macOS
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                            <Laptop className="w-4 h-4" />
                            Linux
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-6 mb-8">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          2
                        </div>
                      </div>
                      <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-xl font-bold text-gray-900">Set Up Remote Access</h4>
                          <Settings className="w-6 h-6 text-purple-600" />
                        </div>
                        <p className="text-gray-700 mb-4">
                          Sign in with your Google account, then click "Set up Remote Access" and create a unique
                          name for your computer. Set a PIN (at least 6 digits) for secure access.
                        </p>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <p className="text-sm text-purple-900">
                            <strong>Pro Tip:</strong> Choose a strong PIN and never share it with anyone. Remote-Works
                            agents will only access your computer when you initiate a session.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-6 mb-8">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          3
                        </div>
                      </div>
                      <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-xl font-bold text-gray-900">Schedule a Session</h4>
                          <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-gray-700 mb-4">
                          Go to your Projects page on Remote-Works and schedule a screen sharing session with your
                          assigned agent. Both you and the agent can coordinate convenient times.
                        </p>
                        <button
                          onClick={() => router.push('/candidate-projects')}
                          className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                        >
                          <Calendar className="w-5 h-5" />
                          Go to Projects
                        </button>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          4
                        </div>
                      </div>
                      <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-xl font-bold text-gray-900">Start Screen Sharing</h4>
                          <Video className="w-6 h-6 text-orange-600" />
                        </div>
                        <p className="text-gray-700 mb-4">
                          At your scheduled time, share your computer name with the agent. They'll request access,
                          and you'll approve it by entering your PIN. You can end the session at any time.
                        </p>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <p className="text-sm text-orange-900">
                            <strong>You're Always in Control:</strong> You can see everything the agent does in
                            real-time and terminate the session instantly if needed.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* How Screen Sharing Works */}
              <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Monitor className="w-7 h-7 text-blue-600" />
                  How Screen Sharing Works
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Eye className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Real-Time View</h4>
                        <p className="text-gray-600 text-sm">
                          You see everything happening on your screen in real-time. The agent's actions are
                          visible to you at all times.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Lock className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Encrypted Connection</h4>
                        <p className="text-gray-600 text-sm">
                          All data transmitted during screen sharing is encrypted with Google's security
                          protocols, ensuring privacy.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <UserCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Permission-Based Access</h4>
                        <p className="text-gray-600 text-sm">
                          Agents can only access your computer when you explicitly grant permission by
                          sharing your session details.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Video className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Session Recording</h4>
                        <p className="text-gray-600 text-sm">
                          You can record all screen sharing sessions using your own recording software for
                          your records and peace of mind.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Instant Termination</h4>
                        <p className="text-gray-600 text-sm">
                          You can end any session immediately at any time by clicking the "Stop Sharing"
                          button or closing the application.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Settings className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Controlled Access</h4>
                        <p className="text-gray-600 text-sm">
                          Agents only work on the specific platforms you authorize. They cannot access
                          personal files or other applications.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Scheduling Sessions */}
              <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Calendar className="w-7 h-7 text-blue-600" />
                  Scheduling Your Sessions
                </h2>
                <p className="text-gray-700 mb-6">
                  Flexibility is key to effective collaboration. Schedule screen sharing sessions that work
                  for both you and your assigned agents.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-5 border border-blue-100">
                    <Clock className="w-8 h-8 text-blue-600 mb-3" />
                    <h4 className="font-bold text-gray-900 mb-2">Flexible Timing</h4>
                    <p className="text-gray-600 text-sm">
                      Choose times that fit your schedule. Coordinate with agents through the project page.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-5 border border-blue-100">
                    <Users className="w-8 h-8 text-purple-600 mb-3" />
                    <h4 className="font-bold text-gray-900 mb-2">Agent Coordination</h4>
                    <p className="text-gray-600 text-sm">
                      Both you and your agent can propose and agree on session times for mutual convenience.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-5 border border-blue-100">
                    <FileCheck className="w-8 h-8 text-green-600 mb-3" />
                    <h4 className="font-bold text-gray-900 mb-2">Project-Based</h4>
                    <p className="text-gray-600 text-sm">
                      Schedule sessions based on project needs, deadlines, and task complexity.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Security & Privacy Tab */}
          {activeTab === 'security' && (
            <div className="space-y-12">
              {/* Security Guarantee */}
              <section className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-8 md:p-12 text-white">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Shield className="w-9 h-9 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Your Security is Our Priority</h2>
                    <p className="text-green-100 text-lg">Comprehensive protection at every level</p>
                  </div>
                </div>
                <p className="text-lg text-green-50 leading-relaxed">
                  We understand that sharing screen access requires trust. That's why we've implemented
                  industry-leading security measures and strict policies to protect your data, privacy,
                  and earning potential.
                </p>
              </section>

              {/* Security Features */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Measures & Guarantees</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Session Recording Rights</h3>
                        <p className="text-gray-700">
                          You have the full right to record all screen sharing sessions using any recording
                          software. Keep records for your protection and peace of mind.
                        </p>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-sm text-green-900 font-medium">
                        Recommended: OBS Studio, Screen Recorder, or built-in OS recording tools
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Restricted Access Scope</h3>
                        <p className="text-gray-700">
                          Agents can ONLY operate within the specific platforms and tasks you authorize.
                          They cannot access personal files, emails, or unrelated applications.
                        </p>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-blue-900 font-medium">
                        Unauthorized access outside task scope is strictly prohibited
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <UserCheck className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Agent Identities</h3>
                        <p className="text-gray-700">
                          All agents are verified with real personal data, background checks, and can be
                          tracked. Request agent ID anytime for additional transparency.
                        </p>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <p className="text-sm text-purple-900 font-medium">
                        Every agent maintains a detailed track record and performance history
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-red-200">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Zero Tolerance Policy</h3>
                        <p className="text-gray-700">
                          Remote-Works enforces strict rules with severe penalties for violations.
                          Any unauthorized activity results in immediate termination and legal action.
                        </p>
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <p className="text-sm text-red-900 font-medium">
                        Violations are taken seriously with permanent bans and potential prosecution
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Company Rules & Policies */}
              <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FileCheck className="w-7 h-7 text-blue-600" />
                  Company Rules & Agent Policies
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Authorized Platforms Only</h4>
                      <p className="text-gray-600 text-sm">
                        Agents must work exclusively on platforms explicitly authorized by you. Any attempt
                        to access unauthorized websites or applications is forbidden.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">No Personal Data Access</h4>
                      <p className="text-gray-600 text-sm">
                        Agents are prohibited from accessing, copying, or viewing any personal files, photos,
                        documents, emails, or financial information outside the authorized work scope.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Mandatory Activity Logging</h4>
                      <p className="text-gray-600 text-sm">
                        All agent activities during screen sharing are logged and monitored. Random audits
                        ensure compliance with security protocols.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Confidentiality Agreement</h4>
                      <p className="text-gray-600 text-sm">
                        All agents sign strict confidentiality agreements. Sharing or disclosing any candidate
                        information results in immediate termination and legal consequences.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">5</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Professional Conduct Standards</h4>
                      <p className="text-gray-600 text-sm">
                        Agents must maintain professional behavior at all times. Harassment, inappropriate
                        communication, or unprofessional conduct leads to immediate removal.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Penalties & Offenses */}
              <section className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 border-2 border-red-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <AlertTriangle className="w-7 h-7 text-red-600" />
                  Violations & Penalties
                </h2>
                <p className="text-gray-700 mb-6">
                  Remote-Works maintains zero tolerance for security violations. The following penalties apply
                  to agents who breach our policies:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-5 border-2 border-red-300">
                    <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                      <X className="w-5 h-5" />
                      Immediate Termination
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Accessing unauthorized applications, personal files, or exceeding scope of work
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-5 border-2 border-red-300">
                    <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                      <X className="w-5 h-5" />
                      Permanent Platform Ban
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Attempting to steal data, credentials, or engaging in fraudulent activities
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-5 border-2 border-red-300">
                    <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                      <X className="w-5 h-5" />
                      Legal Prosecution
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Criminal activities, data theft, or violations causing financial harm to candidates
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-5 border-2 border-red-300">
                    <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                      <X className="w-5 h-5" />
                      Financial Penalties
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Breach of confidentiality agreements or causing reputational damage
                    </p>
                  </div>
                </div>
              </section>

              {/* Agent Verification */}
              <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Award className="w-7 h-7 text-blue-600" />
                  Agent Verification & Track Records
                </h2>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserCheck className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">Identity Verified</h4>
                    <p className="text-gray-600 text-sm">
                      All agents provide government ID, address proof, and pass background checks
                    </p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">Performance Tracked</h4>
                    <p className="text-gray-600 text-sm">
                      Every agent has a detailed track record of completed tasks and client ratings
                    </p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Eye className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">Transparency Available</h4>
                    <p className="text-gray-600 text-sm">
                      Request agent ID, certifications, and performance history anytime for peace of mind
                    </p>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-blue-900">
                    <strong>Trust Through Transparency:</strong> We believe in complete transparency. You can request
                    your assigned agent's ID, track record, and verification details at any time through your
                    project page. This builds trust and ensures you know exactly who is helping you manage your gigs.
                  </p>
                </div>
              </section>

              {/* Your Rights */}
              <section className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Shield className="w-7 h-7" />
                  Your Rights as a Candidate
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold mb-1">Right to Terminate</h4>
                      <p className="text-indigo-100 text-sm">
                        End any screen sharing session immediately, for any reason, without explanation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold mb-1">Right to Record</h4>
                      <p className="text-indigo-100 text-sm">
                        Record all sessions for your records and use them as evidence if needed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold mb-1">Right to Request Agent Change</h4>
                      <p className="text-indigo-100 text-sm">
                        Request a different agent if you're uncomfortable or unsatisfied
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold mb-1">Right to Full Transparency</h4>
                      <p className="text-indigo-100 text-sm">
                        Access complete information about your agent's identity and track record
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold mb-1">Right to Limit Scope</h4>
                      <p className="text-indigo-100 text-sm">
                        Specify exactly which platforms and tasks agents can access and work on
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold mb-1">Right to Report Violations</h4>
                      <p className="text-indigo-100 text-sm">
                        Report any suspicious activity with guaranteed investigation and action
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Call to Action */}
          <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center mt-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Maximize Your Earnings?</h2>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Let our trained agents help you manage multiple gigs while you maintain complete control
              and security. Start with a scheduled session today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/candidate-projects')}
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl text-lg"
              >
                <Calendar className="w-6 h-6" />
                Schedule a Session
              </button>
              <button
                onClick={() => router.push('/candidate-info')}
                className="inline-flex items-center justify-center gap-2 bg-blue-700 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl text-lg"
              >
                <FileCheck className="w-6 h-6" />
                Learn More
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
