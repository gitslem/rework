import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowRight, CheckCircle, Users, Briefcase, Shield,
  Zap, Clock, Star, MessageSquare, Award, TrendingUp,
  BadgeCheck, UserCheck, Building2, Sparkles,
  Target, Search, FileCheck, Menu, X, Rocket, Mail, Send, Loader,
  Home as HomeIcon, Coffee, Wifi, Monitor, Bot, Headphones, Layers, DollarSign,
  Laptop, Globe, Code, Lightbulb, Database, Server, Smartphone, ChevronLeft, ChevronRight
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
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Auto-play testimonials slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev === 3 ? 0 : prev + 1)); // 4 testimonials (0-3)
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const stats = [
    { number: "20+", label: "Platforms Supported", icon: <Globe className="w-5 h-5" /> },
    { number: "$3k+", label: "Avg. Monthly Income", icon: <DollarSign className="w-5 h-5" /> },
    { number: "98%", label: "Success Rate", icon: <Star className="w-5 h-5" /> },
    { number: "24/7", label: "Support", icon: <Headphones className="w-5 h-5" /> }
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
      description: "Direct PayPal payments after successful approval, with flexible options including revenue sharing based on agent preference."
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
      description: "No subscription fees, no hidden charges. Connect with agents and only pay for services after receiving results or approval."
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
      title: "Browse AI Assistants",
      description: "Find AI-powered assistants specializing in your platforms of interest."
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
      role: "Data Annotator",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
    },
    {
      quote: "This platform transformed my business. The secure payment system gives everyone peace of mind.",
      author: "Michael C.",
      role: "Verified Agent",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
    },
    {
      quote: "My agent knew exactly what platforms look for. Got approved on 3 services in 2 weeks.",
      author: "Priya S.",
      role: "AI Trainer",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces"
    },
    {
      quote: "The AI-powered assistance made the application process so smooth. Started earning within days!",
      author: "David L.",
      role: "Content Moderator",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces"
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
            <div className="flex justify-between items-center h-20 md:h-24 py-3">
              <div className="flex items-center">
                <Logo showText={false} size="md" />
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

        {/* Hero Section - Clean Milkish Design with Professional Animations */}
        <section className="relative pt-32 pb-40 px-6 lg:px-8 overflow-hidden bg-white">
          {/* Subtle Background Decoration */}
          <div className="absolute inset-0 overflow-hidden opacity-40">
            {/* Animated gradient orbs */}
            <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-yellow-200 to-amber-200 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s', animationDuration: '8s' }}></div>
            <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '4s', animationDuration: '10s' }}></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center space-y-10">
              {/* Enhanced Badge with Typewriter Effect */}
              <div className={`inline-flex items-center space-x-3 bg-white/90 backdrop-blur-lg px-8 py-4 rounded-full border-2 border-purple-200 shadow-xl ${isVisible ? 'animate-fade-in' : 'opacity-0'} relative group hover:border-purple-400 transition-all duration-500`}>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-amber-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center space-x-3">
                  <div className="relative">
                    <Bot className="w-5 h-5 text-purple-600 animate-pulse relative z-10" />
                    <div className="absolute inset-0 bg-purple-400 rounded-full blur-md opacity-30"></div>
                  </div>
                  <span className={`font-bold text-sm sm:text-base tracking-wide bg-gradient-to-r from-purple-600 via-amber-600 to-purple-600 bg-clip-text text-transparent ${isVisible ? 'animate-typewriter' : 'opacity-0'}`} style={{
                    textShadow: '0 0 20px rgba(147, 51, 234, 0.3), 0 0 30px rgba(245, 158, 11, 0.2)',
                    filter: 'drop-shadow(0 0 10px rgba(147, 51, 234, 0.4))'
                  }}>
                    Personalized Support + AI Powered
                  </span>
                </div>
              </div>

              {/* Enhanced Main Headline with Professional Animations */}
              <div className="space-y-4">
                <h1 className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-black leading-[1.1] tracking-tight ${isVisible ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
                  <span className="block">Get Approved for</span>
                  <span className="block mt-3 bg-gradient-to-r from-purple-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent animate-gradient relative">
                    AI Training Projects
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/10 via-amber-500/10 to-yellow-500/10 blur-2xl -z-10 animate-pulse"></div>
                  </span>
                </h1>
              </div>

              {/* Enhanced Subheadline with Clean Background */}
              <div className={`max-w-4xl mx-auto ${isVisible ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
                <p className="text-xl sm:text-2xl lg:text-3xl text-gray-800 leading-relaxed font-medium">
                  Connect with verified{' '}
                  <span className="relative inline-block group">
                    <span className="font-bold bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent">
                      onboarding specialists
                    </span>
                    <svg className="absolute -bottom-1 left-0 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                      <path d="M0,3 Q50,6 100,3" stroke="url(#gradient-underline)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                      <defs>
                        <linearGradient id="gradient-underline" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#9333ea" />
                          <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                  {' '}who help candidates qualify for{' '}
                  <span className="font-bold text-black relative">
                    top global AI training opportunities
                  </span>
                </p>
              </div>

              {/* Enhanced Trust Badges with Professional Look */}
              <div className={`flex items-center justify-center flex-wrap gap-4 sm:gap-6 ${isVisible ? 'animate-fade-in-up stagger-3' : 'opacity-0'}`}>
                <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 px-5 py-3 rounded-2xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-xl hover:scale-105">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div className="absolute inset-0 bg-green-400 rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
                    </div>
                    <span className="text-green-900 font-bold text-sm sm:text-base">98% Success Rate</span>
                  </div>
                </div>
                <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 px-5 py-3 rounded-2xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:scale-105">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Shield className="w-6 h-6 text-blue-600" />
                      <div className="absolute inset-0 bg-blue-400 rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
                    </div>
                    <span className="text-blue-900 font-bold text-sm sm:text-base">100% Free Platform</span>
                  </div>
                </div>
                <div className="group relative bg-gradient-to-br from-purple-50 to-pink-50 px-5 py-3 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-xl hover:scale-105">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Zap className="w-6 h-6 text-purple-600" />
                      <div className="absolute inset-0 bg-purple-400 rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
                    </div>
                    <span className="text-purple-900 font-bold text-sm sm:text-base">24hr Response</span>
                  </div>
                </div>
              </div>

              {/* Enhanced CTA Buttons with Professional Animations */}
              <div className={`flex justify-center pt-8 ${isVisible ? 'animate-fade-in-scale stagger-4' : 'opacity-0'}`}>
                <button
                  onClick={() => router.push('/register?type=candidate')}
                  className="group relative bg-gradient-to-r from-black via-gray-900 to-black text-white px-10 sm:px-14 py-5 sm:py-6 rounded-full font-bold text-base sm:text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-amber-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center space-x-3">
                    <Rocket className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce-subtle" />
                    <span>Find an Agent Now</span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                </button>
              </div>

              {/* Enhanced Trust Indicators */}
              <div className={`pt-8 ${isVisible ? 'animate-fade-in stagger-5' : 'opacity-0'}`}>
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-gray-600 font-medium">
                  <div className="flex items-center space-x-1.5 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full hover:bg-white transition-all">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>No credit card required</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center space-x-1.5 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full hover:bg-white transition-all">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Start in 2 minutes</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center space-x-1.5 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full hover:bg-white transition-all">
                    <Headphones className="w-4 h-4 text-purple-600" />
                    <span>24/7 support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Badges */}
        <section id="platforms" className="py-20 px-6 lg:px-8 bg-white relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl"></div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <p className="text-xs font-bold text-gray-500 mb-3 tracking-widest uppercase animate-fade-in">
                Trusted Platforms We Work With
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 animate-fade-in-up">
                Connect to <span className="bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent">Top AI Platforms</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {platforms.map((platform, index) => (
                <div
                  key={platform}
                  className={`group bg-white px-6 py-5 rounded-xl text-center font-bold text-gray-900 border-2 border-gray-200 hover:border-purple-500 hover-lift transition-all duration-300 shadow-sm hover:shadow-xl animate-fade-in-scale stagger-${(index % 6) + 1} cursor-pointer`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-amber-500 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                    {platform}
                  </span>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="flex justify-center mt-8 animate-fade-in">
              <button
                onClick={() => router.push('/platforms')}
                className="group relative bg-black text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-gray-800 transition-all hover-lift shadow-lg overflow-hidden"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>View All Platforms</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section with Animated Remote Work Icons */}
        <section className="relative py-24 px-6 lg:px-8 bg-white overflow-hidden">
          {/* Animated Background - Remote Work Icons */}
          <div className="absolute inset-0 overflow-hidden opacity-10" style={{ pointerEvents: 'none' }}>
            {/* Floating Icons Row 1 */}
            <div className="absolute top-10 left-10 animate-float" style={{ animationDelay: '0s', animationDuration: '8s' }}>
              <Laptop className="w-16 h-16 text-gray-400" />
            </div>
            <div className="absolute top-20 right-20 animate-float" style={{ animationDelay: '1s', animationDuration: '10s' }}>
              <Coffee className="w-14 h-14 text-gray-400" />
            </div>
            <div className="absolute top-32 left-1/4 animate-float" style={{ animationDelay: '2s', animationDuration: '12s' }}>
              <Wifi className="w-12 h-12 text-gray-400" />
            </div>

            {/* Floating Icons Row 2 */}
            <div className="absolute top-48 right-1/3 animate-float" style={{ animationDelay: '0.5s', animationDuration: '9s' }}>
              <Monitor className="w-18 h-18 text-gray-400" />
            </div>
            <div className="absolute top-56 left-16 animate-float" style={{ animationDelay: '1.5s', animationDuration: '11s' }}>
              <Headphones className="w-14 h-14 text-gray-400" />
            </div>
            <div className="absolute top-64 right-1/4 animate-float" style={{ animationDelay: '2.5s', animationDuration: '13s' }}>
              <Globe className="w-16 h-16 text-gray-400" />
            </div>

            {/* Floating Icons Row 3 - Middle */}
            <div className="absolute top-1/2 left-12 animate-float" style={{ animationDelay: '1s', animationDuration: '10s' }}>
              <Code className="w-14 h-14 text-gray-400" />
            </div>
            <div className="absolute top-1/2 right-16 animate-float" style={{ animationDelay: '2s', animationDuration: '14s' }}>
              <Lightbulb className="w-12 h-12 text-gray-400" />
            </div>
            <div className="absolute top-1/3 left-1/2 animate-float" style={{ animationDelay: '3s', animationDuration: '11s' }}>
              <HomeIcon className="w-20 h-20 text-gray-400" />
            </div>

            {/* Floating Icons Row 4 - Bottom */}
            <div className="absolute bottom-20 left-1/4 animate-float" style={{ animationDelay: '0.5s', animationDuration: '12s' }}>
              <Database className="w-14 h-14 text-gray-400" />
            </div>
            <div className="absolute bottom-32 right-1/3 animate-float" style={{ animationDelay: '1.5s', animationDuration: '9s' }}>
              <Server className="w-16 h-16 text-gray-400" />
            </div>
            <div className="absolute bottom-16 left-20 animate-float" style={{ animationDelay: '2.5s', animationDuration: '13s' }}>
              <Smartphone className="w-12 h-12 text-gray-400" />
            </div>
            <div className="absolute bottom-24 right-20 animate-float" style={{ animationDelay: '3.5s', animationDuration: '10s' }}>
              <Rocket className="w-18 h-18 text-gray-400" />
            </div>

            {/* Additional Smaller Icons for Depth */}
            <div className="absolute top-1/4 right-1/2 animate-float" style={{ animationDelay: '4s', animationDuration: '15s' }}>
              <Zap className="w-10 h-10 text-gray-400" />
            </div>
            <div className="absolute bottom-1/3 left-1/3 animate-float" style={{ animationDelay: '0.8s', animationDuration: '8s' }}>
              <Star className="w-10 h-10 text-gray-400" />
            </div>
            <div className="absolute top-3/4 right-1/4 animate-float" style={{ animationDelay: '1.8s', animationDuration: '11s' }}>
              <Target className="w-10 h-10 text-gray-400" />
            </div>
          </div>

          {/* Stats Content */}
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-purple-50 backdrop-filter backdrop-blur-lg px-6 py-3 rounded-full border border-purple-200 mb-6">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-gray-800 text-sm font-semibold">Our Impact</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-4">
                Trusted by Remote Workers Worldwide
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join thousands of successful remote workers who found their dream opportunities through our platform
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`text-center group animate-fade-in-up stagger-${index + 1} cursor-default`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Icon Container with Glow Effect */}
                  <div className="relative inline-flex items-center justify-center mb-6">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-amber-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-all duration-500"></div>

                    {/* Icon */}
                    <div
                      className="relative w-20 h-20 bg-gradient-to-br from-purple-50 to-amber-50 backdrop-filter backdrop-blur-lg border-2 border-purple-200 rounded-2xl flex items-center justify-center shadow-lg hover-lift animate-float transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                      style={{ animationDelay: `${index * 0.5}s`, animationDuration: `${6 + index}s` }}
                    >
                      <div className="text-purple-600 group-hover:scale-110 transition-transform duration-300">
                        {stat.icon}
                      </div>
                    </div>
                  </div>

                  {/* Number with Gradient */}
                  <div className="text-5xl md:text-6xl font-extrabold mb-2 bg-gradient-to-r from-purple-600 via-amber-500 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>

                  {/* Label */}
                  <div className="text-sm md:text-base text-gray-600 font-semibold tracking-wide uppercase group-hover:text-black transition-colors duration-300">
                    {stat.label}
                  </div>

                  {/* Decorative Line */}
                  <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-amber-500 mx-auto mt-4 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-x-0 group-hover:scale-x-100"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="relative py-24 px-6 lg:px-8 bg-white overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-200 mb-6 animate-fade-in">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-gray-700">Simple Process</span>
              </div>
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
                  className={`relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-purple-500 transition-all duration-500 group hover-lift shadow-lg animate-fade-in-scale stagger-${index + 1} hover:shadow-2xl`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Step Number */}
                  <div className="text-7xl font-extrabold bg-gradient-to-br from-purple-200 to-amber-200 bg-clip-text text-transparent mb-4 group-hover:scale-125 transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:to-amber-500">
                    {item.step}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-black mb-3 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-amber-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed text-sm group-hover:text-gray-700 transition-colors">
                    {item.description}
                  </p>

                  {/* Arrow Connector */}
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-12 -right-3 w-6 h-6 z-10">
                      <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-amber-500 transition-all duration-300 group-hover:translate-x-1" />
                    </div>
                  )}

                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/0 to-amber-500/0 group-hover:from-purple-500/10 group-hover:to-amber-500/10 rounded-bl-full rounded-tr-2xl transition-all duration-500"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-24 px-6 lg:px-8 bg-white overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-10 right-10 w-80 h-80 bg-yellow-200/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-200 mb-6 animate-fade-in">
                <Award className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-semibold text-gray-700">Why Choose Us</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold text-black mb-4 animate-fade-in-up">
                Why Choose
                <span className="block mt-2 bg-gradient-to-r from-purple-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                  Rework
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
                  className={`group bg-white/70 backdrop-blur-sm p-8 rounded-2xl hover-lift transition-all duration-500 border-2 border-gray-200 hover:border-purple-500 hover:bg-white animate-fade-in-scale stagger-${(index % 6) + 1} hover:shadow-xl`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Icon with animated background */}
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-amber-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
                    <div className="relative w-14 h-14 bg-gradient-to-br from-purple-600 to-amber-500 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                      {feature.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-black mb-3 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-amber-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {feature.description}
                  </p>

                  {/* Decorative bottom accent */}
                  <div className="mt-6 w-0 h-1 bg-gradient-to-r from-purple-600 to-amber-500 group-hover:w-full transition-all duration-500 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section - Slider */}
        <section className="relative py-24 px-6 lg:px-8 bg-white overflow-hidden">
          {/* Animated Background - Success & Remote Work Icons */}
          <div className="absolute inset-0 overflow-hidden opacity-10" style={{ pointerEvents: 'none' }}>
            {/* Floating Icons Row 1 - Top */}
            <div className="absolute top-10 left-10 animate-float" style={{ animationDelay: '0s', animationDuration: '7s' }}>
              <Star className="w-16 h-16 text-yellow-400" />
            </div>
            <div className="absolute top-20 right-20 animate-float" style={{ animationDelay: '1s', animationDuration: '9s' }}>
              <Award className="w-14 h-14 text-amber-500" />
            </div>
            <div className="absolute top-32 left-1/4 animate-float" style={{ animationDelay: '2s', animationDuration: '11s' }}>
              <BadgeCheck className="w-12 h-12 text-purple-500" />
            </div>

            {/* Floating Icons Row 2 */}
            <div className="absolute top-48 right-1/3 animate-float" style={{ animationDelay: '0.5s', animationDuration: '8s' }}>
              <TrendingUp className="w-18 h-18 text-green-500" />
            </div>
            <div className="absolute top-56 left-16 animate-float" style={{ animationDelay: '1.5s', animationDuration: '10s' }}>
              <MessageSquare className="w-14 h-14 text-blue-500" />
            </div>
            <div className="absolute top-64 right-1/4 animate-float" style={{ animationDelay: '2.5s', animationDuration: '12s' }}>
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>

            {/* Floating Icons Row 3 - Middle */}
            <div className="absolute top-1/2 left-12 animate-float" style={{ animationDelay: '1s', animationDuration: '9s' }}>
              <Laptop className="w-14 h-14 text-gray-500" />
            </div>
            <div className="absolute top-1/2 right-16 animate-float" style={{ animationDelay: '2s', animationDuration: '13s' }}>
              <Sparkles className="w-12 h-12 text-purple-600" />
            </div>
            <div className="absolute top-1/3 left-1/2 animate-float" style={{ animationDelay: '3s', animationDuration: '10s' }}>
              <Rocket className="w-20 h-20 text-indigo-500" />
            </div>

            {/* Floating Icons Row 4 - Bottom */}
            <div className="absolute bottom-20 left-1/4 animate-float" style={{ animationDelay: '0.5s', animationDuration: '11s' }}>
              <Users className="w-14 h-14 text-blue-600" />
            </div>
            <div className="absolute bottom-32 right-1/3 animate-float" style={{ animationDelay: '1.5s', animationDuration: '8s' }}>
              <Coffee className="w-16 h-16 text-amber-600" />
            </div>
            <div className="absolute bottom-16 left-20 animate-float" style={{ animationDelay: '2.5s', animationDuration: '12s' }}>
              <Target className="w-12 h-12 text-red-500" />
            </div>
            <div className="absolute bottom-24 right-20 animate-float" style={{ animationDelay: '3.5s', animationDuration: '9s' }}>
              <Globe className="w-18 h-18 text-cyan-500" />
            </div>

            {/* Additional Smaller Icons for Depth */}
            <div className="absolute top-1/4 right-1/2 animate-float" style={{ animationDelay: '4s', animationDuration: '14s' }}>
              <Briefcase className="w-10 h-10 text-gray-600" />
            </div>
            <div className="absolute bottom-1/3 left-1/3 animate-float" style={{ animationDelay: '0.8s', animationDuration: '7s' }}>
              <HomeIcon className="w-10 h-10 text-blue-400" />
            </div>
            <div className="absolute top-3/4 right-1/4 animate-float" style={{ animationDelay: '1.8s', animationDuration: '10s' }}>
              <Zap className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-yellow-50 backdrop-blur-sm px-6 py-3 rounded-full border border-yellow-200 mb-6 animate-fade-in">
                <Star className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-semibold text-gray-800">Testimonials</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black animate-fade-in-up">
                Success Stories
              </h2>
              <p className="text-xl text-gray-600 animate-fade-in-up stagger-1">
                Join thousands who found success with our AI-powered platform
              </p>
            </div>

            {/* Slider Container */}
            <div className="relative">
              {/* Testimonial Card */}
              <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-purple-50 to-amber-50 backdrop-blur-xl rounded-2xl p-12 border-2 border-purple-200 transition-all duration-500 hover:border-purple-400 hover:shadow-2xl animate-fade-in-scale">
                  <div className="flex gap-1 mb-8 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                  <p className="text-gray-800 text-xl leading-relaxed mb-8 text-center transition-all duration-500 font-medium">
                    "{testimonials[currentTestimonial].quote}"
                  </p>
                  <div className="flex items-center justify-center">
                    <div className="relative w-14 h-14 rounded-full border-2 border-purple-300 shadow-lg transition-transform duration-300 hover:scale-110 overflow-hidden">
                      <img
                        src={testimonials[currentTestimonial].avatar}
                        alt={testimonials[currentTestimonial].author}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to gradient with initial if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.className = 'relative w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center font-bold text-lg text-white border-2 border-purple-300 shadow-lg transition-transform duration-300 hover:scale-110';
                            parent.innerHTML = testimonials[currentTestimonial].author[0];
                          }
                        }}
                      />
                    </div>
                    <div className="ml-4 text-left">
                      <div className="font-bold text-base text-black">{testimonials[currentTestimonial].author}</div>
                      <div className="text-sm text-gray-600">{testimonials[currentTestimonial].role}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-center gap-4 mt-8 animate-fade-in">
                <button
                  onClick={() => setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                  className="w-12 h-12 rounded-full bg-white border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-400 hover:scale-110 transition-all duration-300 flex items-center justify-center hover:shadow-xl"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-6 h-6 text-purple-600" />
                </button>

                {/* Dots Indicator */}
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`h-2 rounded-full transition-all duration-500 hover:scale-125 ${
                        currentTestimonial === index ? 'bg-purple-600 w-8' : 'bg-gray-300 w-2'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                  className="w-12 h-12 rounded-full bg-white border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-400 hover:scale-110 transition-all duration-300 flex items-center justify-center hover:shadow-xl"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-6 h-6 text-purple-600" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section - Work From Home Theme */}
        <section className="relative py-24 px-6 lg:px-8 overflow-hidden bg-slate-900">
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

        {/* Trust Badges Slider */}
        <section className="py-12 bg-white overflow-hidden">
          <div className="relative">
            <div className="flex items-center logo-scroll-animation-wrapper">
              {/* First set */}
              <div className="flex items-center gap-12 md:gap-16 flex-shrink-0 logo-set">
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">PayPal</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">TELUS Digital</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">OneForma</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Google</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Scale AI</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Outlier</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Appen</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Alignerr</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Handshake</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Mindrift</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Lionbridge</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Mercor</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">RWS</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Welocalize</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Clickworker</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">DataAnnotation</span>
                </div>
              </div>

              {/* Duplicate set for seamless loop */}
              <div className="flex items-center gap-12 md:gap-16 flex-shrink-0 logo-set">
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">PayPal</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">TELUS Digital</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">OneForma</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Google</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Scale AI</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Outlier</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Appen</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Alignerr</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Handshake</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Mindrift</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Lionbridge</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Mercor</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">RWS</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Welocalize</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Clickworker</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">DataAnnotation</span>
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
