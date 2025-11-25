import { useRouter } from 'next/router';
import { Globe2 } from 'lucide-react';
import Head from 'next/head';

export default function Terms() {
  const router = useRouter();

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
              <button onClick={() => router.push('/')} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Back to Home
              </button>
            </div>
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
                accordance with the rules of the American Arbitration Association.
              </p>
              <p className="text-gray-700 leading-relaxed">
                For disputes between Candidates and Agents, we offer mediation services to help reach a fair resolution.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law provisions.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about these Terms, please contact us at:
              </p>
              <p className="text-gray-700 mt-4">
                <strong>Email:</strong> legal@remote-works.io<br />
                <strong>Mail:</strong> Remote-Works Legal Department<br />
                123 Platform Street, Suite 100<br />
                Wilmington, DE 19801
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <Globe2 className="w-9 h-9 text-blue-500 mr-3" />
                <div className="text-2xl font-bold text-white">
                  Remote-<span className="text-blue-500">Works</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm">© 2025 Remote-Works. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
