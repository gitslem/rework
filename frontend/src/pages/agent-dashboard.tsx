import { useRouter } from 'next/router';
import { Globe2, Users, DollarSign, Star, TrendingUp, Settings, MessageSquare, LogOut } from 'lucide-react';
import Head from 'next/head';

export default function AgentDashboard() {
  const router = useRouter();

  const stats = [
    { label: 'Total Clients', value: '0', icon: <Users className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500' },
    { label: 'Success Rate', value: '0%', icon: <TrendingUp className="w-6 h-6" />, color: 'from-green-500 to-emerald-500' },
    { label: 'Total Earnings', value: '$0', icon: <DollarSign className="w-6 h-6" />, color: 'from-purple-500 to-pink-500' },
    { label: 'Rating', value: '0.0', icon: <Star className="w-6 h-6" />, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <>
      <Head>
        <title>Agent Dashboard | Remote-Works</title>
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
          {/* Verification Notice */}
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-yellow-900 mb-2">⚠️ Pending Verification</h3>
            <p className="text-yellow-800">
              Your agent account is pending verification. Our team will review your credentials within 24-48 hours.
              You'll receive an email notification once you're approved.
            </p>
          </div>

          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
            <h1 className="text-4xl font-bold mb-2">Welcome, Agent! 👋</h1>
            <p className="text-xl text-blue-100">Complete your profile to start helping candidates get approved</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl text-white mb-4`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Profile Setup */}
          <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Agent Profile</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Add Services</h3>
                  <p className="text-sm text-gray-600">Select which platforms you help with (Outlier, Alignerr, etc.)</p>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Add Services
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Set Your Rates</h3>
                  <p className="text-sm text-gray-600">Define pricing for each platform you support</p>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Set Rates
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Upload Credentials</h3>
                  <p className="text-sm text-gray-600">Provide proof of successful placements</p>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Upload
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No activity yet. Complete your profile to start receiving clients!</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
