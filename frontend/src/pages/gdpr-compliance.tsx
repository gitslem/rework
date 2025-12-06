import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Shield, Lock, Eye, FileText, Download, Trash2,
  CheckCircle, AlertCircle, Globe, Database, UserCheck,
  Mail, Clock, FileCheck, Settings, Key, ShieldCheck,
  Server, ArrowRight, Info, Book, Scale
} from 'lucide-react';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';

export default function GDPRCompliance() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const gdprPrinciples = [
    {
      icon: <Scale className="w-8 h-8" />,
      title: "Lawfulness, Fairness & Transparency",
      description: "We process your data lawfully, fairly, and in a transparent manner. You always know what data we collect and why."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Purpose Limitation",
      description: "We collect your data for specific, explicit, and legitimate purposes only and don't use it for other reasons."
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Data Minimization",
      description: "We only collect data that is necessary for the purposes we've stated. Nothing more, nothing less."
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Accuracy",
      description: "We ensure your personal data is accurate and kept up to date. You can update your information anytime."
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Storage Limitation",
      description: "We keep your data only for as long as necessary for the purposes we collected it for."
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Integrity & Confidentiality",
      description: "We protect your data with appropriate security measures against unauthorized access, loss, or damage."
    }
  ];

  const yourRights = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Right to Access",
      description: "You can request a copy of all personal data we hold about you at any time.",
      action: "Request Your Data"
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Right to Rectification",
      description: "You can update or correct your personal information if it's inaccurate or incomplete.",
      action: "Update Information"
    },
    {
      icon: <Trash2 className="w-6 h-6" />,
      title: "Right to Erasure",
      description: "You can request deletion of your personal data under certain circumstances.",
      action: "Request Deletion"
    },
    {
      icon: <Ban className="w-6 h-6" />,
      title: "Right to Restrict Processing",
      description: "You can request that we limit the way we use your personal data.",
      action: "Request Restriction"
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "Right to Data Portability",
      description: "You can receive your data in a structured, commonly used format and transfer it to another service.",
      action: "Download Data"
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "Right to Object",
      description: "You can object to processing of your data for direct marketing or other purposes.",
      action: "Object to Processing"
    }
  ];

  const dataWeCollect = [
    {
      category: "Account Information",
      items: [
        "Name and contact details (email, phone)",
        "Account credentials (encrypted)",
        "Profile information and preferences",
        "Professional skills and experience"
      ],
      icon: <UserCheck className="w-6 h-6" />
    },
    {
      category: "Usage Data",
      items: [
        "Login activity and timestamps",
        "Pages visited and features used",
        "Device and browser information",
        "IP address and location data"
      ],
      icon: <Globe className="w-6 h-6" />
    },
    {
      category: "Communication Data",
      items: [
        "Messages between candidates and agents",
        "Support ticket conversations",
        "Email communications",
        "Feedback and survey responses"
      ],
      icon: <Mail className="w-6 h-6" />
    },
    {
      category: "Transaction Data",
      items: [
        "Payment information (via secure providers)",
        "Transaction history and invoices",
        "Billing addresses",
        "Payment method details (tokenized)"
      ],
      icon: <FileCheck className="w-6 h-6" />
    }
  ];

  const securityMeasures = [
    {
      icon: <Lock className="w-6 h-6" />,
      title: "End-to-End Encryption",
      description: "All sensitive data is encrypted both in transit and at rest using industry-standard protocols."
    },
    {
      icon: <Server className="w-6 h-6" />,
      title: "Secure Infrastructure",
      description: "Our servers are hosted in secure, certified data centers with 24/7 monitoring and protection."
    },
    {
      icon: <Key className="w-6 h-6" />,
      title: "Access Controls",
      description: "Strict access controls ensure only authorized personnel can access personal data on a need-to-know basis."
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Regular Audits",
      description: "We conduct regular security audits and penetration testing to identify and fix vulnerabilities."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Data Breach Protocol",
      description: "We have procedures in place to detect, report, and investigate any data breaches within 72 hours."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Privacy by Design",
      description: "Data protection is built into our systems from the ground up, not added as an afterthought."
    }
  ];

  const dataRetention = [
    {
      type: "Active Account Data",
      period: "Duration of account + 30 days after closure",
      reason: "To provide services and resolve any post-closure issues"
    },
    {
      type: "Transaction Records",
      period: "7 years",
      reason: "Legal and tax compliance requirements"
    },
    {
      type: "Communication Logs",
      period: "2 years",
      reason: "Customer support and dispute resolution"
    },
    {
      type: "Marketing Data",
      period: "Until consent is withdrawn",
      reason: "To send you updates and offers you've opted into"
    }
  ];

  return (
    <>
      <Head>
        <title>GDPR Compliance | RemoteWorks</title>
        <meta name="description" content="Learn how RemoteWorks complies with GDPR regulations and protects your personal data. Understand your rights and our data protection practices." />
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
        <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center space-x-2 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg px-4 py-2 rounded-full border border-white border-opacity-20 mb-6">
                <Shield className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-semibold">GDPR Compliant</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                GDPR Compliance & Data Protection
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
                Your privacy matters. We're fully committed to protecting your personal data and complying with the
                General Data Protection Regulation (GDPR).
              </p>
              <div className="inline-flex items-center space-x-2 text-sm text-gray-300">
                <Info className="w-4 h-4" />
                <span>Last Updated: December 2025</span>
              </div>
            </div>
          </div>
        </section>

        {/* GDPR Principles */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">GDPR Principles We Follow</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our data protection practices are built on the six core principles of GDPR.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gdprPrinciples.map((principle, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                    {principle.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{principle.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{principle.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Data Protection Rights</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Under GDPR, you have several rights regarding your personal data. Here's how you can exercise them.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {yourRights.map((right, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white mb-4">
                    {right.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{right.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{right.description}</p>
                  <button
                    onClick={() => router.push('/support')}
                    className="text-purple-600 hover:text-purple-700 font-semibold text-sm inline-flex items-center space-x-1"
                  >
                    <span>{right.action}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
              <Book className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Help Exercising Your Rights?</h3>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                Our Data Protection Officer is here to help. Contact us at{' '}
                <a href="mailto:dpo@remote-works.io" className="text-blue-600 hover:text-blue-700 font-semibold">
                  dpo@remote-works.io
                </a>{' '}
                to exercise any of your rights or ask questions about our data practices.
              </p>
            </div>
          </div>
        </section>

        {/* Data We Collect */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What Data We Collect</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Transparency is key. Here's a complete overview of the personal data we collect and why.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {dataWeCollect.map((category, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{category.category}</h3>
                  </div>
                  <ul className="space-y-3">
                    {category.items.map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Measures */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">How We Protect Your Data</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We implement robust technical and organizational measures to protect your personal data.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {securityMeasures.map((measure, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform">
                      {measure.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{measure.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{measure.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Retention */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Data Retention Policy</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We only keep your data for as long as necessary. Here's our retention schedule.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">Data Type</th>
                        <th className="px-6 py-4 text-left font-semibold">Retention Period</th>
                        <th className="px-6 py-4 text-left font-semibold">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dataRetention.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{item.type}</td>
                          <td className="px-6 py-4 text-gray-700">{item.period}</td>
                          <td className="px-6 py-4 text-gray-600 text-sm">{item.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* International Transfers */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-2xl p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <Globe className="w-12 h-12 text-blue-600 flex-shrink-0" />
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      RemoteWorks operates globally, and your data may be transferred to and processed in countries
                      outside the European Economic Area (EEA). We ensure that all international data transfers comply
                      with GDPR requirements.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">
                          We use Standard Contractual Clauses (SCCs) approved by the European Commission
                        </span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">
                          We only transfer data to countries with adequate data protection levels
                        </span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">
                          All service providers are contractually bound to protect your data
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact & Complaints */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-8">
                <Mail className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact Our DPO</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Have questions about your data or our GDPR compliance? Our Data Protection Officer is here to help.
                </p>
                <div className="space-y-3">
                  <a
                    href="mailto:dpo@remote-works.io"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    <Mail className="w-5 h-5" />
                    <span>dpo@remote-works.io</span>
                  </a>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-8">
                <AlertCircle className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Lodge a Complaint</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  You have the right to lodge a complaint with your local data protection authority if you believe
                  we're not complying with GDPR.
                </p>
                <button
                  onClick={() => router.push('/support')}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all font-semibold inline-flex items-center space-x-2"
                >
                  <span>Submit a Concern</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-6 text-white" />
            <h2 className="text-4xl font-bold mb-6">Your Privacy, Our Priority</h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join thousands of candidates and agents who trust us with their data. Start your journey with confidence.
            </p>
            <button
              onClick={() => router.push('/register')}
              className="bg-white text-indigo-900 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all font-semibold inline-flex items-center space-x-2"
            >
              <span>Get Started Today</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

// Import Target and Ban icons
import { Target, Ban } from 'lucide-react';
