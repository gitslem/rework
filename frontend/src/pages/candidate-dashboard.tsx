import { useRouter } from 'next/router';
import { Globe2, Users, Search, MessageSquare, Settings, LogOut, ArrowRight } from 'lucide-react';
import Head from 'next/head';

export default function CandidateDashboard() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Candidate Dashboard | Remote-Works</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center cursor-pointer group" onClick={() => router.push('/')}>
                <Globe2 className="w-9 h-9 text-blue-600" />
                <div className="ml-3 text-2xl font-bold text-gray-900">
                  Remote-<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Works</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  <span>Messages</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
                <button onClick={() => router.push('/login')} className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Approval Notice */}
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-yellow-900 mb-2">⚠️ Account Pending Approval</h3>
            <p className="text-yellow-800">
              Your account is being reviewed by our admin team. You'll be able to browse and hire agents once your account is approved (usually within 24-48 hours).
              You'll receive an email notification once you're approved.
            </p>
          </div>

          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
            <h1 className="text-4xl font-bold mb-2">Welcome to Remote-Works! 👋</h1>
            <p className="text-xl text-blue-100">We're reviewing your account. Soon you'll be able to browse verified agents.</p>
          </div>

          {/* What's Next */}
          <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What Happens Next?</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Admin Approval (24-48 hours)</h3>
                  <p className="text-gray-600">Our team reviews your profile to ensure quality and authenticity.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Browse Verified Agents</h3>
                  <p className="text-gray-600">Once approved, you can browse agents who specialize in the platforms you're interested in.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Hire an Agent</h3>
                  <p className="text-gray-600">Message agents, discuss your needs, and hire the right expert to help you get approved.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Get Approved & Start Earning</h3>
                  <p className="text-gray-600">Work with your agent to optimize your application and get approved for your chosen platform!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platforms Preview */}
          <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Platforms You Can Get Approved For</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {['Outlier AI', 'Alignerr', 'OneForma', 'Appen', 'RWS', 'Mindrift AI', 'TELUS Digital', 'More...'].map((platform, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg text-center font-semibold text-gray-700 border border-gray-200">
                  {platform}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 text-center border-2 border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">While You Wait...</h3>
            <p className="text-gray-700 mb-6">
              Learn more about how our agents can help you succeed
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => router.push('/faq')} className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                Read FAQ
              </button>
              <button onClick={() => router.push('/about')} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2">
                Learn More
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
