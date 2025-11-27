import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowRight, CheckCircle, Users, Briefcase, Shield,
  Zap, Clock, Star, MessageSquare, Award, TrendingUp,
  BadgeCheck, UserCheck, Building2, Sparkles,
  Target, Search, FileCheck, Menu, X, Rocket, Mail, Send, Loader,
  Home as HomeIcon, Coffee, Wifi, Monitor, Bot, Headphones, Layers, DollarSign,
  Laptop, Globe, Code, Lightbulb, Database, Server, Smartphone
} from 'lucide-react';
import Head from 'next/head';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { number: "50K+", label: "Active Candidates", icon: <Users className="w-5 h-5" /> },
    { number: "2.5K+", label: "Verified Agents", icon: <BadgeCheck className="w-5 h-5" /> },
    { number: "98%", label: "Success Rate", icon: <Star className="w-5 h-5" /> },
    { number: "24/7", label: "Support", icon: <Clock className="w-5 h-5" /> }
  ];

  const platforms = [
    'Outlier AI',
    'Alignerr',
    'OneForma',
    'Appen',
    'RWS',
    'Mindrift AI',
    'TELUS Digital',
    'Scale AI'
  ];

  const features = [
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "Verified Agents",
      description: "All agents are thoroughly vetted with proven track records of successful placements."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Platform",
      description: "Enterprise-grade security with escrow payment protection for all transactions."
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Direct Communication",
      description: "Message agents directly and get personalized guidance throughout the process."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "High Success Rate",
      description: "98% success rate in getting candidates approved for their desired platforms."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Fast Approval",
      description: "Get matched with an agent within 24 hours and start immediately."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "100% Free to Use",
      description: "No subscription fees, no hidden charges. Connect with agents and only pay for services you choose."
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Create Account",
      description: "Sign up and complete your profile with skills and preferences."
    },
    {
      step: "02",
      title: "Get Approved",
      description: "Admin reviews your profile for quality assurance (24-48 hours)."
    },
    {
      step: "03",
      title: "Browse Agents",
      description: "Find verified agents specializing in your platforms of interest."
    },
    {
      step: "04",
      title: "Start Earning",
      description: "Work with your agent to get approved and begin earning."
    }
  ];

  const testimonials = [
    {
      quote: "Got approved on Outlier within a week after struggling for months. Best decision I made.",
      author: "Sarah J.",
      role: "Data Annotator"
    },
    {
      quote: "This platform transformed my business. The secure payment system gives everyone peace of mind.",
      author: "Michael C.",
      role: "Verified Agent"
    },
    {
      quote: "My agent knew exactly what platforms look for. Got approved on 3 services in 2 weeks.",
      author: "Priya S.",
      role: "AI Trainer"
    }
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      setSubscriptionStatus('error');
      setTimeout(() => {
        setSubscriptionStatus('idle');
        setErrorMessage('');
      }, 3000);
      return;
    }

    setSubscriptionStatus('loading');

    try {
      const { getFirebaseFirestore, isFirebaseConfigured } = await import('@/lib/firebase/config');
      const { collection, addDoc, Timestamp } = await import('firebase/firestore');

      if (!isFirebaseConfigured) {
        setErrorMessage('Service temporarily unavailable. Please try again later.');
        setSubscriptionStatus('error');
        setTimeout(() => {
          setSubscriptionStatus('idle');
          setErrorMessage('');
        }, 3000);
        return;
      }

      const db = getFirebaseFirestore();
      const emailLower = email.toLowerCase().trim();

      await addDoc(collection(db, 'newsletter_subscriptions'), {
        email: emailLower,
        subscribedAt: Timestamp.now(),
        source: 'homepage',
        status: 'active'
      });

      setSubscriptionStatus('success');
      setEmail('');
      setTimeout(() => setSubscriptionStatus('idle'), 5000);
    } catch (error: any) {
      console.error('Subscription error:', error);
      setErrorMessage(error.message || 'Failed to subscribe. Please try again.');
      setSubscriptionStatus('error');
      setTimeout(() => {
        setSubscriptionStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  return (
    <>
      <Head>
        <title>RemoteWorks - Get Approved for AI Training Projects</title>
        <meta name="description" content="Connect with verified agents who help you get approved for projects on Outlier, Alignerr, OneForma, and more. 98% success rate." />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center">
                <Logo showText={false} size="sm" />
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-8">
                <a href="#platforms" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Platforms</a>
                <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">How It Works</a>
                <button onClick={() => router.push('/about')} className="text-sm font-medium text-gray-600 hover:text-black transition-colors">About</button>
                <button onClick={() => router.push('/faq')} className="text-sm font-medium text-gray-600 hover:text-black transition-colors">FAQ</button>
                <button onClick={() => router.push('/login')} className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                  Sign In
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all"
                >
                  Get Started
                </button>
              </div>

              {/* Mobile menu button */}
              <div className="lg:hidden">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-black">
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="lg:hidden py-4 space-y-4 border-t border-gray-200">
                <a href="#platforms" className="block text-sm font-medium text-gray-600 hover:text-black">Platforms</a>
                <a href="#how-it-works" className="block text-sm font-medium text-gray-600 hover:text-black">How It Works</a>
                <button onClick={() => router.push('/about')} className="block w-full text-left text-sm font-medium text-gray-600 hover:text-black">About</button>
                <button onClick={() => router.push('/faq')} className="block w-full text-left text-sm font-medium text-gray-600 hover:text-black">FAQ</button>
                <button onClick={() => router.push('/login')} className="block w-full text-left text-sm font-medium text-gray-600 hover:text-black">Sign In</button>
                <button onClick={() => router.push('/register')} className="block w-full bg-black text-white px-6 py-2 rounded-full text-sm font-medium text-center">
                  Get Started
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-24 pb-32 px-6 lg:px-8 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-8">
              {/* Badge */}
              <div className={`inline-flex items-center space-x-2 bg-gradient-to-r from-black to-gray-800 text-white px-6 py-3 rounded-full shadow-lg ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
                <Sparkles className="w-4 h-4 animate-pulse-custom" />
                <span className="font-semibold text-sm">Trusted by 50,000+ Worldwide</span>
              </div>

              {/* Main Headline */}
              <h1 className={`text-5xl sm:text-6xl lg:text-8xl font-extrabold text-black leading-tight tracking-tight ${isVisible ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
                Get Approved for
                <span className="block mt-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                  AI Training Projects
                </span>
              </h1>

              {/* Subheadline */}
              <div className={`max-w-4xl mx-auto ${isVisible ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
                <div className="relative inline-block">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-lg blur opacity-20 animate-pulse-custom"></div>
                  <p className="relative text-xl sm:text-2xl text-gray-700 leading-relaxed px-8 py-4 bg-white rounded-lg border-2 border-gray-100">
                    Connect with verified{' '}
                    <span className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      onboarding specialists
                    </span>{' '}
                    who help candidates qualify for{' '}
                    <span className="relative inline-block">
                      <span className="font-bold text-black">top global data and AI training opportunities</span>
                      <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                        <path d="M0,4 Q25,8 50,4 T100,4" stroke="url(#gradient)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#9333ea" />
                            <stop offset="50%" stopColor="#ec4899" />
                            <stop offset="100%" stopColor="#2563eb" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </span>
                  </p>
                </div>
              </div>

              <div className={`flex items-center justify-center flex-wrap gap-6 text-sm font-semibold ${isVisible ? 'animate-fade-in-up stagger-3' : 'opacity-0'}`}>
                <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-900">98% Success Rate</span>
                </div>
                <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-900">100% Free Platform</span>
                </div>
                <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-full border border-purple-200">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span className="text-purple-900">24hr Response</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className={`flex justify-center pt-6 ${isVisible ? 'animate-fade-in-scale stagger-4' : 'opacity-0'}`}>
                <button
                  onClick={() => router.push('/register?type=candidate')}
                  className="group relative bg-black text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-gray-900 transition-smooth hover-lift shadow-2xl overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <Rocket className="mr-2 w-5 h-5 animate-bounce-subtle" />
                    Find an Agent Now
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className={`pt-12 ${isVisible ? 'animate-fade-in stagger-5' : 'opacity-0'}`}>
                <p className="text-sm text-gray-500 mb-4">No credit card required • Start in 2 minutes • 24/7 support</p>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Badges */}
        <section id="platforms" className="py-16 px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto">
            <p className="text-center text-xs font-bold text-gray-600 mb-8 tracking-widest uppercase animate-fade-in">
              Trusted Platforms We Work With
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {platforms.map((platform, index) => (
                <div
                  key={platform}
                  className={`bg-white px-6 py-5 rounded-xl text-center font-bold text-gray-900 border-2 border-gray-200 hover:border-black hover-lift transition-smooth shadow-sm hover:shadow-xl animate-fade-in-scale stagger-${(index % 6) + 1}`}
                >
                  {platform}
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="flex justify-center mt-8 animate-fade-in">
              <button
                onClick={() => router.push('/platforms')}
                className="group flex items-center space-x-2 bg-black text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-gray-800 transition-all hover-lift shadow-lg"
              >
                <span>View All Platforms</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section with Animated Remote Work Icons */}
        <section className="relative py-24 px-6 lg:px-8 bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
          {/* Animated Background - Remote Work Icons */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            {/* Floating Icons Row 1 */}
            <div className="absolute top-10 left-10 animate-float" style={{ animationDelay: '0s', animationDuration: '8s' }}>
              <Laptop className="w-16 h-16 text-white" />
            </div>
            <div className="absolute top-20 right-20 animate-float" style={{ animationDelay: '1s', animationDuration: '10s' }}>
              <Coffee className="w-14 h-14 text-white" />
            </div>
            <div className="absolute top-32 left-1/4 animate-float" style={{ animationDelay: '2s', animationDuration: '12s' }}>
              <Wifi className="w-12 h-12 text-white" />
            </div>

            {/* Floating Icons Row 2 */}
            <div className="absolute top-48 right-1/3 animate-float" style={{ animationDelay: '0.5s', animationDuration: '9s' }}>
              <Monitor className="w-18 h-18 text-white" />
            </div>
            <div className="absolute top-56 left-16 animate-float" style={{ animationDelay: '1.5s', animationDuration: '11s' }}>
              <Headphones className="w-14 h-14 text-white" />
            </div>
            <div className="absolute top-64 right-1/4 animate-float" style={{ animationDelay: '2.5s', animationDuration: '13s' }}>
              <Globe className="w-16 h-16 text-white" />
            </div>

            {/* Floating Icons Row 3 - Middle */}
            <div className="absolute top-1/2 left-12 animate-float" style={{ animationDelay: '1s', animationDuration: '10s' }}>
              <Code className="w-14 h-14 text-white" />
            </div>
            <div className="absolute top-1/2 right-16 animate-float" style={{ animationDelay: '2s', animationDuration: '14s' }}>
              <Lightbulb className="w-12 h-12 text-white" />
            </div>
            <div className="absolute top-1/3 left-1/2 animate-float" style={{ animationDelay: '3s', animationDuration: '11s' }}>
              <HomeIcon className="w-20 h-20 text-white" />
            </div>

            {/* Floating Icons Row 4 - Bottom */}
            <div className="absolute bottom-20 left-1/4 animate-float" style={{ animationDelay: '0.5s', animationDuration: '12s' }}>
              <Database className="w-14 h-14 text-white" />
            </div>
            <div className="absolute bottom-32 right-1/3 animate-float" style={{ animationDelay: '1.5s', animationDuration: '9s' }}>
              <Server className="w-16 h-16 text-white" />
            </div>
            <div className="absolute bottom-16 left-20 animate-float" style={{ animationDelay: '2.5s', animationDuration: '13s' }}>
              <Smartphone className="w-12 h-12 text-white" />
            </div>
            <div className="absolute bottom-24 right-20 animate-float" style={{ animationDelay: '3.5s', animationDuration: '10s' }}>
              <Rocket className="w-18 h-18 text-white" />
            </div>

            {/* Additional Smaller Icons for Depth */}
            <div className="absolute top-1/4 right-1/2 animate-float" style={{ animationDelay: '4s', animationDuration: '15s' }}>
              <Zap className="w-10 h-10 text-white" />
            </div>
            <div className="absolute bottom-1/3 left-1/3 animate-float" style={{ animationDelay: '0.8s', animationDuration: '8s' }}>
              <Star className="w-10 h-10 text-white" />
            </div>
            <div className="absolute top-3/4 right-1/4 animate-float" style={{ animationDelay: '1.8s', animationDuration: '11s' }}>
              <Target className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Stats Content */}
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg px-6 py-3 rounded-full border border-white border-opacity-20 mb-6">
                <TrendingUp className="w-5 h-5 text-white" />
                <span className="text-white text-sm font-semibold">Our Impact</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                Trusted by Remote Workers Worldwide
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Join thousands of successful remote workers who found their dream opportunities through our platform
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat, index) => (
                <div key={index} className={`text-center group animate-fade-in-up stagger-${index + 1}`}>
                  {/* Icon Container with Glow Effect */}
                  <div className="relative inline-flex items-center justify-center mb-6">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>

                    {/* Icon */}
                    <div className="relative w-20 h-20 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border-2 border-white border-opacity-30 rounded-2xl flex items-center justify-center shadow-2xl hover-lift animate-float transform group-hover:scale-110 transition-transform" style={{ animationDelay: `${index * 0.5}s` }}>
                      <div className="text-white">
                        {stat.icon}
                      </div>
                    </div>
                  </div>

                  {/* Number with Gradient */}
                  <div className="text-5xl md:text-6xl font-extrabold mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                    {stat.number}
                  </div>

                  {/* Label */}
                  <div className="text-sm md:text-base text-gray-300 font-semibold tracking-wide uppercase">
                    {stat.label}
                  </div>

                  {/* Decorative Line */}
                  <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mt-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-extrabold text-black mb-4 animate-fade-in-up">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 animate-fade-in-up stagger-1">
                Four simple steps to get approved and start earning
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((item, index) => (
                <div
                  key={index}
                  className={`relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-purple-500 transition-smooth group hover-lift shadow-lg animate-fade-in-scale stagger-${index + 1}`}
                >
                  <div className="text-7xl font-extrabold bg-gradient-to-br from-purple-200 to-blue-200 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3 group-hover:text-purple-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{item.description}</p>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-12 -right-3 w-6 h-6">
                      <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-purple-500 transition-colors animate-bounce-subtle" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-extrabold text-black mb-4 animate-fade-in-up">
                Why Choose
                <span className="block mt-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  RemoteWorks
                </span>
              </h2>
              <p className="text-xl text-gray-600 animate-fade-in-up stagger-1">
                The safest, most effective way to get approved
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`group bg-gray-50 p-8 rounded-2xl hover-lift transition-smooth border-2 border-transparent hover:border-black animate-fade-in-scale stagger-${(index % 6) + 1}`}
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-black to-gray-700 text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3 group-hover:text-purple-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 px-6 lg:px-8 bg-black text-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Success Stories
              </h2>
              <p className="text-xl text-gray-400">
                Join thousands who found success with our verified agents
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition-all">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-white fill-white" />
                    ))}
                  </div>
                  <p className="text-white leading-relaxed mb-6">{testimonial.quote}</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center font-bold text-sm border border-gray-700">
                      {testimonial.author[0]}
                    </div>
                    <div className="ml-4">
                      <div className="font-bold text-sm">{testimonial.author}</div>
                      <div className="text-xs text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative py-32 px-6 lg:px-8 bg-gradient-to-br from-purple-600 via-blue-600 to-black text-white overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '3s' }}></div>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="mb-6 animate-fade-in">
              <span className="inline-block bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg px-6 py-2 rounded-full text-sm font-semibold border border-white border-opacity-30">
                Start Your Journey Today
              </span>
            </div>

            <h2 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-in-up stagger-1">
              Ready to Get
              <span className="block mt-2">Approved?</span>
            </h2>

            <p className="text-xl md:text-2xl text-white text-opacity-90 mb-12 animate-fade-in-up stagger-2">
              Join 50,000+ candidates who found success with our verified agents.
            </p>

            <div className="flex justify-center mb-10 animate-fade-in-scale stagger-3">
              <button
                onClick={() => router.push('/register?type=candidate')}
                className="group bg-white text-black px-12 py-5 rounded-full font-bold text-lg hover:bg-gray-100 transition-smooth hover-lift shadow-2xl"
              >
                <span className="flex items-center justify-center">
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
            </div>

            <p className="text-sm text-white text-opacity-80 animate-fade-in stagger-4">
              <CheckCircle className="inline w-4 h-4 mr-1" />
              No credit card required
              <span className="mx-3">•</span>
              <Shield className="inline w-4 h-4 mr-1" />
              100% Free to use
              <span className="mx-3">•</span>
              <Clock className="inline w-4 h-4 mr-1" />
              24/7 support
            </p>
          </div>
        </section>

        {/* Newsletter Section - Work From Home Theme */}
        <section className="relative py-24 px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800">
          {/* Work From Home Background Illustrations */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            {/* Floating shapes representing work-from-home elements */}
            <div className="absolute top-20 left-10 w-80 h-80 bg-gray-700 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-float"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-gray-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-gray-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>

            {/* Decorative grid pattern */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}></div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Side - Content */}
              <div className="space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center space-x-2 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg px-4 py-2 rounded-full border border-white border-opacity-20">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-semibold">Work From Anywhere</span>
                </div>

                {/* Heading */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                  Stay Connected,
                  <span className="block mt-2 text-gray-300">Work Remotely</span>
                </h2>

                {/* Description */}
                <p className="text-lg text-gray-300 leading-relaxed">
                  Join our community of remote workers. Get exclusive updates, tips, and opportunities delivered straight to your inbox.
                </p>

                {/* Work From Home Icons */}
                <div className="grid grid-cols-4 gap-4 pt-4">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-white bg-opacity-10 rounded-lg flex items-center justify-center backdrop-filter backdrop-blur-lg border border-white border-opacity-20">
                      <HomeIcon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-gray-400 text-center">Home Office</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-white bg-opacity-10 rounded-lg flex items-center justify-center backdrop-filter backdrop-blur-lg border border-white border-opacity-20">
                      <Coffee className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-gray-400 text-center">Flexibility</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-white bg-opacity-10 rounded-lg flex items-center justify-center backdrop-filter backdrop-blur-lg border border-white border-opacity-20">
                      <Wifi className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-gray-400 text-center">Connected</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-white bg-opacity-10 rounded-lg flex items-center justify-center backdrop-filter backdrop-blur-lg border border-white border-opacity-20">
                      <Monitor className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-gray-400 text-center">Digital</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Newsletter Form */}
              <div className="relative">
                {/* Decorative glow effect behind form */}
                <div className="absolute -inset-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl blur-2xl opacity-20"></div>

                <div className="relative bg-white bg-opacity-10 backdrop-filter backdrop-blur-xl rounded-2xl p-8 border border-white border-opacity-20 shadow-2xl">
                  <div className="space-y-6">
                    {/* Form Header */}
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-2">
                        <Mail className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Subscribe to Our Newsletter</h3>
                      <p className="text-gray-300 text-sm">Get the latest updates, tips, and opportunities</p>
                    </div>

                    {/* Subscription Form */}
                    <form onSubmit={handleSubscribe} className="space-y-4">
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          disabled={subscriptionStatus === 'loading' || subscriptionStatus === 'success'}
                          className="w-full px-6 py-4 bg-white bg-opacity-90 border-2 border-gray-300 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={subscriptionStatus === 'loading' || subscriptionStatus === 'success'}
                        className="w-full bg-black hover:bg-gray-800 text-white px-6 py-4 rounded-xl transition-all text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        {subscriptionStatus === 'loading' ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            <span>Subscribing...</span>
                          </>
                        ) : subscriptionStatus === 'success' ? (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            <span>Successfully Subscribed!</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>Subscribe Now</span>
                          </>
                        )}
                      </button>

                      {errorMessage && (
                        <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg p-3">
                          <p className="text-red-200 text-sm text-center">{errorMessage}</p>
                        </div>
                      )}

                      {subscriptionStatus === 'success' && !errorMessage && (
                        <div className="bg-green-500 bg-opacity-20 border border-green-500 border-opacity-30 rounded-lg p-3">
                          <p className="text-green-200 text-sm text-center">Thanks for subscribing! Check your inbox.</p>
                        </div>
                      )}
                    </form>

                    {/* Privacy Note */}
                    <p className="text-xs text-gray-400 text-center">
                      <Shield className="inline w-3 h-3 mr-1" />
                      We respect your privacy. Unsubscribe anytime.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
