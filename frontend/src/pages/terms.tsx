import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';

export default function Terms() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <Head>
        <title>Terms of Service | Remote-Works</title>
        <meta name="description" content="Remote-Works Terms of Service - Read our terms and conditions for using the platform." />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              <Logo size="md" showText={false} onClick={() => router.push('/')} />

              {/* Desktop Navigation */}
              <button onClick={() => router.push('/')} className="hidden md:block text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Back to Home
              </button>

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
              <div className="md:hidden py-4 border-t border-gray-200">
                <button onClick={() => { router.push('/'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors font-medium">
                  Back to Home
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-12">Last updated: January 1, 2025</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing or using Remote-Works ("the Platform"), you agree to be bound by these Terms of Service ("Terms").
                If you do not agree to these Terms, please do not use our Platform.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. Continued use of the Platform after changes constitutes
                acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Definitions</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>"Agent"</strong> refers to verified users who provide application assistance services to Candidates</li>
                <li><strong>"Candidate"</strong> refers to users seeking help getting approved for third-party platforms</li>
                <li><strong>"Platform"</strong> refers to the Remote-Works website and all related services</li>
                <li><strong>"Services"</strong> refers to the application assistance services provided by Agents</li>
                <li><strong>"Third-Party Platforms"</strong> refers to external services like Outlier, Alignerr, OneForma, etc.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">3.1 Registration</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                To use the Platform, you must create an account and provide accurate, complete information. You are responsible
                for maintaining the confidentiality of your account credentials.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">3.2 Account Types</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li><strong>Candidate Accounts:</strong> Subject to admin approval before accessing Agent profiles</li>
                <li><strong>Agent Accounts:</strong> Require verification of credentials and success rates</li>
              </ul>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">3.3 Account Termination</h3>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity,
                or harm other users.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Services</h2>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">4.1 Platform Role</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Remote-Works acts as a marketplace connecting Candidates with Agents. We do not provide application assistance
                services directly. All services are provided by independent Agents.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">4.2 No Guarantees</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                While Agents maintain high success rates, Remote-Works does not guarantee approval on any Third-Party Platform.
                Approval decisions are made solely by the Third-Party Platforms.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">4.3 Agent Responsibilities</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide honest, accurate information about services and success rates</li>
                <li>Deliver services as described in their profile</li>
                <li>Maintain confidentiality of Candidate information</li>
                <li>Comply with all applicable laws and Third-Party Platform policies</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Payments</h2>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">5.1 Fees</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Candidates pay Agents directly through the Platform. Remote-Works charges a 15% platform fee on all transactions,
                which is automatically deducted from Agent earnings.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">5.2 Escrow</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Payments are held in escrow until service completion criteria (as defined by the Agent) are met. Escrow protects
                both parties and ensures fair transactions.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">5.3 Refunds</h3>
              <p className="text-gray-700 leading-relaxed">
                Refund policies are set by individual Agents. Most Agents offer refunds if the Candidate is not approved.
                Remote-Works facilitates refunds but does not determine refund eligibility.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Prohibited Activities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">Users may not:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide false or misleading information</li>
                <li>Impersonate another person or entity</li>
                <li>Engage in fraudulent activity</li>
                <li>Circumvent the Platform to avoid fees</li>
                <li>Harass, threaten, or harm other users</li>
                <li>Violate any applicable laws or Third-Party Platform policies</li>
                <li>Use automated tools to scrape or collect data from the Platform</li>
                <li>Share account credentials with others</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All content on the Platform, including logos, designs, text, and software, is owned by Remote-Works or licensed
                to us. You may not use our intellectual property without written permission.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Users retain ownership of content they submit but grant Remote-Works a license to use, display, and distribute
                that content on the Platform.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Disclaimers</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THAT THE PLATFORM WILL BE
                ERROR-FREE, SECURE, OR UNINTERRUPTED.
              </p>
              <p className="text-gray-700 leading-relaxed">
                WE ARE NOT RESPONSIBLE FOR THE ACTIONS OF AGENTS OR CANDIDATES, OR FOR APPROVAL DECISIONS MADE BY THIRD-PARTY PLATFORMS.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, REMOTE-WORKS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">10. Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Any disputes arising from these Terms or use of the Platform shall be resolved through binding arbitration in
                accordance with the rules of the ADR Institute of Canada (ADRIC).
              </p>
              <p className="text-gray-700 leading-relaxed">
                For disputes between Candidates and Agents, we offer mediation services to help reach a fair resolution.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein,
                without regard to conflict of law provisions. Any legal action or proceeding relating to these Terms shall be
                brought exclusively in the courts of Ontario.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about these Terms, please contact us at:
              </p>
              <p className="text-gray-700 mt-4">
                <strong>Email:</strong> support@remote-works.io
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
