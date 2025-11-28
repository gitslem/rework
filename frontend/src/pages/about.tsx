import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Target, Users, Shield, Heart, CheckCircle, Menu, X,
  UserPlus, BadgeCheck, TrendingUp, ArrowRight, DollarSign, Briefcase
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

  const team = [
    {
      name: "Najim Sulwiman",
      role: "Founder & CEO",
      bio: "Former AI training specialist with 6+ years at leading remote work platforms. Built Remote-Works to solve the platform approval challenges he witnessed firsthand.",
      avatar: "NS"
    },
    {
      name: "Mudassir Salisu",
      role: "Chief Technology Officer",
      bio: "Former engineer at a major tech company specializing in marketplace architecture and AI-powered matching systems. Designed our agent verification infrastructure.",
      avatar: "MS"
    },
    {
      name: "Tyagi Harshit",
      role: "Head of Agent Relations",
      bio: "Oversees agent verification, training, and support. Personally reviews every agent application to maintain our 98% success rate standard.",
      avatar: "TH"
    },
    {
      name: "Garcia Emmanuel",
      role: "Director of Trust & Safety",
      bio: "Former fraud prevention lead at a major fintech company. Designed our multi-layer verification system protecting both agents and candidates.",
      avatar: "GE"
    },
    {
      name: "Millien Zafar",
      role: "Head of Growth & Partnerships",
      bio: "Established relationships with 20+ remote work platforms. Works directly with platform representatives to understand approval criteria.",
      avatar: "MZ"
    }
  ];

  const milestones = [
    { year: "2023", event: "Remote-Works Founded", description: "Launched in March 2023 after 8 months of development. Started with 12 carefully vetted agents and a vision to solve the platform approval crisis." },
    { year: "2023", event: "First 100 Agents Verified", description: "By September 2023, reached 100 verified agents across 15 countries. Implemented our proprietary verification system requiring proof of 10+ successful approvals." },
    { year: "2024", event: "10,000 Successful Approvals", description: "Hit major milestone of 10,000 candidates successfully approved. Achieved 98% success rate through rigorous agent training and quality control." },
    { year: "2024", event: "Platform Partnerships", description: "Established direct communication channels with compliance teams at major AI training platforms to better understand their evolving requirements." },
    { year: "2025", event: "400+ Agents, 27K+ Approvals", description: "Network grew to 400+ verified agents across 35 countries. Facilitated 27,000+ successful platform approvals, with candidates now earning $3K+ monthly on average." }
  ];

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
                Democratizing Access to
                <span className="block text-black">
                  AI Training Opportunities
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Since 2023, we've helped 27,000+ individuals break into remote AI training work by connecting them
                with 400+ verified agents who understand exactly what leading platforms require for approval.
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
                  Solving the Platform Approval Crisis
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  In 2022, our founder Najim Sulwiman was working as an AI trainer for a leading remote work platform when he noticed a troubling pattern:
                  qualified candidates were being rejected at alarming rates—often exceeding 70%—not due to lack of skills, but because
                  they didn't understand the nuances of what platform evaluators were looking for.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  He realized that those who succeeded often had insider knowledge or connections to someone who had navigated the process.
                  This created an unfair barrier to entry for talented individuals worldwide who simply needed guidance.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  <strong>Our mission is simple:</strong> democratize access to remote AI training opportunities by connecting candidates
                  with verified agents who have successfully helped others get approved. We've built a trusted marketplace where expertise
                  meets opportunity, with flexible payment options and rigorous verification.
                </p>
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Our Vision for 2026</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Expand to 1,000+ verified agents across 50+ countries, facilitate 100,000 successful platform approvals,
                    and become the trusted bridge between AI training platforms and global talent. We're building partnerships
                    with platforms to create a smoother approval process for everyone.
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700 font-medium">98% Success Rate (26,460 of 27,000 approvals)</span>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700 font-medium">Average 3-7 day approval time</span>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700 font-medium">$3K+ average monthly income after approval</span>
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
        <section className="py-24 bg-white">
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
                  <div className="flex-grow bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{milestone.event}</h3>
                    <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Earning Potential Section */}
        <section className="py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Diverse Income Streams
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get approved on multiple platforms and work on various AI training projects to maximize your earning potential
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Platform Types */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center">
                    <Briefcase className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">20+ Platforms Supported</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">AI Training & Data Annotation</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Content Moderation & Review</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Language & Translation Services</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Coding & Technical Evaluation</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Creative Writing & Editing</span>
                  </div>
                </div>
              </div>

              {/* Earning Breakdown */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Monthly Income Breakdown</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-semibold">Entry Level (1 Platform)</span>
                      <span className="text-2xl font-bold text-green-600">$800-1.5K</span>
                    </div>
                    <p className="text-sm text-gray-600">Part-time work, 15-20 hours/week</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-semibold">Intermediate (2-3 Platforms)</span>
                      <span className="text-2xl font-bold text-blue-600">$2K-3.5K</span>
                    </div>
                    <p className="text-sm text-gray-600">Full-time work, 30-40 hours/week</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-semibold">Advanced (4+ Platforms)</span>
                      <span className="text-2xl font-bold text-purple-600">$4K-6K+</span>
                    </div>
                    <p className="text-sm text-gray-600">Multiple specializations, high-value projects</p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-black rounded-xl text-white text-center">
                  <div className="text-3xl font-bold mb-1">$3K+</div>
                  <p className="text-gray-300 text-sm">Average monthly income of our successful candidates</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Meet Our Team
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Dedicated professionals committed to your success
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {team.map((member, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-black cursor-pointer hover:-translate-y-1 text-center"
                >
                  <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
                    {member.avatar}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-black font-semibold mb-4">{member.role}</p>
                  <p className="text-gray-600 leading-relaxed text-sm">{member.bio}</p>
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
