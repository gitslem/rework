import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowRight, CheckCircle, Users, Briefcase, Globe2, Shield,
  Zap, Clock, GitBranch, Terminal, FileCheck, MessageSquare,
  Sparkles, Target, TrendingUp, Lock, BadgeCheck
} from 'lucide-react';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  const problems = [
    { icon: <MessageSquare className="w-6 h-6" />, text: "Vague briefs ('make an AI bot' = 10 interpretations)" },
    { icon: <Clock className="w-6 h-6" />, text: "Time zones destroy meeting schedules" },
    { icon: <FileCheck className="w-6 h-6" />, text: "Deliverables aren't easily verifiable" },
    { icon: <Target className="w-6 h-6" />, text: "Juggling Slack, Notion, GitHub, Drive — no single source of truth" }
  ];

  const solutions = [
    {
      icon: <Sparkles className="w-12 h-12" />,
      title: "Smart Project Briefs",
      description: "AI transforms vague client requests into clear deliverables, milestones, and budgets.",
      visual: "💬→📋"
    },
    {
      icon: <Terminal className="w-12 h-12" />,
      title: "Shared Sandbox",
      description: "Test models, prompts, or automations live between client & freelancer.",
      visual: "⚡️🔄"
    },
    {
      icon: <BadgeCheck className="w-12 h-12" />,
      title: "Proof-of-Build",
      description: "Auto-verifies commits, datasets, or API outputs to confirm authentic work.",
      visual: "✓✓✓"
    }
  ];

  const valueProps = [
    {
      icon: <Globe2 className="w-8 h-8" />,
      title: "Timezone-Aware Collaboration",
      description: "Automatically plans check-ins and async updates around everyone's local hours."
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI Co-Pilot for PMs",
      description: "Summarizes updates, creates progress reports, and flags stalled deliverables."
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Trust Layer",
      description: "Code verification, milestone escrow, and optional blockchain timestamping for IP security."
    },
    {
      icon: <BadgeCheck className="w-8 h-8" />,
      title: "Verified Network",
      description: "Freelancers get badges for model fine-tuning, prompt design, automation, and compliance."
    }
  ];

  const forCompanies = [
    "SaaS startups building AI copilots or automations",
    "Marketing teams needing AI content systems",
    "Enterprises experimenting with LLM adoption"
  ];

  const forFreelancers = [
    "AI agents & automation developers",
    "LangChain, LlamaIndex, or n8n builders",
    "AI creatives (prompt, video, or sound designers)",
    "ML fine-tuning or RAG specialists"
  ];

  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      period: "",
      description: "Create profile, browse jobs, limited projects.",
      idealFor: "New freelancers / testers",
      features: [
        "Create freelancer profile",
        "Browse available projects",
        "Apply to 3 projects/month",
        "Basic messaging",
        "Community support"
      ],
      cta: "Get Started",
      highlighted: false
    },
    {
      name: "Pro Freelancer",
      price: "$15",
      period: "/mo",
      description: "Verified badge, analytics, AI résumé, portfolio hosting.",
      idealFor: "Active AI contractors",
      features: [
        "Everything in Free",
        "Verified freelancer badge",
        "Unlimited project applications",
        "AI-powered résumé builder",
        "Portfolio & case study hosting",
        "Advanced analytics dashboard",
        "Priority support"
      ],
      cta: "Start Free Trial",
      highlighted: true
    },
    {
      name: "Team Plan",
      price: "$25",
      period: "/user/mo",
      description: "Client dashboards, co-pilot PM tools, sandbox seats.",
      idealFor: "Startups & small teams",
      features: [
        "Everything in Pro",
        "Team collaboration dashboard",
        "AI PM Co-Pilot tools",
        "Shared sandbox environments",
        "Project templates library",
        "Code verification & escrow",
        "Dedicated account manager",
        "Custom integrations"
      ],
      cta: "Contact Sales",
      highlighted: false
    }
  ];

  return (
    <>
      <Head>
        <title>Relaywork - Hire AI Talent. Manage Projects. Ship Across Time Zones.</title>
        <meta name="description" content="Where AI builders and companies work across time zones — without the chaos. Connect with verified AI freelancers and ship projects asynchronously." />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-accent-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
                <Globe2 className="w-8 h-8 text-primary-500 mr-2" />
                <div className="text-2xl font-bold text-accent-dark">
                  Relay<span className="gradient-text">work</span>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-accent-gray-600 hover:text-primary-500 transition font-medium">Features</a>
                <a href="#pricing" className="text-accent-gray-600 hover:text-primary-500 transition font-medium">Pricing</a>
                <a href="#for-who" className="text-accent-gray-600 hover:text-primary-500 transition font-medium">Who It's For</a>
                <button onClick={() => router.push('/login')} className="text-accent-gray-600 hover:text-primary-500 transition font-medium">Login</button>
                <button onClick={() => router.push('/register')} className="btn-primary">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white">
          <div className="section-container">
            <div className="max-w-5xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Where AI builders meet global companies</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-accent-dark leading-tight">
                Hire AI talent.<br />
                Manage projects.<br />
                <span className="gradient-text">Ship across time zones.</span>
              </h1>

              <p className="text-xl md:text-2xl text-accent-gray-600 max-w-3xl mx-auto leading-relaxed">
                Relaywork connects startups and enterprises with verified AI freelancers — from prompt engineers
                to automation builders — and gives them a shared workspace to plan, build, and verify AI projects asynchronously.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button onClick={() => router.push('/register?type=client')} className="btn-primary flex items-center justify-center group text-lg">
                  Find AI Freelancers
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                </button>
                <button onClick={() => router.push('/register?type=freelancer')} className="btn-secondary text-lg">
                  Work as a Freelancer
                </button>
              </div>

              {/* Globe Visual Concept */}
              <div className="relative pt-12">
                <div className="relative max-w-3xl mx-auto">
                  <div className="bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-3xl p-12 backdrop-blur-sm border border-primary-200">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div className="space-y-2">
                        <div className="w-16 h-16 mx-auto bg-gradient-purple rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          🔨
                        </div>
                        <div className="text-sm font-semibold text-accent-gray-700">Build</div>
                      </div>
                      <div className="space-y-2">
                        <div className="w-16 h-16 mx-auto bg-gradient-purple rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          🧪
                        </div>
                        <div className="text-sm font-semibold text-accent-gray-700">Test</div>
                      </div>
                      <div className="space-y-2">
                        <div className="w-16 h-16 mx-auto bg-gradient-purple rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          🚀
                        </div>
                        <div className="text-sm font-semibold text-accent-gray-700">Deliver</div>
                      </div>
                      <div className="space-y-2">
                        <div className="w-16 h-16 mx-auto bg-gradient-purple rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          ⬆️
                        </div>
                        <div className="text-sm font-semibold text-accent-gray-700">Upgrade</div>
                      </div>
                    </div>
                    <div className="mt-8 text-center text-accent-gray-600 font-medium">
                      🌍 Projects moving 24/7 across time zones
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="section-container bg-accent-gray-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-accent-dark mb-6">
                The Remote AI Chaos
              </h2>
              <p className="text-xl text-accent-gray-600 max-w-3xl mx-auto">
                AI projects stall — not because of skill, but because of miscommunication.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {problems.map((problem, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border-2 border-red-200 flex items-start space-x-4">
                  <div className="text-red-500 flex-shrink-0 mt-1">
                    {problem.icon}
                  </div>
                  <p className="text-accent-gray-700 font-medium">{problem.text}</p>
                </div>
              ))}
            </div>

            {/* Visual Comparison */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="bg-white rounded-2xl p-8 border-2 border-red-300">
                <div className="text-center mb-4 text-red-600 font-bold text-lg">❌ Without Relaywork</div>
                <div className="flex flex-wrap gap-3 justify-center opacity-60">
                  <div className="bg-blue-100 px-4 py-2 rounded-lg text-sm">Slack</div>
                  <div className="bg-purple-100 px-4 py-2 rounded-lg text-sm">Zoom</div>
                  <div className="bg-green-100 px-4 py-2 rounded-lg text-sm">Drive</div>
                  <div className="bg-pink-100 px-4 py-2 rounded-lg text-sm">Figma</div>
                  <div className="bg-yellow-100 px-4 py-2 rounded-lg text-sm">GitHub</div>
                  <div className="bg-red-100 px-4 py-2 rounded-lg text-sm">Notion</div>
                </div>
                <div className="text-center mt-4 text-accent-gray-500 text-sm">Tangled mess of tools</div>
              </div>
              <div className="bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="text-center mb-4 font-bold text-lg">✓ With Relaywork</div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <Globe2 className="w-16 h-16 mx-auto mb-3" />
                  <div className="font-semibold">One unified workspace</div>
                </div>
                <div className="text-center mt-4 text-sm text-white/80">Everything in one place</div>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section id="features" className="section-container bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-accent-dark mb-6">
                The Async AI Workspace
              </h2>
              <p className="text-xl text-accent-gray-600 max-w-3xl mx-auto">
                Every AI project, from idea to verified delivery — all in one async flow.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {solutions.map((solution, index) => (
                <div key={index} className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl p-8 card-hover border border-primary-200">
                  <div className="text-6xl text-center mb-6">{solution.visual}</div>
                  <div className="bg-gradient-purple text-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    {solution.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-accent-dark mb-4">{solution.title}</h3>
                  <p className="text-accent-gray-600 leading-relaxed">{solution.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Props Section */}
        <section className="section-container bg-accent-dark text-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Built for Global Async Teams
              </h2>
              <p className="text-xl text-accent-gray-300 max-w-3xl mx-auto">
                The most powerful features for distributed AI development teams.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {valueProps.map((prop, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition">
                  <div className="bg-gradient-purple w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                    {prop.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{prop.title}</h3>
                  <p className="text-accent-gray-300 leading-relaxed">{prop.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who It's For Section */}
        <section id="for-who" className="section-container bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-accent-dark mb-6">
                Who It's For
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* For Companies */}
              <div className="bg-gradient-to-br from-blue-50 to-primary-50 rounded-2xl p-10 border-2 border-primary-200">
                <div className="w-16 h-16 bg-gradient-purple rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-accent-dark mb-6">For Companies</h3>
                <ul className="space-y-4">
                  {forCompanies.map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
                      <span className="text-accent-gray-700 text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => router.push('/register?type=client')} className="btn-primary w-full mt-8">
                  Find AI Freelancers
                </button>
              </div>

              {/* For Freelancers */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-10 border-2 border-purple-200">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-accent-dark mb-6">For Freelancers</h3>
                <ul className="space-y-4">
                  {forFreelancers.map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                      <span className="text-accent-gray-700 text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => router.push('/register?type=freelancer')} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-8 rounded-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 w-full mt-8">
                  Join the Network
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="section-container bg-gradient-to-b from-accent-gray-100 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-accent-dark mb-6">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-accent-gray-600 max-w-3xl mx-auto">
                Choose the plan that fits your needs. All plans include our core collaboration features.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {pricingTiers.map((tier, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-2xl overflow-hidden card-hover border-2 ${
                    tier.highlighted ? 'border-primary-500 shadow-2xl scale-105' : 'border-accent-gray-200'
                  }`}
                >
                  {tier.highlighted && (
                    <div className="bg-gradient-purple text-white text-center py-3 font-bold text-sm">
                      ⭐ MOST POPULAR
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-accent-dark mb-2">{tier.name}</h3>
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-accent-dark">{tier.price}</span>
                      <span className="text-accent-gray-500">{tier.period}</span>
                    </div>
                    <p className="text-accent-gray-600 mb-4">{tier.description}</p>
                    <div className="bg-primary-50 rounded-lg p-3 mb-6">
                      <p className="text-sm text-primary-700 font-semibold">Ideal for:</p>
                      <p className="text-sm text-accent-gray-700">{tier.idealFor}</p>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                          <span className="text-accent-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => router.push('/register')}
                      className={tier.highlighted ? 'btn-primary w-full' : 'btn-outline w-full'}
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
        <section className="section-container bg-gradient-to-br from-primary-500 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              AI work never sleeps — but you should.
            </h2>
            <p className="text-2xl text-white/90 mb-10">
              Relaywork keeps your projects moving while you rest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => router.push('/register?type=client')} className="bg-white text-primary-500 px-10 py-4 rounded-lg font-bold hover:shadow-2xl transition transform hover:scale-105 text-lg">
                Start a Project
              </button>
              <button onClick={() => router.push('/register?type=freelancer')} className="bg-white/10 backdrop-blur-sm border-2 border-white text-white px-10 py-4 rounded-lg font-bold hover:bg-white/20 transition text-lg">
                Join the Freelance Network
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-accent-dark text-accent-gray-300 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-5 gap-12 mb-12">
              <div className="md:col-span-2">
                <div className="flex items-center mb-4">
                  <Globe2 className="w-8 h-8 text-primary-400 mr-2" />
                  <div className="text-2xl font-bold text-white">
                    Relay<span className="text-primary-400">work</span>
                  </div>
                </div>
                <p className="text-accent-gray-400 leading-relaxed mb-6">
                  Where AI builders and companies work across time zones — without the chaos.
                </p>
                <p className="text-accent-gray-500 text-sm">
                  AI work never sleeps — but you should.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4">Product</h4>
                <ul className="space-y-3">
                  <li><a href="#features" className="hover:text-primary-400 transition">Features</a></li>
                  <li><a href="#pricing" className="hover:text-primary-400 transition">Pricing</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition">API</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition">Integrations</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4">Company</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="hover:text-primary-400 transition">About</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition">Blog</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition">Careers</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition">Contact</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4">Legal</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="hover:text-primary-400 transition">Privacy</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition">Terms</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition">Security</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-accent-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-accent-gray-500 text-sm">© 2025 Relaywork. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-accent-gray-500 hover:text-primary-400 transition">Twitter</a>
                <a href="#" className="text-accent-gray-500 hover:text-primary-400 transition">LinkedIn</a>
                <a href="#" className="text-accent-gray-500 hover:text-primary-400 transition">GitHub</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
