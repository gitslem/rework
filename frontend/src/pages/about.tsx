import { useRouter } from 'next/router';
import {
  Globe2, Target, Users, Award, TrendingUp, Shield,
  Heart, Zap, CheckCircle, ArrowRight
} from 'lucide-react';
import Head from 'next/head';

export default function About() {
  const router = useRouter();

  const values = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Trust & Security",
      description: "We verify every agent and protect every transaction with enterprise-grade security.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community First",
      description: "Building a supportive community where agents and candidates succeed together.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Results Driven",
      description: "98% success rate because we only work with the best agents who deliver results.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Transparency",
      description: "Clear pricing, honest communication, and no hidden fees. What you see is what you get.",
      color: "from-orange-500 to-red-500"
    }
  ];

  const team = [
    {
      name: "Sarah Mitchell",
      role: "Founder & CEO",
      bio: "Former recruiter at Outlier with 5+ years helping candidates succeed in remote work.",
      avatar: "SM"
    },
    {
      name: "David Chen",
      role: "Head of Operations",
      bio: "Expert in marketplace platforms with experience scaling to 50,000+ users.",
      avatar: "DC"
    },
    {
      name: "Maria Rodriguez",
      role: "Agent Success Lead",
      bio: "Dedicated to ensuring our agents have the tools and support they need to succeed.",
      avatar: "MR"
    },
    {
      name: "James Wilson",
      role: "Head of Security",
      bio: "Cybersecurity specialist ensuring your data and transactions are always protected.",
      avatar: "JW"
    }
  ];

  const milestones = [
    { year: "2023", event: "Remote-Works Founded", description: "Started with a vision to democratize access to AI training opportunities" },
    { year: "2023", event: "1,000 Candidates", description: "Reached our first thousand candidates helped by verified agents" },
    { year: "2024", event: "500 Verified Agents", description: "Built a network of trusted agents across 50+ countries" },
    { year: "2024", event: "50,000+ Success Stories", description: "Helped over 50,000 candidates get approved for remote work" },
    { year: "2025", event: "Global Expansion", description: "Expanding to support 20+ additional platforms and services" }
  ];

  return (
    <>
      <Head>
        <title>About Us - Remote-Works | Our Mission & Story</title>
        <meta name="description" content="Learn about Remote-Works' mission to connect candidates with verified agents for AI training opportunities. Meet our team and discover our story." />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center cursor-pointer group" onClick={() => router.push('/')}>
                <div className="relative">
                  <Globe2 className="w-9 h-9 text-blue-600 group-hover:scale-110 transition-transform" />
                  <div className="absolute -inset-1 bg-blue-600 opacity-20 blur-md group-hover:opacity-30 transition-opacity rounded-full"></div>
                </div>
                <div className="ml-3 text-2xl font-bold text-gray-900">
                  Remote-<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Works</span>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <button onClick={() => router.push('/')} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Home</button>
                <button onClick={() => router.push('/login')} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Sign In</button>
                <button
                  onClick={() => router.push('/register')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Empowering Remote Workers
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  One Connection at a Time
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                We're on a mission to make AI training and remote work opportunities accessible to everyone,
                connecting talented candidates with expert agents who help them succeed.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-block mb-4">
                  <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">Our Mission</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Breaking Down Barriers to Remote Work
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Getting approved for platforms like Outlier, Alignerr, and OneForma can be challenging.
                  Many qualified candidates face rejection due to small mistakes in their applications or
                  lack of knowledge about what these platforms are looking for.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Remote-Works bridges this gap by connecting candidates with verified agents who have proven
                  track records in getting people approved. Our agents know the ins and outs of each platform
                  and provide personalized guidance to maximize your chances of success.
                </p>
                <div className="flex items-center gap-4 pt-4">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700 font-medium">98% Success Rate</span>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700 font-medium">50,000+ Candidates Helped</span>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700 font-medium">2,500+ Verified Agents</span>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 text-white shadow-2xl">
                  <div className="space-y-8">
                    <div>
                      <div className="text-5xl font-bold mb-2">50K+</div>
                      <div className="text-blue-100">Successful Approvals</div>
                    </div>
                    <div>
                      <div className="text-5xl font-bold mb-2">98%</div>
                      <div className="text-blue-100">Success Rate</div>
                    </div>
                    <div>
                      <div className="text-5xl font-bold mb-2">2.5K+</div>
                      <div className="text-blue-100">Verified Agents</div>
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
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 cursor-pointer hover:-translate-y-1"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform shadow-md`}>
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
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
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
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

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 cursor-pointer hover:-translate-y-1 text-center"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg">
                    {member.avatar}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-semibold mb-4">{member.role}</p>
                  <p className="text-gray-600 leading-relaxed text-sm">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Join Our Growing Community
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Whether you're looking to get approved for remote work or want to help others succeed as an agent,
              we'd love to have you.
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
                className="bg-gray-900 text-white px-10 py-5 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-2xl border-2 border-white/20"
              >
                Become an Agent
              </button>
            </div>
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
                <h4 className="font-bold text-white mb-4">Company</h4>
                <ul className="space-y-3">
                  <li><button onClick={() => router.push('/about')} className="hover:text-blue-400 transition-colors">About Us</button></li>
                  <li><button onClick={() => router.push('/faq')} className="hover:text-blue-400 transition-colors">FAQ</button></li>
                  <li><button onClick={() => router.push('/support')} className="hover:text-blue-400 transition-colors">Support</button></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4">Legal</h4>
                <ul className="space-y-3">
                  <li><button onClick={() => router.push('/terms')} className="hover:text-blue-400 transition-colors">Terms of Service</button></li>
                  <li><button onClick={() => router.push('/privacy')} className="hover:text-blue-400 transition-colors">Privacy Policy</button></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4">Get Started</h4>
                <ul className="space-y-3">
                  <li><button onClick={() => router.push('/register?type=candidate')} className="hover:text-blue-400 transition-colors">Find an Agent</button></li>
                  <li><button onClick={() => router.push('/register?type=agent')} className="hover:text-blue-400 transition-colors">Become an Agent</button></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 text-center">
              <p className="text-gray-500 text-sm">© 2025 Remote-Works. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
