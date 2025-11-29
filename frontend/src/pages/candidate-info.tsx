import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Play, BookOpen, Lightbulb, CheckCircle, Users, TrendingUp,
  Award, Target, Zap, Shield, ArrowRight, DollarSign, Briefcase,
  Globe, Clock, Star, ChevronRight, Home, Monitor
} from 'lucide-react';
import Head from 'next/head';
import Logo from '@/components/Logo';

export default function CandidateInfo() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'learn' | 'tips'>('learn');
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Vetted Expert Agents",
      description: "Access to authenticated agents experienced in 20+ platforms",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Get Approved Faster",
      description: "Agents know the ins and outs of approval processes",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Flexible Payment Options",
      description: "Choose between one-time fees or revenue sharing",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Multiple Income Streams",
      description: "Access to various remote work opportunities",
      color: "from-orange-500 to-red-500"
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
      title: "1. Complete Your Profile Thoroughly",
      description: "A complete profile increases your credibility and helps agents understand your background better. Include all relevant skills, experience, and certifications.",
      tips: [
        "Add a professional bio",
        "List all relevant skills",
        "Upload ID verification documents",
        "Connect social media profiles"
      ]
    },
    {
      title: "2. Choose the Right Agent",
      description: "Review agent profiles carefully. Look for specialists in the platforms you're interested in.",
      tips: [
        "Check agent ratings and reviews",
        "Review their success rate",
        "Read their terms carefully",
        "Ask questions before committing"
      ]
    },
    {
      title: "3. Understand Payment Options",
      description: "Remote-Works offers two flexible payment models to suit your needs.",
      tips: [
        "One-Time Fee: Pay upfront for approval assistance (e.g., $100-150 per project)",
        "Revenue Share: Split earnings 50/50 or as agreed with your agent",
        "Agents can handle tasks on your behalf if authorized",
        "All terms are clearly defined before you start"
      ]
    },
    {
      title: "4. Follow Agent Guidelines",
      description: "Your success depends on following the guidance provided by your agent.",
      tips: [
        "Read all instructions carefully",
        "Meet deadlines for document submissions",
        "Be responsive to agent messages",
        "Ask questions if anything is unclear"
      ]
    },
    {
      title: "5. Maintain Professional Communication",
      description: "Clear and professional communication ensures smooth collaboration.",
      tips: [
        "Respond to messages within 24 hours",
        "Be honest about your availability",
        "Keep agents updated on your progress",
        "Report any issues immediately"
      ]
    },
    {
      title: "6. Maximize Your Earnings",
      description: "Once approved, you can work on multiple projects simultaneously.",
      tips: [
        "Start with one platform and expand gradually",
        "Meet quality standards to maintain approval",
        "Track your earnings across platforms",
        "Request agent assistance for additional platforms"
      ]
    },
    {
      title: "7. Stay Consistent and Reliable",
      description: "Building a reputation takes time and consistency.",
      tips: [
        "Deliver high-quality work consistently",
        "Meet project deadlines",
        "Follow platform guidelines strictly",
        "Build long-term relationships with agents"
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>Learn & Tips - Remote-Works</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              <Logo showText={false} onClick={() => router.push('/')} />
              <button
                onClick={() => router.push('/candidate-dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to Remote-Works Info Center
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Learn how our platform works and discover tips to maximize your success in remote work opportunities
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
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-blue-600'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                Learn
              </button>
              <button
                onClick={() => setActiveTab('tips')}
                className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors ${
                  activeTab === 'tips'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-blue-600'
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
              {/* Video Section */}
              <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Play className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Introduction Video</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Watch this quick introduction to understand how Remote-Works connects you with vetted agents
                  and remote work opportunities.
                </p>
                <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
                  <video
                    ref={videoRef}
                    controls
                    className="w-full h-full"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  >
                    <source src="/Remote-Worksio.Intro-mp4.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  {!isPlaying && (
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 cursor-pointer"
                      onClick={handlePlayVideo}
                    >
                      <div className="bg-white rounded-full p-6 shadow-2xl hover:scale-110 transition-transform">
                        <Play className="w-12 h-12 text-blue-600" />
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* What is Remote-Works */}
              <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Globe className="w-8 h-8 text-blue-600" />
                  What is Remote-Works?
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Remote-Works is a <strong className="text-blue-600">marketplace platform</strong> that connects talented individuals
                    with expert agents who specialize in remote work opportunities. We bridge the gap between candidates seeking
                    flexible work and the growing demand for AI projects, translation, transcription, data labeling, evaluation,
                    research, and more.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Our platform features <strong className="text-purple-600">vetted, authenticated agents</strong> who have proven
                    expertise in getting candidates approved on 20+ remote work platforms including industry leaders like
                    TELUS Digital, OneForma, Outlier, RWS, and many others.
                  </p>
                </div>
              </section>

              {/* Key Features Grid */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Why Choose Remote-Works?
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

              {/* How It Works */}
              <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <Target className="w-8 h-8 text-blue-600" />
                  How It Works
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      step: "1",
                      title: "Sign Up & Get Verified",
                      description: "Create your account, complete your profile, and upload verification documents. Our admin team reviews applications within 24-48 hours.",
                      color: "blue"
                    },
                    {
                      step: "2",
                      title: "Browse Vetted Agents",
                      description: "Once approved, explore our marketplace of authenticated agents. View their expertise, success rates, pricing, and reviews from other candidates.",
                      color: "purple"
                    },
                    {
                      step: "3",
                      title: "Request Services",
                      description: "Send a service request to an agent explaining which platforms you're interested in and your goals. Agents respond with their terms and availability.",
                      color: "green"
                    },
                    {
                      step: "4",
                      title: "Choose Your Payment Model",
                      description: "Select between one-time payment or revenue sharing based on what works best for you.",
                      color: "orange"
                    },
                    {
                      step: "5",
                      title: "Get Approved & Start Earning",
                      description: "Follow your agent's guidance to get approved on platforms. Once approved, start working on projects and earning income!",
                      color: "pink"
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex gap-6 items-start">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-${item.color}-100 flex items-center justify-center`}>
                        <span className={`text-xl font-bold text-${item.color}-600`}>{item.step}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Payment Models */}
              <section className="grid md:grid-cols-2 gap-8">
                {/* Paid Model */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    <h3 className="text-2xl font-bold text-gray-900">One-Time Payment</h3>
                  </div>
                  <p className="text-gray-700 mb-6">
                    Pay a specific fee for approval assistance. Perfect for those who want a straightforward transaction.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">Fixed fee per project (e.g., $100 per platform)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">Package deals available (e.g., $150 for 4 approvals)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">No ongoing obligations</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">You keep 100% of earnings</p>
                    </div>
                  </div>
                </div>

                {/* Share Model */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Revenue Share</h3>
                  </div>
                  <p className="text-gray-700 mb-6">
                    Share earnings with your agent. Ideal for ongoing support and task management.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">No upfront payment required</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">50/50 split or as agreed with agent</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">Agent can work on projects on your behalf (if authorized)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">Ongoing agent support included</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Work Types */}
              <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Briefcase className="w-8 h-8 text-blue-600" />
                  Types of Remote Work Available
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {workTypes.map((work, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 text-center hover:shadow-md transition-all">
                      <div className="bg-white rounded-lg p-3 w-fit mx-auto mb-2">
                        <div className="text-blue-600">
                          {work.icon}
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{work.name}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Supported Platforms */}
              <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Shield className="w-8 h-8" />
                  20+ Supported Platforms
                </h2>
                <p className="text-gray-300 mb-6">
                  Our agents have expertise across industry-leading platforms. No limit to the number of gigs you can pursue!
                </p>
                <div className="flex flex-wrap gap-3">
                  {platforms.map((platform, index) => (
                    <span
                      key={index}
                      className="bg-white bg-opacity-10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium hover:bg-opacity-20 transition-all"
                    >
                      {platform}
                    </span>
                  ))}
                  <span className="bg-blue-600 px-4 py-2 rounded-full text-sm font-bold">
                    +10 More
                  </span>
                </div>
              </section>

              {/* Screen Sharing Banner */}
              <section className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Monitor className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2">Secure Screen Sharing Available</h3>
                    <p className="text-green-100 text-lg mb-4">
                      Let our trained agents help you manage multiple gigs efficiently with Google Remote Desktop.
                      You stay in complete control with our zero-tolerance security policies.
                    </p>
                    <button
                      onClick={() => router.push('/candidate-screen')}
                      className="bg-white text-green-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all inline-flex items-center gap-2"
                    >
                      <Shield className="w-5 h-5" />
                      Learn About Screen Sharing
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Tips Tab */}
          {activeTab === 'tips' && (
            <div className="space-y-8">
              {/* Header */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 border-2 border-yellow-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-yellow-500 p-3 rounded-xl">
                    <Lightbulb className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">7 Tips to Succeed with Remote-Works</h2>
                </div>
                <p className="text-gray-700 text-lg">
                  Follow these proven strategies to maximize your success and earnings on our platform.
                  These tips come from our most successful candidates and experienced agents.
                </p>
              </div>

              {/* Tips List */}
              {successTips.map((tip, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                      <Star className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{tip.title}</h3>
                      <p className="text-gray-600 text-lg leading-relaxed mb-4">{tip.description}</p>
                      <div className="space-y-2">
                        {tip.tips.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                            <ChevronRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Call to Action */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
                <h3 className="text-3xl font-bold mb-4">Ready to Start Your Remote Work Journey?</h3>
                <p className="text-xl text-blue-100 mb-6">
                  Join thousands of candidates who are already earning with Remote-Works
                </p>
                <button
                  onClick={() => router.push('/candidate-dashboard')}
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all inline-flex items-center gap-2"
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
