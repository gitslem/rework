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
      title: "Build Your Client Base",
      description: "Access a steady stream of qualified candidates actively seeking your expertise",
      color: "from-amber-500 to-yellow-500"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Establish Your Brand",
      description: "Create a professional profile showcasing your success metrics and platform mastery",
      color: "from-gray-800 to-black"
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Control Your Revenue",
      description: "Set your rates and choose between upfront payments or recurring revenue share",
      color: "from-amber-600 to-yellow-600"
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Scale Your Business",
      description: "Serve multiple clients across various platforms using efficient workflow tools",
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
      title: "1. Craft a Compelling Professional Profile",
      description: "Your profile is your business card. A well-optimized agent profile differentiates you in a competitive marketplace and commands higher rates.",
      tips: [
        "Showcase quantifiable success metrics (approval rates, platforms mastered, clients served)",
        "Detail your specialized platform expertise with specific examples",
        "Display professional credentials, certifications, and verification badges",
        "Feature authentic client testimonials that highlight measurable results"
      ]
    },
    {
      title: "2. Establish Clear Service Agreements",
      description: "Professional service terms protect your business and set proper client expectations from the start.",
      tips: [
        "Document detailed pricing structures with clear payment terms",
        "Define specific deliverables, timelines, and success criteria",
        "Clarify service boundaries and scope limitations",
        "Use written agreements for revenue share arrangements"
      ]
    },
    {
      title: "3. Master Client Communication",
      description: "Professional communication differentiates top-tier agents and drives client retention.",
      tips: [
        "Maintain 24-hour response time to all client inquiries",
        "Set realistic expectations based on platform requirements",
        "Provide regular progress updates with actionable insights",
        "Establish preferred communication channels and availability hours"
      ]
    },
    {
      title: "4. Deliver Exceptional Results",
      description: "Your approval success rate directly impacts your earning potential and business growth.",
      tips: [
        "Develop systematic processes for each platform's approval workflow",
        "Provide comprehensive preparation materials for platform assessments",
        "Implement post-approval check-ins to ensure client success",
        "Convert satisfied clients into recurring business and referrals"
      ]
    },
    {
      title: "5. Adhere to Security Protocols",
      description: "Platform security compliance is non-negotiable. Violations result in immediate account termination.",
      tips: [
        "Restrict screen sharing access to explicitly authorized platforms only",
        "Never access, view, or store client personal files or credentials",
        "Respect client privacy boundaries and confidentiality agreements",
        "Follow all Remote-Works security policies without exception"
      ]
    },
    {
      title: "6. Scale Your Consulting Business",
      description: "Strategic business development transforms your agent practice into a sustainable income source.",
      tips: [
        "Create tiered service packages targeting different client segments",
        "Develop platform specializations in high-demand, high-value niches",
        "Build revenue share client portfolios for passive recurring income",
        "Document case studies and success stories for marketing purposes"
      ]
    },
    {
      title: "7. Maintain Professional Standards",
      description: "Long-term business success requires strict adherence to ethical practices and platform policies.",
      tips: [
        "Comply with all Remote-Works agent terms of service",
        "Honor confidentiality obligations with every client",
        "Maintain detailed project records for quality assurance",
        "Report policy violations or security concerns immediately"
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
        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Professional Agent Resource Center
            </h1>
            <p className="text-xl md:text-2xl text-amber-100 max-w-3xl mx-auto">
              Master the business of platform approval consulting. Build your client base, scale your practice, and maximize your professional earnings.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('learn')}
                className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors ${
                  activeTab === 'learn'
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-gray-600 hover:text-amber-600'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                Learn
              </button>
              <button
                onClick={() => setActiveTab('tips')}
                className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors ${
                  activeTab === 'tips'
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-gray-600 hover:text-amber-600'
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
              <section className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border border-amber-200 shadow-md">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Globe className="w-8 h-8 text-amber-600" />
                  What is Remote-Works for Agents?
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Remote-Works is a <strong className="text-amber-600">professional marketplace</strong> designed specifically for
                    experienced agents who specialize in remote work platform approvals. As a verified agent, you'll leverage this
                    platform to monetize your expertise in navigating complex approval processes across 20+ platforms including
                    TELUS Digital, OneForma, Outlier AI, Appen, DataAnnotation, and many others.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    This is your opportunity to build a <strong className="text-amber-700">scalable consulting business</strong>. Connect
                    with candidates who need your specialized knowledge, set your own pricing structure, choose your service delivery
                    model, and grow a sustainable income stream by helping others succeed in the remote work economy.
                  </p>
                </div>
              </section>

              {/* Key Features Grid */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Why Be an Agent on Remote-Works?
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-200 hover:scale-105 transform duration-300"
                    >
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl text-white mb-4`}>
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* How It Works for Agents */}
              <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <Target className="w-8 h-8 text-amber-600" />
                  Your Path to Professional Success
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      step: "1",
                      title: "Establish Your Professional Presence",
                      description: "Complete the agent verification process and build a compelling profile that highlights your platform expertise, approval success rates, specialized services, and professional credentials.",
                      color: "amber"
                    },
                    {
                      step: "2",
                      title: "Configure Your Service Offerings",
                      description: "Define your consulting packages, set competitive rates, choose between one-time fee or revenue share models, and establish clear terms of service that protect both you and your clients.",
                      color: "yellow"
                    },
                    {
                      step: "3",
                      title: "Evaluate Client Requests",
                      description: "Receive inquiries from candidates who have reviewed your profile. Screen potential clients, assess their needs, and respond with customized proposals that match their platform goals.",
                      color: "amber"
                    },
                    {
                      step: "4",
                      title: "Deliver Expert Consulting Services",
                      description: "Provide professional guidance through platform registrations, qualification assessments, and approval workflows. Leverage secure screen sharing tools for efficient, hands-on client support when appropriate.",
                      color: "yellow"
                    },
                    {
                      step: "5",
                      title: "Build Your Professional Reputation",
                      description: "Each successful approval enhances your track record. Client ratings and testimonials strengthen your profile, leading to increased visibility, premium pricing opportunities, and sustainable business growth.",
                      color: "amber"
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex gap-6 items-start">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
                        <span className="text-xl font-bold text-white">{item.step}</span>
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Pricing Models for Agents */}
              <section className="grid md:grid-cols-2 gap-8">
                {/* One-Time Fee */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Project-Based Fee Structure</h3>
                  </div>
                  <p className="text-gray-700 mb-6">
                    Charge fixed consulting fees per platform approval. Ideal for transactional client relationships with clear deliverables.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">Set competitive rates based on platform complexity ($100-$200 per approval)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">Create premium packages for multi-platform approvals</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">Receive upfront payment ensuring immediate cash flow</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">Define clear project scope and success metrics</p>
                    </div>
                  </div>
                </div>

                {/* Revenue Share */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border-2 border-amber-200 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-8 h-8 text-amber-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Revenue Share Partnership</h3>
                  </div>
                  <p className="text-gray-700 mb-6">
                    Build long-term client partnerships with ongoing passive income streams. Perfect for scaling your consulting practice.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">No upfront cost reduces client acquisition barriers</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">Negotiate 50/50 split or custom percentage based on involvement</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">Option to manage client projects for complete service delivery</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">Generate recurring monthly income from active client portfolios</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Platform Expertise */}
              <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Briefcase className="w-8 h-8 text-amber-600" />
                  Platform Specializations
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {workTypes.map((work, index) => (
                    <div key={index} className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 text-center hover:shadow-md transition-all border border-amber-200">
                      <div className="bg-white rounded-lg p-3 w-fit mx-auto mb-2">
                        <div className="text-amber-600">
                          {work.icon}
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{work.name}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Supported Platforms */}
              <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-lg">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Shield className="w-8 h-8 text-amber-500" />
                  Monetize Your Platform Expertise
                </h2>
                <p className="text-gray-300 mb-6">
                  Leverage your knowledge across 20+ industry-leading remote work platforms. Specialize in high-demand platforms to command premium rates and establish yourself as the go-to expert in your niche.
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
                  <h2 className="text-3xl font-bold text-black">7 Essential Strategies for Professional Success</h2>
                </div>
                <p className="text-gray-800 text-lg">
                  These proven methodologies will help you establish a thriving consulting practice, differentiate your services,
                  and build a sustainable business in the platform approval industry.
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
              <div className="bg-gradient-to-r from-amber-600 to-yellow-600 rounded-2xl p-8 text-white text-center shadow-lg">
                <h3 className="text-3xl font-bold mb-4">Ready to Launch Your Consulting Practice?</h3>
                <p className="text-xl text-amber-100 mb-6">
                  Join elite agents who have built profitable businesses helping clients succeed on remote work platforms
                </p>
                <button
                  onClick={() => router.push('/agent-dashboard')}
                  className="bg-white text-amber-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all inline-flex items-center gap-2"
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
