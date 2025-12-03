import Head from 'next/head';
import { useRouter } from 'next/router';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import { Shield, Users, CheckCircle, AlertTriangle, FileText, MessageSquare } from 'lucide-react';

export default function CodeOfConduct() {
  const router = useRouter();

  const sections = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Our Commitment",
      color: "from-blue-600 to-cyan-600",
      content: "RemoteWorks is committed to maintaining a professional, respectful, and inclusive platform where candidates and agents can collaborate effectively. This Code of Conduct outlines the standards we expect from all members of our community."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Expected Behavior",
      color: "from-purple-600 to-pink-600",
      items: [
        "Treat all members with respect, professionalism, and courtesy",
        "Communicate clearly, honestly, and promptly with your agent or candidates",
        "Provide accurate information in all applications and interactions",
        "Honor commitments and meet agreed-upon deadlines",
        "Maintain confidentiality of sensitive information shared on the platform",
        "Report any concerns or violations through proper channels",
        "Follow all platform guidelines and policies"
      ]
    },
    {
      icon: <AlertTriangle className="w-8 h-8" />,
      title: "Prohibited Activities",
      color: "from-red-600 to-orange-600",
      items: [
        "Harassment, discrimination, or hate speech of any kind",
        "Sharing false, misleading, or fraudulent information",
        "Attempting to circumvent platform fees or payment systems",
        "Soliciting or sharing personal contact information to bypass the platform",
        "Spamming, unsolicited advertising, or promotional content",
        "Engaging in any illegal activities or encouraging others to do so",
        "Using the platform for purposes other than legitimate job opportunities",
        "Creating multiple accounts to manipulate the system"
      ]
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "For Agents",
      color: "from-green-600 to-emerald-600",
      items: [
        "Provide genuine, verified job opportunities only",
        "Clearly communicate job requirements, timelines, and compensation",
        "Respond to candidate inquiries in a timely and professional manner",
        "Maintain transparency about application processes and outcomes",
        "Respect candidate privacy and data protection rights",
        "Provide constructive feedback when requested",
        "Never request fees or payments from candidates for applications"
      ]
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "For Candidates",
      color: "from-amber-600 to-yellow-600",
      items: [
        "Submit honest and accurate application materials",
        "Follow agent instructions and platform guidelines carefully",
        "Communicate professionally in all interactions",
        "Meet deadlines and honor commitments made to agents",
        "Provide feedback on your experience when requested",
        "Report any suspicious activity or inappropriate behavior",
        "Respect intellectual property and confidential information"
      ]
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Reporting & Enforcement",
      color: "from-indigo-600 to-purple-600",
      content: "If you witness or experience behavior that violates this Code of Conduct, please report it immediately through our support channels. All reports are reviewed promptly and handled with confidentiality. Violations may result in warnings, temporary suspension, or permanent removal from the platform, depending on severity. We reserve the right to terminate accounts engaging in serious misconduct without prior warning."
    }
  ];

  return (
    <>
      <Head>
        <title>Code of Conduct - RemoteWorks</title>
        <meta name="description" content="Professional standards and community guidelines for RemoteWorks platform members" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center h-20 md:h-24 py-3">
              <Logo showText={false} size="lg" />
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-all font-medium"
              >
                Back to Home
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-black to-gray-800 text-white py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Code of Conduct
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Building a professional and respectful community for AI training opportunities
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div className={`bg-gradient-to-r ${section.color} p-6 text-white`}>
                  <div className="flex items-center gap-4">
                    {section.icon}
                    <h2 className="text-2xl font-bold">{section.title}</h2>
                  </div>
                </div>
                <div className="p-8">
                  {section.content && (
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {section.content}
                    </p>
                  )}
                  {section.items && (
                    <ul className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}

            {/* Contact Section */}
            <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-8 text-center shadow-xl">
              <h2 className="text-2xl font-bold mb-4">Questions or Concerns?</h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                If you have questions about this Code of Conduct or need to report a violation, please contact our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/support')}
                  className="px-8 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-all"
                >
                  Contact Support
                </button>
                <a
                  href="mailto:support@remote-works.io"
                  className="px-8 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-full font-semibold hover:bg-white/20 transition-all"
                >
                  Email Us
                </a>
              </div>
            </div>

            {/* Last Updated */}
            <div className="text-center text-gray-500 text-sm">
              Last Updated: December 2025
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
