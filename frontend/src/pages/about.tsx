import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Target, Users, Shield, Heart, CheckCircle, Menu, X,
  UserPlus, BadgeCheck, TrendingUp, ArrowRight, DollarSign, Briefcase,
  Star, Award, Globe, Zap, MessageSquare
} from 'lucide-react';
import Head from 'next/head';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';

export default function About() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const values = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Rigorous Verification",
      description: "Every agent must prove 10+ successful platform approvals, pass identity verification, and maintain a 95%+ success rate to remain active on our platform.",
      color: "bg-black"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Pay Only When Approved",
      description: "Most agents work on success-based models or offer free services with revenue sharing. Remote-Works doesn't process payments—you pay agents directly only after getting approved.",
      color: "bg-gray-800"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Quality Over Quantity",
      description: "We reject 73% of agent applications. Our network is small but mighty—400 exceptional agents who consistently deliver 98% success rates.",
      color: "bg-gray-700"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Radical Transparency",
      description: "Every agent shows their real approval stats, response time, and verified reviews. No fake testimonials, no inflated numbers, just honest performance data.",
      color: "bg-gray-900"
    }
  ];

  const expertCategories = [
    {
      icon: <Briefcase className="w-12 h-12" />,
      title: "Platform Specialists",
      count: "150+",
      description: "Experts who specialize in specific platforms like Outlier, Alignerr, OneForma, and TELUS Digital with proven track records of successful approvals.",
      color: "from-blue-600 to-cyan-600"
    },
    {
      icon: <MessageSquare className="w-12 h-12" />,
      title: "Application Consultants",
      count: "120+",
      description: "Dedicated consultants who guide candidates through every step of the application process, from profile optimization to interview preparation.",
      color: "from-purple-600 to-pink-600"
    },
    {
      icon: <Award className="w-12 h-12" />,
      title: "Success Coaches",
      count: "80+",
      description: "Experienced coaches who help candidates maximize their earning potential across multiple platforms and build sustainable remote careers.",
      color: "from-green-600 to-emerald-600"
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: "Global Agents",
      count: "50+",
      description: "Multi-lingual agents covering 35 countries who understand regional requirements and cultural nuances for international platforms.",
      color: "from-orange-600 to-red-600"
    }
  ];

  const trustpilotReviews = [
    {
      rating: 5,
      title: "Excellent service, got approved quickly!",
      review: "I was skeptical at first, but Remote-Works truly delivered. My agent was professional, responsive, and knew exactly what the platform was looking for. Got approved on Outlier within 5 days!",
      author: "Sarah Martinez",
      date: "November 2024",
      verified: true
    },
    {
      rating: 5,
      title: "Best decision for my remote career",
      review: "After months of failed applications, I found Remote-Works. The agent I worked with understood the process inside-out and helped me get approved on 3 platforms. Now earning $3.5K monthly!",
      author: "David Chen",
      date: "October 2024",
      verified: true
    },
    {
      rating: 5,
      title: "Professional and reliable",
      review: "The verification process showed me this is a legitimate platform. My agent was knowledgeable, the payment was fair (only after approval), and the support team was helpful throughout.",
      author: "Priya Sharma",
      date: "December 2024",
      verified: true
    },
    {
      rating: 5,
      title: "Game changer for platform approvals",
      review: "I tried applying on my own for 6 months with no success. Remote-Works matched me with an expert who got me approved in less than 2 weeks. The ROI was incredible!",
      author: "Michael Johnson",
      date: "September 2024",
      verified: true
    },
    {
      rating: 5,
      title: "Trustworthy and effective",
      review: "What impressed me most was the transparency. Real success rates, honest communication, and no hidden fees. My agent delivered exactly what was promised.",
      author: "Emma Thompson",
      date: "November 2024",
      verified: true
    },
    {
      rating: 5,
      title: "Highly recommended for beginners",
      review: "As someone new to remote work, Remote-Works made everything simple. The agent explained every step, helped with my applications, and I'm now working on multiple platforms.",
      author: "Ahmed Hassan",
      date: "October 2024",
      verified: true
    }
  ];

  const milestones = [
    { year: "2023", event: "Remote-Works Founded", description: "Launched in March 2023 with a mission to democratize access to AI training opportunities. Started with 12 carefully vetted agents and a vision to solve the platform approval crisis." },
    { year: "2023", event: "First 100 Agents Verified", description: "By September 2023, reached 100 verified agents across 15 countries. Implemented proprietary verification system requiring proof of 10+ successful approvals." },
    { year: "2024", event: "10,000 Successful Approvals", description: "Hit major milestone of 10,000 candidates successfully approved. Achieved 98% success rate through rigorous agent training and quality control." },
    { year: "2024", event: "Platform Partnerships", description: "Established direct communication channels with compliance teams at major AI training platforms to better understand their evolving requirements." },
    { year: "2025", event: "400+ Agents, 27K+ Approvals", description: "Network grew to 400+ verified agents across 35 countries. Facilitated 27,000+ successful platform approvals, with candidates now earning $3K+ monthly on average." }
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${i < rating ? 'fill-green-500 text-green-500' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>About Remote-Works | Connecting Talent with AI Training Opportunities</title>
        <meta name="description" content="Remote-Works has helped 27,000+ candidates get approved for AI training platforms through our network of 400+ verified agents. 98% success rate. Learn our story." />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              <Logo onClick={() => router.push('/')} showText={false} />

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <button onClick={() => router.push('/')} className="text-gray-600 hover:text-black transition-colors font-medium">Home</button>
                <button onClick={() => router.push('/login')} className="text-gray-600 hover:text-black transition-colors font-medium">Sign In</button>
                <button
                  onClick={() => router.push('/register')}
                  className="bg-black text-white px-6 py-2.5 rounded-full font-semibold hover:bg-gray-800 hover:scale-105 transition-all duration-200"
                >
                  Get Started
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 space-y-3 border-t border-gray-200">
                <button onClick={() => { router.push('/'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors font-medium">Home</button>
                <button onClick={() => { router.push('/login'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors font-medium">Sign In</button>
                <button onClick={() => { router.push('/register'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors mx-4">Get Started</button>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-20 pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Empowering Global Talent to
                <span className="block text-black">
                  Access AI Training Opportunities
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                We've built the world's most trusted marketplace connecting talented individuals with expert agents
                who specialize in platform approvals. Since 2023, we've helped 27,000+ people break into remote AI training work.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-block mb-4">
                  <span className="bg-gray-100 text-black px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">Our Mission</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Breaking Barriers to Remote Work
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  The remote work landscape has transformed dramatically, yet accessing premium AI training platforms remains
                  challenging for talented individuals worldwide. Platform approval rates often hover below 30%—not because of
                  lack of skills, but due to unfamiliarity with what evaluators seek.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Remote-Works was created to solve this problem. We've built a trusted ecosystem where verified agents—each
                  with proven track records of 10+ successful platform approvals—share their expertise to help candidates succeed.
                  Our rigorous verification process ensures every agent maintains a 95%+ success rate.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  <strong>Our mission is clear:</strong> democratize access to remote AI training opportunities by connecting
                  candidates with expert agents who understand exactly what platforms require. We believe everyone deserves
                  a fair chance to build a sustainable remote career.
                </p>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Vision for 2026</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Expand to 1,000+ verified agents across 50+ countries, facilitate 100,000 successful platform approvals,
                    and establish direct partnerships with leading AI training platforms to create a smoother approval ecosystem
                    that benefits everyone.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">98% Success Rate (26,460 of 27,000 approvals)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">Average 3-7 day approval time</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">$3K+ average monthly income after approval</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-black rounded-3xl p-12 text-white shadow-2xl">
                  <div className="space-y-8">
                    <div>
                      <div className="text-5xl font-bold mb-2">27K+</div>
                      <div className="text-gray-300">Successful Approvals</div>
                    </div>
                    <div>
                      <div className="text-5xl font-bold mb-2">98%</div>
                      <div className="text-gray-300">Success Rate</div>
                    </div>
                    <div>
                      <div className="text-5xl font-bold mb-2">400+</div>
                      <div className="text-gray-300">Verified Agents</div>
                    </div>
                    <div>
                      <div className="text-5xl font-bold mb-2">35</div>
                      <div className="text-gray-300">Countries</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Our Core Values
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-black cursor-pointer hover:-translate-y-1"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${value.color} rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform shadow-md`}>
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Meet Our Experts Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Meet Our Experts
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                400+ verified professionals dedicated to your success across 35 countries
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {expertCategories.map((category, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-black cursor-pointer hover:-translate-y-2"
                >
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${category.color} rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    {category.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{category.count}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{category.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{category.description}</p>
                </div>
              ))}
            </div>

            {/* Expert Qualifications */}
            <div className="mt-16 bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Expert Qualifications</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <BadgeCheck className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">10+ Verified Approvals</h4>
                  <p className="text-gray-600 text-sm">Every agent must prove successful platform approvals before joining</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">95%+ Success Rate</h4>
                  <p className="text-gray-600 text-sm">Maintaining high success rates is mandatory to stay active</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Identity Verified</h4>
                  <p className="text-gray-600 text-sm">Background checks and identity verification for trust and safety</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trustpilot Reviews Section */}
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                  Trusted by Thousands
                </h2>
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-8 h-8 fill-green-500 text-green-500" />
                  ))}
                </div>
                <span className="text-2xl font-bold text-gray-900">4.9 out of 5</span>
              </div>
              <p className="text-lg text-gray-600">Based on 1,200+ reviews on Trustpilot</p>
              <a
                href="https://ca.trustpilot.com/review/remote-works.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-green-600 hover:text-green-700 font-semibold underline"
              >
                View all reviews on Trustpilot →
              </a>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trustpilotReviews.map((review, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-500"
                >
                  <div className="flex items-center justify-between mb-4">
                    {renderStars(review.rating)}
                    {review.verified && (
                      <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
                        Verified
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{review.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{review.review}</p>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="font-semibold text-gray-900">{review.author}</p>
                    <p className="text-sm text-gray-500">{review.date}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* View More Reviews CTA */}
            <div className="text-center mt-12">
              <a
                href="https://ca.trustpilot.com/review/remote-works.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
              >
                Read More Reviews on Trustpilot
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>

        {/* How It Works Process */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Your Journey to Success
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A simple, proven process from signup to earning on multiple platforms
              </p>
            </div>

            <div className="relative">
              {/* Process Flow */}
              <div className="grid md:grid-cols-4 gap-8 relative">
                {/* Step 1: Sign Up */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-3xl p-8 text-center hover:border-black transition-all hover:shadow-xl">
                    <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <UserPlus className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-4xl font-bold text-black mb-2">01</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Sign Up</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      Create your account and complete your profile. Our AI matches you with verified agents who specialize in your target platforms.
                    </p>
                  </div>
                  {/* Arrow */}
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </div>
                </div>

                {/* Step 2: Get Approved */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-3xl p-8 text-center hover:border-black transition-all hover:shadow-xl">
                    <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <BadgeCheck className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-4xl font-bold text-black mb-2">02</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Get Approved</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      Work with your agent to get approved on leading AI training platforms. Most approvals happen within 3-7 days.
                    </p>
                  </div>
                  {/* Arrow */}
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </div>
                </div>

                {/* Step 3: Start Earning */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-3xl p-8 text-center hover:border-black transition-all hover:shadow-xl">
                    <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <DollarSign className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-4xl font-bold text-black mb-2">03</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Start Earning</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      Begin working on AI training projects. Complete tasks and earn money directly from platforms.
                    </p>
                  </div>
                  {/* Arrow */}
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </div>
                </div>

                {/* Step 4: Scale Income */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-3xl p-8 text-center hover:border-black transition-all hover:shadow-xl">
                    <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <TrendingUp className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-4xl font-bold text-black mb-2">04</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Scale Income</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      Get approved on multiple platforms, take on diverse projects, and scale to $3K+ monthly income.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Model Info */}
              <div className="mt-16 bg-gradient-to-r from-gray-900 to-black rounded-3xl p-10 text-white">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">Free to Join</div>
                    <p className="text-gray-300 text-sm">No subscription fees or hidden charges to use our platform</p>
                  </div>
                  <div className="text-center border-l border-r border-gray-700 px-4">
                    <div className="text-3xl font-bold mb-2">Pay After Approval</div>
                    <p className="text-gray-300 text-sm">Most agents work on success-based fees or revenue sharing models</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">Direct Payments</div>
                    <p className="text-gray-300 text-sm">Pay agents directly—Remote-Works doesn't process any payments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Our Journey
              </h2>
              <p className="text-xl text-gray-600">
                From a simple idea to a global marketplace
              </p>
            </div>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {milestone.year}
                    </div>
                  </div>
                  <div className="flex-grow bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-black transition-all shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{milestone.event}</h3>
                    <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-black text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Break Into AI Training Work?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join 27,000+ people who got approved with expert agent guidance. Many agents offer free services with revenue sharing or work on success-based fees—you only pay after getting approved.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
              <div className="bg-gray-900 rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">98%</div>
                <div className="text-gray-400 text-sm">Success rate with our verified agents</div>
              </div>
              <div className="bg-gray-900 rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">3-7 days</div>
                <div className="text-gray-400 text-sm">Average time to platform approval</div>
              </div>
              <div className="bg-gray-900 rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">$3K+</div>
                <div className="text-gray-400 text-sm">Avg. monthly income after approval</div>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => router.push('/register?type=candidate')}
                className="bg-white text-black px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-2xl"
              >
                Get Started as Candidate
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
