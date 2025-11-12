import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowRight, CheckCircle, Users, Briefcase, Globe2, Shield,
  Zap, Clock, GitBranch, Terminal, FileCheck, MessageSquare,
  Sparkles, Target, TrendingUp, Lock, BadgeCheck, Award,
  Rocket, Code2, BarChart3, Heart
} from 'lucide-react';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  const stats = [
    { number: "10,000+", label: "AI Projects Completed", icon: <CheckCircle className="w-6 h-6" /> },
    { number: "5,000+", label: "Verified Freelancers", icon: <Users className="w-6 h-6" /> },
    { number: "150+", label: "Countries Connected", icon: <Globe2 className="w-6 h-6" /> },
    { number: "98%", label: "Client Satisfaction", icon: <Heart className="w-6 h-6" /> }
  ];

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI-Powered Project Briefs",
      description: "Transform vague ideas into crystal-clear project specifications with our AI assistant. No more miscommunication.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Terminal className="w-8 h-8" />,
      title: "Live Collaboration Sandbox",
      description: "Test code, models, and automations together in real-time. See results before you commit.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <BadgeCheck className="w-8 h-8" />,
      title: "Automated Proof-of-Work",
      description: "Every commit, deployment, and deliverable is automatically verified and timestamped.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Globe2 className="w-8 h-8" />,
      title: "Timezone Intelligence",
      description: "Smart scheduling that respects everyone's hours. Work async without the chaos.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "AI Progress Tracking",
      description: "Automated status updates and progress reports. Always know where your project stands.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Enterprise-Grade Security",
      description: "Milestone-based escrow, blockchain timestamping, and IP protection built-in.",
      color: "from-pink-500 to-rose-500"
    }
  ];

  const testimonials = [
    {
      quote: "Remote-Works transformed how we build AI products. We went from 3-week sprints to continuous delivery.",
      author: "Sarah Chen",
      role: "CTO at TechFlow AI",
      image: "SC"
    },
    {
      quote: "As a freelancer, this is the first platform that actually protects my work and respects my timezone.",
      author: "Marcus Rodriguez",
      role: "AI Engineer & Automation Specialist",
      image: "MR"
    },
    {
      quote: "The proof-of-build feature alone saved us from 3 disputes. Trust is built into every interaction.",
      author: "Priya Sharma",
      role: "Product Manager at StartupCo",
      image: "PS"
    }
  ];

  const useCases = [
    {
      icon: <Rocket className="w-12 h-12" />,
      title: "For Startups",
      description: "Build your AI product with world-class talent without the overhead of full-time hires.",
      benefits: ["Access 5,000+ verified AI freelancers", "Scale team up or down instantly", "Pay only for delivered work"]
    },
    {
      icon: <Briefcase className="w-12 h-12" />,
      title: "For Enterprises",
      description: "Augment your AI capabilities with specialists who understand your security requirements.",
      benefits: ["Enterprise-grade security & compliance", "Dedicated account management", "Custom integrations & workflows"]
    },
    {
      icon: <Code2 className="w-12 h-12" />,
      title: "For Freelancers",
      description: "Join a network that values your expertise and protects your work across time zones.",
      benefits: ["Verified badge & portfolio showcase", "Automated invoicing & escrow", "AI-powered project matching"]
    }
  ];

  const pricingTiers = [
    {
      name: "Starter",
      price: "$0",
      period: "/month",
      description: "Perfect for exploring the platform",
      features: [
        "Create professional profile",
        "Browse 1,000+ active projects",
        "Apply to 3 projects monthly",
        "Basic messaging & collaboration",
        "Community support"
      ],
      cta: "Start Free",
      highlighted: false,
      bgColor: "from-gray-50 to-gray-100"
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month",
      description: "For active AI professionals",
      features: [
        "Everything in Starter",
        "Verified professional badge",
        "Unlimited project applications",
        "AI-powered profile optimization",
        "Advanced analytics dashboard",
        "Priority project matching",
        "24/7 priority support"
      ],
      cta: "Start 14-Day Trial",
      highlighted: true,
      bgColor: "from-primary-50 to-blue-100"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For teams and organizations",
      features: [
        "Everything in Professional",
        "Team collaboration workspace",
        "AI PM co-pilot & automation",
        "Dedicated sandbox environments",
        "Custom security & compliance",
        "Dedicated account manager",
        "SLA guarantees"
      ],
      cta: "Contact Sales",
      highlighted: false,
      bgColor: "from-purple-50 to-pink-100"
    }
  ];

  return (
    <>
      <Head>
        <title>Remote-Works - Build AI Projects Across Time Zones | Verified Freelance Platform</title>
        <meta name="description" content="Connect with 5,000+ verified AI freelancers. Build, test, and ship AI projects asynchronously with built-in trust and automated verification. Join 10,000+ successful projects." />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center cursor-pointer group" onClick={() => router.push('/')}>
                <div className="relative">
                  <Globe2 className="w-9 h-9 text-primary-500 group-hover:scale-110 transition-transform" />
                  <div className="absolute -inset-1 bg-primary-500 opacity-20 blur-md group-hover:opacity-30 transition-opacity rounded-full"></div>
                </div>
                <div className="ml-3 text-2xl font-bold text-gray-900">
                  Remote-<span className="bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent">Works</span>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">Features</a>
                <a href="#use-cases" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">Use Cases</a>
                <a href="#pricing" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">Pricing</a>
                <button onClick={() => router.push('/login')} className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
                  Sign In
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section - Futurpreneur-inspired with large visuals */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-32">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-4xl mx-auto space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-200 px-5 py-2.5 rounded-full">
                <Sparkles className="w-5 h-5 text-primary-600" />
                <span className="text-primary-700 font-semibold text-sm">Trusted by 10,000+ AI projects worldwide</span>
              </div>

              {/* Main headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Build AI Projects.<br />
                <span className="bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Ship Across Time Zones.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Connect with verified AI freelancers and ship projects asynchronously.
                Built-in trust, automated verification, and seamless collaboration — all in one platform.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <button
                  onClick={() => router.push('/register?type=client')}
                  className="group bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
                >
                  Find AI Talent
                  <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => router.push('/register?type=freelancer')}
                  className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg border-2 border-gray-200 hover:border-primary-500 hover:shadow-xl transition-all duration-200"
                >
                  Join as Freelancer
                </button>
              </div>

              {/* Visual representation */}
              <div className="pt-16">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { icon: <GitBranch className="w-10 h-10" />, label: "Collaborate", color: "from-blue-500 to-blue-600" },
                      { icon: <Terminal className="w-10 h-10" />, label: "Build", color: "from-purple-500 to-purple-600" },
                      { icon: <BadgeCheck className="w-10 h-10" />, label: "Verify", color: "from-green-500 to-green-600" },
                      { icon: <Rocket className="w-10 h-10" />, label: "Ship", color: "from-orange-500 to-orange-600" }
                    ].map((item, index) => (
                      <div key={index} className="group cursor-pointer">
                        <div className={`w-24 h-24 mx-auto bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300`}>
                          {item.icon}
                        </div>
                        <p className="mt-4 text-sm font-semibold text-gray-700">{item.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 flex items-center justify-center gap-2 text-gray-600">
                    <Globe2 className="w-5 h-5 text-primary-500" />
                    <span className="font-medium">Your projects never sleep • Work happens 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - Trust building */}
        <section className="py-16 bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group cursor-pointer">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    {stat.icon}
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-block mb-4">
                <span className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold">PLATFORM FEATURES</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Everything You Need to Ship AI Projects
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From ideation to delivery, every step is optimized for async collaboration across time zones.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 cursor-pointer hover:-translate-y-1"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform shadow-md`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{feature.description}</p>
                  <div className="flex items-center text-primary-600 font-semibold text-sm group-hover:gap-2 transition-all">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section - Community focus */}
        <section className="py-24 bg-gradient-to-br from-primary-600 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Trusted by AI Builders Worldwide
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Join thousands of companies and freelancers building the future of AI together.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all hover:scale-105 cursor-pointer"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white/30">
                      {testimonial.image}
                    </div>
                    <div className="ml-4">
                      <div className="font-bold text-lg">{testimonial.author}</div>
                      <div className="text-sm text-white/80">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-white/90 leading-relaxed italic">"{testimonial.quote}"</p>
                  <div className="flex gap-1 mt-6">
                    {[...Array(5)].map((_, i) => (
                      <Sparkles key={i} className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="use-cases" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Built for Every AI Journey
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Whether you're hiring, building, or freelancing — we've got you covered.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {useCases.map((useCase, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 border-2 border-gray-200 hover:border-primary-500 transition-all hover:shadow-2xl group cursor-pointer"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    {useCase.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{useCase.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{useCase.description}</p>
                  <ul className="space-y-3">
                    {useCase.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="mt-8 w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-block mb-4">
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">SIMPLE PRICING</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Choose Your Plan
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Start free, scale as you grow. No hidden fees, cancel anytime.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingTiers.map((tier, index) => (
                <div
                  key={index}
                  className={`rounded-3xl overflow-hidden transition-all duration-300 ${
                    tier.highlighted
                      ? 'bg-white border-4 border-primary-500 shadow-2xl scale-105 relative'
                      : 'bg-white border-2 border-gray-200 hover:border-primary-300 hover:shadow-xl'
                  }`}
                >
                  {tier.highlighted && (
                    <div className="bg-gradient-to-r from-primary-500 to-purple-600 text-white text-center py-3 font-bold text-sm">
                      🔥 MOST POPULAR
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                    <div className="mb-6">
                      <span className="text-5xl font-bold text-gray-900">{tier.price}</span>
                      <span className="text-gray-500">{tier.period}</span>
                    </div>
                    <p className="text-gray-600 mb-8">{tier.description}</p>
                    <ul className="space-y-4 mb-8">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => router.push('/register')}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                        tier.highlighted
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-xl hover:scale-105'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {tier.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full mb-8">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-semibold">Join 10,000+ successful AI projects</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to Build Your Next<br />AI Project?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join the platform where AI innovation happens 24/7. Start collaborating across time zones today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/register?type=client')}
                className="bg-white text-gray-900 px-10 py-5 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-2xl"
              >
                Hire AI Talent
              </button>
              <button
                onClick={() => router.push('/register?type=freelancer')}
                className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-2xl"
              >
                Find Work
              </button>
            </div>
            <p className="mt-8 text-sm text-gray-400">
              No credit card required • Start free • Scale anytime
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-5 gap-12 mb-12">
              <div className="md:col-span-2">
                <div className="flex items-center mb-6">
                  <Globe2 className="w-9 h-9 text-primary-500 mr-3" />
                  <div className="text-2xl font-bold text-white">
                    Remote-<span className="text-primary-500">Works</span>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed mb-6">
                  The global platform for AI collaboration. Build, ship, and scale AI projects across time zones.
                </p>
                <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                    <span className="text-white font-bold">𝕏</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                    <span className="text-white font-bold">in</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                    <GitBranch className="w-5 h-5 text-white" />
                  </a>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4">Product</h4>
                <ul className="space-y-3">
                  <li><a href="#features" className="hover:text-primary-400 transition-colors">Features</a></li>
                  <li><a href="#pricing" className="hover:text-primary-400 transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition-colors">Integrations</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition-colors">API</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4">Company</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="hover:text-primary-400 transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition-colors">Contact</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4">Resources</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="hover:text-primary-400 transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition-colors">Community</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition-colors">Terms</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">© 2025 Remote-Works. All rights reserved.</p>
              <p className="text-gray-500 text-sm mt-4 md:mt-0">
                Made with <Heart className="w-4 h-4 inline text-red-500 fill-red-500" /> for the AI community
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
