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
        <meta name="description" content="Remote-Works Terms of Service - Read our terms and conditions for using our workforce readiness platform." />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20 md:h-24 py-3">
              <Logo size="lg" showText={false} onClick={() => router.push('/')} />

              {/* Desktop Navigation */}
              <button onClick={() => router.push('/')} className="hidden md:block text-gray-600 hover:text-purple-600 transition-colors font-medium">
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
          <p className="text-gray-600 mb-12">Last updated: December 23, 2025</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing, browsing, or using Remote-Works ("Platform", "Service", "we", "us", or "our"), you ("User", "you", or "your")
                acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms"), our Privacy Policy,
                and all applicable laws and regulations.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE THIS PLATFORM.</strong> Your continued use of the Platform
                constitutes your acceptance of these Terms and any modifications thereto.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We reserve the absolute right to modify, amend, or replace these Terms at any time without prior notice. Changes are
                effective immediately upon posting. Your continued use of the Platform after changes constitutes acceptance of the
                modified Terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Definitions</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>"Platform"</strong> refers to the Remote-Works website, mobile applications, and all related services, content, and features</li>
                <li><strong>"Professional"</strong> refers to users seeking workforce readiness services and access to remote work opportunities</li>
                <li><strong>"Company"</strong> refers to organizations seeking to access verified, workforce-ready professionals</li>
                <li><strong>"Career Specialist"</strong> refers to independent professionals who provide career coaching, verification, and readiness services</li>
                <li><strong>"Third-Party Platforms"</strong> refers to external employers, job boards, and opportunity providers (e.g., Outlier, Alignerr, OneForma, etc.)</li>
                <li><strong>"Workforce Readiness System"</strong> refers to our three-stage process: Profile Verification, Application Readiness, and Employer-Aligned Onboarding</li>
                <li><strong>"Services"</strong> refers to all workforce readiness, career coaching, verification, and related services provided through the Platform</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Nature of Platform - Informational Service Only</h2>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">3.1 Platform Role</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Remote-Works is SOLELY an informational and educational platform</strong> that connects professionals with independent
                career specialists and provides resources for workforce readiness. We are NOT:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>An employment agency or recruiter</li>
                <li>A job placement service</li>
                <li>An employer or hiring entity</li>
                <li>A guarantor of employment, approval, or income</li>
                <li>A party to any agreements between users and career specialists</li>
                <li>A party to any agreements between users and third-party platforms</li>
                <li>Responsible for the actions, services, or decisions of career specialists, third-party platforms, or other users</li>
              </ul>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">3.2 Independent Contractors</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                All career specialists on the Platform are independent contractors, NOT employees, agents, or representatives of Remote-Works.
                We do not employ, supervise, direct, or control career specialists in any manner. Career specialists set their own schedules,
                methods, fees, and service terms.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">3.3 No Direct Services</h3>
              <p className="text-gray-700 leading-relaxed">
                Remote-Works does not provide career coaching, verification services, job placement, or any professional services directly.
                All services are provided by independent third parties. We merely facilitate connections and provide informational resources.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">4. No Guarantees or Warranties</h2>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">4.1 No Employment Guarantee</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>WE MAKE ABSOLUTELY NO GUARANTEES, PROMISES, OR WARRANTIES</strong> regarding:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Employment, job placement, or approval on any third-party platform</li>
                <li>Income, earnings, or financial results of any kind</li>
                <li>Success rates, approval rates, or performance metrics</li>
                <li>Quality, accuracy, or effectiveness of services provided by career specialists</li>
                <li>Availability of opportunities on third-party platforms</li>
                <li>Acceptance, approval, or continued engagement with third-party platforms</li>
              </ul>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">4.2 Third-Party Decisions</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                ALL employment decisions, approvals, rejections, terminations, and opportunity access are made SOLELY by third-party
                platforms at their complete discretion. Remote-Works has NO control over, influence on, or responsibility for these
                decisions.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">4.3 Platform Availability</h3>
              <p className="text-gray-700 leading-relaxed">
                We do not guarantee that the Platform will be available, uninterrupted, secure, error-free, or free from viruses or
                other harmful components. Platform access may be suspended, restricted, or terminated at any time without notice.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">5. User Accounts and Responsibilities</h2>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">5.1 Account Registration</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                To access certain features, you must create an account with accurate, current, and complete information. You are solely
                responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Maintaining the confidentiality and security of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Ensuring all information provided is truthful, accurate, and complete</li>
                <li>Updating your information to keep it current</li>
                <li>Notifying us immediately of any unauthorized access or security breaches</li>
              </ul>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">5.2 Account Eligibility</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You must be at least 18 years old and legally capable of entering into binding contracts. By creating an account, you
                represent and warrant that you meet these requirements.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">5.3 Account Termination</h3>
              <p className="text-gray-700 leading-relaxed">
                We reserve the absolute right to suspend, restrict, or terminate any account at any time, for any reason or no reason,
                with or without notice, including but not limited to violations of these Terms, suspected fraud, abusive behavior, or
                any activity we deem inappropriate.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Payments and Fees</h2>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">6.1 Fee Structure</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Career specialists set their own fees. Remote-Works may charge platform fees for facilitating transactions. All fees
                are non-refundable unless explicitly stated otherwise by the career specialist.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">6.2 Payment Processing</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Payments are processed through third-party payment processors. We are not responsible for payment processing errors,
                delays, security breaches, or failures. All payment disputes must be resolved with the payment processor.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">6.3 Refund Policy</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Refund policies are determined solely by individual career specialists. Remote-Works does not guarantee refunds and is
                not responsible for processing or facilitating refunds. Users acknowledge that payment for services does NOT guarantee
                results, employment, or approval.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">6.4 No Refund from Platform</h3>
              <p className="text-gray-700 leading-relaxed">
                Platform fees charged by Remote-Works are strictly non-refundable under all circumstances, including but not limited to
                service dissatisfaction, non-approval, or termination of account.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Prohibited Conduct</h2>
              <p className="text-gray-700 leading-relaxed mb-4">Users are strictly prohibited from:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Providing false, misleading, or fraudulent information</li>
                <li>Impersonating any person, entity, or career specialist</li>
                <li>Engaging in any fraudulent, deceptive, or illegal activity</li>
                <li>Violating any applicable laws, regulations, or third-party platform policies</li>
                <li>Circumventing the Platform to avoid fees</li>
                <li>Harassing, threatening, abusing, or defaming other users, career specialists, or Platform staff</li>
                <li>Using automated tools, bots, scrapers, or scripts to access the Platform</li>
                <li>Attempting to hack, breach security, or access unauthorized areas of the Platform</li>
                <li>Distributing malware, viruses, or harmful code</li>
                <li>Sharing account credentials with others</li>
                <li>Collecting or harvesting user information without consent</li>
                <li>Posting or transmitting inappropriate, offensive, or illegal content</li>
                <li>Interfering with or disrupting the Platform's operation</li>
                <li>Using the Platform for any unlawful purpose</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Violation of these prohibitions may result in immediate account termination, legal action, and reporting to law enforcement.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All content, features, functionality, software, designs, logos, trademarks, and materials on the Platform are owned
                exclusively by Remote-Works or our licensors and are protected by copyright, trademark, patent, and other intellectual
                property laws.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may not copy, reproduce, distribute, modify, create derivative works, publicly display, reverse engineer, or
                exploit any Platform content without our express written permission.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By submitting content to the Platform, you grant Remote-Works a worldwide, perpetual, irrevocable, royalty-free,
                transferable license to use, reproduce, distribute, modify, and display such content for Platform operation and promotion.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Disclaimers of Warranties</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>THE PLATFORM AND ALL SERVICES ARE PROVIDED STRICTLY "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
                EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Warranties of merchantability, fitness for a particular purpose, non-infringement, or title</li>
                <li>Warranties that the Platform will be uninterrupted, secure, error-free, or virus-free</li>
                <li>Warranties regarding accuracy, reliability, or completeness of content</li>
                <li>Warranties regarding results, outcomes, or performance</li>
                <li>Warranties regarding career specialist qualifications, services, or results</li>
                <li>Warranties regarding third-party platform approvals or employment</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>WE EXPRESSLY DISCLAIM ALL WARRANTIES</strong> to the maximum extent permitted by law. You use the Platform entirely
                at your own risk.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Some jurisdictions do not allow the exclusion of certain warranties. In such jurisdictions, some of the above exclusions
                may not apply to you, but shall be limited to the minimum extent required by law.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, REMOTE-WORKS, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AFFILIATES,
                PARTNERS, AND LICENSORS SHALL NOT BE LIABLE FOR ANY:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Direct, indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, use, goodwill, or other intangible losses</li>
                <li>Damages arising from your use or inability to use the Platform</li>
                <li>Damages arising from unauthorized access to your account or data</li>
                <li>Damages arising from errors, bugs, viruses, or security breaches</li>
                <li>Damages arising from actions or omissions of career specialists, third-party platforms, or other users</li>
                <li>Damages arising from employment decisions, rejections, or terminations</li>
                <li>Damages arising from service quality, results, or outcomes</li>
                <li>Damages arising from payment disputes or refund denials</li>
                <li>Damages arising from content accuracy or reliability</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU EXCEED THE GREATER OF (A) $100 USD OR (B) THE AMOUNT YOU PAID TO
                REMOTE-WORKS IN THE 12 MONTHS PRECEDING THE CLAIM.</strong>
              </p>
              <p className="text-gray-700 leading-relaxed">
                These limitations apply whether the alleged liability is based on contract, tort, negligence, strict liability, or any
                other basis, even if we have been advised of the possibility of such damages.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree to indemnify, defend, and hold harmless Remote-Works, its officers, directors, employees, agents, affiliates,
                partners, licensors, and service providers from and against any and all claims, liabilities, damages, losses, costs,
                expenses, or fees (including reasonable attorneys' fees) arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Your use or misuse of the Platform</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any law, regulation, or third-party rights</li>
                <li>Your content or submissions</li>
                <li>Your interactions with career specialists or other users</li>
                <li>Your employment applications, approvals, rejections, or terminations</li>
                <li>Your payment disputes or refund claims</li>
                <li>Any fraudulent, deceptive, or illegal activity</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                This indemnification obligation survives termination of your account and these Terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">12. Dispute Resolution and Arbitration</h2>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">12.1 Binding Arbitration</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>YOU AGREE THAT ANY DISPUTE, CLAIM, OR CONTROVERSY ARISING OUT OF OR RELATING TO THESE TERMS OR THE PLATFORM SHALL
                BE RESOLVED EXCLUSIVELY THROUGH BINDING ARBITRATION,</strong> except for disputes that may be taken to small claims court.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">12.2 Class Action Waiver</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>YOU WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.</strong> All disputes must
                be brought individually. You may not consolidate claims with other users.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">12.3 Informal Resolution</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Before initiating arbitration, you must first contact us at support@remote-works.io to attempt informal resolution.
                We will have 60 days to resolve the dispute informally.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mb-3">12.4 Arbitration Rules</h3>
              <p className="text-gray-700 leading-relaxed">
                Arbitration shall be conducted in accordance with the rules of the ADR Institute of Canada (ADRIC) or similar arbitration
                body. The arbitrator's decision is final and binding. Each party bears its own costs unless otherwise awarded by the arbitrator.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">13. Governing Law and Jurisdiction</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms are governed by and construed in accordance with the laws of the Province of Ontario and the federal laws
                of Canada applicable therein, without regard to conflict of law principles.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Any legal action or proceeding relating to these Terms (if not subject to arbitration) shall be brought exclusively
                in the courts located in Ontario, Canada. You consent to the personal jurisdiction of such courts and waive any objection
                to venue.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">14. Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to suspend or terminate your access to the Platform immediately, without prior notice or liability,
                for any reason, including without limitation:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Abusive behavior toward users, career specialists, or staff</li>
                <li>Non-payment of fees</li>
                <li>Inactivity for extended periods</li>
                <li>At our sole discretion for any reason or no reason</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Upon termination, your right to use the Platform ceases immediately. Provisions that by their nature should survive
                termination shall survive, including disclaimers, limitations of liability, indemnification, and dispute resolution.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">15. Privacy and Data Protection</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your use of the Platform is also governed by our Privacy Policy, which is incorporated into these Terms by reference.
                By using the Platform, you consent to our collection, use, and disclosure of your information as described in the Privacy Policy.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We are not responsible for the privacy practices of career specialists, third-party platforms, or other users. You
                acknowledge that sharing personal information with career specialists or third parties is at your own risk.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">16. Third-Party Links and Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Platform may contain links to third-party websites, services, or resources. We provide these links for convenience
                only and do not endorse, control, or assume responsibility for third-party content, products, or services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>YOU ACCESS THIRD-PARTY SITES AT YOUR OWN RISK.</strong> We are not liable for any damages arising from your
                use of third-party sites or services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">17. Entire Agreement and Severability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and Remote-Works regarding
                the Platform and supersede all prior agreements, understandings, and communications.
              </p>
              <p className="text-gray-700 leading-relaxed">
                If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall
                continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">18. No Waiver</h2>
              <p className="text-gray-700 leading-relaxed">
                Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.
                No waiver shall be effective unless made in writing and signed by an authorized representative of Remote-Works.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">19. Assignment</h2>
              <p className="text-gray-700 leading-relaxed">
                You may not assign, transfer, or delegate these Terms or your account without our prior written consent. We may assign
                these Terms at any time without restriction. These Terms are binding upon and inure to the benefit of the parties and
                their permitted successors and assigns.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">20. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions, concerns, or complaints about these Terms, please contact us at:
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Remote-Works</strong>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong> support@remote-works.io
              </p>
              <p className="text-gray-700">
                <strong>Legal:</strong> legal@remote-works.io
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">21. Acknowledgment</h2>
              <p className="text-gray-700 leading-relaxed">
                <strong>BY USING THE PLATFORM, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS.
                YOU ACKNOWLEDGE THAT REMOTE-WORKS MAKES NO GUARANTEES REGARDING EMPLOYMENT, APPROVALS, INCOME, OR RESULTS. YOU UNDERSTAND
                THAT ALL SERVICES ARE PROVIDED "AS IS" AND THAT YOUR USE OF THE PLATFORM IS AT YOUR SOLE RISK.</strong>
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
