import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  ChevronDown, ChevronUp, Search, Menu, X
} from 'lucide-react';
import Head from 'next/head';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';

export default function FAQ() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const faqCategories = [
    {
      category: "Getting Started",
      faqs: [
        {
          question: "What is Rework?",
          answer: "Rework is a remote work enablement and recruitment platform that helps professionals prepare, verify, and connect with legitimate remote work opportunities. We provide profile verification, application readiness support, and access to vetted opportunities on platforms like Outlier, Alignerr, OneForma, Appen, RWS, Mindrift, TELUS Digital, and 20+ more. We are not an employer—all hiring decisions are made by third-party companies."
        },
        {
          question: "How do I sign up?",
          answer: "Click 'Get Started' on our homepage and create your professional profile. Complete the verification process including identity, skill, and eligibility checks. Once verified, you'll gain access to remote work opportunities from trusted platforms. The verification process typically takes 24-48 hours."
        },
        {
          question: "Is the platform free to use?",
          answer: "Yes! Creating an account and accessing the platform is completely free. There are no hidden fees or mandatory charges. Optional career support services (like profile optimization or application readiness review) are available for purchase if you choose to use them, but they're not required to access opportunities."
        },
        {
          question: "How long does verification take?",
          answer: "The verification process typically takes 24-48 hours. We review your identity, skills, and eligibility to ensure you meet platform standards. You'll receive an email notification once your verification is complete and you can start accessing opportunities."
        }
      ]
    },
    {
      category: "For Professionals",
      faqs: [
        {
          question: "How much does it cost to access opportunities?",
          answer: "Accessing the platform and opportunities is completely free. Optional career support services (profile optimization, application readiness review, skill assessment guidance) are available for purchase if you choose to use them, with prices varying by service. These services are not required—they're just additional support if you want extra help."
        },
        {
          question: "What's the success rate for platform approvals?",
          answer: "Professionals who complete our verification process and follow platform guidelines have a 98% success rate in securing opportunities. We ensure your profile meets platform standards and requirements before you apply, significantly increasing your chances of approval."
        },
        {
          question: "How do I access remote work opportunities?",
          answer: "After completing verification, browse available opportunities that match your skills and interests. Each opportunity listing shows platform requirements, expected income, and application details. You apply directly through our platform, and we help ensure your application meets all requirements."
        },
        {
          question: "Do you guarantee job placement?",
          answer: "No. We provide career enablement and recruitment support, not employment guarantees. We help you prepare application-ready profiles and connect you with opportunities, but all hiring decisions are made by the third-party companies and platforms based on their specific requirements."
        },
        {
          question: "How long does it take to start working?",
          answer: "After verification (24-48 hours), you can immediately start applying to opportunities. Platform approval times vary—most take 1-2 weeks to review applications. Once approved by the platform, you can typically start working right away."
        },
        {
          question: "Can I apply to multiple platforms?",
          answer: "Yes! You can apply to as many platforms as you'd like. Many professionals work across multiple platforms simultaneously to maximize their income. We support 20+ platforms including Outlier, Alignerr, OneForma, Appen, and more."
        }
      ]
    },
    {
      category: "For Employers",
      faqs: [
        {
          question: "How can my company use Rework to find talent?",
          answer: "Rework helps employers access pre-screened, verified professionals ready for remote work. You can post opportunities or request talent that matches your specific requirements. All professionals have completed identity, skill, and eligibility verification before being added to our talent pool."
        },
        {
          question: "What types of professionals are available?",
          answer: "Our platform includes professionals skilled in AI training, data annotation, content moderation, software development, and other remote work roles. All professionals are verified and have experience with remote work platforms and digital collaboration."
        },
        {
          question: "How are professionals vetted?",
          answer: "Every professional completes comprehensive verification including identity checks, skill assessments, and eligibility reviews. This ensures authenticity and credibility. Professionals also receive application readiness training to understand remote work expectations."
        },
        {
          question: "What's the process for hiring through Rework?",
          answer: "Post your opportunity or specific talent requirements on our platform. Browse pre-verified professional profiles or receive recommendations. Connect with candidates directly for interviews. All hiring decisions and employment relationships are between you and the professional."
        },
        {
          question: "Is there a fee for employers?",
          answer: "Contact our sales team for employer pricing and partnership options. We offer flexible plans based on your hiring volume and needs. Visit our For Employers page or contact support for more information."
        }
      ]
    },
    {
      category: "Payments & Security",
      faqs: [
        {
          question: "How does payment work for optional services?",
          answer: "The platform is free to use. If you choose to purchase optional career support services (profile optimization, application readiness review, etc.), payment is processed securely through trusted payment processors. You only pay for the specific services you choose to use."
        },
        {
          question: "Is my payment information secure?",
          answer: "Yes. We use industry-standard encryption and work with trusted payment processors including Stripe and PayPal. We never store your full credit card information on our servers. All transactions are encrypted and secure."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, debit cards, and PayPal for optional service purchases. Payment options may vary by region. The platform itself requires no payment."
        },
        {
          question: "What is your refund policy?",
          answer: "Refund policies for optional career support services are clearly stated before purchase. Contact our support team if you have any issues with a service. Platform access is always free, so no refund is needed for basic features."
        },
        {
          question: "How is my personal data protected?",
          answer: "We use enterprise-grade security including SSL encryption, secure databases, GDPR compliance, and regular security audits. We never sell your data to third parties. All verification data is stored securely and used only for platform access. See our Privacy Policy and GDPR Compliance pages for details."
        }
      ]
    },
    {
      category: "Platform Features",
      faqs: [
        {
          question: "Can I contact support before signing up?",
          answer: "Yes! Our support team is available 24/7 via email and live chat during business hours (9 AM - 6 PM EST). We're happy to answer questions about verification, opportunities, or any platform features before you create an account."
        },
        {
          question: "How does the verification process work?",
          answer: "After signing up, you'll complete identity verification (government ID), skill assessment (relevant to your expertise), and eligibility review (platform-specific requirements). This ensures all professionals meet quality standards and helps increase approval rates for opportunities."
        },
        {
          question: "What if I have an issue with an opportunity or platform?",
          answer: "Contact our support team immediately. While we don't control hiring decisions (those are made by third-party companies), we can help mediate issues, provide guidance, and ensure your experience on our platform is positive."
        },
        {
          question: "Is there customer support?",
          answer: "Yes! We offer 24/7 email support and live chat during business hours (9 AM - 6 PM EST). All users receive the same high-quality support with fast response times."
        },
        {
          question: "Can I update my profile after verification?",
          answer: "Absolutely! You can update your profile, skills, and experience at any time. Significant changes may require re-verification to ensure your profile remains accurate and you continue to meet platform standards."
        }
      ]
    },
    {
      category: "Supported Platforms",
      faqs: [
        {
          question: "Which platforms do you connect with?",
          answer: "We connect professionals with opportunities on 20+ platforms including Outlier AI, Alignerr, OneForma, Appen, RWS, Mindrift AI, TELUS Digital, Scale AI, and many more AI training and remote work platforms. New platforms are added regularly based on demand and verification standards."
        },
        {
          question: "Do I need to know which platform I want to work on?",
          answer: "No! Many professionals aren't sure which platform is best for them. Our platform provides guidance and recommendations based on your skills, experience, location, and career goals. You can browse all available opportunities and choose what fits best."
        },
        {
          question: "Can I work on multiple platforms at once?",
          answer: "Yes! Many professionals work across multiple platforms simultaneously to maximize income and opportunities. Our average user earns $4k+ monthly by working on multiple platforms. There's no restriction on how many you can join."
        },
        {
          question: "What if my desired platform isn't listed?",
          answer: "Contact our support team! We're constantly adding new platforms based on user requests and verification standards. We may already be in the process of adding it or can help you find similar opportunities."
        }
      ]
    }
  ];

  const filteredFAQs = faqCategories.map(cat => ({
    ...cat,
    faqs: cat.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.faqs.length > 0);

  return (
    <>
      <Head>
        <title>FAQ - Frequently Asked Questions | Rework</title>
        <meta name="description" content="Find answers to common questions about Rework, our remote work enablement platform, verification process, opportunities, payments, security, and how to get started." />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20 md:h-24 py-3">
              <Logo onClick={() => router.push('/')} showText={false} size="lg" />

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <button onClick={() => router.push('/')} className="text-gray-600 hover:text-black transition-colors font-medium">Home</button>
                <button onClick={() => router.push('/about')} className="text-gray-600 hover:text-black transition-colors font-medium">About</button>
                <button onClick={() => router.push('/support')} className="text-gray-600 hover:text-black transition-colors font-medium">Support</button>
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
                <button onClick={() => { router.push('/about'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors font-medium">About</button>
                <button onClick={() => { router.push('/support'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors font-medium">Support</button>
                <button onClick={() => { router.push('/login'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors font-medium">Sign In</button>
                <button onClick={() => { router.push('/register'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors mx-4">Get Started</button>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Frequently Asked
                <span className="block text-black">
                  Questions
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Find answers to common questions about Rework
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto pt-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for answers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-gray-600">No results found. Try a different search term.</p>
              </div>
            ) : (
              <div className="space-y-12">
                {filteredFAQs.map((category, catIndex) => (
                  <div key={catIndex}>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">{category.category}</h2>
                    <div className="space-y-4">
                      {category.faqs.map((faq, faqIndex) => {
                        const globalIndex = catIndex * 100 + faqIndex;
                        const isOpen = openIndex === globalIndex;

                        return (
                          <div
                            key={faqIndex}
                            className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden transition-all hover:border-black"
                          >
                            <button
                              onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                              className="w-full px-6 py-5 flex justify-between items-center text-left"
                            >
                              <span className="text-lg font-semibold text-gray-900 pr-8">{faq.question}</span>
                              {isOpen ? (
                                <ChevronUp className="w-6 h-6 text-black flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                              )}
                            </button>
                            {isOpen && (
                              <div className="px-6 pb-5">
                                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Still Have Questions */}
        <section className="py-24 bg-black text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Still Have Questions?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Our support team is here to help 24/7
            </p>
            <button
              onClick={() => router.push('/support')}
              className="bg-white text-black px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-2xl"
            >
              Contact Support
            </button>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
