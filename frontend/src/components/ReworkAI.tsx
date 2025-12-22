import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  MessageSquare,
  X,
  Send,
  User,
  Minimize2,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  UserCircle
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  quickActions?: QuickAction[];
}

interface QuickAction {
  label: string;
  action: () => void;
}

const FAQ_DATA = [
  {
    category: "About Remote-Works",
    keywords: ["what is", "remote-works", "different", "workforce readiness", "job board", "guarantee employment", "platform", "about"],
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
    keywords: ["get started", "start", "begin", "sign up", "join", "cost", "fee", "free", "verification", "verified", "how to"],
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
    keywords: ["opportunities", "partner", "projects", "types", "income", "earning", "salary", "pay", "work", "multiple", "how much", "average"],
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
    keywords: ["three-stage", "stages", "profile verification", "application readiness", "employer-aligned onboarding", "onboarding", "system", "process"],
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
    keywords: ["trust", "security", "legitimate", "safe", "secure", "data", "privacy", "scam", "fraud", "gdpr", "protection", "partner vetting", "refund"],
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
    keywords: ["success rate", "support", "contact", "help", "approved", "not approved", "update profile", "after approval", "98%"],
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
        answer: "We offer 24/7 support: Email us at support@remote-works.io for detailed inquiries (response within 24 hours). Visit our Support page for live chat during business hours (9 AM - 6 PM EST). Check our FAQ page for instant answers to common questions. All professionals receive the same high-quality support—no premium tiers, no gatekeeping. We're here to help you succeed."
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
    keywords: ["optional services", "coaching", "profile optimization", "services", "purchase", "buy", "paid", "need to buy"],
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
  },
  {
    category: "Company Information",
    keywords: ["company", "address", "location", "where located", "office", "contact", "email", "phone", "reach", "headquarters", "based", "social media", "twitter", "blog", "trustpilot"],
    faqs: [
      {
        question: "Where is Remote-Works located?",
        answer: "Remote-Works is located at:\n📍 Concord, CA\n✉️ support@remote-works.io\n\nWe're a professional talent platform serving clients worldwide. Our team is available 24/7 to support our global community of professionals."
      },
      {
        question: "How can I contact Remote-Works?",
        answer: "You can reach us through:\n\n✉️ Email: support@remote-works.io\n📍 Address: Concord, CA\n💬 Live Chat: Available 24/7 through this chat\n🌐 Support Page: Visit /support for more options\n\nWe typically respond within 24 hours!"
      },
      {
        question: "What are your social media channels?",
        answer: "Follow us on:\n\n📝 Blog: https://ai.remote-works.io/\n🐦 Twitter/X: https://x.com/remote_worksio\n⭐ Trustpilot: https://ca.trustpilot.com/review/remote-works.io\n\nStay updated with the latest news, tips, and opportunities!"
      }
    ]
  }
];

