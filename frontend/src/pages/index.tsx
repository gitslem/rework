import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowRight, CheckCircle, Users, Briefcase, Globe2, Shield,
  Zap, Clock, Star, MessageSquare, Award, TrendingUp,
  Lock, BadgeCheck, UserCheck, Building2, Sparkles,
  Target, Search, FileCheck, ChevronDown, Menu, X
} from 'lucide-react';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const stats = [
    { number: "50,000+", label: "Active Candidates", icon: <Users className="w-6 h-6" /> },
    { number: "2,500+", label: "Verified Agents", icon: <BadgeCheck className="w-6 h-6" /> },
    { number: "98%", label: "Success Rate", icon: <Star className="w-6 h-6" /> },
    { number: "24/7", label: "Support Available", icon: <Clock className="w-6 h-6" /> }
  ];

  const services = [
    {
      name: "Outlier AI",
      description: "Get approved for AI training and data annotation projects",
      icon: "🎯",
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Alignerr",
      description: "Access AI alignment and RLHF opportunities",
      icon: "🔄",
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "OneForma",
      description: "Join linguistic and AI training programs",
      icon: "🌐",
      color: "from-green-500 to-emerald-500"
    },
    {
      name: "Appen",
      description: "Connect with global data collection projects",
      icon: "📊",
      color: "from-orange-500 to-red-500"
    },
    {
      name: "RWS",
      description: "Translation and localization opportunities",
      icon: "💬",
      color: "from-indigo-500 to-purple-500"
    },
    {
      name: "Mindrift AI",
      description: "AI model training and improvement tasks",
      icon: "🧠",
      color: "from-pink-500 to-rose-500"
    },
    {
      name: "TELUS Digital",
      description: "Digital customer experience projects",
      icon: "📱",
      color: "from-teal-500 to-cyan-500"
    },
    {
      name: "More Platforms",
      description: "Access to 20+ additional opportunities",
      icon: "➕",
      color: "from-gray-500 to-slate-600"
    }
  ];

  const features = [
    {
      icon: <UserCheck className="w-8 h-8" />,
      title: "Verified Agents",
      description: "All agents are thoroughly vetted and have proven track records helping candidates get approved for projects.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Marketplace",
      description: "Your information is protected with enterprise-grade security. Payments are processed through secure escrow.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Direct Communication",
      description: "Message agents directly, discuss your needs, and get personalized guidance throughout the application process.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "High Success Rate",
      description: "Our agents have a 98% success rate in getting candidates approved for their desired projects and platforms.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Fast Approval",
      description: "Get matched with an agent within 24 hours and start your application process immediately.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Money-Back Guarantee",
      description: "If you don't get approved, you don't pay. Our agents only earn when you succeed.",
      color: "from-pink-500 to-rose-500"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Create Your Account",
      description: "Sign up as a candidate and complete your profile with your skills and preferences.",
      icon: <UserCheck className="w-12 h-12" />
    },
    {
      step: "2",
      title: "Get Admin Approval",
      description: "Our team reviews your profile to ensure quality and authenticity. This usually takes 24-48 hours.",
      icon: <BadgeCheck className="w-12 h-12" />
    },
    {
      step: "3",
      title: "Browse Agents",
      description: "Once approved, browse verified agents who specialize in the platforms you're interested in.",
      icon: <Search className="w-12 h-12" />
    },
    {
      step: "4",
      title: "Hire & Get Approved",
      description: "Work with your chosen agent to optimize your application and get approved for projects.",
      icon: <Sparkles className="w-12 h-12" />
    }
  ];

  const testimonials = [
    {
      quote: "I was struggling to get approved on Outlier for months. Within a week of hiring an agent through Remote-Works, I was accepted and started earning!",
      author: "Sarah Johnson",
      role: "Data Annotator",
      rating: 5,
      avatar: "SJ"
    },
    {
      quote: "As an agent, this platform has transformed my business. I can now help more candidates and the secure payment system gives everyone peace of mind.",
      author: "Michael Chen",
      role: "Verified Agent",
      rating: 5,
      avatar: "MC"
    },
    {
      quote: "The best investment I made. My agent knew exactly what the platforms were looking for and helped me get approved on 3 different services.",
      author: "Priya Sharma",
      role: "AI Trainer",
      rating: 5,
      avatar: "PS"
    }
  ];

  const faqs = [
    {
      question: "What is Remote-Works?",
      answer: "Remote-Works is a marketplace connecting candidates with verified agents who help them get approved for projects on platforms like Outlier, Alignerr, OneForma, and more."
    },
    {
      question: "How much do agents charge?",
      answer: "Agent fees vary based on the service and platform. Most agents charge between $50-$200, but you only pay if you get approved. Browse agents to see their specific rates."
    },
    {
      question: "What's the success rate?",
      answer: "Our verified agents have a 98% success rate in getting candidates approved. If you don't get approved, you don't pay."
    },
    {
      question: "How long does the approval process take?",
      answer: "After admin approval (24-48 hours), you can immediately hire an agent. Most agents can help you get approved within 1-2 weeks, depending on the platform."
    }
  ];

  return (
    <>
      <Head>
        <title>Remote-Works - Get Approved for AI Training Projects | Verified Agent Marketplace</title>
        <meta name="description" content="Connect with verified agents who help you get approved for projects on Outlier, Alignerr, OneForma, Appen, and more. 98% success rate. Money-back guarantee." />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <div className="flex items-center cursor-pointer group" onClick={() => router.push('/')}>
                <div className="relative">
                  <Globe2 className="w-9 h-9 text-blue-600 group-hover:scale-110 transition-transform" />
                  <div className="absolute -inset-1 bg-blue-600 opacity-20 blur-md group-hover:opacity-30 transition-opacity rounded-full"></div>
                </div>
                <div className="ml-3 text-2xl font-bold text-gray-900">
                  Remote-<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Works</span>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="#services" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Services</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">How It Works</a>
                <button onClick={() => router.push('/about')} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">About</button>
                <button onClick={() => router.push('/faq')} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">FAQ</button>
                <button onClick={() => router.push('/support')} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Support</button>
                <button onClick={() => router.push('/login')} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                  Sign In
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Get Started
                </button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600 hover:text-blue-600">
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 space-y-4 border-t border-gray-200">
                <a href="#services" className="block text-gray-600 hover:text-blue-600 transition-colors font-medium">Services</a>
                <a href="#how-it-works" className="block text-gray-600 hover:text-blue-600 transition-colors font-medium">How It Works</a>
                <button onClick={() => router.push('/about')} className="block w-full text-left text-gray-600 hover:text-blue-600 transition-colors font-medium">About</button>
                <button onClick={() => router.push('/faq')} className="block w-full text-left text-gray-600 hover:text-blue-600 transition-colors font-medium">FAQ</button>
                <button onClick={() => router.push('/support')} className="block w-full text-left text-gray-600 hover:text-blue-600 transition-colors font-medium">Support</button>
                <button onClick={() => router.push('/login')} className="block w-full text-left text-gray-600 hover:text-blue-600 transition-colors font-medium">Sign In</button>
                <button onClick={() => router.push('/register')} className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold text-center">
                  Get Started
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-32">
          {/* Decorative background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-4xl mx-auto space-y-8">
              {/* Trust Badge */}
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 px-5 py-2.5 rounded-full">
                <BadgeCheck className="w-5 h-5 text-blue-600" />
                <span className="text-blue-700 font-semibold text-sm">Trusted by 50,000+ Candidates Worldwide</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Get Approved for<br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI Training Projects
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Connect with verified agents who specialize in getting candidates approved for
                <span className="font-semibold text-gray-900"> Outlier, Alignerr, OneForma, Appen</span>, and more.
                <span className="block mt-2 text-lg text-blue-600 font-semibold">98% Success Rate • Money-Back Guarantee</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <button
                  onClick={() => router.push('/register?type=candidate')}
                  className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
                >
                  Find an Agent
                  <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => router.push('/register?type=agent')}
                  className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-200"
                >
                  Become an Agent
                </button>
              </div>

              {/* Platform logos/badges */}
              <div className="pt-12">
                <p className="text-sm text-gray-500 mb-6 font-medium">GET APPROVED FOR THESE PLATFORMS & MORE</p>
                <div className="flex flex-wrap justify-center gap-6 items-center opacity-60">
                  {['Outlier', 'Alignerr', 'OneForma', 'Appen', 'RWS', 'Mindrift', 'TELUS'].map((platform) => (
                    <div key={platform} className="bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-200 font-semibold text-gray-700">
                      {platform}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group cursor-pointer">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    {stat.icon}
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-block mb-4">
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">Available Services</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Platforms Our Agents Support
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get expert help securing approval on the world's leading AI training and data annotation platforms
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 cursor-pointer hover:-translate-y-1"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl text-white text-3xl mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                How Remote-Works Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Four simple steps to get approved and start earning
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((item, index) => (
                <div key={index} className="relative">
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent -z-10"></div>
                  )}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-500 transition-all hover:shadow-xl group cursor-pointer">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg">
                      {item.icon}
                    </div>
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Why Choose Remote-Works?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The safest, most effective way to get approved for remote work opportunities
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 cursor-pointer hover:-translate-y-1"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform shadow-md`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Success Stories
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Join thousands of candidates who found success with our verified agents
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all hover:scale-105 cursor-pointer"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                    ))}
                  </div>
                  <p className="text-white/90 leading-relaxed italic mb-6">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center font-bold border-2 border-white/30">
                      {testimonial.avatar}
                    </div>
                    <div className="ml-4">
                      <div className="font-bold">{testimonial.author}</div>
                      <div className="text-sm text-white/80">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Preview Section */}
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Got questions? We've got answers.
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() => router.push('/faq')}
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                View All FAQs
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to Get Approved?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join 50,000+ candidates who found success with our verified agents.
              Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/register?type=candidate')}
                className="bg-white text-gray-900 px-10 py-5 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-2xl"
              >
                Get Started as Candidate
              </button>
              <button
                onClick={() => router.push('/register?type=agent')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-2xl"
              >
                Become an Agent
              </button>
            </div>
            <p className="mt-8 text-sm text-gray-400">
              No credit card required • Money-back guarantee • 24/7 support
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-5 gap-12 mb-12">
              <div className="md:col-span-2">
                <div className="flex items-center mb-6">
                  <Globe2 className="w-9 h-9 text-blue-500 mr-3" />
                  <div className="text-2xl font-bold text-white">
                    Remote-<span className="text-blue-500">Works</span>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed mb-6">
                  The trusted marketplace connecting candidates with verified agents for AI training and remote work opportunities.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4">For Candidates</h4>
                <ul className="space-y-3">
                  <li><a href="#services" className="hover:text-blue-400 transition-colors">Browse Services</a></li>
                  <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a></li>
                  <li><button onClick={() => router.push('/register?type=candidate')} className="hover:text-blue-400 transition-colors">Sign Up</button></li>
                  <li><button onClick={() => router.push('/faq')} className="hover:text-blue-400 transition-colors">FAQ</button></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4">For Agents</h4>
                <ul className="space-y-3">
                  <li><button onClick={() => router.push('/register?type=agent')} className="hover:text-blue-400 transition-colors">Become an Agent</button></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Agent Guidelines</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Success Stories</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4">Company</h4>
                <ul className="space-y-3">
                  <li><button onClick={() => router.push('/about')} className="hover:text-blue-400 transition-colors">About Us</button></li>
                  <li><button onClick={() => router.push('/support')} className="hover:text-blue-400 transition-colors">Support</button></li>
                  <li><button onClick={() => router.push('/terms')} className="hover:text-blue-400 transition-colors">Terms of Service</button></li>
                  <li><button onClick={() => router.push('/privacy')} className="hover:text-blue-400 transition-colors">Privacy Policy</button></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">© 2025 Remote-Works. All rights reserved.</p>
              <p className="text-gray-500 text-sm mt-4 md:mt-0">
                Made with ❤️ for remote workers worldwide
              </p>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}
