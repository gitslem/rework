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
      title: "Trusted Partnerships",
      description: "We partner exclusively with established global organizations that maintain high standards for remote work quality, fair compensation, and professional development.",
      color: "bg-black"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Professional Integrity",
      description: "Every professional in our network undergoes comprehensive verification to ensure authenticity, credibility, and readiness to meet international work standards.",
      color: "bg-gray-800"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Quality-First Approach",
      description: "We prioritize long-term career success over quick placements. Our structured guidance ensures professionals are genuinely prepared for remote work excellence.",
      color: "bg-gray-700"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Transparent Communication",
      description: "Complete honesty about processes, requirements, and expectations. We build trust through clear communication and realistic guidance at every step.",
      color: "bg-gray-900"
    }
  ];

  const expertCategories = [
    {
      icon: <Briefcase className="w-12 h-12" />,
      title: "Professional Verification",
      count: "Rigorous",
      description: "Multi-level verification process ensuring every professional meets international standards for identity, skills, and professional readiness.",
      color: "from-blue-600 to-cyan-600"
    },
    {
      icon: <MessageSquare className="w-12 h-12" />,
      title: "Expert Guidance",
      count: "Personalized",
      description: "One-on-one career coaching from specialists who understand global platform requirements and industry best practices.",
      color: "from-purple-600 to-pink-600"
    },
    {
      icon: <Award className="w-12 h-12" />,
      title: "Career Development",
      count: "Continuous",
      description: "Ongoing professional development resources, skill enhancement programs, and career advancement support for long-term success.",
      color: "from-green-600 to-emerald-600"
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: "Global Network",
      count: "20+ Partners",
      description: "Direct access to vetted opportunities through our partnerships with leading organizations in AI, language services, and digital content.",
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
        <title>About Rework | Professional Remote Work Platform with Personalized Career Support</title>
        <meta name="description" content="Rework has helped thousands of professionals access verified remote work opportunities with personalized support. 98% success rate. Leading platform for remote AI training, data annotation, translation, and digital content careers with expert guidance." />
        <meta name="keywords" content="about rework, remote work platform, personalized career support, AI training careers, data annotation jobs, remote opportunities, work from home platform, professional development, career readiness program, remote job assistance, flexible work opportunities" />

        {/* Open Graph Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rework.com/about" />
        <meta property="og:title" content="About Rework - Professional Remote Work Platform" />
        <meta property="og:description" content="Learn how Rework provides personalized support to help professionals access verified remote work opportunities with 98% success rate." />
        <meta property="og:site_name" content="Rework" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Rework - Remote Work with Expert Support" />
        <meta name="twitter:description" content="Thousands of successful placements. 98% success rate. Personalized support for remote work opportunities." />

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
              "description": "Professional career platform partnering with leading global organizations to connect verified professionals with legitimate remote opportunities in AI training, data annotation, translation, and digital content creation",
              "mainEntity": {
                "@type": "Organization",
                "name": "Rework",
                "url": "https://rework.com",
                "foundingDate": "2023",
                "description": "Professional remote work platform with partnerships across 20+ global organizations",
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
                Your Trusted Partner for
                <span className="block text-black">
                  Global Remote Work Success
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Rework is a professional career platform partnering with leading global organizations to connect verified professionals
                with legitimate remote opportunities in AI training, data annotation, translation, and digital content creation.
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
                  Building Bridges to Global Remote Opportunities
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  In today's rapidly evolving digital economy, remote work opportunities have become increasingly accessible yet
                  increasingly competitive. Rework was founded to bridge the gap between talented professionals worldwide and
                  leading global organizations seeking skilled remote contributors.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  <strong>We are not a job board.</strong> We are a professional career platform that partners with established
                  global organizations in AI development, language services, and digital content creation. Our partnerships with
                  industry leaders enable us to provide structured pathways to legitimate remote opportunities that might otherwise
                  be difficult to access or navigate independently.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Through our comprehensive verification process, personalized career guidance, and direct partnerships with
                  top-tier platforms, we help professionals build credible profiles that meet international standards. Our success
                  is measured by the long-term career growth of the professionals we serve.
                </p>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Our Commitment to Excellence</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We maintain rigorous standards for both the professionals we verify and the partnerships we establish. Every
                    opportunity we connect you with has been thoroughly vetted to ensure legitimacy, fair compensation, and
                    professional working conditions. We believe in sustainable remote careers built on trust, transparency, and
                    mutual respect.
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
                Comprehensive Professional Services
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                End-to-end career support designed to connect verified professionals with global remote opportunities
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
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Leading Organizations Trust Us</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <BadgeCheck className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Verified Talent Pool</h4>
                  <p className="text-gray-600 text-sm">Every professional is thoroughly verified for identity, skills, and professional readiness through our rigorous multi-step process</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Quality Standards</h4>
                  <p className="text-gray-600 text-sm">We maintain international quality benchmarks, ensuring professionals meet the high standards expected by global organizations</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Partnership Integrity</h4>
                  <p className="text-gray-600 text-sm">Built on trust, transparency, and ethical practices—we are committed to sustainable success for all stakeholders</p>
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
                Your Professional Journey with Rework
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A structured pathway from verification to accessing opportunities with our global partner organizations
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
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Professional Verification</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      Complete our comprehensive verification process covering identity, professional credentials, and skill assessment to meet international standards.
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
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Career Coaching</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      Work with experienced career specialists who provide personalized guidance to optimize your profile for global partner platforms.
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
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Partner Connections</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      Gain access to curated opportunities from our network of 20+ trusted global partners in AI, translation, and digital content.
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
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Career Growth</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      Build sustainable remote careers with ongoing support, professional development resources, and access to multiple partner platforms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Model Info */}
              <div className="mt-16 bg-gradient-to-r from-gray-900 to-black rounded-3xl p-10 text-white">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">Professional Platform</div>
                    <p className="text-gray-300 text-sm">Comprehensive career services connecting verified professionals with global opportunities</p>
                  </div>
                  <div className="text-center border-l border-r border-gray-700 px-4">
                    <div className="text-3xl font-bold mb-2">Trusted Partners</div>
                    <p className="text-gray-300 text-sm">Direct partnerships with 20+ leading organizations in AI, translation, and digital content</p>
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
