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

  const teamMembers = [
    {
      name: "Anslem Ebiega",
      role: "Teams Lead",
      icon: <Users className="w-8 h-8" />
    },
    {
      name: "Jubal Simire",
      role: "Support Lead",
      icon: <MessageSquare className="w-8 h-8" />
    },
    {
      name: "Salisu Mudassir",
      role: "Marketing Lead",
      icon: <TrendingUp className="w-8 h-8" />
    },
    {
      name: "Hannah Elio",
      role: "Onboarding Lead",
      icon: <UserPlus className="w-8 h-8" />
    }
  ];

  const values = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Trusted Partnerships",
      description: "We partner exclusively with established global organizations that maintain high standards for remote work quality, fair compensation, and professional development.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Professional Integrity",
      description: "Every professional in our network undergoes comprehensive verification to ensure authenticity, credibility, and readiness to meet international work standards.",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Quality-First Approach",
      description: "We prioritize long-term career success over quick placements. Our structured guidance ensures professionals are genuinely prepared for remote work excellence.",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Transparent Communication",
      description: "Complete honesty about processes, requirements, and expectations. We build trust through clear communication and realistic guidance at every step.",
    }
  ];

  const expertCategories = [
    {
      icon: <Briefcase className="w-12 h-12" />,
      title: "Professional Verification",
      count: "Rigorous",
      description: "Multi-level verification process ensuring every professional meets international standards for identity, skills, and professional readiness.",
      color: "from-purple-600 to-pink-600"
    },
    {
      icon: <MessageSquare className="w-12 h-12" />,
      title: "Expert Guidance",
      count: "Personalized",
      description: "One-on-one career coaching from specialists who understand global platform requirements and industry best practices.",
      color: "from-amber-600 to-yellow-600"
    },
    {
      icon: <Award className="w-12 h-12" />,
      title: "Career Development",
      count: "Continuous",
      description: "Ongoing professional development resources, skill enhancement programs, and career advancement support for long-term success.",
      color: "from-purple-600 to-amber-600"
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: "Global Network",
      count: "40+ Platforms",
      description: "Direct access to vetted opportunities through our network of 40+ leading platforms in AI, language services, and digital content.",
      color: "from-pink-600 to-purple-600"
    }
  ];

  const trustpilotReviews = [
    {
      rating: 5,
      title: "Excellent service, got approved quickly!",
      review: "I was skeptical at first, but Remote-Works truly delivered. My career specialist was professional, responsive, and knew exactly what the platform was looking for. Got approved on Outlier within 5 days!",
      author: "Sarah Martinez",
      date: "November 2024",
      verified: true
    },
    {
      rating: 5,
      title: "Best decision for my remote career",
      review: "After months of failed applications, I found Remote-Works. The career specialist I worked with understood the process inside-out and helped me get approved on 3 platforms. Now earning $3.5K monthly!",
      author: "David Chen",
      date: "October 2024",
      verified: true
    },
    {
      rating: 5,
      title: "Professional and reliable",
      review: "The verification process showed me this is a legitimate platform. My career specialist was knowledgeable, the payment was fair (only after approval), and the support team was helpful throughout.",
      author: "Priya Sharma",
      date: "December 2024",
      verified: true
    },
    {
      rating: 5,
      title: "Game changer for platform approvals",
      review: "I tried applying on my own for 6 months with no success. Remote-Works matched me with a career specialist who got me approved in less than 2 weeks. The ROI was incredible!",
      author: "Michael Johnson",
      date: "September 2024",
      verified: true
    },
    {
      rating: 5,
      title: "Trustworthy and effective",
      review: "What impressed me most was the transparency. Real success rates, honest communication, and no hidden fees. My career specialist delivered exactly what was promised.",
      author: "Emma Thompson",
      date: "November 2024",
      verified: true
    },
    {
      rating: 5,
      title: "Highly recommended for beginners",
      review: "As someone new to remote work, Remote-Works made everything simple. The career specialist explained every step, helped with my applications, and I'm now working on multiple platforms.",
      author: "Ahmed Hassan",
      date: "October 2024",
      verified: true
    }
  ];

  const milestones = [
    { year: "2023", event: "Remote-Works Founded", description: "Launched in March 2023 with a mission to democratize access to AI training opportunities. Started with 12 project types and a vision to solve the platform approval crisis." },
    { year: "2023", event: "First 100 Professionals Verified", description: "By September 2023, reached 100 verified professionals across 15 countries. Implemented proprietary verification system requiring proof of 10+ successful approvals." },
    { year: "2024", event: "10,000 Successful Approvals", description: "Hit major milestone of 10,000 candidates successfully approved. Achieved 95% success rate through rigorous professional training and quality control." },
    { year: "2024", event: "Platform Partnerships", description: "Established direct communication channels with compliance teams at major AI training platforms to better understand their evolving requirements." },
    { year: "2025", event: "12 Projects, 27K+ Professionals", description: "Network expanded to 12 verified project types across 40+ platforms in 35 countries. Facilitated 27,000+ professional placements, with members now earning $4K+ monthly on average." }
  ];

  // Auto-play testimonials slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev === trustpilotReviews.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${i < rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>About Remote-Works | Professional Remote Work Platform with Personalized Career Support</title>
        <meta name="description" content="Remote-Works has helped thousands of professionals access verified remote work opportunities with personalized support. 95% success rate. Leading platform for remote AI training, data annotation, translation, and digital content careers with expert guidance." />
        <meta name="keywords" content="about remote-works, remote work platform, personalized career support, AI training careers, data annotation jobs, remote opportunities, work from home platform, professional development, career readiness program, remote job assistance, flexible work opportunities" />

        {/* Open Graph Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://remote-works.io/about" />
        <meta property="og:title" content="About Remote-Works - Professional Remote Work Platform" />
        <meta property="og:description" content="Learn how Remote-Works provides personalized support to help professionals access verified remote work opportunities with 95% success rate." />
        <meta property="og:site_name" content="Remote-Works" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Remote-Works - Remote Work with Expert Support" />
        <meta name="twitter:description" content="Thousands of successful placements. 95% success rate. Personalized support for remote work opportunities." />

        {/* Additional SEO Tags */}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://remote-works.io/about" />

        {/* Structured Data - AboutPage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AboutPage",
              "name": "About Remote-Works",
              "description": "Professional career platform partnering with leading global organizations to connect verified professionals with legitimate remote opportunities in AI training, data annotation, translation, and digital content creation",
              "mainEntity": {
                "@type": "Organization",
                "name": "Remote-Works",
                "url": "https://remote-works.io",
                "foundingDate": "2023",
                "description": "Professional remote work platform with partnerships across 40+ global platforms",
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
            <div className="flex justify-between items-center h-20">
              <Logo onClick={() => router.push('/')} showText={false} size="md" />

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <button onClick={() => router.push('/')} className="text-gray-600 hover:text-black transition-colors font-medium text-sm">Home</button>
                <button onClick={() => router.push('/login')} className="text-gray-600 hover:text-black transition-colors font-medium text-sm">Sign In</button>
                <button
                  onClick={() => router.push('/register')}
                  className="bg-gradient-to-r from-purple-600 to-amber-500 text-white px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-all"
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
                <button onClick={() => { router.push('/register'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-lg font-semibold mx-4">Get Started</button>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-amber-50 to-white pt-20 pb-16">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '3s' }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto space-y-6">
              <h1 className="text-5xl md:text-6xl font-extrabold text-black leading-tight">
                Your Trusted Partner for
                <span className="block mt-2 bg-gradient-to-r from-purple-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                  Global Remote Work Success
                </span>
              </h1>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Remote-Works is a professional career platform partnering with leading global organizations to connect verified professionals
                with legitimate remote opportunities in AI training, data annotation, translation, and digital content creation.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-block mb-4">
                  <span className="bg-gradient-to-r from-purple-600 to-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">Our Mission</span>
                </div>
                <h2 className="text-4xl font-extrabold text-black mb-6">
                  Building Bridges to Global Remote Opportunities
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  In today's rapidly evolving digital economy, remote work opportunities have become increasingly accessible yet
                  increasingly competitive. Remote-Works was founded to bridge the gap between talented professionals worldwide and
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
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">Comprehensive profile verification process</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">Structured onboarding and guidance</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">Access to vetted remote opportunities</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-black rounded-3xl p-12 text-white shadow-2xl">
                  <div className="space-y-8">
                    <div>
                      <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">2023</div>
                      <div className="text-gray-300">Founded</div>
                    </div>
                    <div>
                      <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">40+</div>
                      <div className="text-gray-300">Platforms</div>
                    </div>
                    <div>
                      <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">Global</div>
                      <div className="text-gray-300">Reach</div>
                    </div>
                    <div>
                      <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">100%</div>
                      <div className="text-gray-300">Transparency</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-4">
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
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-500"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-amber-500 rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform shadow-md">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-4">
                Meet Our{' '}
                <span className="bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent">
                  Leadership Team
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Dedicated professionals committed to your remote work success
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-purple-50 to-amber-50 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-500"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-amber-500 rounded-full text-white mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    {member.icon}
                  </div>
                  <h3 className="text-xl font-bold text-black mb-2">{member.name}</h3>
                  <p className="text-purple-600 font-semibold">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Professional Services Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-4">
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
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-500"
                >
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${category.color} rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    {category.icon}
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent mb-2">{category.count}</div>
                  <h3 className="text-xl font-bold text-black mb-3">{category.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{category.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trustpilot Reviews Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <h2 className="text-4xl md:text-5xl font-extrabold text-black">
                  Trusted by Thousands
                </h2>
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-8 h-8 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <span className="text-2xl font-bold text-black">4.9 out of 5</span>
              </div>
              <p className="text-lg text-gray-600">Verified customer reviews from our community</p>
            </div>

            {/* Testimonial Slider */}
            <div className="relative max-w-4xl mx-auto">
              {/* Main Testimonial Card */}
              <div className="bg-gradient-to-br from-purple-50 to-amber-50 rounded-3xl p-10 md:p-12 shadow-2xl border-2 border-purple-200 hover:border-purple-500 transition-all duration-500">
                <div className="flex items-center justify-between mb-6">
                  {renderStars(trustpilotReviews[currentTestimonial].rating)}
                  {trustpilotReviews[currentTestimonial].verified && (
                    <span className="bg-purple-100 text-purple-700 text-sm px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4" />
                      Verified
                    </span>
                  )}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-black mb-4">
                  {trustpilotReviews[currentTestimonial].title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  "{trustpilotReviews[currentTestimonial].review}"
                </p>
                <div className="border-t border-purple-200 pt-6">
                  <p className="text-xl font-bold text-black">
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
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 w-12 h-12 bg-white rounded-full shadow-xl border-2 border-purple-200 hover:border-purple-500 flex items-center justify-center transition-all hover:scale-110 group"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-purple-600" />
              </button>
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev === trustpilotReviews.length - 1 ? 0 : prev + 1))}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 w-12 h-12 bg-white rounded-full shadow-xl border-2 border-purple-200 hover:border-purple-500 flex items-center justify-center transition-all hover:scale-110 group"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-purple-600" />
              </button>

              {/* Dot Indicators */}
              <div className="flex justify-center gap-2 mt-8">
                {trustpilotReviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentTestimonial
                        ? 'w-8 h-3 bg-gradient-to-r from-purple-600 to-amber-500'
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
        <section className="py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-4">
                Your Professional Journey with Remote-Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A structured pathway from verification to accessing opportunities with our global partner organizations
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="relative bg-white rounded-2xl p-8 text-center shadow-lg border-2 border-transparent hover:border-purple-500 transition-all">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <UserPlus className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-purple-600 mb-2">01</div>
                <h3 className="text-xl font-bold text-black mb-3">Professional Verification</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Complete our comprehensive verification process covering identity, professional credentials, and skill assessment.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative bg-white rounded-2xl p-8 text-center shadow-lg border-2 border-transparent hover:border-purple-500 transition-all">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <BadgeCheck className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-amber-600 mb-2">02</div>
                <h3 className="text-xl font-bold text-black mb-3">Expert Career Coaching</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Work with experienced career specialists who provide personalized guidance to optimize your profile.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative bg-white rounded-2xl p-8 text-center shadow-lg border-2 border-transparent hover:border-purple-500 transition-all">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <DollarSign className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-purple-600 mb-2">03</div>
                <h3 className="text-xl font-bold text-black mb-3">Platform Connections</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Gain access to curated opportunities from our network of 40+ trusted global platforms.
                </p>
              </div>

              {/* Step 4 */}
              <div className="relative bg-white rounded-2xl p-8 text-center shadow-lg border-2 border-transparent hover:border-purple-500 transition-all">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-amber-600 mb-2">04</div>
                <h3 className="text-xl font-bold text-black mb-3">Career Growth</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Build sustainable remote careers with ongoing support and professional development resources.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-4">
                Our Journey
              </h2>
              <p className="text-xl text-gray-600">
                From a simple idea to a global platform
              </p>
            </div>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-amber-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {milestone.year}
                    </div>
                  </div>
                  <div className="flex-grow bg-gradient-to-br from-purple-50 to-amber-50 rounded-2xl p-6 border-2 border-purple-200 hover:border-purple-500 transition-all shadow-lg">
                    <h3 className="text-2xl font-bold text-black mb-2">{milestone.event}</h3>
                    <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-purple-50/20 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-amber-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-amber-400/20 to-yellow-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-400/10 to-amber-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-slate-900">
              Ready to Access Remote Work Opportunities?
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 mb-10 leading-relaxed max-w-3xl mx-auto">
              Join Remote-Works to verify your profile, prepare for applications, and connect with legitimate remote work opportunities offered by third-party companies and platforms.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
              <div className="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-lg">
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent">Verified</div>
                <div className="text-gray-600 text-sm font-medium">Profile verification process</div>
              </div>
              <div className="bg-white rounded-xl p-6 border-2 border-amber-200 shadow-lg">
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">Transparent</div>
                <div className="text-gray-600 text-sm font-medium">No false promises or guarantees</div>
              </div>
              <div className="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-lg">
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Support</div>
                <div className="text-gray-600 text-sm font-medium">Career enablement services</div>
              </div>
            </div>

            <button
              onClick={() => router.push('/register?type=candidate')}
              className="group relative bg-gradient-to-r from-purple-600 via-amber-500 to-purple-600 text-white px-12 py-5 rounded-full font-bold text-lg transition-all shadow-2xl hover:shadow-purple-500/50 hover:scale-105 inline-flex items-center space-x-3"
            >
              <span>Get Started as a Professional</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