export default function ReworkAI() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadData, setLeadData] = useState({ name: '', email: '', message: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // CRITICAL FIX: All hooks MUST be called before any conditional returns
  // This fixes React error #300 during page navigation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Hide ReworkAI on all authenticated/logged-in pages
  const hideOnPages = [
    '/candidate-dashboard',
    '/agent-dashboard',
    '/profile-settings',
    '/dashboard',
    '/admin',
    '/candidate-projects',
    '/candidate-info',
    '/agent-connections',
    '/agent-info',
    '/agent-screen',
    '/candidate-screen',
    '/company-dashboard',
    '/create-project',
    '/sandboxes',
    '/sandbox/',
    '/candidate-projects-new',
  ];

  const currentPath = router.pathname;
  const shouldHide = hideOnPages.some(page => currentPath.startsWith(page));

  // Don't render if on profile/dashboard pages
  if (shouldHide) {
    return null;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const findBestAnswer = (query: string): string | null => {
    const lowerQuery = query.toLowerCase();

    // Varied introduction phrases for natural conversation
    const scanningPhrases = [
      "Let me look that up for you...\n\n",
      "I'll search our website for that information...\n\n",
      "Let me find that information...\n\n",
      "Searching our database...\n\n",
      "Looking into that for you...\n\n",
      "I found this on our site:\n\n",
      "Here's what I discovered:\n\n",
      "Based on our website information:\n\n"
    ];

    const getRandomPhrase = () => scanningPhrases[Math.floor(Math.random() * scanningPhrases.length)];

    // Check for greetings
    if (lowerQuery.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/)) {
      return "Hello! 👋 I'm Hannah, your Remote-Works assistant.\n\nI'm here to help you learn about our workforce readiness platform, our three-stage system (Profile Verification, Application Readiness, and Employer-Aligned Onboarding), partner opportunities, and how we help professionals succeed with a 98% success rate.\n\nWhat would you like to know?";
    }

    // Check for navigation requests
    if (lowerQuery.includes('navigate') || lowerQuery.includes('go to') || lowerQuery.includes('find page')) {
      return "I can help you navigate to different pages:\n\n🏠 Home - /\n👥 Browse Agents - /browse-agents\n❓ FAQ - /faq\n📖 About Us - /about\n🛡️ Trust & Transparency - /trust-transparency\n🇪🇺 GDPR Compliance - /gdpr-compliance\n📞 Support - /support\n📝 Sign Up - /register\n🔑 Login - /login\n📜 Terms of Service - /terms\n🔒 Privacy Policy - /privacy\n\nWhich page would you like to visit?";
    }

    // Check for social media requests
    if (lowerQuery.includes('social') || lowerQuery.includes('twitter') || lowerQuery.includes('blog') || lowerQuery.includes('trustpilot') || lowerQuery.includes('follow')) {
      return `${getRandomPhrase()}Our social media presence:\n\n📝 Blog: https://ai.remote-works.io/\n🐦 Twitter/X: https://x.com/remote_worksio\n⭐ Trustpilot: https://ca.trustpilot.com/review/remote-works.io\n\nYou can follow us on any of these platforms to stay updated with the latest news, tips, and opportunities!`
    }

    // Enhanced scanning mechanism - Search through all categories with better scoring
    let bestMatch: { answer: string; score: number; category: string } | null = null;

    for (const category of FAQ_DATA) {
      // Check if query matches category keywords
      const categoryKeywordMatches = category.keywords.filter(keyword =>
        lowerQuery.includes(keyword)
      ).length;

      if (categoryKeywordMatches > 0) {
        // Scan through FAQs in this category
        for (const faq of category.faqs) {
          const questionLower = faq.question.toLowerCase();
          const questionWords = questionLower.split(' ').filter(w => w.length > 2);
          const queryWords = lowerQuery.split(' ').filter(w => w.length > 2);

          // Calculate comprehensive match score
          let score = 0;

          // Exact question match (highest priority)
          if (lowerQuery === questionLower || questionLower.includes(lowerQuery) || lowerQuery.includes(questionLower)) {
            score += 1000;
          }

          // Word matching score
          const matchingWords = queryWords.filter(word =>
            questionWords.some(qWord => qWord.includes(word) || word.includes(qWord))
          );
          score += matchingWords.length * 10;

          // Keyword match bonus
          score += categoryKeywordMatches * 5;

          // Answer content relevance (check if answer contains query words)
          const answerLower = faq.answer.toLowerCase();
          const answerMatches = queryWords.filter(word =>
            answerLower.includes(word)
          ).length;
          score += answerMatches * 3;

          if (score > 0 && (!bestMatch || score > bestMatch.score)) {
            bestMatch = {
              answer: faq.answer,
              score,
              category: category.category
            };
          }
        }
      }
    }

    if (bestMatch) {
      // Use varied introduction based on category for more natural responses
      let intro = getRandomPhrase();

      // Customize intro based on category for better context
      if (bestMatch.category === "Company Information") {
        intro = "I found our company information:\n\n";
      } else if (bestMatch.category === "Supported Platforms") {
        intro = "Here's our platform information:\n\n";
      } else if (bestMatch.category === "Trust & Security") {
        intro = "Here's how we ensure your safety:\n\n";
      } else if (bestMatch.category === "Platform Features & Statistics") {
        intro = "Here are our key stats and features:\n\n";
      }

      return `${intro}${bestMatch.answer}`;
    }

    // Fallback: try partial category match with better context
    for (const category of FAQ_DATA) {
      const categoryMatch = category.keywords.some(keyword =>
        lowerQuery.includes(keyword)
      );

      if (categoryMatch && category.faqs.length > 0) {
        return `${getRandomPhrase()}I found information about ${category.category.toLowerCase()}:\n\n${category.faqs[0].answer}\n\nWould you like to know something more specific?`;
      }
    }

    return null;
  };

  const addMessage = (text: string, isBot: boolean, quickActions?: QuickAction[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot,
      timestamp: new Date(),
      quickActions
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    addMessage(userMessage, false);
    setInputValue('');

    // Simulate typing delay
    setTimeout(() => {
      const answer = findBestAnswer(userMessage);

      if (answer) {
        addMessage(answer, true, [
          {
            label: "Talk to Human",
            action: () => handleEscalateToHuman()
          },
          {
            label: "More Questions",
            action: () => handleMoreQuestions()
          }
        ]);
      } else {
        // Site-aligned response for outside questions
        const outOfScopeResponse = `I appreciate your question! While I'm specifically designed to help with information about Remote-Works' workforce readiness platform, I want to make sure you get the best answer.

Here's what I can help with:
• Our three-stage system (Profile Verification, Application Readiness, Employer-Aligned Onboarding)
• Partner opportunities and income potential ($4k+ monthly average)
• How our 98% success rate works
• Platform security and trust
• Getting started and verification process
• Optional services and support

For questions outside these areas, our human support team is available 24/7 and would love to help! They can provide personalized assistance for your specific situation.

Would you like to:`;

        addMessage(
          outOfScopeResponse,
          true,
          [
            {
              label: "Contact Support Team",
              action: () => handleEscalateToHuman()
            },
            {
              label: "View Full FAQ",
              action: () => router.push('/faq')
            },
            {
              label: "Ask About Remote-Works",
              action: () => handleMoreQuestions()
            },
            {
              label: "Leave a Message",
              action: () => setShowLeadForm(true)
            }
          ]
        );
      }
    }, 800);
  };

  const handleEscalateToHuman = () => {
    addMessage("I'd like to speak with a human support agent", false);
    setTimeout(() => {
      addMessage(
        "I'll connect you with our support team right away! You can reach them through:",
        true,
        [
          {
            label: "Go to Support Page",
            action: () => router.push('/support')
          },
          {
            label: "Leave a Message",
            action: () => setShowLeadForm(true)
          }
        ]
      );
    }, 500);
  };

  const handleMoreQuestions = () => {
    addMessage(
      "Perfect! Here are some topics I can help you with:\n\n• What is Remote-Works and how we're different\n• Our three-stage workforce readiness system\n• Partner opportunities and income potential\n• Getting started and verification process\n• Success rates and support\n• Trust, security, and GDPR compliance\n• Optional services (completely optional!)\n\nWhat would you like to know?",
      true
    );
  };

  const handleQuickAction = (label: string) => {
    if (label.toLowerCase().includes('started')) {
      addMessage("How do I get started?", false);
      setTimeout(() => {
        const answer = findBestAnswer("how do i sign up");
        if (answer) {
          addMessage(answer, true, [
            {
              label: "Sign Up Now",
              action: () => router.push('/register')
            },
            {
              label: "Learn More",
              action: () => router.push('/about')
            }
          ]);
        }
      }, 800);
    } else if (label.toLowerCase().includes('pricing')) {
      addMessage("How much does it cost?", false);
      setTimeout(() => {
        const answer = findBestAnswer("how much do agents charge");
        if (answer) {
          addMessage(answer, true);
        }
      }, 800);
    } else if (label.toLowerCase().includes('agents')) {
      addMessage("How do I find agents?", false);
      setTimeout(() => {
        addMessage(
          "You can browse our verified agents who specialize in different platforms. Each agent's profile shows their success rate, reviews, and pricing. Ready to explore?",
          true,
          [
            {
              label: "Browse Agents",
              action: () => router.push('/browse-agents')
            },
            {
              label: "Sign Up First",
              action: () => router.push('/register')
            }
          ]
        );
      }, 800);
    } else if (label.toLowerCase().includes('support')) {
      handleEscalateToHuman();
    }
  };

  const handleSubmitLead = () => {
    if (!leadData.name || !leadData.email || !leadData.message) {
      alert('Please fill in all fields');
      return;
    }

    // Here you would typically send this to your backend
    console.log('Lead submitted:', leadData);

    setShowLeadForm(false);
    addMessage(
      `Thank you, ${leadData.name}! 🎉\n\nWe've received your message and our support team will get back to you at ${leadData.email} within 24 hours. We appreciate your patience!`,
      true
    );
    setLeadData({ name: '', email: '', message: '' });
  };

  const openChat = () => {
    setIsOpen(true);
    setIsMinimized(false);

    if (messages.length === 0) {
      setTimeout(() => {
        addMessage(
          "Hi there! 👋 I'm Hannah, your Remote-Works assistant.\n\nI'm here to help you understand our workforce readiness platform, learn about our three-stage system, explore partner opportunities, and answer any questions you have about Remote-Works.\n\nWhat can I help you with today?",
          true,
          []
        );

        // Add quick action buttons after initial message
        setTimeout(() => {
          addMessage(
            "Here are some ways I can assist you:",
            true,
            [
              {
                label: "Help me get started",
                action: () => handleQuickAction("Get Started")
              },
              {
                label: "Tell me about pricing",
                action: () => handleQuickAction("Pricing")
              },
              {
                label: "Find me an agent",
                action: () => handleQuickAction("Find Agents")
              },
              {
                label: "Talk to a human",
                action: () => handleQuickAction("Contact Support")
              }
            ]
          );
        }, 1000);
      }, 500);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={openChat}
        className="fixed bottom-6 right-6 z-50 bg-black text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-all duration-300 group animate-bounce-subtle"
        aria-label="Open Hannah Chat"
      >
        <div className="relative">
          <MessageSquare className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        </div>
        <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-black text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <Sparkles className="w-4 h-4 inline mr-1" />
          Chat with Hannah
        </div>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-black text-white rounded-full px-6 py-3 shadow-2xl hover:scale-105 transition-all duration-200 flex items-center space-x-2"
        >
          <UserCircle className="w-5 h-5" />
          <span className="font-semibold">Hannah</span>
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] animate-fade-in-scale">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[600px] max-h-[calc(100vh-3rem)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-black to-gray-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <UserCircle className="w-7 h-7 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <h3 className="font-bold text-lg flex items-center">
                Hannah
                <Sparkles className="w-4 h-4 ml-2" />
              </h3>
              <p className="text-xs text-gray-300">Online • Typically replies instantly</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Minimize chat"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        {!showLeadForm ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                    <div className={`flex items-start space-x-2 max-w-[80%] ${message.isBot ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.isBot ? 'bg-gradient-to-br from-purple-400 to-pink-400 text-white' : 'bg-gray-300 text-gray-700'}`}>
                        {message.isBot ? <UserCircle className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div className={`rounded-2xl px-4 py-3 ${message.isBot ? 'bg-white border border-gray-200' : 'bg-black text-white'}`}>
                        <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                      </div>
                    </div>
                  </div>
                  {message.quickActions && message.quickActions.length > 0 && (
                    <div className="flex flex-wrap gap-2 ml-10">
                      {message.quickActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={action.action}
                          className="px-4 py-2 bg-white border-2 border-black text-black rounded-full text-sm font-medium hover:bg-black hover:text-white transition-all duration-200"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-black transition-colors text-sm"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="bg-black text-white p-3 rounded-full hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
              <p className="text-xs text-gray-500 text-center mt-2">
                Powered by Hannah • 24/7 Support
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Lead Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              <div className="text-center mb-6">
                <Mail className="w-12 h-12 mx-auto mb-3 text-black" />
                <h4 className="font-bold text-xl text-gray-900">Leave us a message</h4>
                <p className="text-sm text-gray-600 mt-2">
                  We'll get back to you within 24 hours
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={leadData.name}
                    onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={leadData.email}
                    onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message *
                  </label>
                  <textarea
                    value={leadData.message}
                    onChange={(e) => setLeadData({ ...leadData, message: e.target.value })}
                    placeholder="How can we help you?"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-4 bg-white space-y-2">
              <button
                onClick={handleSubmitLead}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Send Message
              </button>
              <button
                onClick={() => setShowLeadForm(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Back to Chat
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
