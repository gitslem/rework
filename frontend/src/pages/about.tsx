import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Target, Users, Shield, Heart, CheckCircle, Menu, X,
  UserPlus, BadgeCheck, TrendingUp, ArrowRight, DollarSign, Briefcase,
  Star, Award, Globe, Zap, MessageSquare, ChevronLeft, ChevronRight
} from 'lucide-react';
import Head from 'next/head';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';

export default function About() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const values = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Comprehensive Verification",
      description: "All professionals complete identity, skill, and eligibility verification to ensure authenticity and credibility before accessing opportunities.",
      color: "bg-black"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "No Job Guarantees",
      description: "We provide career enablement and recruitment support—not employment. All hiring decisions are made by third-party companies based on their requirements.",
      color: "bg-gray-800"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Quality Standards",
      description: "We focus on connecting professionals with legitimate, vetted remote work opportunities offered by reputable third-party companies and platforms.",
      color: "bg-gray-700"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Complete Transparency",
      description: "Clear communication about our role, services, and limitations. No false promises, no misleading claims—just honest support and realistic expectations.",
      color: "bg-gray-900"
    }
  ];

  const expertCategories = [
    {
      icon: <Briefcase className="w-12 h-12" />,
      title: "Profile Verification",
      count: "Core",
      description: "Comprehensive identity, skill, and eligibility verification processes to ensure all professionals meet platform standards.",
      color: "from-blue-600 to-cyan-600"
    },
    {
      icon: <MessageSquare className="w-12 h-12" />,
      title: "Application Support",
      count: "Service",
      description: "Structured onboarding and guidance to help professionals prepare application-ready profiles that meet platform requirements.",
      color: "from-purple-600 to-pink-600"
    },
    {
      icon: <Award className="w-12 h-12" />,
      title: "Career Enablement",
      count: "Focus",
      description: "Optional career support services including profile optimization, application readiness review, and skill assessment guidance.",
      color: "from-green-600 to-emerald-600"
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: "Global Opportunities",
      count: "Access",
      description: "Connections to verified remote work opportunities offered by third-party companies and platforms worldwide.",
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

  // Auto-play testimonials slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev === trustpilotReviews.length - 1 ? 0 : prev + 1));
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(interval);
  }, []);

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
        <title>About Rework | Leading Remote Work Platform for AI Training & Data Annotation Jobs</title>
        <meta name="description" content="Rework has helped 27,000+ professionals get approved for remote AI training jobs on Outlier, Appen, Welocalize, TELUS Digital, RWS & more. 98% success rate. Join the leading platform for data annotation and machine learning jobs." />
        <meta name="keywords" content="about rework, remote work platform, AI training jobs, data annotation careers, remote AI opportunities, work from home jobs, machine learning jobs, platform approval service" />

        {/* Open Graph Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rework.com/about" />
        <meta property="og:title" content="About Rework - 27,000+ Professionals Approved for Remote AI Jobs" />
        <meta property="og:description" content="Learn how Rework helps professionals get approved for remote AI training and data annotation jobs with 98% success rate." />
        <meta property="og:site_name" content="Rework" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Rework - Leading Remote AI Jobs Platform" />
        <meta name="twitter:description" content="27,000+ approvals. 98% success rate. Get approved for Outlier, Appen, Welocalize & more." />

        {/* Additional SEO Tags */}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rework.com/about" />

        {/* Structured Data - AboutPage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AboutPage",
              "name": "About Rework",
              "description": "Rework has helped 27,000+ professionals get approved for remote AI training and data annotation jobs",
              "mainEntity": {
                "@type": "Organization",
                "name": "Rework",
                "url": "https://rework.com",
                "foundingDate": "2023",
                "numberOfEmployees": {
                  "@type": "QuantitativeValue",
                  "value": "400+"
                }
              }
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20 md:h-24 py-3">
              <Logo onClick={() => router.push('/')} showText={false} size="lg" />

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
                Connecting Professionals with
                <span className="block text-black">
                  Verified Remote Work Opportunities
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Remote-Works.io is a career enablement and recruitment platform helping professionals prepare, verify,
                and connect with legitimate remote work opportunities across global digital work platforms.
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
                  Enabling Remote Work Careers
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  The remote work landscape has transformed dramatically, creating opportunities for professionals worldwide.
                  However, navigating application requirements, verification processes, and platform standards can be challenging
                  for individuals seeking legitimate remote work opportunities.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Remote-Works.io was created to provide clarity and support. We help professionals prepare comprehensive profiles,
                  complete necessary verifications, and connect with vetted remote work opportunities offered by third-party companies
                  and platforms. Our platform focuses on transparency, ethical practices, and realistic expectations.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  <strong>Our mission is clear:</strong> provide career enablement and recruitment support services that help
                  professionals access legitimate remote work opportunities. We believe in transparency, ethical practices, and
                  empowering individuals to build sustainable remote careers.
                </p>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Vision for 2026</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Expand our network of verified support specialists, establish direct partnerships with leading remote work
                    platforms, and create a more transparent ecosystem that connects professionals with legitimate opportunities
                    while maintaining ethical standards and realistic expectations.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">Comprehensive profile verification process</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">Structured onboarding and guidance</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">Access to vetted remote opportunities</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-black rounded-3xl p-12 text-white shadow-2xl">
                  <div className="space-y-8">
                    <div>
                      <div className="text-5xl font-bold mb-2">2023</div>
                      <div className="text-gray-300">Founded</div>
                    </div>
                    <div>
                      <div className="text-5xl font-bold mb-2">20+</div>
                      <div className="text-gray-300">Partner Platforms</div>
                    </div>
                    <div>
                      <div className="text-5xl font-bold mb-2">Global</div>
                      <div className="text-gray-300">Reach</div>
                    </div>
                    <div>
                      <div className="text-5xl font-bold mb-2">100%</div>
                      <div className="text-gray-300">Transparency</div>
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
                Our Services
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive career enablement and recruitment support for remote professionals
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

            {/* Service Principles */}
            <div className="mt-16 bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Commitments</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <BadgeCheck className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Verification First</h4>
                  <p className="text-gray-600 text-sm">All professionals complete comprehensive verification before accessing opportunities</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">No False Promises</h4>
                  <p className="text-gray-600 text-sm">We provide support and access—not guarantees of approval or employment</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Ethical Practices</h4>
                  <p className="text-gray-600 text-sm">Complete transparency about our role, services, and limitations</p>
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
              <p className="text-lg text-gray-600">Verified customer reviews from our community</p>
            </div>

            {/* Testimonial Slider */}
            <div className="relative max-w-4xl mx-auto">
              {/* Main Testimonial Card */}
              <div className="bg-white rounded-3xl p-10 md:p-12 shadow-2xl border-2 border-gray-100 hover:border-green-500 transition-all duration-500">
                <div className="flex items-center justify-between mb-6">
                  {renderStars(trustpilotReviews[currentTestimonial].rating)}
                  {trustpilotReviews[currentTestimonial].verified && (
                    <span className="bg-green-100 text-green-700 text-sm px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4" />
                      Verified
                    </span>
                  )}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {trustpilotReviews[currentTestimonial].title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  "{trustpilotReviews[currentTestimonial].review}"
                </p>
                <div className="border-t border-gray-200 pt-6">
                  <p className="text-xl font-bold text-gray-900">
                    {trustpilotReviews[currentTestimonial].author}
                  </p>
                  <p className="text-gray-500 mt-1">
                    {trustpilotReviews[currentTestimonial].date}
                  </p>
                </div>
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev === 0 ? trustpilotReviews.length - 1 : prev - 1))}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 w-12 h-12 bg-white rounded-full shadow-xl border-2 border-gray-200 hover:border-green-500 flex items-center justify-center transition-all hover:scale-110 group"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-green-600" />
              </button>
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev === trustpilotReviews.length - 1 ? 0 : prev + 1))}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 w-12 h-12 bg-white rounded-full shadow-xl border-2 border-gray-200 hover:border-green-500 flex items-center justify-center transition-all hover:scale-110 group"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-green-600" />
              </button>

              {/* Dot Indicators */}
              <div className="flex justify-center gap-2 mt-8">
                {trustpilotReviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentTestimonial
                        ? 'w-8 h-3 bg-gradient-to-r from-green-500 to-green-600'
                        : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Process */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Your Journey with Remote-Works.io
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A clear, structured process from profile creation to accessing remote work opportunities
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
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Create & Verify Profile</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      Create your account and complete identity, skill, and eligibility verification to access opportunities.
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
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Get Application-Ready</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      Receive structured onboarding and guidance to ensure your profile meets platform standards and requirements.
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
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Access Opportunities</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      Connect with verified remote work opportunities offered by third-party companies and platforms.
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
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Work Directly</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      All work, payments, contracts, and assignments are handled directly by the hiring company—not by us.
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Model Info */}
              <div className="mt-16 bg-gradient-to-r from-gray-900 to-black rounded-3xl p-10 text-white">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">Career Enablement</div>
                    <p className="text-gray-300 text-sm">Profile verification and application readiness support services</p>
                  </div>
                  <div className="text-center border-l border-r border-gray-700 px-4">
                    <div className="text-3xl font-bold mb-2">Not an Employer</div>
                    <p className="text-gray-300 text-sm">We connect you with opportunities—hiring is done by third-party companies</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">Optional Services</div>
                    <p className="text-gray-300 text-sm">Additional career support available but not required for access</p>
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
              Ready to Access Remote Work Opportunities?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join Remote-Works.io to verify your profile, prepare for applications, and connect with legitimate remote work opportunities offered by third-party companies and platforms.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
              <div className="bg-gray-900 rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">Verified</div>
                <div className="text-gray-400 text-sm">Profile verification process</div>
              </div>
              <div className="bg-gray-900 rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">Transparent</div>
                <div className="text-gray-400 text-sm">No false promises or guarantees</div>
              </div>
              <div className="bg-gray-900 rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">Support</div>
                <div className="text-gray-400 text-sm">Career enablement services</div>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => router.push('/register?type=candidate')}
                className="bg-white text-black px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-2xl"
              >
                Get Started as a Professional
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
