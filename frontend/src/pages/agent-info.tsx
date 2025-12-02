import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  BookOpen, Lightbulb, CheckCircle, Users, TrendingUp,
  Award, Target, Zap, Shield, ArrowRight, DollarSign, Briefcase,
  Globe, Clock, Star, ChevronRight, Home, UserCheck
} from 'lucide-react';
import Head from 'next/head';
import Logo from '@/components/Logo';

export default function AgentInfo() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'learn' | 'tips'>('learn');

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Connect with Candidates",
      description: "Build your client base with motivated candidates seeking approval",
      color: "from-amber-500 to-yellow-500"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Showcase Your Expertise",
      description: "Display your success rate and platform specializations",
      color: "from-gray-800 to-black"
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Flexible Earnings",
      description: "Choose your pricing model: one-time fees or revenue sharing",
      color: "from-amber-600 to-yellow-600"
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Manage Multiple Projects",
      description: "Handle multiple candidates and platforms simultaneously",
      color: "from-gray-700 to-gray-900"
    }
  ];

  const platforms = [
    "Outlier AI", "TELUS Digital", "OneForma", "RWS", "Appen",
    "Alignerr", "Mindrift AI", "DataAnnotation", "Lionbridge", "Clickworker"
  ];

  const workTypes = [
    { name: "AI Training", icon: <Zap className="w-5 h-5" /> },
    { name: "Translation", icon: <Globe className="w-5 h-5" /> },
    { name: "Transcription", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Data Labeling", icon: <Target className="w-5 h-5" /> },
    { name: "Evaluation", icon: <CheckCircle className="w-5 h-5" /> },
    { name: "Research", icon: <Award className="w-5 h-5" /> }
  ];

  const successTips = [
    {
      title: "1. Build a Strong Profile",
      description: "A comprehensive agent profile attracts more candidates and builds trust.",
      tips: [
        "Highlight your platform expertise and success rate",
        "List all platforms you specialize in",
        "Upload verification documents and certifications",
        "Add testimonials from satisfied candidates"
      ]
    },
    {
      title: "2. Set Clear Terms",
      description: "Transparency about pricing and services helps candidates make informed decisions.",
      tips: [
        "Clearly define your pricing structure",
        "Specify what services you provide",
        "Outline expected timelines for approvals",
        "Be upfront about revenue sharing terms"
      ]
    },
    {
      title: "3. Communicate Professionally",
      description: "Clear communication is key to successful agent-candidate relationships.",
      tips: [
        "Respond to inquiries within 24 hours",
        "Set realistic expectations",
        "Keep candidates updated on progress",
        "Be available for questions and support"
      ]
    },
    {
      title: "4. Deliver Quality Service",
      description: "Your reputation depends on successfully getting candidates approved.",
      tips: [
        "Provide detailed guidance through each step",
        "Help with profile optimization and test preparation",
        "Follow up after approval to ensure success",
        "Build long-term relationships for repeat business"
      ]
    },
    {
      title: "5. Maintain Security Standards",
      description: "Follow all platform security policies when using screen sharing.",
      tips: [
        "Only access authorized platforms",
        "Never view or access personal files",
        "Respect candidate privacy at all times",
        "Follow Remote-Works security protocols strictly"
      ]
    },
    {
      title: "6. Maximize Your Earnings",
      description: "Grow your agent business by expanding your services and client base.",
      tips: [
        "Offer package deals for multiple platform approvals",
        "Specialize in high-demand platforms",
        "Provide ongoing support for revenue share opportunities",
        "Build a portfolio of successful case studies"
      ]
    },
    {
      title: "7. Stay Compliant and Professional",
      description: "Adherence to platform rules ensures long-term success.",
      tips: [
        "Follow all Remote-Works agent policies",
        "Maintain confidentiality agreements",
        "Keep detailed records of all work",
        "Report any issues or violations immediately"
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>Agent Info & Tips - Remote-Works</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              <Logo showText={false} onClick={() => router.push('/')} />
              <button
                onClick={() => router.push('/agent-dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white py-16 border-b-4 border-amber-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Agent Info Center
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Learn how to succeed as an agent and discover tips to maximize your earnings helping candidates
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b-2 border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('learn')}
                className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-4 transition-colors ${
                  activeTab === 'learn'
                    ? 'border-amber-500 text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                Learn
              </button>
              <button
                onClick={() => setActiveTab('tips')}
                className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-4 transition-colors ${
                  activeTab === 'tips'
                    ? 'border-amber-500 text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                <Lightbulb className="w-5 h-5" />
                Tips for Success
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Learn Tab */}
          {activeTab === 'learn' && (
            <div className="space-y-12">
              {/* What is Remote-Works for Agents */}
              <section className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border-2 border-amber-200">
                <h2 className="text-3xl font-bold text-black mb-6 flex items-center gap-3">
                  <Globe className="w-8 h-8 text-amber-600" />
                  What is Remote-Works for Agents?
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-800 leading-relaxed mb-4">
                    Remote-Works is a <strong className="text-amber-600">marketplace platform</strong> that connects expert agents
                    with candidates seeking approval on remote work platforms. As an agent, you leverage your expertise to help
                    candidates get approved and succeed on platforms like TELUS Digital, OneForma, Outlier, and 20+ others.
                  </p>
                  <p className="text-gray-800 leading-relaxed">
                    Our platform provides <strong className="text-black">verified agents</strong> with the tools to showcase their
                    expertise, connect with motivated candidates, and build a sustainable business helping others succeed in
                    remote work opportunities.
                  </p>
                </div>
              </section>

              {/* Key Features Grid */}
              <section>
                <h2 className="text-3xl font-bold text-black mb-8 text-center">
                  Why Be an Agent on Remote-Works?
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-amber-400 hover:scale-105 transform duration-300"
                    >
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl text-white mb-4`}>
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold text-black mb-2">{feature.title}</h3>
                      <p className="text-gray-700">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* How It Works for Agents */}
              <section className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
                <h2 className="text-3xl font-bold text-black mb-8 flex items-center gap-3">
                  <Target className="w-8 h-8 text-amber-600" />
                  How It Works for Agents
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      step: "1",
                      title: "Create Your Agent Profile",
                      description: "Sign up as an agent, complete verification, and showcase your expertise, success rate, and platform specializations.",
                      color: "amber"
                    },
                    {
                      step: "2",
                      title: "Set Your Services & Pricing",
                      description: "Define your service offerings, pricing structure (one-time fees or revenue share), and terms for working with candidates.",
                      color: "yellow"
                    },
                    {
                      step: "3",
                      title: "Receive Service Requests",
                      description: "Candidates browse agent profiles and send service requests. Review requests and respond with your availability and terms.",
                      color: "amber"
                    },
                    {
                      step: "4",
                      title: "Help Candidates Succeed",
                      description: "Guide candidates through registration, testing, and approval processes. Use screen sharing for hands-on support when needed.",
                      color: "yellow"
                    },
                    {
                      step: "5",
                      title: "Build Your Reputation",
                      description: "Successful approvals earn you ratings and reviews, helping you attract more candidates and grow your agent business.",
                      color: "amber"
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex gap-6 items-start">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
                        <span className="text-xl font-bold text-white">{item.step}</span>
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                        <h3 className="text-xl font-bold text-black mb-2">{item.title}</h3>
                        <p className="text-gray-700 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Pricing Models for Agents */}
              <section className="grid md:grid-cols-2 gap-8">
                {/* One-Time Fee */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-300">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    <h3 className="text-2xl font-bold text-black">One-Time Fee Model</h3>
                  </div>
                  <p className="text-gray-800 mb-6">
                    Charge candidates a fixed fee for approval assistance. Simple and straightforward.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-800">Set your own pricing per platform ($100-$200 typical)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-800">Offer package deals for multiple platforms</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-800">Payment upfront before service delivery</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-800">Clear scope with defined deliverables</p>
                    </div>
                  </div>
                </div>

                {/* Revenue Share */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border-2 border-amber-300">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-8 h-8 text-amber-600" />
                    <h3 className="text-2xl font-bold text-black">Revenue Share Model</h3>
                  </div>
                  <p className="text-gray-800 mb-6">
                    Share in candidate earnings. Build long-term relationships and recurring income.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-800">No upfront fee from candidates</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-800">Earn 50% or negotiated split of candidate earnings</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-800">Can manage projects on candidate's behalf if authorized</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-800">Ongoing income as long as candidate works</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Platform Expertise */}
              <section className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
                <h2 className="text-3xl font-bold text-black mb-6 flex items-center gap-3">
                  <Briefcase className="w-8 h-8 text-amber-600" />
                  Platform Specializations
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {workTypes.map((work, index) => (
                    <div key={index} className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 text-center hover:shadow-md transition-all border-2 border-amber-200">
                      <div className="bg-white rounded-lg p-3 w-fit mx-auto mb-2">
                        <div className="text-amber-600">
                          {work.icon}
                        </div>
                      </div>
                      <p className="font-semibold text-black text-sm">{work.name}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Supported Platforms */}
              <section className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 text-white border-2 border-amber-500">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Shield className="w-8 h-8 text-amber-500" />
                  20+ Platforms to Specialize In
                </h2>
                <p className="text-gray-300 mb-6">
                  Help candidates get approved on industry-leading platforms. Build expertise in your chosen specialties!
                </p>
                <div className="flex flex-wrap gap-3">
                  {platforms.map((platform, index) => (
                    <span
                      key={index}
                      className="bg-white bg-opacity-10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium hover:bg-opacity-20 transition-all border border-amber-500"
                    >
                      {platform}
                    </span>
                  ))}
                  <span className="bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 rounded-full text-sm font-bold">
                    +10 More
                  </span>
                </div>
              </section>
            </div>
          )}

          {/* Tips Tab */}
          {activeTab === 'tips' && (
            <div className="space-y-8">
              {/* Header */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border-2 border-amber-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-500 p-3 rounded-xl">
                    <Lightbulb className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-black">7 Tips to Succeed as an Agent</h2>
                </div>
                <p className="text-gray-800 text-lg">
                  Follow these proven strategies to build a successful agent business and maximize your earnings
                  while helping candidates succeed.
                </p>
              </div>

              {/* Tips List */}
              {successTips.map((tip, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200 hover:border-amber-400 transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-amber-100 rounded-full p-3 flex-shrink-0">
                      <Star className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-black mb-2">{tip.title}</h3>
                      <p className="text-gray-700 text-lg leading-relaxed mb-4">{tip.description}</p>
                      <div className="space-y-2">
                        {tip.tips.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <ChevronRight className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-800">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Call to Action */}
              <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-8 text-white text-center border-2 border-amber-500">
                <h3 className="text-3xl font-bold mb-4">Ready to Start Your Agent Business?</h3>
                <p className="text-xl text-gray-300 mb-6">
                  Join successful agents who are helping candidates achieve their remote work goals
                </p>
                <button
                  onClick={() => router.push('/agent-dashboard')}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-amber-600 hover:to-yellow-600 transition-all inline-flex items-center gap-2 shadow-lg"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
