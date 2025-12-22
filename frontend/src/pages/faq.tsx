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
      category: "About Remote-Works",
      faqs: [
        {
          question: "What is Remote-Works?",
          answer: "Remote-Works is a professional talent platform designed to connect verified professionals with high-quality remote opportunities worldwide. We don't just list jobs from partners—we ensure candidates are thoroughly verified, professionally prepared, and strategically onboarded before they ever apply. Through our structured system of Profile Verification, Application Readiness, and Employer-Aligned Onboarding, we streamline access to vetted remote roles, reducing friction, increasing trust, and accelerating hiring outcomes. This is not job searching—this is workforce readiness across multiple platforms."
        },
        {
          question: "How is Remote-Works different from other job boards?",
          answer: "We're not a traditional job board. We're a workforce readiness platform. While other sites simply list jobs, we prepare you for them. Every professional goes through comprehensive verification, receives application readiness training, and benefits from employer-aligned onboarding. We work with partner companies to provide curated opportunities, and our 98% success rate proves that preparation matters. With Remote-Works, you're not just applying—you're arriving ready to succeed."
        },
        {
          question: "What does 'workforce readiness' mean?",
          answer: "Workforce readiness means you're not just job searching—you're being strategically prepared for success. Through our three-stage system (Profile Verification, Application Readiness, and Employer-Aligned Onboarding), we ensure you meet partner requirements before you apply, understand what employers expect, and are positioned to succeed from day one. Our professionals have a 98% success rate because they're ready when opportunity arrives."
        },
        {
          question: "Do you guarantee employment?",
          answer: "No, and we believe honesty builds trust. We provide professional preparation and verified access to opportunities, but we cannot guarantee employment. All hiring decisions are made by our partner companies based on their specific requirements and business needs. What we do guarantee is that you'll be thoroughly prepared, professionally verified, and strategically positioned for success. Our 98% success rate speaks to the quality of our preparation process."
        }
      ]
    },
    {
      category: "Getting Started",
      faqs: [
        {
          question: "How do I get started with Remote-Works?",
          answer: "Getting started is straightforward: (1) Create your professional profile by clicking 'Get Started' on our homepage. (2) Complete our Profile Verification process, which includes identity verification, skill assessment, and eligibility review. (3) Undergo Application Readiness training to understand partner expectations. (4) Access verified project opportunities from our partner network. The entire verification process typically takes 24-48 hours, and our support team is available 24/7 to assist you."
        },
        {
          question: "Is there any cost to join?",
          answer: "No. Creating an account, completing verification, and accessing opportunities is completely free. We believe in transparency—you'll never be surprised by hidden fees. Optional career enhancement services (like advanced profile optimization or one-on-one coaching) are available for purchase if you choose, but they're never required. The core platform and all opportunities remain free to access."
        },
        {
          question: "What is the Profile Verification process?",
          answer: "Profile Verification is our first stage of workforce readiness. It includes: (1) Identity Verification – confirming you are who you say you are through government-issued ID. (2) Skill Assessment – validating your expertise relevant to remote work opportunities. (3) Eligibility Review – ensuring you meet partner platform requirements. This comprehensive verification builds trust with our partners and significantly increases your approval rates. The process takes 24-48 hours and ensures only quality professionals access our partner network."
        },
        {
          question: "What happens after I'm verified?",
          answer: "After verification, you enter our Application Readiness stage. You'll receive training on partner expectations, learn what makes applications successful, and understand how to position yourself for each opportunity. Then, you'll access our curated partner opportunities—12+ verified project types across AI data annotation, content moderation, translation services, search evaluation, and more. You can apply to multiple opportunities, and our average professional earns $4k+ monthly by working across multiple projects."
        }
      ]
    },
    {
      category: "Partner Opportunities",
      faqs: [
        {
          question: "What types of opportunities are available?",
          answer: "We provide access to 12+ verified project types from trusted partner companies: AI Data Annotation, Content Moderation, Translation & Localization, Search Quality Evaluation, Data Labeling, Audio Transcription, Image Recognition, Video Content Evaluation, Technical Translation, Text Categorization, Linguistic Annotation, and Speech Data Collection. Projects range from $10-$45/hour depending on complexity and expertise. Our average professional earns $4k+ monthly by working across multiple projects."
        },
        {
          question: "How do partner opportunities work?",
          answer: "We work with trusted partner companies who provide remote opportunities. When you're ready to apply, we connect you directly with these partners. You'll see full project details—requirements, pay range, benefits, and application process. Because you've completed our three-stage readiness system, you're applying as a verified, prepared professional, which significantly increases your approval chances. All work and payment happens directly between you and the partner company."
        },
        {
          question: "Can I work on multiple projects at once?",
          answer: "Absolutely! Most of our successful professionals work across multiple partner projects simultaneously. This diversifies income, provides flexibility, and protects against fluctuations in any single project's availability. Our platform helps you manage multiple applications and track your opportunities. The average Remote-Works professional earns $4k+ monthly by strategically working across 2-4 projects."
        },
        {
          question: "What's the average income potential?",
          answer: "Our professionals earn an average of $4k+ monthly. Income varies based on the projects you choose, hours you work, and your expertise level. Some opportunities pay $10-$20/hour (data labeling, content moderation), while specialized roles pay $25-$45/hour (technical translation, linguistic annotation). Because we prepare you thoroughly, your approval rates are higher and you can access better-paying opportunities faster."
        },
        {
          question: "How quickly can I start earning?",
          answer: "Timeline breakdown: Profile Verification (24-48 hours) → Application Readiness training (immediate access after verification) → Apply to partner opportunities (same day) → Partner company review (1-2 weeks typically) → Start working (immediately upon partner approval). Most professionals start earning within 2-3 weeks of joining Remote-Works. Some partners have faster approval processes, while specialized roles may take longer but offer higher pay."
        }
      ]
    },
    {
      category: "The Three-Stage System",
      faqs: [
        {
          question: "What is Profile Verification?",
          answer: "Stage 1 of workforce readiness. Profile Verification confirms your identity, validates your skills, and ensures you meet basic requirements for remote work. This includes government ID verification, skill assessments relevant to your expertise, and eligibility checks for partner platforms. Verification typically takes 24-48 hours. This stage builds trust with partners and ensures only quality professionals access opportunities."
        },
        {
          question: "What is Application Readiness?",
          answer: "Stage 2 of workforce readiness. Application Readiness ensures you understand what partners expect and how to present yourself successfully. This includes training on common application requirements, guidance on showcasing relevant experience, tips for partner-specific expectations, and best practices for remote work applications. This preparation is why our professionals have a 98% success rate—they're ready before they apply."
        },
        {
          question: "What is Employer-Aligned Onboarding?",
          answer: "Stage 3 of workforce readiness. Employer-Aligned Onboarding means we help you understand each partner's specific culture, requirements, and success factors before you apply. This strategic positioning ensures you're not just qualified—you're aligned with what the partner values. This final stage of preparation accelerates hiring outcomes by reducing friction between professionals and partners."
        },
        {
          question: "Why do I need all three stages?",
          answer: "Because preparation creates results. Traditional job boards let anyone apply to anything, resulting in low success rates and wasted time. Our three-stage system ensures you're verified (trusted), ready (prepared), and aligned (positioned) before you apply. This is why Remote-Works professionals have a 98% success rate while typical job board success rates are under 10%. We reduce friction, increase trust, and accelerate outcomes for both you and our partners."
        }
      ]
    },
    {
      category: "Trust & Security",
      faqs: [
        {
          question: "How do I know Remote-Works is legitimate?",
          answer: "Transparency builds trust. Here's what makes us legitimate: (1) We never guarantee employment—only preparation and verified access. (2) We're free to use—no hidden fees or mandatory charges. (3) We work with established partner companies, not ourselves as employers. (4) Our verification process protects both professionals and partners. (5) We provide 24/7 support and maintain GDPR compliance. (6) We're honest about what we can and cannot do. Trust is earned through transparency and results."
        },
        {
          question: "Is my personal information secure?",
          answer: "Yes. We use enterprise-grade security including SSL encryption, secure databases, regular security audits, and GDPR compliance. Your verification data is stored securely and used only for platform access and partner matching. We never sell your data to third parties. All payment information (for optional services) is processed through trusted payment processors—we never store full credit card information. See our Privacy Policy and GDPR Compliance pages for complete details."
        },
        {
          question: "What if I have issues with a partner opportunity?",
          answer: "Contact our support team immediately at support@remote-works.io. While we don't control hiring decisions (those are made by partner companies), we can: help mediate communication issues, provide guidance on partner expectations, assist with application concerns, and ensure your platform experience is positive. Our 24/7 support team is here to help you succeed. We track partner feedback to maintain quality across our network."
        },
        {
          question: "How are partner companies vetted?",
          answer: "We only work with established, legitimate companies. Our partner vetting includes: verifying company legitimacy and reputation, confirming payment reliability and history, reviewing professional feedback and success rates, ensuring clear opportunity terms and expectations, and monitoring ongoing partner performance. We maintain relationships only with partners who meet our standards for professionalism and reliability."
        },
        {
          question: "What's your refund policy?",
          answer: "The platform is free, so no refunds are needed for core features. If you purchase optional career enhancement services (coaching, advanced profile optimization, etc.), refund policies are clearly stated before purchase. We stand behind our optional services—if you're not satisfied, contact support within 7 days for resolution. We believe in fair treatment and transparent policies."
        }
      ]
    },
    {
      category: "Success & Support",
      faqs: [
        {
          question: "What is your success rate?",
          answer: "Professionals who complete our three-stage readiness system have a 98% success rate in securing opportunities with partner companies. This high success rate is because we ensure you're verified, prepared, and aligned before you apply. Compare this to typical job board success rates of under 10%, and you'll see why workforce readiness matters more than job searching."
        },
        {
          question: "What if I'm not approved by a partner?",
          answer: "First, this is rare—our 98% success rate means most professionals are approved. If you're not approved: (1) Contact our support team for guidance. (2) We'll review your application and identify improvement areas. (3) You can reapply after addressing feedback. (4) You can apply to other partner opportunities—rejection from one doesn't affect others. (5) We'll provide additional Application Readiness coaching if needed. Our goal is your success."
        },
        {
          question: "How do I contact support?",
          answer: "We offer 24/7 support: Email us at support@remote-works.io for detailed inquiries (response within 24 hours). Visit our Support page for live chat during business hours (9 AM - 6 PM EST). Check our FAQ page (you're here!) for instant answers to common questions. All professionals receive the same high-quality support—no premium tiers, no gatekeeping. We're here to help you succeed."
        },
        {
          question: "Can I update my profile after verification?",
          answer: "Yes! You can update your profile, skills, and experience at any time. Minor updates (contact info, work history additions) don't require re-verification. Significant changes (new skills, different expertise areas, location changes) may require re-verification to ensure accuracy and maintain our 98% success rate. We want your profile to always represent your current capabilities."
        },
        {
          question: "What happens after I'm approved by a partner?",
          answer: "Once a partner approves you, you work directly with them. They'll provide onboarding, project assignments, payment processing, and ongoing support. Remote-Works remains available if you have questions or concerns, but the day-to-day working relationship is between you and the partner. Most partners provide clear guidelines, regular communication, and reliable payment schedules. You can continue accessing new opportunities through Remote-Works while working with current partners."
        }
      ]
    },
    {
      category: "Optional Services",
      faqs: [
        {
          question: "What optional services are available?",
          answer: "While the platform is free, we offer optional career enhancement services if you want extra support: Advanced Profile Optimization (expert review and enhancement of your profile), One-on-One Coaching (personalized career guidance and strategy), Application Review (detailed feedback on specific applications), and Skill Development Resources (courses and materials for in-demand skills). These are completely optional—many professionals succeed without them. We offer them for those who want additional support."
        },
        {
          question: "Do I need to purchase services to access opportunities?",
          answer: "No. Let's be crystal clear: accessing opportunities is free. Application Readiness training is free. Profile Verification is free. Partner opportunities are free to apply to. Optional services are exactly that—optional extras for professionals who want additional personalized support. Many of our successful, $4k+/month professionals never purchase optional services. They're available if you want them, not required for success."
        },
        {
          question: "How do I know if optional services are right for me?",
          answer: "Honest answer: most professionals don't need them. Our free Application Readiness training and Profile Verification prepare you thoroughly. Consider optional services if: you're entering a highly specialized field and want expert guidance, you're having trouble getting approved and want personalized feedback, you want to maximize your income strategy across multiple partners, or you simply prefer one-on-one support. Our support team can help you decide—we won't upsell you on services you don't need."
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
        <meta name="description" content="Get answers about Remote-Works' professional talent platform, our three-stage workforce readiness system (Profile Verification, Application Readiness, Employer-Aligned Onboarding), partner opportunities, security, and how we help verified professionals connect with high-quality remote opportunities worldwide." />
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
