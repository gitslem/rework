import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowRight, CheckCircle, Users, Briefcase, Shield,
  Zap, Clock, Star, MessageSquare, Award, TrendingUp,
  BadgeCheck, UserCheck, Building2, Sparkles,
  Target, Search, FileCheck, Menu, X
} from 'lucide-react';
import Head from 'next/head';
import Logo from '@/components/Logo';

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      title: "Money-Back Guarantee",
      description: "If you don't get approved, you don't pay. Agents earn only when you succeed."
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
            <div className="flex justify-between items-center h-16">
              <Logo />

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
        <section className="pt-20 pb-24 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                <BadgeCheck className="w-4 h-4 text-black" />
                <span className="text-black font-medium text-sm">Trusted by 50,000+ Worldwide</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-black leading-tight tracking-tight">
                Get Approved for<br />
                AI Training Projects
              </h1>

              {/* Subheadline */}
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Connect with verified agents who specialize in getting candidates approved for Outlier, Alignerr, OneForma, and more.
              </p>

              <div className="flex items-center justify-center space-x-6 text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>98% Success Rate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Money-Back Guarantee</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  onClick={() => router.push('/register?type=candidate')}
                  className="group bg-black text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-gray-800 transition-all flex items-center justify-center"
                >
                  Find an Agent
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => router.push('/register?type=agent')}
                  className="bg-white text-black px-8 py-4 rounded-full font-medium text-lg border-2 border-black hover:bg-black hover:text-white transition-all"
                >
                  Become an Agent
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Badges */}
        <section id="platforms" className="py-12 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <p className="text-center text-xs font-semibold text-gray-500 mb-8 tracking-wider uppercase">Platforms</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {platforms.map((platform) => (
                <div key={platform} className="bg-white px-6 py-4 rounded-lg text-center font-medium text-gray-900 border border-gray-200 hover:border-black transition-colors">
                  {platform}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full mb-4">
                    {stat.icon}
                  </div>
                  <div className="text-4xl font-bold text-black mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600">
                Four simple steps to get approved and start earning
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((item, index) => (
                <div key={index} className="relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-black transition-all group">
                  <div className="text-6xl font-bold text-gray-100 mb-4">{item.step}</div>
                  <h3 className="text-xl font-bold text-black mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{item.description}</p>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-12 -right-3 w-6 h-6">
                      <ArrowRight className="w-6 h-6 text-gray-300" />
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
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
                Why Choose RemoteWorks
              </h2>
              <p className="text-xl text-gray-600">
                The safest, most effective way to get approved
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">{feature.title}</h3>
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
        <section className="py-24 px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-black">
              Ready to Get Approved?
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              Join 50,000+ candidates who found success with our verified agents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/register?type=candidate')}
                className="bg-black text-white px-10 py-4 rounded-full font-medium text-lg hover:bg-gray-800 transition-all"
              >
                Get Started as Candidate
              </button>
              <button
                onClick={() => router.push('/register?type=agent')}
                className="bg-white text-black px-10 py-4 rounded-full font-medium text-lg border-2 border-black hover:bg-black hover:text-white transition-all"
              >
                Become an Agent
              </button>
            </div>
            <p className="mt-8 text-sm text-gray-500">
              No credit card required • Money-back guarantee • 24/7 support
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black text-gray-400 py-16 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div className="md:col-span-1">
                <Logo textClassName="text-white" className="mb-6" />
                <p className="text-gray-500 leading-relaxed text-sm">
                  The trusted marketplace for AI training opportunities.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4 text-sm">Candidates</h4>
                <ul className="space-y-3 text-sm">
                  <li><a href="#platforms" className="hover:text-white transition-colors">Platforms</a></li>
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                  <li><button onClick={() => router.push('/register?type=candidate')} className="hover:text-white transition-colors">Sign Up</button></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4 text-sm">Agents</h4>
                <ul className="space-y-3 text-sm">
                  <li><button onClick={() => router.push('/register?type=agent')} className="hover:text-white transition-colors">Become an Agent</button></li>
                  <li><a href="#" className="hover:text-white transition-colors">Guidelines</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4 text-sm">Company</h4>
                <ul className="space-y-3 text-sm">
                  <li><button onClick={() => router.push('/about')} className="hover:text-white transition-colors">About</button></li>
                  <li><button onClick={() => router.push('/support')} className="hover:text-white transition-colors">Support</button></li>
                  <li><button onClick={() => router.push('/faq')} className="hover:text-white transition-colors">FAQ</button></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-600 text-sm text-center">© 2025 RemoteWorks. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
