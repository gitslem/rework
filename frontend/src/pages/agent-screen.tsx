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
import { getFirebaseAuth } from '@/lib/firebase/config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export default function AgentScreen() {
  const router = useRouter();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'how-it-works' | 'security'>('overview');

  useEffect(() => {
    const auth = getFirebaseAuth();
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Screen Sharing Guide for Agents - Remote-Works</title>
        <meta name="description" content="Learn how to use secure screen sharing to help candidates succeed" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Back Button */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/agent-dashboard')}
                  className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline font-medium">Back to Dashboard</span>
                </button>
                <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
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
                  onClick={() => router.push('/agent-info')}
                  className="text-gray-600 hover:text-amber-600 transition-colors font-medium"
                >
                  Info Center
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-4 py-3 space-y-2">
                <button
                  onClick={() => router.push('/agent-info')}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Info Center
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white py-12 md:py-16 border-b-4 border-amber-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                  <Monitor className="w-5 h-5" />
                  <span className="font-semibold">Powered by Google Remote Desktop</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-4">
                  Screen Sharing Guide for Agents
                </h1>
                <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
                  Learn how to securely assist candidates and follow best practices for professional service delivery
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="bg-white rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center">
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
        <div className="bg-white border-b-2 border-gray-200 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-4 md:gap-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-4 md:px-6 py-4 font-semibold border-b-4 transition-colors whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-amber-500 text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                Why Use Screen Sharing
              </button>
              <button
                onClick={() => setActiveTab('how-it-works')}
                className={`flex items-center gap-2 px-4 md:px-6 py-4 font-semibold border-b-4 transition-colors whitespace-nowrap ${
                  activeTab === 'how-it-works'
                    ? 'border-amber-500 text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                <PlayCircle className="w-5 h-5" />
                How to Use It
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-4 md:px-6 py-4 font-semibold border-b-4 transition-colors whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'border-amber-500 text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                <Shield className="w-5 h-5" />
                Security & Compliance
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-12">
              {/* Why Screen Sharing as an Agent */}
              <section>
                <h2 className="text-3xl font-bold text-black mb-6">Why Use Screen Sharing as an Agent</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border-2 border-amber-200">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mb-4">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-black mb-3">Deliver Better Results</h3>
                    <p className="text-gray-800 leading-relaxed">
                      Provide hands-on guidance through registration, testing, and platform approval processes.
                      Screen sharing allows you to help candidates in real-time, increasing success rates.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-300">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-black rounded-xl flex items-center justify-center mb-4">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-black mb-3">Efficient Service Delivery</h3>
                    <p className="text-gray-800 leading-relaxed">
                      Complete tasks faster by directly accessing platforms instead of giving step-by-step
                      instructions. Save time for both you and your candidates.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border-2 border-amber-200">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mb-4">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-black mb-3">Scale Your Business</h3>
                    <p className="text-gray-800 leading-relaxed">
                      Manage multiple candidates and platforms simultaneously. Screen sharing enables you to
                      handle more projects and increase your agent earnings.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-300">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-black rounded-xl flex items-center justify-center mb-4">
                      <Award className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-black mb-3">Build Trust & Reputation</h3>
                    <p className="text-gray-800 leading-relaxed">
                      Provide professional, hands-on service that candidates value. Build a strong reputation
                      with successful approvals and satisfied clients.
                    </p>
                  </div>
                </div>
              </section>

              {/* When to Use Screen Sharing */}
              <section className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
                <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                  <FileCheck className="w-7 h-7 text-amber-600" />
                  When to Use Screen Sharing
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: <CheckCircle className="w-6 h-6 text-amber-600" />,
                      title: "Platform Registration",
                      description: "Guide candidates through account creation, profile setup, and initial verification on new platforms."
                    },
                    {
                      icon: <FileCheck className="w-6 h-6 text-amber-600" />,
                      title: "Skills Testing & Exams",
                      description: "Assist with qualification tests, skills assessments, and platform-specific exams that candidates need to pass."
                    },
                    {
                      icon: <Award className="w-6 h-6 text-amber-600" />,
                      title: "Project Execution",
                      description: "Work on authorized platforms for revenue share arrangements, completing projects on the candidate's behalf."
                    },
                    {
                      icon: <Settings className="w-6 h-6 text-amber-600" />,
                      title: "Account Management",
                      description: "Handle routine tasks like responding to messages, submitting work, and managing project statuses."
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                          {item.icon}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-black mb-2">{item.title}</h4>
                        <p className="text-gray-700 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* How It Works Tab */}
          {activeTab === 'how-it-works' && (
            <div className="space-y-12">
              {/* Getting Candidate Set Up */}
              <section>
                <h2 className="text-3xl font-bold text-black mb-6">How to Set Up Screen Sharing with Candidates</h2>

                <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-8 text-white mb-8 border-2 border-amber-500">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-amber-500 rounded-xl flex items-center justify-center">
                      <Monitor className="w-9 h-9 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Google Remote Desktop</h3>
                      <p className="text-gray-300">Secure, encrypted remote access for professional service delivery</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-amber-500">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Free to Use</span>
                      </div>
                      <p className="text-sm text-gray-300">No cost for agents or candidates</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-amber-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-5 h-5" />
                        <span className="font-semibold">Fully Encrypted</span>
                      </div>
                      <p className="text-sm text-gray-300">Military-grade security</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-amber-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="w-5 h-5" />
                        <span className="font-semibold">Cross-Platform</span>
                      </div>
                      <p className="text-sm text-gray-300">Works on all devices</p>
                    </div>
                  </div>
                </div>

                {/* Setup Process for Agents */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-black">Setup Process</h3>

                  {[
                    {
                      step: "1",
                      title: "Guide Candidate Setup",
                      icon: <Download className="w-6 h-6 text-amber-600" />,
                      description: "Instruct candidates to visit remotedesktop.google.com and install Google Remote Desktop on their computer. Ensure they complete the installation successfully.",
                      color: "amber"
                    },
                    {
                      step: "2",
                      title: "Candidate Configures Access",
                      icon: <Settings className="w-6 h-6 text-yellow-600" />,
                      description: "Candidate sets up remote access with their Google account, names their computer, and creates a secure PIN. Remind them never to share this PIN publicly.",
                      color: "yellow"
                    },
                    {
                      step: "3",
                      title: "Schedule Session Together",
                      icon: <Calendar className="w-6 h-6 text-amber-600" />,
                      description: "Coordinate a screen sharing session through the Remote-Works project page. Agree on a time that works for both parties.",
                      color: "amber"
                    },
                    {
                      step: "4",
                      title: "Connect and Assist",
                      icon: <Video className="w-6 h-6 text-yellow-600" />,
                      description: "At the scheduled time, candidate shares their computer name. Request access and candidate approves by entering their PIN. You can now provide hands-on assistance.",
                      color: "yellow"
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex gap-6">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                          {item.step}
                        </div>
                      </div>
                      <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-xl font-bold text-black">{item.title}</h4>
                          {item.icon}
                        </div>
                        <p className="text-gray-700">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Best Practices */}
              <section className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border-2 border-amber-200">
                <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-3">
                  <Award className="w-7 h-7 text-amber-600" />
                  Best Practices for Agents
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "Always work within authorized platforms only",
                    "Communicate your actions to candidates in real-time",
                    "Be respectful and professional at all times",
                    "Never access personal files or unauthorized applications",
                    "Document your work and keep records of sessions",
                    "Follow all Remote-Works security policies strictly"
                  ].map((practice, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white rounded-lg p-4 border border-amber-200">
                      <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-800 font-medium">{practice}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Security & Compliance Tab */}
          {activeTab === 'security' && (
            <div className="space-y-12">
              {/* Security Requirements */}
              <section className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-8 md:p-12 text-white border-2 border-red-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Shield className="w-9 h-9 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Critical Security Requirements</h2>
                    <p className="text-red-100 text-lg">Strict compliance mandatory for all agents</p>
                  </div>
                </div>
                <p className="text-lg text-red-50 leading-relaxed">
                  As an agent, you must follow all security protocols without exception. Violations result
                  in immediate termination, permanent ban, and potential legal action. Candidate trust and
                  data protection are paramount.
                </p>
              </section>

              {/* Agent Policies */}
              <section className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
                <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                  <FileCheck className="w-7 h-7 text-amber-600" />
                  Mandatory Agent Policies
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      number: "1",
                      title: "Authorized Platforms Only",
                      description: "Work exclusively on platforms explicitly authorized by the candidate. Never access unauthorized websites, applications, or personal files."
                    },
                    {
                      number: "2",
                      title: "Zero Personal Data Access",
                      description: "You are strictly prohibited from viewing, accessing, copying, or sharing any personal files, photos, documents, emails, or financial information."
                    },
                    {
                      number: "3",
                      title: "Session Transparency",
                      description: "Candidates can record all sessions. All your activities are logged and monitored. Random audits ensure compliance with security protocols."
                    },
                    {
                      number: "4",
                      title: "Confidentiality Agreement",
                      description: "All agents sign strict confidentiality agreements. Sharing or disclosing any candidate information results in immediate termination and legal consequences."
                    },
                    {
                      number: "5",
                      title: "Professional Conduct",
                      description: "Maintain professional behavior at all times. Harassment, inappropriate communication, or unprofessional conduct leads to immediate removal from the platform."
                    }
                  ].map((policy, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                      <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-amber-600 font-bold">{policy.number}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-black mb-1">{policy.title}</h4>
                        <p className="text-gray-700 text-sm">{policy.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Penalties */}
              <section className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 border-2 border-red-200">
                <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-3">
                  <AlertTriangle className="w-7 h-7 text-red-600" />
                  Violations & Penalties
                </h2>
                <p className="text-gray-700 mb-6">
                  Remote-Works maintains zero tolerance for security violations. The following penalties apply:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Immediate Termination",
                      description: "Accessing unauthorized applications, personal files, or exceeding authorized scope"
                    },
                    {
                      title: "Permanent Platform Ban",
                      description: "Attempting to steal data, credentials, or engaging in fraudulent activities"
                    },
                    {
                      title: "Legal Prosecution",
                      description: "Criminal activities, data theft, or violations causing financial harm to candidates"
                    },
                    {
                      title: "Financial Penalties",
                      description: "Breach of confidentiality agreements or causing reputational damage"
                    }
                  ].map((penalty, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-5 border-2 border-red-300">
                      <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                        <X className="w-5 h-5" />
                        {penalty.title}
                      </h4>
                      <p className="text-gray-700 text-sm">{penalty.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Your Responsibilities */}
              <section className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 text-white border-2 border-amber-500">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <UserCheck className="w-7 h-7 text-amber-500" />
                  Your Responsibilities as an Agent
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Respect Candidate Control",
                      description: "Candidates can terminate sessions instantly at any time"
                    },
                    {
                      title: "Accept Session Recording",
                      description: "Candidates have the right to record all sessions for their protection"
                    },
                    {
                      title: "Maintain Transparency",
                      description: "Provide your agent ID and credentials when requested"
                    },
                    {
                      title: "Work Within Scope",
                      description: "Only access platforms and perform tasks explicitly authorized"
                    },
                    {
                      title: "Protect Privacy",
                      description: "Never share candidate information with anyone"
                    },
                    {
                      title: "Report Issues",
                      description: "Immediately report any technical or security concerns"
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold mb-1">{item.title}</h4>
                        <p className="text-gray-300 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Call to Action */}
          <section className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-8 md:p-12 text-white text-center border-2 border-amber-500">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Help Candidates Succeed?</h2>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Use screen sharing responsibly to deliver professional service while maintaining the highest
              security standards. Build your reputation as a trusted agent.
            </p>
            <button
              onClick={() => router.push('/agent-dashboard')}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-8 py-4 rounded-lg font-bold hover:from-amber-600 hover:to-yellow-600 transition-all shadow-lg text-lg"
            >
              <FileCheck className="w-6 h-6" />
              Go to Dashboard
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
