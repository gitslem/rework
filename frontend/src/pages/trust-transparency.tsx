import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Shield, CheckCircle, AlertTriangle, UserCheck, Lock,
  FileCheck, Eye, Award, BadgeCheck, Search, Ban,
  TrendingUp, Users, Verified, ShieldCheck, Heart,
  Target, Lightbulb, Scale, Fingerprint, Bell, Database,
  ArrowRight, Mail, Phone, X
} from 'lucide-react';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';

export default function TrustTransparency() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const coreValues = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Integrity First",
      description: "We operate with honesty and transparency in every interaction, ensuring our community can trust us completely."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Focus",
      description: "Our candidates and agents are at the heart of everything we do. Their success is our success."
    },
    {
      icon: <Scale className="w-8 h-8" />,
      title: "Fair & Equal",
      description: "Everyone deserves equal opportunity. We ensure fair treatment and access for all members of our platform."
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovation",
      description: "We continuously improve our platform using the latest technology to provide better services."
    }
  ];

  const promises = [
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "100% Verified Agents",
      description: "Every agent on our platform undergoes rigorous verification before they can interact with candidates."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Secure Payments",
      description: "All transactions are processed through secure, encrypted payment gateways with fraud protection."
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Complete Transparency",
      description: "No hidden fees, no surprises. You see exactly what you're paying for and when."
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "24/7 Support",
      description: "Our support team is always available to help with any concerns or questions you may have."
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Data Protection",
      description: "Your personal information is encrypted and stored securely. We never sell your data to third parties."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Quality Assurance",
      description: "We maintain high standards through continuous monitoring and feedback collection from our community."
    }
  ];

  const scamWarnings = [
    {
      icon: <Ban className="w-6 h-6" />,
      warning: "Upfront Payments",
      description: "Legitimate agents never ask for large upfront payments. Be wary of anyone requesting significant fees before providing any service.",
      severity: "high"
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      warning: "Unrealistic Promises",
      description: "If someone guarantees approval or promises unusually high earnings without effort, it's likely a scam.",
      severity: "high"
    },
    {
      icon: <Ban className="w-6 h-6" />,
      warning: "Off-Platform Communication",
      description: "Scammers often try to move conversations off-platform. Always communicate through our secure messaging system.",
      severity: "medium"
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      warning: "Pressure Tactics",
      description: "Be cautious of agents who pressure you to make quick decisions or create false urgency.",
      severity: "medium"
    },
    {
      icon: <Ban className="w-6 h-6" />,
      warning: "Request for Credentials",
      description: "Never share your platform login credentials or passwords with anyone, including agents.",
      severity: "high"
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      warning: "Unverified Agents",
      description: "Only work with agents who have a verified badge on our platform. Report unverified users immediately.",
      severity: "medium"
    }
  ];

  const verificationSteps = [
    {
      step: "01",
      title: "Identity Verification",
      description: "All agents must verify their identity using government-issued ID and proof of address.",
      icon: <Fingerprint className="w-8 h-8" />
    },
    {
      step: "02",
      title: "Track Record Check",
      description: "We review the agent's history of successful placements and verify their credentials with platforms.",
      icon: <FileCheck className="w-8 h-8" />
    },
    {
      step: "03",
      title: "Background Screening",
      description: "Comprehensive background checks are performed to ensure agent credibility and trustworthiness.",
      icon: <Search className="w-8 h-8" />
    },
    {
      step: "04",
      title: "Continuous Monitoring",
      description: "Agents are continuously monitored based on candidate feedback, success rates, and platform compliance.",
      icon: <Eye className="w-8 h-8" />
    }
  ];

  const safetyFeatures = [
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Real-Time Alerts",
      description: "Receive instant notifications about suspicious activity or potential scams."
    },
    {
      icon: <BadgeCheck className="w-6 h-6" />,
      title: "Verified Badges",
      description: "Easily identify verified agents with our trusted badge system."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Encrypted Messages",
      description: "All communications are end-to-end encrypted for your privacy."
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: "Transaction Records",
      description: "Complete audit trail of all payments and agreements for your protection."
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-amber-500 bg-amber-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getSeverityIconColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-amber-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <>
      <Head>
        <title>Trust & Transparency | Remote-Works.io</title>
        <meta name="description" content="Complete transparency about our role, services, and commitments. Learn what we do, what we don't do, and how we protect our community while maintaining ethical standards." />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button onClick={() => router.push('/')} className="cursor-pointer">
                <Logo textClassName="text-black" showText={true} size="sm" />
              </button>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/login')}
                  className="text-gray-700 hover:text-black transition-colors font-medium"
                >
                  Log In
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-all font-medium"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center space-x-2 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg px-4 py-2 rounded-full border border-white border-opacity-20 mb-6">
                <Shield className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-semibold">Your Safety is Our Priority</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                Trust & Transparency
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
                Complete honesty about our role, services, and limitations. Learn what we do, what we don't do,
                and how we maintain ethical standards while protecting our community.
              </p>
            </div>
          </div>
        </section>

        {/* What We Stand For */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What We Stand For</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our core values guide every decision we make and shape the experience for our entire community.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {coreValues.map((value, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-amber-500 rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Transparency & Commitment Section */}
        <section className="py-20 bg-gradient-to-b from-amber-50 via-white to-amber-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-amber-50 backdrop-blur-sm px-6 py-3 rounded-full border border-amber-200 mb-6">
                <Shield className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-semibold text-gray-700">Transparency & Trust</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Our Commitment to Transparency
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We believe in complete honesty about our role, services, and limitations. Here's what you need to know about working with Remote-Works.io.
              </p>
            </div>

            <div className="max-w-5xl mx-auto space-y-6">
              {/* What We Don't Do */}
              <div className="bg-white border-2 border-amber-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <X className="w-7 h-7 text-red-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Remote-Works.io does not sell jobs</h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      We provide career enablement and recruitment support—we don't sell employment. We are a platform that helps professionals prepare and connect with opportunities offered by third-party companies.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-amber-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <X className="w-7 h-7 text-red-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">We do not guarantee approvals or placements</h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      Success depends on third-party company requirements and individual qualifications. We provide support and guidance, but final hiring decisions are always made by the respective companies and platforms.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-amber-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <X className="w-7 h-7 text-red-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">We do not represent ourselves as an employer</h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      We are an independent platform connecting professionals with opportunities. All employment relationships, work assignments, payments, and contracts are directly between you and the hiring companies—not with Remote-Works.io.
                    </p>
                  </div>
                </div>
              </div>

              {/* What We Do */}
              <div className="bg-gradient-to-r from-amber-100 to-amber-50 border-2 border-amber-300 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-7 h-7 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">We provide career enablement and recruitment support</h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      Our role is to help you prepare comprehensive profiles, complete necessary verifications, receive structured onboarding and guidance, and connect with legitimate remote work opportunities offered by third-party companies and platforms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Disclaimer */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-8 mt-8 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Important Notice</h3>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>All opportunities are subject to third-party company requirements and availability.</strong> Remote-Works.io is an independent platform providing career enablement and recruitment support services. We are not affiliated with, endorsed by, or acting on behalf of any third-party company unless explicitly stated in writing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Principles */}
            <div className="mt-16 max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl p-10 border-2 border-gray-200 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Operating Principles</h3>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Eye className="w-8 h-8 text-amber-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">Full Transparency</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">Clear communication about our role, services, and what we can and cannot do</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="w-8 h-8 text-amber-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">No False Promises</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">Realistic expectations and honest guidance throughout your journey</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-amber-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">Ethical Support</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">Professional career enablement services focused on your long-term success</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Promise */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Promise to You</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                These are the commitments we make to every member of our community. Your trust is earned through our actions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {promises.map((promise, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-purple-600 rounded-lg flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform">
                      {promise.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{promise.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{promise.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Scam Detection */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-red-100 px-4 py-2 rounded-full mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-600 text-sm font-semibold">Stay Safe</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Scam Detection & Prevention</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Protect yourself by recognizing these common warning signs. Report any suspicious activity immediately.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {scamWarnings.map((warning, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-xl p-6 ${getSeverityColor(warning.severity)} transition-all duration-300 hover:shadow-lg`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 ${getSeverityIconColor(warning.severity)}`}>
                      {warning.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{warning.warning}</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{warning.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Report Suspicious Activity</h3>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                If you encounter any suspicious behavior or potential scams, please report it immediately to our team.
                We take all reports seriously and investigate thoroughly.
              </p>
              <button
                onClick={() => router.push('/support')}
                className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition-all font-semibold inline-flex items-center space-x-2"
              >
                <Mail className="w-5 h-5" />
                <span>Report an Issue</span>
              </button>
            </div>
          </div>
        </section>

        {/* Verification Process */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full mb-4">
                <Verified className="w-5 h-5 text-green-600" />
                <span className="text-green-600 text-sm font-semibold">Verified & Trusted</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Verification Process</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Every agent goes through a rigorous multi-step verification process before they can work with candidates.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {verificationSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                    <div className="text-6xl font-bold text-gray-200 mb-4">{step.step}</div>
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-amber-500 rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                  {index < verificationSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Safety Features */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Built-In Safety Features</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our platform includes multiple layers of protection to keep you safe at every step.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {safetyFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="text-center group"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white group-hover:scale-110 transition-transform shadow-lg">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-6 text-white" />
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join Remote-Works.io with complete transparency and confidence. Verify your profile, prepare for applications, and connect with legitimate remote work opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/register?type=candidate')}
                className="bg-white text-black px-8 py-4 rounded-lg hover:bg-gray-100 transition-all font-semibold inline-flex items-center justify-center space-x-2"
              >
                <span>Get Started as a Professional</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/company')}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-black transition-all font-semibold inline-flex items-center justify-center space-x-2"
              >
                <span>For Employers</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
