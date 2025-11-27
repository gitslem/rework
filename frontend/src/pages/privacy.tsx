import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';

export default function Privacy() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <Head>
        <title>Privacy Policy | Remote-Works</title>
        <meta name="description" content="Remote-Works Privacy Policy - Learn how we collect, use, and protect your personal information." />
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
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-12">Last updated: January 1, 2025</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Remote-Works ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how
                we collect, use, disclose, and safeguard your information when you use our Platform.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using Remote-Works, you consent to the data practices described in this policy.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">2.1 Information You Provide</h3>
              <p className="text-gray-700 leading-relaxed mb-4">We collect information you voluntarily provide when you:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li><strong>Create an account:</strong> Name, email address, password, profile information</li>
                <li><strong>Complete your profile:</strong> Skills, experience, bio, location, contact details</li>
                <li><strong>Use our services:</strong> Messages, reviews, service requests, applications</li>
                <li><strong>Make payments:</strong> Billing information (processed securely by third-party payment processors)</li>
                <li><strong>Contact support:</strong> Support tickets, feedback, inquiries</li>
              </ul>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">2.2 Automatically Collected Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">When you use the Platform, we automatically collect:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li><strong>Usage data:</strong> Pages viewed, features used, time spent on Platform</li>
                <li><strong>Device information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Location data:</strong> Approximate location based on IP address</li>
                <li><strong>Cookies and similar technologies:</strong> See Section 6 for details</li>
              </ul>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">2.3 Information from Third Parties</h3>
              <p className="text-gray-700 leading-relaxed">
                We may receive information from payment processors, identity verification services, and other third-party
                services we use to operate the Platform.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">We use collected information to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide, operate, and maintain the Platform</li>
                <li>Process transactions and send related information</li>
                <li>Verify user identities and prevent fraud</li>
                <li>Facilitate communication between Candidates and Agents</li>
                <li>Send administrative information, updates, and security alerts</li>
                <li>Respond to support requests and provide customer service</li>
                <li>Improve and optimize the Platform through analytics</li>
                <li>Personalize your experience and recommend relevant services</li>
                <li>Enforce our Terms of Service and protect user safety</li>
                <li>Comply with legal obligations</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">4. How We Share Your Information</h2>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">4.1 With Other Users</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your profile information is visible to other users as necessary for the Platform to function. Candidates can
                see Agent profiles, and Agents can see Candidate profiles when there's a service relationship.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">4.2 With Service Providers</h3>
              <p className="text-gray-700 leading-relaxed mb-4">We share information with third-party service providers who help us:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Process payments (Stripe, PayPal)</li>
                <li>Send emails and notifications</li>
                <li>Provide customer support</li>
                <li>Analyze Platform usage</li>
                <li>Verify identities and prevent fraud</li>
              </ul>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">4.3 For Legal Reasons</h3>
              <p className="text-gray-700 leading-relaxed mb-4">We may disclose information if required to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Comply with legal obligations, court orders, or government requests</li>
                <li>Enforce our Terms of Service</li>
                <li>Protect the rights, property, or safety of Remote-Works, our users, or the public</li>
                <li>Detect, prevent, or address fraud, security, or technical issues</li>
              </ul>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">4.4 Business Transfers</h3>
              <p className="text-gray-700 leading-relaxed">
                If Remote-Works is involved in a merger, acquisition, or sale of assets, your information may be transferred
                as part of that transaction. We will notify you of any such change.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>SSL/TLS encryption for data in transit</li>
                <li>Encrypted databases for data at rest</li>
                <li>Regular security audits and penetration testing</li>
                <li>Secure authentication with password hashing</li>
                <li>Limited employee access to personal data</li>
                <li>Secure payment processing (we never store full credit card numbers)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                However, no method of transmission over the Internet is 100% secure. While we strive to protect your data,
                we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Keep you logged in to your account</li>
                <li>Remember your preferences</li>
                <li>Analyze Platform usage and performance</li>
                <li>Provide personalized experiences</li>
                <li>Serve relevant advertisements (with your consent)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                You can control cookies through your browser settings. However, disabling cookies may limit Platform functionality.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Your Privacy Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Objection:</strong> Object to certain data processing activities</li>
                <li><strong>Restrict:</strong> Request restriction of data processing</li>
                <li><strong>Withdraw consent:</strong> Withdraw previously given consent at any time</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                To exercise these rights, contact us at privacy@remote-works.io. We will respond within 30 days.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and comply with legal
                obligations. When you delete your account, we will delete or anonymize your personal information within 90 days,
                except where we must retain it for legal, tax, or regulatory purposes.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                The Platform is not intended for users under 18 years of age. We do not knowingly collect information from
                children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">10. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence.
                These countries may have different data protection laws. By using the Platform, you consent to such transfers.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">11. California Privacy Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                California residents have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Right to know what personal information is collected, used, shared, or sold</li>
                <li>Right to delete personal information</li>
                <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
                <li>Right to non-discrimination for exercising privacy rights</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                To exercise these rights, email privacy@remote-works.io or call 1-555-123-4567.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">12. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of material changes by email or through
                a prominent notice on the Platform. Your continued use after changes indicates acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <p className="text-gray-700">
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
