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
          question: "What is Remote-Works?",
          answer: "Remote-Works is a marketplace that connects candidates with verified agents who help them get approved for projects on platforms like Outlier, Alignerr, OneForma, Appen, RWS, Mindrift, TELUS Digital, and more. Our agents have proven track records and provide personalized guidance to maximize your chances of approval."
        },
        {
          question: "How do I sign up?",
          answer: "Click 'Get Started' on our homepage and choose whether you want to sign up as a candidate or agent. Fill out your profile information and wait for admin approval (usually 24-48 hours). Once approved, candidates can browse agents and agents can start accepting clients."
        },
        {
          question: "Is there a fee to join?",
          answer: "Signing up is completely free for both candidates and agents. Candidates only pay when they hire an agent, and agents only pay a small platform fee when they complete a successful placement."
        },
        {
          question: "How long does admin approval take?",
          answer: "Admin approval typically takes 24-48 hours. We review each profile to ensure quality and authenticity. You'll receive an email notification once your account is approved."
        }
      ]
    },
    {
      category: "For Candidates",
      faqs: [
        {
          question: "How much do agents charge?",
          answer: "Agent fees vary based on the service and platform. Most agents charge between $50-$200, but you only pay if you get approved. Each agent's profile lists their specific rates for different platforms."
        },
        {
          question: "What's the success rate?",
          answer: "Our verified agents have a 98% success rate in getting candidates approved. We only work with agents who have proven track records and consistently deliver results."
        },
        {
          question: "How do I choose an agent?",
          answer: "Browse agent profiles to see their specializations, success rates, reviews, and pricing. Look for agents who specialize in the platforms you're interested in and have high ratings from previous clients."
        },
        {
          question: "What if I don't get approved?",
          answer: "Most agents offer a money-back guarantee if you don't get approved. This is specified in their profile. You can also work with the agent to reapply or try a different platform."
        },
        {
          question: "How long does the approval process take?",
          answer: "Once you hire an agent, they typically help you prepare and submit your application within 3-7 days. Platform approval times vary, but most take 1-2 weeks to review applications."
        },
        {
          question: "Can I hire multiple agents?",
          answer: "Yes! You can hire different agents for different platforms. For example, one agent might specialize in Outlier while another excels at Alignerr approvals."
        }
      ]
    },
    {
      category: "For Agents",
      faqs: [
        {
          question: "How do I become a verified agent?",
          answer: "Sign up as an agent and complete your profile with details about your experience and success rate. Provide evidence of successful placements (testimonials, screenshots, etc.). Our team will review your application and verify your credentials within 48 hours."
        },
        {
          question: "What's the platform fee?",
          answer: "We charge a 15% platform fee on successful placements. This covers payment processing, security, and platform maintenance. There are no upfront fees or monthly subscriptions."
        },
        {
          question: "How do I get paid?",
          answer: "Payments are held in escrow until the candidate is approved for the platform. Once approval is confirmed, funds are released to your account within 3-5 business days. You can withdraw to your bank account or PayPal."
        },
        {
          question: "Can I set my own prices?",
          answer: "Yes! You have full control over your pricing for each platform you support. We recommend competitive rates based on market research, but the final decision is yours."
        },
        {
          question: "How do I attract more clients?",
          answer: "Build a strong profile with detailed service descriptions, maintain a high success rate, collect positive reviews, respond quickly to inquiries, and specialize in specific platforms to become a go-to expert."
        }
      ]
    },
    {
      category: "Payments & Security",
      faqs: [
        {
          question: "How does payment work?",
          answer: "Candidates pay upfront, and funds are held in secure escrow. When the candidate gets approved for the platform, the funds are released to the agent. If approval doesn't happen (and the agent offers a guarantee), funds are refunded to the candidate."
        },
        {
          question: "Is my payment information secure?",
          answer: "Yes. We use industry-standard encryption and work with trusted payment processors (Stripe, PayPal). We never store your full credit card information on our servers."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, debit cards, and PayPal. Payment options may vary by region."
        },
        {
          question: "Can I get a refund?",
          answer: "Refund policies depend on the agent's guarantee. Most agents offer full refunds if you don't get approved. Check the agent's profile for their specific refund policy."
        },
        {
          question: "How is my personal data protected?",
          answer: "We use enterprise-grade security, including SSL encryption, secure databases, and regular security audits. We never sell your data to third parties. See our Privacy Policy for details."
        }
      ]
    },
    {
      category: "Platform Features",
      faqs: [
        {
          question: "Can I message agents before hiring?",
          answer: "Yes! You can message agents to ask questions and discuss your situation before making a commitment. This helps ensure you find the right fit."
        },
        {
          question: "How do reviews work?",
          answer: "After a service is completed, both candidates and agents can leave reviews. Reviews are verified and help build trust in our community. High ratings help agents attract more clients."
        },
        {
          question: "What if I have a dispute with an agent?",
          answer: "Contact our support team immediately. We'll mediate the dispute and, if necessary, issue refunds or take action against agents who violate our terms of service."
        },
        {
          question: "Is there customer support?",
          answer: "Yes! We offer 24/7 email support and live chat during business hours (9 AM - 6 PM EST). Premium users get priority support with faster response times."
        },
        {
          question: "Can I update my profile after creating it?",
          answer: "Absolutely! You can update your profile, skills, services, and pricing at any time. Some changes (like adding new platform specializations for agents) may require re-verification."
        }
      ]
    },
    {
      category: "Supported Platforms",
      faqs: [
        {
          question: "Which platforms do you support?",
          answer: "Our agents help with Outlier AI, Alignerr, OneForma, Appen, RWS, Mindrift AI, TELUS Digital, and 20+ other AI training and remote work platforms. New platforms are added regularly based on demand."
        },
        {
          question: "Do I need to know which platform I want?",
          answer: "No! Many candidates aren't sure which platform is best for them. Agents can help you choose based on your skills, experience, and goals."
        },
        {
          question: "Can agents help with multiple platforms?",
          answer: "Yes! Many agents specialize in multiple platforms. Check their profile to see which services they offer."
        },
        {
          question: "What if my desired platform isn't listed?",
          answer: "Contact our support team! We're constantly adding new platforms based on user requests. We may already have agents who support it or can help you find a solution."
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
        <title>FAQ - Frequently Asked Questions | Remote-Works</title>
        <meta name="description" content="Find answers to common questions about Remote-Works, our agent marketplace, payments, security, and how to get started." />
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
                Find answers to common questions about Remote-Works
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
