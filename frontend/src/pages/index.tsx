import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowRight, CheckCircle, Users, Briefcase, Shield,
  Zap, Clock, Star, MessageSquare, Award, TrendingUp,
  BadgeCheck, UserCheck, Building2, Sparkles, Compass,
  Target, Search, FileCheck, Menu, X, Rocket, Mail, Send, Loader,
  Home as HomeIcon, Coffee, Wifi, Monitor, Bot, Headphones, Layers, DollarSign,
  Laptop, Globe, Code, Lightbulb, Database, Server, Smartphone, ChevronLeft, ChevronRight,
  Heart, Flag, Workflow, Network
} from 'lucide-react';
import Head from 'next/head';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [missionVisible, setMissionVisible] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const missionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Stats counting animation
  const [platformsCount, setPlatformsCount] = useState(0);
  const [avgIncome, setAvgIncome] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const [supportHours, setSupportHours] = useState(0);
  const statsAnimatedRef = useRef(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // Stats slider with typewriter effect
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const [typewriterText, setTypewriterText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [displayNumber, setDisplayNumber] = useState(0);

  // Hero image slider
  const [currentHeroImage, setCurrentHeroImage] = useState(0);

  // Hero subheadline typewriter effect
  const [heroTypewriterText, setHeroTypewriterText] = useState('');
  const [heroIsTyping, setHeroIsTyping] = useState(true);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Hero subheadline typewriter animation
  useEffect(() => {
    const fullText = "Connect with legitimate opportunities from leading global organizations through our verified platform";
    let currentIndex = 0;
    let isDeleting = false;
    let typingSpeed = 50; // Speed of typing in ms

    const type = () => {
      if (!isDeleting && currentIndex <= fullText.length) {
        // Typing forward
        setHeroTypewriterText(fullText.substring(0, currentIndex));
        currentIndex++;
        setHeroIsTyping(true);

        if (currentIndex > fullText.length) {
          // Pause at the end before deleting
          setTimeout(() => {
            isDeleting = true;
            setTimeout(type, typingSpeed);
          }, 2000); // Pause for 2 seconds
          return;
        }

        setTimeout(type, typingSpeed);
      } else if (isDeleting && currentIndex >= 0) {
        // Deleting backward
        setHeroTypewriterText(fullText.substring(0, currentIndex));
        currentIndex--;
        setHeroIsTyping(true);

        if (currentIndex < 0) {
          // Pause before restarting
          setTimeout(() => {
            isDeleting = false;
            currentIndex = 0;
            setTimeout(type, typingSpeed);
          }, 500); // Short pause before retyping
          return;
        }

        setTimeout(type, typingSpeed / 2); // Delete faster than typing
      }
    };

    const timeoutId = setTimeout(type, 1000); // Start after 1 second

    return () => clearTimeout(timeoutId);
  }, []);

  // Ensure video plays continuously with improved reliability
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let playAttempts = 0;
    const maxPlayAttempts = 5;

    // Aggressive play function with retry logic
    const playVideo = async () => {
      if (playAttempts >= maxPlayAttempts) return;
      playAttempts++;

      try {
        // Force unmute to ensure it's truly muted (required for autoplay)
        video.muted = true;
        video.volume = 0;

        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
          setVideoLoaded(true);
          console.log('Video playing successfully');
        }
      } catch (error) {
        console.log(`Video play attempt ${playAttempts} failed:`, error);

        // Retry after a short delay
        if (playAttempts < maxPlayAttempts) {
          setTimeout(() => playVideo(), 500);
        }
      }
    };

    // Force load the video
    video.load();

    // Multiple event listeners to catch different ready states
    const handleCanPlay = () => {
      console.log('Video can play - attempting playback');
      playVideo();
    };

    const handleLoadedData = () => {
      console.log('Video loaded data - attempting playback');
      playVideo();
    };

    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded');
      // Try to play even at this early stage
      if (video.readyState >= 2) {
        playVideo();
      }
    };

    // Ensure video restarts if loop fails
    const handleEnded = () => {
      video.currentTime = 0;
      playVideo();
    };

    // Prevent video from pausing
    const handlePause = () => {
      if (!video.ended) {
        playVideo();
      }
    };

    // Handle visibility change - resume video when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && video.paused && video.readyState >= 2) {
        playVideo();
      }
    };

    // Attach all event listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('pause', handlePause);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Immediate play attempt if video is already ready
    if (video.readyState >= 2) {
      playVideo();
    }

    // Periodic check to ensure video is playing (backup mechanism)
    const playbackCheck = setInterval(() => {
      if (video.paused && !video.ended && video.readyState >= 2) {
        playVideo();
      }
    }, 2000);

    // Cleanup
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('pause', handlePause);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(playbackCheck);
    };
  }, []);

  // Auto-play testimonials slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev === 5 ? 0 : prev + 1)); // 6 testimonials (0-5)
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-play hero image slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev === 2 ? 0 : prev + 1)); // 3 images (0-2)
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for mission section animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMissionVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (missionRef.current) {
      observer.observe(missionRef.current);
    }

    return () => {
      if (missionRef.current) {
        observer.unobserve(missionRef.current);
      }
    };
  }, []);

  // Intersection Observer for stats counting animation
  useEffect(() => {
    let intervals: NodeJS.Timeout[] = [];

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsAnimatedRef.current) {
          statsAnimatedRef.current = true;

          // Animate platforms count from 0 to 20
          let platformFrame = 0;
          const platformInterval = setInterval(() => {
            platformFrame++;
            setPlatformsCount(platformFrame);
            if (platformFrame >= 20) clearInterval(platformInterval);
          }, 50);
          intervals.push(platformInterval);

          // Animate avg income from 0 to 4000
          let incomeFrame = 0;
          const incomeInterval = setInterval(() => {
            incomeFrame += 100;
            if (incomeFrame >= 4000) {
              setAvgIncome(4000);
              clearInterval(incomeInterval);
            } else {
              setAvgIncome(incomeFrame);
            }
          }, 20);
          intervals.push(incomeInterval);

          // Animate success rate from 0 to 95
          let rateFrame = 0;
          const rateInterval = setInterval(() => {
            rateFrame += 2;
            if (rateFrame >= 95) {
              setSuccessRate(95);
              clearInterval(rateInterval);
            } else {
              setSuccessRate(rateFrame);
            }
          }, 20);
          intervals.push(rateInterval);

          // Animate support hours from 0 to 24
          let hoursFrame = 0;
          const hoursInterval = setInterval(() => {
            hoursFrame++;
            setSupportHours(hoursFrame);
            if (hoursFrame >= 24) clearInterval(hoursInterval);
          }, 40);
          intervals.push(hoursInterval);
        }
      },
      { threshold: 0.3 }
    );

    const currentStatsRef = statsRef.current;
    if (currentStatsRef) {
      observer.observe(currentStatsRef);
    }

    return () => {
      // Clear all intervals on cleanup
      intervals.forEach(interval => clearInterval(interval));
      if (currentStatsRef) {
        observer.unobserve(currentStatsRef);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stats slider with typewriter effect and number counting
  useEffect(() => {
    const statsLabels = [
      "Platforms Supported",
      "Avg. Monthly Income",
      "Success Rate",
      "Support",
      "Project Types"
    ];

    const statsTargets = [20, 4000, 95, 24, 12]; // Target values for counting
    const currentLabel = statsLabels[currentStatIndex];
    const targetValue = statsTargets[currentStatIndex];

    let charIndex = 0;
    setTypewriterText('');
    setIsTyping(true);
    setDisplayNumber(0);

    // Number counting animation
    const countDuration = 1500; // 1.5 seconds to count
    const countSteps = 30;
    const increment = targetValue / countSteps;
    let currentCount = 0;
    let countStep = 0;

    const countingInterval = setInterval(() => {
      if (countStep < countSteps) {
        currentCount += increment;
        setDisplayNumber(Math.floor(currentCount));
        countStep++;
      } else {
        setDisplayNumber(targetValue);
        clearInterval(countingInterval);
      }
    }, countDuration / countSteps);

    // Typewriter animation (starts after a brief delay)
    setTimeout(() => {
      const typewriterInterval = setInterval(() => {
        if (charIndex < currentLabel.length) {
          setTypewriterText(currentLabel.substring(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typewriterInterval);
          setIsTyping(false);
        }
      }, 80);
    }, 300);

    // Auto-rotate to next stat after displaying
    const rotationTimeout = setTimeout(() => {
      setCurrentStatIndex((prev) => (prev + 1) % 5);
    }, 4000); // Display each stat for 4 seconds

    return () => {
      clearInterval(countingInterval);
      clearTimeout(rotationTimeout);
    };
  }, [currentStatIndex]);

  const stats = [
    { number: "20+", label: "Platforms Supported", icon: <Globe className="w-5 h-5" /> },
    { number: "$4k+", label: "Avg. Monthly Income", icon: <DollarSign className="w-5 h-5" /> },
    { number: "95%", label: "Success Rate", icon: <Star className="w-5 h-5" /> },
    { number: "24/7", label: "Support", icon: <Headphones className="w-5 h-5" /> },
    { number: "12+", label: "Project Types", icon: <Layers className="w-5 h-5" /> }
  ];

  const heroImages = [
    "https://images.pexels.com/photos/3727474/pexels-photo-3727474.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/9783346/pexels-photo-9783346.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/7773547/pexels-photo-7773547.jpeg?auto=compress&cs=tinysrgb&w=1200"
  ];

  const projectTypes = [
    'AI Data Annotation',
    'Content Moderation',
    'Translation Services',
    'Search Evaluation',
    'Data Labeling',
    'Audio Transcription',
    'Image Recognition',
    'Text Categorization'
  ];

  const features = [
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Access to Verified Opportunities",
      description: "Connect with legitimate remote work opportunities from trusted platforms."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Transparent Onboarding",
      description: "Clear, structured process with no hidden requirements or misleading claims."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Professional Standards",
      description: "Preparation and access, delivered within enterprise hiring standards."
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Optional Career Support",
      description: "Choose from optional services to enhance your application readiness."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Long-term Career Growth",
      description: "Focus on building sustainable remote careers, not quick fixes."
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "Full Control",
      description: "You work directly with hiring platforms—we just help you get there."
    },
    {
      icon: <BadgeCheck className="w-6 h-6" />,
      title: "Comprehensive Verification",
      description: "Complete identity, skill, and eligibility verification to access opportunities."
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Personalized Guidance",
      description: "Structured onboarding and support throughout your application journey."
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: "Application-Ready Profiles",
      description: "Ensure your profile meets platform standards and requirements."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Platform Access",
      description: "Connect with remote work opportunities across 20+ trusted platforms worldwide."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "24/7 Platform Support",
      description: "Access resources and support whenever you need assistance."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Ethical Practices",
      description: "Complete transparency about our role, services, and limitations—no hidden charges."
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Create & Verify Your Profile",
      description: "Professionals create a profile and complete identity, skill, and eligibility verification."
    },
    {
      step: "02",
      title: "Get Application-Ready",
      description: "We help ensure profiles meet platform standards through structured onboarding, guidance, and optional career support services."
    },
    {
      step: "03",
      title: "Access Remote Opportunities",
      description: "Verified professionals may gain access to legitimate remote opportunities offered by external companies and platforms."
    },
    {
      step: "04",
      title: "Work Directly With the Hiring Platform",
      description: "All work, payments, contracts, and task assignments are handled directly by the hiring company."
    }
  ];

  const testimonials = [
    {
      quote: "The platform's structured approach helped me get approved on multiple remote work platforms within two weeks. The preparation and guidance made all the difference in my application success.",
      author: "Annika Sørensen",
      role: "Data Annotation Specialist",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces"
    },
    {
      quote: "After months of unsuccessful applications, Remote-Works connected me with opportunities that matched my skills. The verification process gave employers confidence in my qualifications.",
      author: "Takeshi Yamamoto",
      role: "AI Training Specialist",
      avatar: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=200&h=200&fit=crop&crop=faces"
    },
    {
      quote: "The professional onboarding process prepared me thoroughly for remote work. Within three weeks, I was earning a consistent income from legitimate platforms.",
      author: "Lakshmi Patel",
      role: "Content Moderation Expert",
      avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=faces"
    },
    {
      quote: "Remote-Works streamlined my path to verified remote opportunities. The transparency and support throughout the process exceeded my expectations.",
      author: "Dmitri Volkov",
      role: "Search Evaluation Analyst",
      avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&h=200&fit=crop&crop=faces"
    },
    {
      quote: "Finding legitimate remote work was challenging until I discovered this platform. The structured verification and professional preparation made me a competitive candidate.",
      author: "Amara Okafor",
      role: "Translation Services Provider",
      avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=faces"
    },
    {
      quote: "The platform's professional approach to remote work placement is unmatched. I went from unemployment to earning consistently within my first month.",
      author: "Lars Bergström",
      role: "Data Labeling Specialist",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop&crop=faces"
    }
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      setSubscriptionStatus('error');
      setTimeout(() => {
        setSubscriptionStatus('idle');
        setErrorMessage('');
      }, 3000);
      return;
    }

    setSubscriptionStatus('loading');

    try {
      const { getFirebaseFirestore, isFirebaseConfigured } = await import('@/lib/firebase/config');
      const { collection, addDoc, Timestamp } = await import('firebase/firestore');

      if (!isFirebaseConfigured) {
        setErrorMessage('Service temporarily unavailable. Please try again later.');
        setSubscriptionStatus('error');
        setTimeout(() => {
          setSubscriptionStatus('idle');
          setErrorMessage('');
        }, 3000);
        return;
      }

      const db = getFirebaseFirestore();
      const emailLower = email.toLowerCase().trim();

      await addDoc(collection(db, 'newsletter_subscriptions'), {
        email: emailLower,
        subscribedAt: Timestamp.now(),
        source: 'homepage',
        status: 'active'
      });

      setSubscriptionStatus('success');
      setEmail('');
      setTimeout(() => setSubscriptionStatus('idle'), 5000);
    } catch (error: any) {
      console.error('Subscription error:', error);
      setErrorMessage(error.message || 'Failed to subscribe. Please try again.');
      setSubscriptionStatus('error');
      setTimeout(() => {
        setSubscriptionStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  return (
    <>
      <Head>
        <title>Remote Work Opportunities with Personalized Support | Professional Career Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="description" content="Access verified remote work opportunities worldwide with personalized application support. Expert career guidance, professional profile verification, and structured onboarding to help you succeed in remote AI training, data annotation, translation, and digital content roles." />
        <meta name="keywords" content="remote work opportunities, work from home jobs, personalized career support, remote AI training jobs, data annotation careers, translation jobs, content moderation roles, remote job platform, professional verification, career readiness, digital nomad jobs, flexible remote work, freelance opportunities, remote career guidance" />

        {/* Open Graph Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rework.com/" />
        <meta property="og:title" content="Remote Work Platform with Personalized Career Support" />
        <meta property="og:description" content="Join thousands of professionals accessing verified remote opportunities with expert guidance. 98% success rate. Personalized support for remote AI training, data annotation, translation, and more." />
        <meta property="og:site_name" content="Rework" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Remote Work with Professional Career Support" />
        <meta name="twitter:description" content="Verified remote work opportunities with personalized application support. Expert career guidance for AI training, data annotation, and translation roles." />

        {/* Additional SEO Tags */}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rework.com/" />
        <meta name="author" content="Rework" />

        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Rework",
              "url": "https://rework.com",
              "description": "Remote work enablement platform connecting professionals with AI training and data annotation opportunities",
              "sameAs": [],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "27000",
                "bestRating": "5"
              }
            })
          }}
        />

        {/* Structured Data - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Rework",
              "url": "https://rework.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://rework.com/projects?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-20 md:h-24 py-3">
              <div className="flex items-center">
                <Logo showText={false} size="md" />
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-8">
                <a href="#projects" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Projects</a>
                <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">How It Works</a>
                <button onClick={() => router.push('/about')} className="text-sm font-medium text-gray-600 hover:text-black transition-colors">About</button>
                <button onClick={() => router.push('/faq')} className="text-sm font-medium text-gray-600 hover:text-black transition-colors">FAQ</button>
                <button onClick={() => router.push('/login')} className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                  Sign In
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all"
                >
                  Get Started
                </button>
              </div>

              {/* Mobile menu button */}
              <div className="lg:hidden">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-black">
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="lg:hidden py-4 space-y-4 border-t border-gray-200">
                <a href="#projects" className="block text-sm font-medium text-gray-600 hover:text-black">Projects</a>
                <a href="#how-it-works" className="block text-sm font-medium text-gray-600 hover:text-black">How It Works</a>
                <button onClick={() => router.push('/about')} className="block w-full text-left text-sm font-medium text-gray-600 hover:text-black">About</button>
                <button onClick={() => router.push('/faq')} className="block w-full text-left text-sm font-medium text-gray-600 hover:text-black">FAQ</button>
                <button onClick={() => router.push('/login')} className="block w-full text-left text-sm font-medium text-gray-600 hover:text-black">Sign In</button>
                <button onClick={() => router.push('/register')} className="block w-full bg-black text-white px-6 py-2 rounded-full text-sm font-medium text-center">
                  Get Started
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section - Modern Design with Purple & Amber Gold Theme */}
        <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-purple-400/20 to-amber-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-amber-400/20 to-yellow-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] lg:w-[800px] lg:h-[800px] bg-gradient-to-br from-purple-400/10 to-amber-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                {/* Badge */}
                <div className={`inline-flex items-center gap-3 bg-white/80 backdrop-blur-xl px-6 py-3 rounded-full border border-purple-200/50 shadow-lg ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
                  <div className="relative">
                    <Bot className="w-5 h-5 text-purple-600" />
                    <div className="absolute inset-0 bg-purple-600 rounded-full blur-md opacity-30 animate-pulse"></div>
                  </div>
                  <span className="font-semibold text-sm bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
                    Rework Digital
                  </span>
                  <div className="h-5 w-px bg-purple-200"></div>
                  <span className="text-sm text-gray-600 font-medium">Trusted Worldwide</span>
                </div>

                {/* Main Headline */}
                <div className="space-y-4">
                  <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight ${isVisible ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
                    <span className="block text-slate-900">Your Gateway to</span>
                    <span className="block mt-2 bg-gradient-to-r from-purple-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent relative">
                      Verified Remote Work
                      <svg className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-2 sm:h-3" viewBox="0 0 100 10" preserveAspectRatio="none">
                        <path d="M0,5 Q25,8 50,5 T100,5" stroke="url(#hero-underline)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
                        <defs>
                          <linearGradient id="hero-underline" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#9333ea" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#eab308" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </span>
                  </h1>
                </div>

                {/* Subheadline with Typewriter Effect */}
                <div className={`text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 leading-relaxed font-medium max-w-2xl min-h-[3rem] sm:min-h-[4rem] ${isVisible ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
                  <span className="inline">{heroTypewriterText}</span>
                  <span className={`inline-block w-0.5 h-5 sm:h-6 bg-purple-600 ml-1 ${heroIsTyping ? 'animate-blink' : 'opacity-0'}`}></span>
                </div>

                {/* CTA Buttons */}
                <div className={`flex flex-col sm:flex-row gap-4 pt-4 ${isVisible ? 'animate-fade-in-scale stagger-3' : 'opacity-0'}`}>
                  <button
                    onClick={() => router.push('/register?type=candidate')}
                    className="group relative bg-gradient-to-r from-purple-600 via-amber-500 to-purple-600 text-white px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 overflow-hidden inline-flex items-center justify-center w-auto"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-amber-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Rocket className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="whitespace-nowrap">Start Your Journey</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
                    </span>
                  </button>

                  <button
                    onClick={() => router.push('/company')}
                    className="group relative bg-white border-2 border-slate-200 text-slate-900 px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 hover:shadow-xl hover:border-purple-300 hover:scale-105 inline-flex items-center justify-center w-auto"
                  >
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                      <span className="whitespace-nowrap">For Employers</span>
                    </span>
                  </button>
                </div>

                {/* Trust Indicators & Journey Stages */}
                <div className={`flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-6 pt-6 ${isVisible ? 'animate-fade-in stagger-4' : 'opacity-0'}`}>
                  {/* Journey Badges */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-green-50 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-green-200">
                      <BadgeCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-green-700 whitespace-nowrap">Verified</span>
                    </div>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-purple-50 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-purple-200">
                      <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-purple-700 whitespace-nowrap">Qualified</span>
                    </div>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-amber-50 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-amber-200">
                      <Rocket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-amber-700 whitespace-nowrap">Hired</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className={`grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-6 pt-4 ${isVisible ? 'animate-fade-in stagger-5' : 'opacity-0'}`}>
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">Free to Join</div>
                      <div className="text-[10px] sm:text-xs text-gray-600 whitespace-nowrap">No hidden fees</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">Quick Setup</div>
                      <div className="text-[10px] sm:text-xs text-gray-600 whitespace-nowrap">Start in minutes</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">24/7 Support</div>
                      <div className="text-[10px] sm:text-xs text-gray-600 whitespace-nowrap">Always available</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Image Slider */}
              <div className={`relative mt-8 lg:mt-0 ${isVisible ? 'animate-fade-in-scale stagger-2' : 'opacity-0'}`}>
                <div className="relative mx-auto max-w-lg lg:max-w-none">
                  {/* Main Image Container with Slider */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/20 border border-white/20 backdrop-blur-sm">
                    {heroImages.map((image, index) => (
                      <div
                        key={index}
                        className={`transition-opacity duration-1000 ${index === currentHeroImage ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                      >
                        <img
                          src={image}
                          alt={`Remote Work ${index + 1}`}
                          className="w-full h-auto object-cover"
                          style={{ aspectRatio: '4/3' }}
                        />
                      </div>
                    ))}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 via-transparent to-amber-600/20"></div>

                    {/* Slider Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {heroImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentHeroImage(index)}
                          className={`transition-all duration-300 rounded-full ${
                            index === currentHeroImage
                              ? 'w-8 h-2 bg-gradient-to-r from-purple-600 to-amber-600'
                              : 'w-2 h-2 bg-white/60 hover:bg-white/90'
                          }`}
                          aria-label={`View image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Floating Stats Cards - Smaller on all devices */}
                  {/* Bottom Left - Success Rate */}
                  <div className="absolute -bottom-3 sm:-bottom-4 md:-bottom-6 -left-3 sm:-left-4 md:-left-6 bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg md:shadow-xl border border-purple-100 p-2 sm:p-3 md:p-4 animate-float" style={{ animationDuration: '6s' }}>
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center shadow-md md:shadow-lg shadow-purple-500/30">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-base sm:text-xl md:text-2xl font-black bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">95%</div>
                        <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium whitespace-nowrap">Success Rate</div>
                      </div>
                    </div>
                  </div>

                  {/* Top Right - Platforms */}
                  <div className="absolute -top-3 sm:-top-4 md:-top-6 -right-3 sm:-right-4 md:-right-6 bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg md:shadow-xl border border-purple-100 p-2 sm:p-3 md:p-4 animate-float" style={{ animationDuration: '7s', animationDelay: '1s' }}>
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center shadow-md md:shadow-lg shadow-purple-500/30">
                        <Globe className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-base sm:text-xl md:text-2xl font-black bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">40+</div>
                        <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium whitespace-nowrap">Platforms</div>
                      </div>
                    </div>
                  </div>

                  {/* Top Left - AI Personalized Support */}
                  <div className="absolute top-1/4 -left-3 sm:-left-4 md:-left-6 bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg md:shadow-xl border border-amber-100 p-2 sm:p-3 md:p-4 animate-float" style={{ animationDuration: '8s', animationDelay: '2s' }}>
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-md md:shadow-lg shadow-amber-500/30">
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm sm:text-base md:text-lg font-black bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">AI</div>
                        <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-600 font-medium whitespace-nowrap">Personalized</div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Right - Project Types */}
                  <div className="absolute bottom-1/4 -right-3 sm:-right-4 md:-right-6 bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg md:shadow-xl border border-purple-100 p-2 sm:p-3 md:p-4 animate-float" style={{ animationDuration: '7.5s', animationDelay: '0.5s' }}>
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center shadow-md md:shadow-lg shadow-purple-500/30">
                        <Layers className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-base sm:text-xl md:text-2xl font-black bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">12+</div>
                        <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium whitespace-nowrap">Project Types</div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -z-10 -top-10 -right-10 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-amber-400/20 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute -z-10 -bottom-10 -left-10 w-72 h-72 bg-gradient-to-br from-amber-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Badges */}
        <section id="projects" className="py-20 px-6 lg:px-8 bg-white relative overflow-hidden">
          {/* Animated Background Elements - Platform & Connection Theme */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Gradient Orbs */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-amber-300/30 to-orange-300/30 rounded-full blur-3xl animate-float" style={{ animationDuration: '10s', animationDelay: '0s' }}></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-br from-orange-300/30 to-amber-300/30 rounded-full blur-3xl animate-float" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-purple-300/20 to-amber-300/20 rounded-full blur-3xl animate-float" style={{ animationDuration: '14s', animationDelay: '1s' }}></div>

            {/* Floating Platform/Connection Icons */}
            <div className="absolute top-20 left-20 animate-float opacity-10" style={{ animationDuration: '8s', animationDelay: '0s' }}>
              <Globe className="w-16 h-16 text-purple-500" />
            </div>
            <div className="absolute top-32 right-24 animate-float opacity-10" style={{ animationDuration: '9s', animationDelay: '1s' }}>
              <Layers className="w-14 h-14 text-amber-500" />
            </div>
            <div className="absolute bottom-28 left-1/4 animate-float opacity-10" style={{ animationDuration: '11s', animationDelay: '2s' }}>
              <Briefcase className="w-18 h-18 text-orange-500" />
            </div>
            <div className="absolute bottom-20 right-1/3 animate-float opacity-10" style={{ animationDuration: '10s', animationDelay: '0.5s' }}>
              <Building2 className="w-16 h-16 text-purple-600" />
            </div>
            <div className="absolute top-1/2 left-16 animate-float opacity-10" style={{ animationDuration: '13s', animationDelay: '1.5s' }}>
              <Sparkles className="w-12 h-12 text-amber-600" />
            </div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <p className="text-xs font-bold text-gray-500 mb-3 tracking-widest uppercase animate-fade-in">
                Verified Opportunities from Our Partners
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 animate-fade-in-up">
                Access <span className="bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent">Premium Projects</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {projectTypes.map((project, index) => (
                <div
                  key={project}
                  className={`group bg-white px-6 py-5 rounded-xl text-center font-bold text-gray-900 border-2 border-gray-200 hover:border-purple-500 hover-lift transition-all duration-300 shadow-sm hover:shadow-xl animate-fade-in-scale stagger-${(index % 6) + 1} cursor-pointer`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-amber-500 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                    {project}
                  </span>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="flex justify-center mt-8 animate-fade-in">
              <button
                onClick={() => router.push('/projects')}
                className="group relative bg-black text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-gray-800 transition-all hover-lift shadow-lg overflow-hidden"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Explore All Projects</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="relative py-24 px-6 lg:px-8 bg-white overflow-hidden">
          {/* Animated Background Elements - Process/Workflow Theme */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Gradient Orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-blue-300/20 rounded-full blur-3xl animate-float" style={{ animationDuration: '10s', animationDelay: '0s' }}></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-300/20 to-yellow-300/20 rounded-full blur-3xl animate-float" style={{ animationDuration: '12s', animationDelay: '3s' }}></div>
            <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-200/15 to-amber-200/15 rounded-full blur-3xl animate-float" style={{ animationDuration: '14s', animationDelay: '1.5s' }}></div>

            {/* Floating Process/Workflow Icons */}
            <div className="absolute top-24 right-20 animate-float opacity-10" style={{ animationDuration: '8s', animationDelay: '0s' }}>
              <ArrowRight className="w-16 h-16 text-purple-500" />
            </div>
            <div className="absolute top-1/3 left-16 animate-float opacity-10" style={{ animationDuration: '9s', animationDelay: '1s' }}>
              <UserCheck className="w-18 h-18 text-blue-500" />
            </div>
            <div className="absolute bottom-32 right-1/3 animate-float opacity-10" style={{ animationDuration: '11s', animationDelay: '2s' }}>
              <FileCheck className="w-14 h-14 text-green-500" />
            </div>
            <div className="absolute top-1/2 right-12 animate-float opacity-10" style={{ animationDuration: '10s', animationDelay: '0.5s' }}>
              <Rocket className="w-20 h-20 text-amber-500" />
            </div>
            <div className="absolute bottom-20 left-1/4 animate-float opacity-10" style={{ animationDuration: '13s', animationDelay: '1.5s' }}>
              <CheckCircle className="w-16 h-16 text-purple-600" />
            </div>
            <div className="absolute top-40 left-1/3 animate-float opacity-10" style={{ animationDuration: '12s', animationDelay: '2.5s' }}>
              <Target className="w-12 h-12 text-amber-600" />
            </div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-200 mb-6 animate-fade-in">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-gray-700">Simple Process</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold text-black mb-4 animate-fade-in-up">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 animate-fade-in-up stagger-1">
                Your path to verified remote work opportunities
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((item, index) => (
                <div
                  key={index}
                  className={`relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-purple-500 transition-all duration-500 group hover-lift shadow-lg animate-fade-in-scale stagger-${index + 1} hover:shadow-2xl`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Step Number */}
                  <div className="text-7xl font-extrabold bg-gradient-to-br from-purple-200 to-amber-200 bg-clip-text text-transparent mb-4 group-hover:scale-125 transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:to-amber-500">
                    {item.step}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-black mb-3 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-amber-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed text-sm group-hover:text-gray-700 transition-colors">
                    {item.description}
                  </p>

                  {/* Arrow Connector */}
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-12 -right-3 w-6 h-6 z-10">
                      <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-amber-500 transition-all duration-300 group-hover:translate-x-1" />
                    </div>
                  )}

                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/0 to-amber-500/0 group-hover:from-purple-500/10 group-hover:to-amber-500/10 rounded-bl-full rounded-tr-2xl transition-all duration-500"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-24 px-6 lg:px-8 bg-white overflow-hidden">
          {/* Animated Background Elements - Features/Benefits Theme */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Gradient Orbs */}
            <div className="absolute top-10 right-10 w-80 h-80 bg-gradient-to-br from-yellow-300/20 to-amber-300/20 rounded-full blur-3xl animate-float" style={{ animationDuration: '11s', animationDelay: '0s' }}></div>
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-br from-orange-300/20 to-red-300/20 rounded-full blur-3xl animate-float" style={{ animationDuration: '13s', animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-br from-purple-300/15 to-pink-300/15 rounded-full blur-3xl animate-float" style={{ animationDuration: '15s', animationDelay: '1s' }}></div>

            {/* Floating Features/Benefits Icons */}
            <div className="absolute top-20 left-20 animate-float opacity-10" style={{ animationDuration: '9s', animationDelay: '0s' }}>
              <Star className="w-16 h-16 text-yellow-500" />
            </div>
            <div className="absolute top-40 right-24 animate-float opacity-10" style={{ animationDuration: '10s', animationDelay: '1s' }}>
              <Award className="w-18 h-18 text-amber-500" />
            </div>
            <div className="absolute bottom-32 left-1/4 animate-float opacity-10" style={{ animationDuration: '12s', animationDelay: '2s' }}>
              <TrendingUp className="w-14 h-14 text-green-500" />
            </div>
            <div className="absolute bottom-24 right-1/3 animate-float opacity-10" style={{ animationDuration: '11s', animationDelay: '0.5s' }}>
              <Sparkles className="w-20 h-20 text-purple-500" />
            </div>
            <div className="absolute top-1/2 right-16 animate-float opacity-10" style={{ animationDuration: '14s', animationDelay: '1.5s' }}>
              <BadgeCheck className="w-16 h-16 text-purple-600" />
            </div>
            <div className="absolute top-1/3 left-1/3 animate-float opacity-10" style={{ animationDuration: '13s', animationDelay: '2.5s' }}>
              <Zap className="w-14 h-14 text-yellow-600" />
            </div>
            <div className="absolute bottom-40 right-20 animate-float opacity-10" style={{ animationDuration: '10s', animationDelay: '3s' }}>
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-200 mb-6 animate-fade-in">
                <Award className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-semibold text-gray-700">Why Choose Us</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold text-black mb-4 animate-fade-in-up">
                Why Professionals Choose
                <span className="block mt-2 bg-gradient-to-r from-purple-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                  Rework
                </span>
              </h2>
              <p className="text-xl text-gray-600 animate-fade-in-up stagger-1">
                Comprehensive career enablement and recruitment support for remote professionals
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`group bg-white/70 backdrop-blur-sm p-6 rounded-2xl hover-lift transition-all duration-500 border-2 border-gray-200 hover:border-purple-500 hover:bg-white animate-fade-in-scale stagger-${(index % 4) + 1} hover:shadow-xl`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Icon with animated background */}
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-amber-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
                    <div className="relative w-14 h-14 bg-gradient-to-br from-purple-600 to-amber-500 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                      {feature.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-black mb-3 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-amber-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {feature.description}
                  </p>

                  {/* Decorative bottom accent */}
                  <div className="mt-6 w-0 h-1 bg-gradient-to-r from-purple-600 to-amber-500 group-hover:w-full transition-all duration-500 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Employers Section */}
        <section className="relative py-24 px-6 lg:px-8 bg-gradient-to-b from-white via-purple-50/30 to-amber-50/30 overflow-hidden">
          {/* Animated Background Elements - AI Projects & Remote Work Theme */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Gradient Orbs */}
            <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl animate-float" style={{ animationDuration: '8s', animationDelay: '0s' }}></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl animate-float" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-300/15 to-yellow-300/15 rounded-full blur-3xl animate-float" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
            <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-to-br from-blue-300/15 to-purple-300/15 rounded-full blur-3xl animate-float" style={{ animationDuration: '14s', animationDelay: '3s' }}></div>

            {/* Floating AI & Remote Work Icons */}
            {/* AI & Tech Icons */}
            <div className="absolute top-20 right-1/4 animate-float opacity-15" style={{ animationDuration: '6s', animationDelay: '0s' }}>
              <Bot className="w-16 h-16 text-purple-500" />
            </div>
            <div className="absolute top-1/3 left-20 animate-float opacity-15" style={{ animationDuration: '9s', animationDelay: '0.5s' }}>
              <Code className="w-14 h-14 text-blue-500" />
            </div>
            <div className="absolute bottom-32 right-24 animate-float opacity-15" style={{ animationDuration: '7s', animationDelay: '1s' }}>
              <Database className="w-18 h-18 text-purple-600" />
            </div>
            <div className="absolute top-1/2 right-16 animate-float opacity-15" style={{ animationDuration: '10s', animationDelay: '1.5s' }}>
              <Server className="w-14 h-14 text-amber-500" />
            </div>

            {/* Remote Work Icons */}
            <div className="absolute top-40 left-1/3 animate-float opacity-15" style={{ animationDuration: '8s', animationDelay: '2s' }}>
              <Laptop className="w-16 h-16 text-gray-600" />
            </div>
            <div className="absolute bottom-40 left-1/4 animate-float opacity-15" style={{ animationDuration: '11s', animationDelay: '2.5s' }}>
              <Monitor className="w-20 h-20 text-purple-400" />
            </div>
            <div className="absolute bottom-24 right-1/3 animate-float opacity-15" style={{ animationDuration: '9s', animationDelay: '3s' }}>
              <Wifi className="w-12 h-12 text-blue-400" />
            </div>
            <div className="absolute top-1/4 right-1/3 animate-float opacity-15" style={{ animationDuration: '13s', animationDelay: '0.8s' }}>
              <Headphones className="w-14 h-14 text-amber-600" />
            </div>

            {/* Collaboration Icons */}
            <div className="absolute bottom-1/4 left-1/3 animate-float opacity-15" style={{ animationDuration: '8s', animationDelay: '1.5s' }}>
              <Users className="w-14 h-14 text-purple-500" />
            </div>
            <div className="absolute top-1/3 right-20 animate-float opacity-15" style={{ animationDuration: '12s', animationDelay: '2.2s' }}>
              <Building2 className="w-16 h-16 text-amber-500" />
            </div>
            <div className="absolute bottom-1/2 right-1/2 animate-float opacity-15" style={{ animationDuration: '10s', animationDelay: '3.5s' }}>
              <Globe className="w-12 h-12 text-blue-600" />
            </div>

            {/* Geometric Shapes - Tech Theme */}
            <div className="absolute top-40 left-20 w-20 h-20 border-2 border-purple-300/20 rounded-lg rotate-12 animate-spin-slow"></div>
            <div className="absolute bottom-40 right-40 w-24 h-24 border-2 border-blue-300/20 rounded-lg rotate-45 animate-spin-slow" style={{ animationDuration: '20s' }}></div>
            <div className="absolute top-1/2 right-20 w-16 h-16 bg-gradient-to-br from-purple-200/10 to-blue-200/10 rounded-lg rotate-45 animate-float" style={{ animationDuration: '11s' }}></div>
            <div className="absolute top-2/3 left-1/4 w-12 h-12 border-2 border-amber-300/20 rounded-full animate-pulse"></div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-purple-200 mb-6 animate-fade-in shadow-lg">
                <Building2 className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">For Employers</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-black mb-6 animate-fade-in-up">
                Hire Verified
                <span className="block mt-2 bg-gradient-to-r from-purple-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                  Remote Talent
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Rework helps employers access pre-screened, verified professionals ready for remote work.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border-2 border-gray-200 hover:border-purple-500 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-amber-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-all duration-500"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-purple-600 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <BadgeCheck className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">Pre-verified Talent Pool</h3>
                <p className="text-gray-600 leading-relaxed">Access professionals who have completed identity, skill, and eligibility verification.</p>
                <div className="mt-6 w-0 h-1 bg-gradient-to-r from-purple-600 to-amber-500 group-hover:w-full transition-all duration-500 rounded-full"></div>
              </div>

              <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border-2 border-gray-200 hover:border-amber-500 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-purple-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-all duration-500"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-amber-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-amber-600 transition-colors">Reduced Onboarding Friction</h3>
                <p className="text-gray-600 leading-relaxed">Hire candidates who are already prepared and understand remote work expectations.</p>
                <div className="mt-6 w-0 h-1 bg-gradient-to-r from-amber-500 to-purple-600 group-hover:w-full transition-all duration-500 rounded-full"></div>
              </div>

              <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border-2 border-gray-200 hover:border-purple-500 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-yellow-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-all duration-500"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-purple-600 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">Global Reach</h3>
                <p className="text-gray-600 leading-relaxed">Connect with qualified remote professionals from around the world.</p>
                <div className="mt-6 w-0 h-1 bg-gradient-to-r from-purple-600 to-yellow-500 group-hover:w-full transition-all duration-500 rounded-full"></div>
              </div>

              <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border-2 border-gray-200 hover:border-amber-500 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-purple-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-all duration-500"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-amber-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-amber-600 transition-colors">Fraud-Prevention Checks</h3>
                <p className="text-gray-600 leading-relaxed">All professionals undergo verification to ensure authenticity and credibility.</p>
                <div className="mt-6 w-0 h-1 bg-gradient-to-r from-amber-500 to-purple-600 group-hover:w-full transition-all duration-500 rounded-full"></div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => router.push('/company')}
                className="group relative bg-gradient-to-r from-purple-600 via-amber-500 to-yellow-500 text-white px-12 py-6 rounded-full font-bold text-lg transition-all duration-500 hover:shadow-2xl hover:scale-105 inline-flex items-center space-x-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10 flex items-center space-x-3">
                  <Building2 className="w-6 h-6 animate-bounce-subtle" />
                  <span>Request Service</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials Section - Slider */}
        <section className="relative py-24 px-6 lg:px-8 bg-white overflow-hidden">
          {/* Animated Background - Success & Remote Work Icons */}
          <div className="absolute inset-0 overflow-hidden opacity-10" style={{ pointerEvents: 'none' }}>
            {/* Floating Icons Row 1 - Top */}
            <div className="absolute top-10 left-10 animate-float" style={{ animationDelay: '0s', animationDuration: '7s' }}>
              <Star className="w-16 h-16 text-yellow-400" />
            </div>
            <div className="absolute top-20 right-20 animate-float" style={{ animationDelay: '1s', animationDuration: '9s' }}>
              <Award className="w-14 h-14 text-amber-500" />
            </div>
            <div className="absolute top-32 left-1/4 animate-float" style={{ animationDelay: '2s', animationDuration: '11s' }}>
              <BadgeCheck className="w-12 h-12 text-purple-500" />
            </div>

            {/* Floating Icons Row 2 */}
            <div className="absolute top-48 right-1/3 animate-float" style={{ animationDelay: '0.5s', animationDuration: '8s' }}>
              <TrendingUp className="w-18 h-18 text-green-500" />
            </div>
            <div className="absolute top-56 left-16 animate-float" style={{ animationDelay: '1.5s', animationDuration: '10s' }}>
              <MessageSquare className="w-14 h-14 text-blue-500" />
            </div>
            <div className="absolute top-64 right-1/4 animate-float" style={{ animationDelay: '2.5s', animationDuration: '12s' }}>
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>

            {/* Floating Icons Row 3 - Middle */}
            <div className="absolute top-1/2 left-12 animate-float" style={{ animationDelay: '1s', animationDuration: '9s' }}>
              <Laptop className="w-14 h-14 text-gray-500" />
            </div>
            <div className="absolute top-1/2 right-16 animate-float" style={{ animationDelay: '2s', animationDuration: '13s' }}>
              <Sparkles className="w-12 h-12 text-purple-600" />
            </div>
            <div className="absolute top-1/3 left-1/2 animate-float" style={{ animationDelay: '3s', animationDuration: '10s' }}>
              <Rocket className="w-20 h-20 text-indigo-500" />
            </div>

            {/* Floating Icons Row 4 - Bottom */}
            <div className="absolute bottom-20 left-1/4 animate-float" style={{ animationDelay: '0.5s', animationDuration: '11s' }}>
              <Users className="w-14 h-14 text-blue-600" />
            </div>
            <div className="absolute bottom-32 right-1/3 animate-float" style={{ animationDelay: '1.5s', animationDuration: '8s' }}>
              <Coffee className="w-16 h-16 text-amber-600" />
            </div>
            <div className="absolute bottom-16 left-20 animate-float" style={{ animationDelay: '2.5s', animationDuration: '12s' }}>
              <Target className="w-12 h-12 text-red-500" />
            </div>
            <div className="absolute bottom-24 right-20 animate-float" style={{ animationDelay: '3.5s', animationDuration: '9s' }}>
              <Globe className="w-18 h-18 text-cyan-500" />
            </div>

            {/* Additional Smaller Icons for Depth */}
            <div className="absolute top-1/4 right-1/2 animate-float" style={{ animationDelay: '4s', animationDuration: '14s' }}>
              <Briefcase className="w-10 h-10 text-gray-600" />
            </div>
            <div className="absolute bottom-1/3 left-1/3 animate-float" style={{ animationDelay: '0.8s', animationDuration: '7s' }}>
              <HomeIcon className="w-10 h-10 text-blue-400" />
            </div>
            <div className="absolute top-3/4 right-1/4 animate-float" style={{ animationDelay: '1.8s', animationDuration: '10s' }}>
              <Zap className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-yellow-50 backdrop-blur-sm px-6 py-3 rounded-full border border-yellow-200 mb-6 animate-fade-in">
                <Star className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-semibold text-gray-800">Testimonials</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black animate-fade-in-up">
                Success Stories
              </h2>
              <p className="text-xl text-gray-600 animate-fade-in-up stagger-1">
                Join thousands who found success with our AI-powered platform
              </p>
            </div>

            {/* Slider Container */}
            <div className="relative">
              {/* Testimonial Card */}
              <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-purple-50 to-amber-50 backdrop-blur-xl rounded-2xl p-12 border-2 border-purple-200 transition-all duration-500 hover:border-purple-400 hover:shadow-2xl animate-fade-in-scale">
                  <div className="flex gap-1 mb-8 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                  <p className="text-gray-800 text-xl leading-relaxed mb-8 text-center transition-all duration-500 font-medium">
                    "{testimonials[currentTestimonial].quote}"
                  </p>
                  <div className="flex items-center justify-center">
                    <div className="relative w-14 h-14 rounded-full border-2 border-purple-300 shadow-lg transition-transform duration-300 hover:scale-110 overflow-hidden">
                      <img
                        src={testimonials[currentTestimonial].avatar}
                        alt={testimonials[currentTestimonial].author}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to gradient with initial if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.className = 'relative w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center font-bold text-lg text-white border-2 border-purple-300 shadow-lg transition-transform duration-300 hover:scale-110';
                            parent.innerHTML = testimonials[currentTestimonial].author[0];
                          }
                        }}
                      />
                    </div>
                    <div className="ml-4 text-left">
                      <div className="font-bold text-base text-black">{testimonials[currentTestimonial].author}</div>
                      <div className="text-sm text-gray-600">{testimonials[currentTestimonial].role}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-center gap-4 mt-8 animate-fade-in">
                <button
                  onClick={() => setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                  className="w-12 h-12 rounded-full bg-white border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-400 hover:scale-110 transition-all duration-300 flex items-center justify-center hover:shadow-xl"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-6 h-6 text-purple-600" />
                </button>

                {/* Dots Indicator */}
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`h-2 rounded-full transition-all duration-500 hover:scale-125 ${
                        currentTestimonial === index ? 'bg-purple-600 w-8' : 'bg-gray-300 w-2'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                  className="w-12 h-12 rounded-full bg-white border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-400 hover:scale-110 transition-all duration-300 flex items-center justify-center hover:shadow-xl"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-6 h-6 text-purple-600" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section - Work From Home Theme */}
        <section className="relative py-24 px-6 lg:px-8 overflow-hidden bg-slate-900">
          {/* Work From Home Background Illustrations */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            {/* Floating shapes representing work-from-home elements */}
            <div className="absolute top-20 left-10 w-80 h-80 bg-gray-700 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-float"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-gray-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-gray-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>

            {/* Decorative grid pattern */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}></div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Side - Content */}
              <div className="space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center space-x-2 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg px-4 py-2 rounded-full border border-white border-opacity-20">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-semibold">Work From Anywhere</span>
                </div>

                {/* Heading */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                  Stay Connected,
                  <span className="block mt-2 text-gray-300">Work Remotely</span>
                </h2>

                {/* Description */}
                <p className="text-lg text-gray-300 leading-relaxed">
                  Join our community of remote workers. Get exclusive updates, tips, and opportunities delivered straight to your inbox.
                </p>

                {/* Work From Home Icons */}
                <div className="grid grid-cols-4 gap-4 pt-4">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-white bg-opacity-10 rounded-lg flex items-center justify-center backdrop-filter backdrop-blur-lg border border-white border-opacity-20">
                      <HomeIcon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-gray-400 text-center">Home Office</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-white bg-opacity-10 rounded-lg flex items-center justify-center backdrop-filter backdrop-blur-lg border border-white border-opacity-20">
                      <Coffee className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-gray-400 text-center">Flexibility</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-white bg-opacity-10 rounded-lg flex items-center justify-center backdrop-filter backdrop-blur-lg border border-white border-opacity-20">
                      <Wifi className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-gray-400 text-center">Connected</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-white bg-opacity-10 rounded-lg flex items-center justify-center backdrop-filter backdrop-blur-lg border border-white border-opacity-20">
                      <Monitor className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-gray-400 text-center">Digital</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Newsletter Form */}
              <div className="relative">
                {/* Decorative glow effect behind form */}
                <div className="absolute -inset-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl blur-2xl opacity-20"></div>

                <div className="relative bg-white bg-opacity-10 backdrop-filter backdrop-blur-xl rounded-2xl p-8 border border-white border-opacity-20 shadow-2xl">
                  <div className="space-y-6">
                    {/* Form Header */}
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-2">
                        <Mail className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Subscribe to Our Newsletter</h3>
                      <p className="text-gray-300 text-sm">Get the latest updates, tips, and opportunities</p>
                    </div>

                    {/* Subscription Form */}
                    <form onSubmit={handleSubscribe} className="space-y-4">
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          disabled={subscriptionStatus === 'loading' || subscriptionStatus === 'success'}
                          className="w-full px-6 py-4 bg-white bg-opacity-90 border-2 border-gray-300 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={subscriptionStatus === 'loading' || subscriptionStatus === 'success'}
                        className="w-full bg-black hover:bg-gray-800 text-white px-6 py-4 rounded-xl transition-all text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        {subscriptionStatus === 'loading' ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            <span>Subscribing...</span>
                          </>
                        ) : subscriptionStatus === 'success' ? (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            <span>Successfully Subscribed!</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>Subscribe Now</span>
                          </>
                        )}
                      </button>

                      {errorMessage && (
                        <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg p-3">
                          <p className="text-red-200 text-sm text-center">{errorMessage}</p>
                        </div>
                      )}

                      {subscriptionStatus === 'success' && !errorMessage && (
                        <div className="bg-green-500 bg-opacity-20 border border-green-500 border-opacity-30 rounded-lg p-3">
                          <p className="text-green-200 text-sm text-center">Thanks for subscribing! Check your inbox.</p>
                        </div>
                      )}
                    </form>

                    {/* Privacy Note */}
                    <p className="text-xs text-gray-400 text-center">
                      <Shield className="inline w-3 h-3 mr-1" />
                      We respect your privacy. Unsubscribe anytime.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges Slider */}
        <section className="py-12 bg-white overflow-hidden">
          <div className="relative">
            <div className="flex items-center logo-scroll-animation-wrapper">
              {/* First set */}
              <div className="flex items-center gap-6 md:gap-8 flex-shrink-0 logo-set">
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">PayPal</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">TELUS Digital</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">OneForma</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Google</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Scale AI</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Outlier</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Appen</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Alignerr</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Handshake</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Mindrift</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Lionbridge</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Mercor</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">RWS</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Welocalize</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Clickworker</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">DataAnnotation</span>
                </div>
              </div>

              {/* Second set for seamless loop */}
              <div className="flex items-center gap-6 md:gap-8 flex-shrink-0 logo-set" aria-hidden="true">
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">PayPal</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">TELUS Digital</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">OneForma</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Google</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Scale AI</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Outlier</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Appen</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Alignerr</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Handshake</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Mindrift</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Lionbridge</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Mercor</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">RWS</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Welocalize</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">Clickworker</span>
                </div>
                <div className="flex-shrink-0 w-40 h-20 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-lg md:text-xl font-bold text-gray-700 whitespace-nowrap">DataAnnotation</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
