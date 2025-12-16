import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  ExternalLink
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
    category: "Company Information",
    keywords: ["company", "address", "location", "where located", "office", "contact", "email", "phone", "reach", "headquarters", "based"],
    faqs: [
      {
        question: "Where is Remote-Works located?",
        answer: "Remote-Works is located at:\n📍 5 Buttermill Ave, L4K 0J5, CA\n✉️ support@remote-works.io\n\nWe're a Canadian company serving clients worldwide. Our team is available 24/7 to support our global community of candidates and agents."
      },
      {
        question: "How can I contact Remote-Works?",
        answer: "You can reach us through:\n\n✉️ Email: support@remote-works.io\n📍 Address: 5 Buttermill Ave, L4K 0J5, CA\n💬 Live Chat: Available 24/7 through this chat\n🌐 Support Page: Visit /support for more options\n📝 Contact Form: Available on our website\n\nWe typically respond within 24 hours!"
      },
      {
        question: "What are your business hours?",
        answer: "We offer 24/7 support! Our AI assistant (that's me!) is always available to help. Human support agents are available during extended hours to serve our global community. Email support@remote-works.io anytime and we'll respond within 24 hours."
      }
    ]
  },
  {
    category: "Website Pages & Navigation",
    keywords: ["page", "where find", "navigate", "trust", "gdpr", "privacy", "transparency", "about", "faq", "terms"],
    faqs: [
      {
        question: "What is the Trust & Transparency page?",
        answer: "Our Trust & Transparency page (/trust-transparency) covers:\n\n🛡️ What We Stand For - Our core values\n✅ Our Promise - Our commitments to you\n⚠️ Scam Detection - How to spot and avoid scams\n🔍 Verification Process - How we verify agents\n🔒 Safety Features - Built-in protection measures\n\nThis page shows our commitment to maintaining a safe, trustworthy platform for everyone."
      },
      {
        question: "What is GDPR compliance?",
        answer: "Our GDPR Compliance page (/gdpr-compliance) explains:\n\n📋 Your Data Rights - Access, rectification, erasure, etc.\n🔐 Data Protection - How we secure your information\n📊 What We Collect - Complete transparency on data collection\n⏰ Data Retention - How long we keep your data\n🌍 International Transfers - Cross-border data handling\n✉️ DPO Contact: dpo@remote-works.io\n\nWe're fully committed to protecting your privacy and complying with GDPR regulations."
      },
      {
        question: "Where can I find information about company policies?",
        answer: "Important pages:\n\n🔒 Privacy Policy - /privacy\n📜 Terms of Service - /terms\n🛡️ Trust & Transparency - /trust-transparency\n🇪🇺 GDPR Compliance - /gdpr-compliance\n📖 Code of Conduct - /code-of-conduct\n❓ FAQ - /faq\n📞 Support - /support\n\nAll policies are easily accessible from our footer menu!"
      }
    ]
  },
  {
    category: "Getting Started",
    keywords: ["what is", "sign up", "join", "fee", "approval", "start", "begin", "how to", "register"],
    faqs: [
      {
        question: "What is Remote-Works?",
        answer: "Remote-Works is a marketplace that connects candidates with verified agents who help them get approved for projects on platforms like Outlier, Alignerr, OneForma, Appen, RWS, Mindrift, TELUS Digital, Scale AI, Handshake AI, Lionbridge, Mercor, and 20+ more platforms. Our agents have proven track records (98% success rate) and provide personalized guidance to maximize your approval chances."
      },
      {
        question: "How do I sign up?",
        answer: "Click 'Get Started' on our homepage and choose whether you want to sign up as a candidate or agent. Fill out your profile information and wait for admin approval (usually 24-48 hours). Once approved, candidates can browse agents and agents can start accepting clients."
      },
      {
        question: "Is there a fee to join?",
        answer: "Signing up is completely free for both candidates and agents. It's 100% free to use - no subscription fees, no hidden charges. Candidates only pay agents for services after receiving results or approval. Connect with agents and only pay for services you need!"
      },
      {
        question: "How long does admin approval take?",
        answer: "Admin approval typically takes 24-48 hours. We review each profile to ensure quality and authenticity. You'll receive an email notification once your account is approved."
      }
    ]
  },
  {
    category: "For Candidates",
    keywords: ["agent", "charge", "fee", "cost", "price", "success", "approval", "candidate", "hire"],
    faqs: [
      {
        question: "How do agents work with candidates?",
        answer: "Agents offer flexible arrangements based on your needs:\n\n💼 Different Models Available:\n• Free assistance (some agents help at no charge)\n• Revenue sharing (percentage of your earnings)\n• One-time service fee (varies by agent and platform)\n\nEach agent's profile clearly shows their preferred working model and terms. Browse profiles to find an arrangement that works best for you!"
      },
      {
        question: "What's the success rate?",
        answer: "Our verified agents have a 98% success rate in getting candidates approved. We only work with agents who have proven track records and consistently deliver results."
      },
      {
        question: "How do I choose an agent?",
        answer: "Browse agent profiles to see their specializations, success rates, reviews, and working models. Look for agents who specialize in the platforms you're interested in and have high ratings from previous clients. Each agent clearly lists their terms and preferred arrangement."
      }
    ]
  },
  {
    category: "Payments & Security",
    keywords: ["payment", "pay", "refund", "secure", "security", "data", "privacy", "arrangement", "terms"],
    faqs: [
      {
        question: "How does payment work?",
        answer: "Payment arrangements are flexible and depend on the agent you choose:\n\n💰 Common Models:\n• Free service - Some agents help without charge\n• Revenue share - Agent gets percentage of your earnings\n• One-time fee - Pay once for the service\n\nAll arrangements are clearly stated in the agent's profile before you connect. We ensure transparency in all agreements between candidates and agents."
      },
      {
        question: "Is my payment information secure?",
        answer: "Yes! We use industry-standard encryption and work with trusted payment processors. We never store your full payment information on our servers. All transactions are secured with the highest level of protection."
      },
      {
        question: "What if there's a dispute?",
        answer: "Our support team mediates any disputes fairly. We review the agreed terms between you and the agent, and work to resolve issues quickly. If necessary, we can take action to protect both parties and ensure fair treatment."
      }
    ]
  },
  {
    category: "Platform Features",
    keywords: ["message", "review", "dispute", "support", "contact", "help", "profile", "update"],
    faqs: [
      {
        question: "Can I message agents before hiring?",
        answer: "Yes! You can message agents to ask questions and discuss your situation before making a commitment. This helps ensure you find the right fit."
      },
      {
        question: "Is there customer support?",
        answer: "Yes! We offer 24/7 email support and live chat during business hours (9 AM - 6 PM EST). Premium users get priority support with faster response times."
      },
      {
        question: "What if I have a dispute with an agent?",
        answer: "Contact our support team immediately. We'll mediate the dispute and, if necessary, issue refunds or take action against agents who violate our terms of service."
      }
    ]
  },
  {
    category: "Supported Platforms",
    keywords: ["platform", "outlier", "alignerr", "oneforma", "appen", "rws", "mindrift", "telus", "scale", "google", "paypal", "handshake", "lionbridge", "mercor", "support", "which platforms"],
    faqs: [
      {
        question: "Which platforms do you support?",
        answer: "We support 20+ leading AI training and remote work platforms including:\n\n🔷 TELUS Digital - AI training & data collection\n🔷 OneForma - Data annotation & AI training\n🔷 Google - AI & ML projects\n🔷 Scale AI - Data labeling & AI training\n🔷 Outlier AI - AI training & feedback\n🔷 Appen - Data collection & annotation\n🔷 Alignerr - AI model alignment\n🔷 Handshake AI - Career platform integration\n🔷 Mindrift - AI training platform\n🔷 Lionbridge - Translation & AI training\n🔷 Mercor - Tech talent marketplace\n\nAnd many more! New platforms are added regularly based on demand from our community."
      },
      {
        question: "Can agents help with multiple platforms?",
        answer: "Yes! Many agents specialize in multiple platforms. Check their profile to see which services they offer. Our verified agents have proven track records across various platforms with a 98% success rate!"
      },
      {
        question: "What is your success rate?",
        answer: "We maintain an impressive 98% success rate! Our verified agents have helped thousands of candidates get approved on their desired platforms. This high success rate comes from:\n\n✅ Thoroughly vetted agents\n✅ Proven strategies and guidance\n✅ Platform-specific expertise\n✅ Continuous quality monitoring\n✅ Personalized support throughout the process"
      }
    ]
  },
  {
    category: "Trust & Security",
    keywords: ["trust", "safe", "security", "scam", "fraud", "verify", "verified", "legitimate", "real", "authentic", "protect", "protection"],
    faqs: [
      {
        question: "How do you verify agents?",
        answer: "Our rigorous 4-step verification process includes:\n\n1️⃣ Identity Verification - Government-issued ID and proof of address\n2️⃣ Track Record Check - Review history of successful placements\n3️⃣ Background Screening - Comprehensive credibility checks\n4️⃣ Continuous Monitoring - Ongoing performance and feedback tracking\n\nOnly agents who pass all checks get the verified badge and can work with candidates!"
      },
      {
        question: "How do I avoid scams?",
        answer: "Watch out for these red flags:\n\n🚫 Large upfront payments without guarantees\n🚫 Unrealistic promises or guaranteed approval\n🚫 Requests to communicate off-platform\n🚫 Pressure tactics or false urgency\n🚫 Requests for login credentials\n🚫 Unverified agents (no verified badge)\n\nAlways:\n✅ Use our secure messaging system\n✅ Work only with verified agents\n✅ Report suspicious activity immediately\n✅ Read agent reviews and ratings\n\nYour safety is our priority!"
      },
      {
        question: "What safety features do you have?",
        answer: "We provide multiple layers of protection:\n\n🔔 Real-Time Alerts - Suspicious activity notifications\n✅ Verified Badges - Easy identification of trusted agents\n🔒 Encrypted Messages - End-to-end encryption\n📋 Transaction Records - Complete audit trail\n🛡️ Secure Payments - Industry-standard encryption\n👁️ 24/7 Monitoring - Continuous platform surveillance\n⚖️ Dispute Resolution - Fair mediation process\n\nVisit our Trust & Transparency page for more details!"
      },
      {
        question: "Is my data protected?",
        answer: "Absolutely! We take data protection seriously:\n\n🔐 End-to-end encryption for all sensitive data\n🏢 Secure, certified data centers with 24/7 monitoring\n🔑 Strict access controls - need-to-know basis only\n🔍 Regular security audits and penetration testing\n📊 GDPR compliant - full transparency on data use\n⏰ Clear data retention policies\n🚫 We NEVER sell your data to third parties\n\nContact our DPO at dpo@remote-works.io for data privacy questions!"
      }
    ]
  },
  {
    category: "Platform Features & Statistics",
    keywords: ["feature", "statistics", "stats", "how many", "users", "monthly income", "average", "earnings", "platforms", "support hours"],
    faqs: [
      {
        question: "What are Remote-Works key features?",
        answer: "Our platform offers:\n\n✅ Verified Agents - Thoroughly vetted professionals\n🔒 Secure Platform - Flexible payment arrangements (free, revenue share, or one-time)\n💬 Direct Communication - Message agents directly\n📈 High Success Rate - 98% approval success rate\n⏱️ Fast Approval - Matched within 24 hours\n🎁 100% Free to Use - No subscription or hidden fees\n🌍 20+ Platforms - Wide range of opportunities\n💰 $3k+ Average Monthly Income\n🎯 24/7 Support - Always here to help\n\nStart your journey to remote work success today!"
      },
      {
        question: "What are your platform statistics?",
        answer: "Here are our impressive numbers:\n\n📊 98% Success Rate - Industry-leading approval rate\n🌐 20+ Platforms Supported - And growing!\n💰 $3k+ Average Monthly Income for candidates\n⏰ 24/7 Support - Round-the-clock assistance\n👥 5,000+ Active Users worldwide\n⚡ 24 Hours - Average agent matching time\n🌍 Global Reach - Serving clients worldwide\n✨ 100% Free - No subscription fees\n\nJoin thousands of successful remote workers!"
      },
      {
        question: "What is the average monthly income?",
        answer: "Our candidates earn an average of $3,000+ per month! This varies based on:\n\n• Platform(s) you work with\n• Hours committed per week\n• Skill level and experience\n• Project availability\n• Geographic location\n\nMany candidates work with multiple platforms simultaneously to maximize their earnings. Our verified agents help you get approved faster so you can start earning sooner!"
      }
    ]
  },
  {
    category: "Core Values & Mission",
    keywords: ["value", "mission", "stand for", "believe", "principle", "integrity", "community", "fair"],
    faqs: [
      {
        question: "What does Remote-Works stand for?",
        answer: "Our core values guide everything we do:\n\n❤️ Integrity First - Honesty and transparency in every interaction\n👥 Community Focus - Your success is our success\n⚖️ Fair & Equal - Equal opportunity for everyone\n💡 Innovation - Continuous improvement using latest technology\n\nWe're committed to building a safe, transparent, and trustworthy platform where candidates and agents can succeed together!"
      },
      {
        question: "What is your promise to users?",
        answer: "We promise:\n\n✅ 100% Verified Agents - Rigorous verification process\n🔒 Secure Payments - Encrypted, fraud-protected transactions\n👁️ Complete Transparency - No hidden fees or surprises\n📞 24/7 Support - Always available when you need us\n🛡️ Data Protection - Your information is safe with us\n⭐ Quality Assurance - High standards maintained through monitoring\n\nYour trust is earned through our actions, not just words!"
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
      return "Hello! 👋 I'm Rework AI, your personal assistant.\n\nI'm here to help you find any information about Remote-Works. I can scan our entire website to give you accurate answers about our company, services, policies, and more.\n\nWhat would you like to know?";
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
        addMessage(
          "I don't have a specific answer for that question, but I'd be happy to connect you with our support team who can help! Would you like to:",
          true,
          [
            {
              label: "Contact Support",
              action: () => handleEscalateToHuman()
            },
            {
              label: "View FAQ",
              action: () => router.push('/faq')
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
      "Great! Here are some topics I can help you with:\n\n• Getting started with Remote-Works\n• Agent fees and pricing\n• Payment and security\n• Platform features\n• Supported platforms\n\nWhat would you like to know?",
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
          "Hi there! 👋 I'm Rework AI, your personal assistant.\n\nI'm here to help you with anything about Remote-Works - whether it's finding information, navigating the site, or answering your questions.\n\nWhat can I help you with today?",
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
        aria-label="Open Rework AI Chat"
      >
        <div className="relative">
          <MessageSquare className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        </div>
        <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-black text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <Sparkles className="w-4 h-4 inline mr-1" />
          Chat with Rework AI
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
          <Bot className="w-5 h-5" />
          <span className="font-semibold">Rework AI</span>
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
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-black" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <h3 className="font-bold text-lg flex items-center">
                Rework AI
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
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.isBot ? 'bg-black text-white' : 'bg-gray-300 text-gray-700'}`}>
                        {message.isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
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
                Powered by Rework AI • 24/7 Support
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
