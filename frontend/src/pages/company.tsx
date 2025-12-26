import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { ArrowRight, CheckCircle, Users, TrendingUp, Shield, Zap, Globe, DollarSign, Award, Target, Briefcase, Clock, Building2, Sparkles, Database, MessageSquare, Languages, Search, Tag, Mic, Eye, Video, FileText, FolderTree, BookOpen, Volume2 } from 'lucide-react';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';

export default function Company() {
  const router = useRouter();
  const [counters, setCounters] = useState<Record<string, number>>({ stat1: 0, stat2: 0, stat3: 0, stat4: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [currentProjectSlide, setCurrentProjectSlide] = useState(0);

  // Typewriter effect states
  const [typewriterText, setTypewriterText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const benefits = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Workforce-Ready Professionals",
      description: "Access verified professionals who have completed our three-stage readiness system—Profile Verification, Application Readiness, and Employer-Aligned Onboarding."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "95% Success Rate",
      description: "Our professionals have a 95% success rate in securing roles because they're verified, prepared, and aligned before they apply to your opportunities."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Quality Assurance",
      description: "Every professional undergoes comprehensive verification including identity checks, skill assessments, and eligibility reviews before accessing your opportunities."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Rapid Access to Talent",
      description: "Connect with verified professionals in 24-48 hours. No lengthy recruitment cycles—our workforce readiness system accelerates hiring outcomes."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Talent Pool",
      description: "Access professionals worldwide across 12+ project types and areas of expertise, enabling 24/7 operations and diverse skill sets for your projects."
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Reduced Friction",
      description: "Lower recruitment costs and time-to-hire. Our readiness system ensures professionals meet your requirements before applying, reducing screening overhead."
    }
  ];

  const useCases = [
    {
      title: "AI Training & Development",
      description: "Partner with Remote-Works to access professionals verified for AI data annotation, content moderation, search quality evaluation, and machine learning projects.",
      icon: <Sparkles className="w-12 h-12" />
    },
    {
      title: "Data Services Companies",
      description: "Scale your annotation, labeling, and categorization teams with workforce-ready professionals who understand quality standards and project requirements.",
      icon: <Target className="w-12 h-12" />
    },
    {
      title: "Enterprise Tech Solutions",
      description: "Expand your service offerings with access to verified professionals across technical translation, linguistic annotation, and specialized project types.",
      icon: <Briefcase className="w-12 h-12" />
    },
    {
      title: "Growing Startups",
      description: "Build your initial project teams quickly with verified, prepared professionals—no traditional recruitment overhead or lengthy vetting processes.",
      icon: <Building2 className="w-12 h-12" />
    }
  ];

  const stats = [
    { target: 12, suffix: "+", label: "Project Types", description: "Areas of expertise covered" },
    { target: 95, suffix: "%", label: "Success Rate", description: "Industry-leading preparation" },
    { target: 24, suffix: "hr", label: "Time to Connect", description: "Fast professional matching" },
    { target: 27000, suffix: "+", label: "Verified Professionals", description: "Growing talent network" }
  ];

  const projectTypes = [
    {
      name: "AI Data Annotation",
      description: "High-quality labeled datasets for training machine learning models with precision and accuracy",
      icon: <Database className="w-10 h-10" />
    },
    {
      name: "Content Moderation",
      description: "Scalable content review ensuring platform safety and community guidelines compliance",
      icon: <MessageSquare className="w-10 h-10" />
    },
    {
      name: "Translation & Localization",
      description: "Professional multilingual content adaptation for global markets and diverse audiences",
      icon: <Languages className="w-10 h-10" />
    },
    {
      name: "Search Quality Evaluation",
      description: "Expert assessment of search engine performance and result relevance optimization",
      icon: <Search className="w-10 h-10" />
    },
    {
      name: "Data Labeling",
      description: "Accurate classification and tagging of large-scale datasets for AI applications",
      icon: <Tag className="w-10 h-10" />
    },
    {
      name: "Audio Transcription",
      description: "Precise conversion of audio and video content into structured text format",
      icon: <Mic className="w-10 h-10" />
    },
    {
      name: "Image Recognition",
      description: "Advanced object detection and visual classification for computer vision projects",
      icon: <Eye className="w-10 h-10" />
    },
    {
      name: "Video Content Evaluation",
      description: "Comprehensive quality assessment and content accuracy verification for media",
      icon: <Video className="w-10 h-10" />
    },
    {
      name: "Technical Translation",
      description: "Specialized translation for technical documentation, manuals, and software interfaces",
      icon: <FileText className="w-10 h-10" />
    },
    {
      name: "Text Categorization",
      description: "Intelligent document classification and semantic content organization systems",
      icon: <FolderTree className="w-10 h-10" />
    },
    {
      name: "Linguistic Annotation",
      description: "Advanced language analysis including syntax, semantics, and discourse tagging",
      icon: <BookOpen className="w-10 h-10" />
    },
    {
      name: "Speech Data Collection",
      description: "Diverse voice recording and audio dataset creation for speech recognition systems",
      icon: <Volume2 className="w-10 h-10" />
    }
  ];

  const features = [
    "Access to workforce-ready professionals",
    "Three-stage verification system",
    "Custom partnership models",
    "Dedicated partner success team",
    "Real-time professional matching",
    "Flexible collaboration options",
    "Quality assurance guarantees",
    "Priority support 24/7"
  ];

  // Number counting animation
  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);

          // Animate each stat
          stats.forEach((stat, index) => {
            const duration = 2000; // 2 seconds
            const steps = 60;
            const increment = stat.target / steps;
            let current = 0;

            const timer = setInterval(() => {
              current += increment;
              if (current >= stat.target) {
                current = stat.target;
                clearInterval(timer);
              }

              setCounters(prev => ({
                ...prev,
                [`stat${index + 1}`]: Math.floor(current)
              }));
            }, duration / steps);
          });
        }
      },
      { threshold: 0.5 }
    );

    const statsElement = document.getElementById('stats-section');
    if (statsElement) {
      observer.observe(statsElement);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  // Auto-play project carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProjectSlide((prev) => (prev === projectTypes.length - 1 ? 0 : prev + 1));
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, []);

  // Typewriter effect for hero description
  useEffect(() => {
    const fullText = "Remote-Works connects you with professionals who have completed our three-stage workforce readiness system—Profile Verification, Application Readiness, and Employer-Aligned Onboarding. Access verified, prepared, and aligned talent across 12+ project types with a 95% success rate.";
    let currentIndex = 0;
    let isDeleting = false;
    let typingSpeed = 30; // Speed of typing in ms

    const type = () => {
      if (!isDeleting && currentIndex <= fullText.length) {
        // Typing forward
        setTypewriterText(fullText.substring(0, currentIndex));
        currentIndex++;
        setIsTyping(true);

        if (currentIndex > fullText.length) {
          // Pause at the end before deleting
          setTimeout(() => {
            isDeleting = true;
            setTimeout(type, typingSpeed);
          }, 3000); // Pause for 3 seconds
          return;
        }

        setTimeout(type, typingSpeed);
      } else if (isDeleting && currentIndex >= 0) {
        // Deleting backward
        setTypewriterText(fullText.substring(0, currentIndex));
        currentIndex--;
        setIsTyping(true);

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

  return (
    <>
      <Head>
        <title>For Companies - Partner with Workforce-Ready Professionals | Remote-Works</title>
        <meta name="description" content="Partner with Remote-Works to access verified professionals who have completed our three-stage workforce readiness system. 95% success rate. 12+ project types. Connect with workforce-ready talent in 24 hours. Professional talent platform for companies seeking verified, prepared professionals." />
        <meta name="keywords" content="workforce readiness, verified professionals, professional talent platform, AI project talent, data annotation professionals, remote work partnerships, enterprise talent solutions, workforce verification, professional preparation, employer partnerships" />

        {/* Open Graph Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://remote-works.io/company" />
        <meta property="og:title" content="Partner with Workforce-Ready Professionals - Remote-Works" />
        <meta property="og:description" content="Access verified professionals. 95% success rate. Three-stage workforce readiness system. Enterprise partnerships." />
        <meta property="og:site_name" content="Remote-Works" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Remote-Works for Companies - Workforce Readiness Platform" />
        <meta name="twitter:description" content="Partner with verified professionals. 24hr connection. 27,000+ workforce-ready talent." />

        {/* Additional SEO Tags */}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://remote-works.io/company" />

        {/* Structured Data - Service */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "name": "Remote-Works Enterprise Partnerships",
              "description": "Workforce readiness platform connecting companies with verified professionals",
              "provider": {
                "@type": "Organization",
                "name": "Remote-Works"
              },
              "areaServed": "Worldwide",
              "audience": {
                "@type": "BusinessAudience",
                "audienceType": "AI Companies, Data Services Firms, Tech Startups, Enterprise Solutions"
              }
            })
          }}
        />

      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Logo size="md" showText={false} onClick={() => router.push('/')} />
              <div className="flex items-center space-x-4">
                <button onClick={() => router.push('/')} className="text-gray-600 hover:text-black transition-colors font-medium text-sm">
                  Back to Home
                </button>
                <button
                  onClick={() => router.push('/agent-signup?type=company')}
                  className="relative group bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all overflow-hidden"
                >
                  <span className="relative z-10">Partner With Us</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-20 pb-16 px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-amber-50 to-white overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '3s' }}></div>
          </div>

          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-amber-500 text-white px-6 py-3 rounded-full shadow-lg mb-8">
              <Building2 className="w-4 h-4" />
              <span className="font-semibold text-sm">For Companies</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-black leading-tight mb-6">
              Partner with Verified,
              <span className="block mt-2 bg-gradient-to-r from-purple-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                Workforce-Ready Professionals
              </span>
            </h1>

            <div className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-12 min-h-[7rem] flex items-center justify-center">
              <div>
                <span className="inline">{typewriterText}</span>
                <span className={`inline-block w-0.5 h-6 bg-purple-600 ml-1 ${isTyping ? 'animate-blink' : 'opacity-0'}`}></span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats-section" className="py-16 px-6 lg:px-8 bg-gradient-to-br from-purple-900 via-purple-800 to-black text-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group hover:scale-105 transition-transform">
                  <div className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                    {counters[`stat${index + 1}`]}{stat.suffix}
                  </div>
                  <div className="text-lg font-bold mb-2">{stat.label}</div>
                  <p className="text-sm text-gray-300">{stat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Project Types Carousel Section */}
        <section className="py-20 px-6 lg:px-8 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-4">
                <span className="bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent">
                  12+ Project Types
                </span>
                {' '}We Support
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Access verified professionals across diverse expertise areas
              </p>
            </div>

            {/* Carousel Container */}
            <div className="relative">
              {/* Main Carousel Card - Fixed height to prevent content shift */}
              <div className="relative bg-gradient-to-br from-purple-50 via-white to-amber-50 rounded-3xl p-8 sm:p-12 md:p-16 shadow-2xl border-2 border-purple-200 h-[400px] sm:h-[420px] md:h-[450px] flex flex-col justify-center">
                {/* Project Number Badge */}
                <div className="absolute top-4 sm:top-6 right-4 sm:right-6">
                  <div className="bg-gradient-to-r from-purple-600 to-amber-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                    {currentProjectSlide + 1} / {projectTypes.length}
                  </div>
                </div>

                {/* Project Content */}
                <div className="text-center space-y-4 sm:space-y-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 to-amber-500 rounded-2xl text-white mb-2 sm:mb-4 shadow-lg mx-auto">
                    {projectTypes[currentProjectSlide].icon}
                  </div>

                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black mb-2 sm:mb-4 px-4">
                    {projectTypes[currentProjectSlide].name}
                  </h3>

                  <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto px-4">
                    {projectTypes[currentProjectSlide].description}
                  </p>
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={() => setCurrentProjectSlide((prev) => (prev === 0 ? projectTypes.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl border-2 border-purple-200 hover:border-purple-500 flex items-center justify-center transition-all hover:scale-110 group"
                  aria-label="Previous project"
                >
                  <ArrowRight className="w-6 h-6 text-gray-600 group-hover:text-purple-600 rotate-180" />
                </button>
                <button
                  onClick={() => setCurrentProjectSlide((prev) => (prev === projectTypes.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl border-2 border-purple-200 hover:border-purple-500 flex items-center justify-center transition-all hover:scale-110 group"
                  aria-label="Next project"
                >
                  <ArrowRight className="w-6 h-6 text-gray-600 group-hover:text-purple-600" />
                </button>
              </div>

              {/* Dot Indicators */}
              <div className="flex justify-center gap-2 mt-8 flex-wrap">
                {projectTypes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentProjectSlide(index)}
                    className={`transition-all duration-300 ${
                      index === currentProjectSlide
                        ? 'w-12 h-3 bg-gradient-to-r from-purple-600 to-amber-500 rounded-full'
                        : 'w-3 h-3 bg-gray-300 hover:bg-gray-400 rounded-full'
                    }`}
                    aria-label={`Go to project ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-4">
                Why Partner with Remote-Works?
              </h2>
              <p className="text-xl text-gray-600">
                Access workforce-ready professionals through our proven three-stage system
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="group bg-gray-50 p-8 rounded-2xl hover-lift transition-all border-2 border-transparent hover:border-purple-500"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-amber-500 text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-amber-500 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Project Type Demonstrations - Detailed Examples */}
        <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-purple-50/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-amber-500 text-white px-6 py-3 rounded-full mb-6 shadow-lg">
                <Target className="w-5 h-5" />
                <span className="font-bold text-sm">Real-World Applications</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold text-black mb-6">
                See What's Possible with
                <span className="block mt-2 bg-gradient-to-r from-purple-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                  Verified Talent
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore detailed examples of how companies leverage our workforce-ready professionals across different project types
              </p>
            </div>

            {/* AI Data Annotation Demonstration */}
            <div className="mb-20">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-100">
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Left: Description */}
                  <div className="p-10 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-purple-50 to-white">
                    <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-6 w-fit">
                      <Target className="w-4 h-4" />
                      <span className="font-bold text-sm">PROJECT TYPE 1</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-black mb-6">
                      AI Data Annotation & Training
                    </h3>
                    <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                      Power your AI and machine learning models with high-quality annotated data. Our verified professionals deliver precise labeling, tagging, and categorization across text, image, audio, and video datasets.
                    </p>

                    <div className="space-y-6 mb-8">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-black text-lg mb-1">Image & Video Labeling</h4>
                          <p className="text-gray-600">Object detection, facial recognition, autonomous vehicle training datasets with 99%+ accuracy</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-black text-lg mb-1">Text Annotation & NLP</h4>
                          <p className="text-gray-600">Sentiment analysis, entity recognition, intent classification for chatbots and language models</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-black text-lg mb-1">Audio Transcription & Labeling</h4>
                          <p className="text-gray-600">Speech-to-text, speaker diarization, acoustic event detection for voice assistants</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 bg-amber-50 p-4 rounded-xl border border-amber-200">
                      <Award className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <span><span className="font-bold text-black">Used by:</span> AI companies, autonomous vehicle developers, NLP researchers, voice tech startups</span>
                    </div>
                  </div>

                  {/* Right: Visual Examples */}
                  <div className="p-10 lg:p-12 bg-gradient-to-br from-purple-900 to-black text-white flex flex-col justify-center">
                    <h4 className="text-2xl font-bold mb-6 text-amber-400">Example Applications</h4>

                    {/* Professional Illustration */}
                    <div className="mb-8 rounded-2xl overflow-hidden border-2 border-amber-400/30 shadow-2xl">
                      <img
                        src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800"
                        alt="AI Data Annotation and Machine Learning"
                        className="w-full h-48 object-cover"
                      />
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center text-black font-bold">
                            01
                          </div>
                          <h5 className="font-bold text-lg">Autonomous Vehicles</h5>
                        </div>
                        <p className="text-gray-300 text-sm">Annotating road scenes, pedestrians, traffic signs, and lane markings to train self-driving AI systems</p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center text-black font-bold">
                            02
                          </div>
                          <h5 className="font-bold text-lg">Healthcare AI</h5>
                        </div>
                        <p className="text-gray-300 text-sm">Medical image analysis, X-ray labeling, symptom classification for diagnostic AI assistants</p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center text-black font-bold">
                            03
                          </div>
                          <h5 className="font-bold text-lg">E-commerce AI</h5>
                        </div>
                        <p className="text-gray-300 text-sm">Product categorization, visual search optimization, recommendation engine training datasets</p>
                      </div>

                      <div className="bg-gradient-to-r from-amber-400/20 to-purple-400/20 p-4 rounded-xl border border-amber-400/30 mt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-3xl font-black text-amber-400">95%</div>
                            <div className="text-sm text-gray-300">Average Accuracy Rate</div>
                          </div>
                          <div className="border-l border-white/20 pl-4">
                            <div className="text-3xl font-black text-amber-400">2.5M+</div>
                            <div className="text-sm text-gray-300">Data Points Annotated</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Moderation Demonstration */}
            <div className="mb-12">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-100">
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Left: Visual Examples */}
                  <div className="p-10 lg:p-12 bg-gradient-to-br from-amber-900 to-purple-900 text-white flex flex-col justify-center order-2 lg:order-1">
                    <h4 className="text-2xl font-bold mb-6 text-purple-300">Example Applications</h4>

                    {/* Professional Illustration */}
                    <div className="mb-8 rounded-2xl overflow-hidden border-2 border-purple-400/30 shadow-2xl">
                      <img
                        src="https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800"
                        alt="Content Moderation and Safety"
                        className="w-full h-48 object-cover"
                      />
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            01
                          </div>
                          <h5 className="font-bold text-lg">Social Media Platforms</h5>
                        </div>
                        <p className="text-gray-300 text-sm">Review user-generated content, enforce community guidelines, flag harmful content across posts, comments, and media</p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            02
                          </div>
                          <h5 className="font-bold text-lg">E-commerce Marketplaces</h5>
                        </div>
                        <p className="text-gray-300 text-sm">Verify product listings, detect counterfeit items, ensure seller compliance, maintain marketplace quality</p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            03
                          </div>
                          <h5 className="font-bold text-lg">Online Gaming Communities</h5>
                        </div>
                        <p className="text-gray-300 text-sm">Monitor player interactions, review reported content, enforce conduct policies, maintain safe gaming environments</p>
                      </div>

                      <div className="bg-gradient-to-r from-purple-400/20 to-amber-400/20 p-4 rounded-xl border border-purple-400/30 mt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-3xl font-black text-purple-300">24/7</div>
                            <div className="text-sm text-gray-300">Coverage Available</div>
                          </div>
                          <div className="border-l border-white/20 pl-4">
                            <div className="text-3xl font-black text-purple-300">1.5M+</div>
                            <div className="text-sm text-gray-300">Reviewed</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Description */}
                  <div className="p-10 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-amber-50 to-white order-1 lg:order-2">
                    <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full mb-6 w-fit">
                      <Shield className="w-4 h-4" />
                      <span className="font-bold text-sm">PROJECT TYPE 2</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-black mb-6">
                      Content Moderation & Safety
                    </h3>
                    <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                      Protect your platform and users with scalable content moderation. Our trained professionals review and moderate content across multiple languages and platforms, ensuring compliance and safety.
                    </p>

                    <div className="space-y-6 mb-8">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-black text-lg mb-1">Multilingual Content Review</h4>
                          <p className="text-gray-600">Moderate content in 40+ languages with culturally-aware professionals who understand context</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-black text-lg mb-1">Policy Enforcement</h4>
                          <p className="text-gray-600">Consistent application of your community guidelines with trained moderators who follow your protocols</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-black text-lg mb-1">Rapid Response Times</h4>
                          <p className="text-gray-600">Real-time moderation with SLA-backed response times for flagged content and user reports</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 bg-purple-50 p-4 rounded-xl border border-purple-200">
                      <Users className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span><span className="font-bold text-black">Used by:</span> Social platforms, marketplaces, gaming companies, community forums</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20 px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-4">
                Perfect For Your Business
              </h2>
              <p className="text-xl text-gray-600">
                Trusted by companies seeking workforce-ready professionals
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {useCases.map((useCase, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-purple-500 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-purple-600 text-white rounded-2xl mb-6 shadow-lg">
                    {useCase.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-3">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {useCase.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features List Section */}
        <section className="py-20 px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-4">
                Partnership Benefits
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to access workforce-ready professionals efficiently
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 bg-gray-50 p-4 rounded-xl hover:bg-purple-50 transition-colors"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-600 to-amber-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Ready to Scale */}
        <section className="relative py-24 px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-purple-50/20 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-amber-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-amber-400/20 to-yellow-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-400/10 to-amber-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-slate-900">
              Ready to Scale Your Operations?
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 mb-10 leading-relaxed max-w-3xl mx-auto">
              Join companies using Remote-Works to access verified, workforce-ready professionals across 12+ project types
            </p>

            <button
              onClick={() => router.push('/agent-signup?type=company')}
              className="group relative bg-gradient-to-r from-purple-600 via-amber-500 to-purple-600 text-white px-12 py-5 rounded-full font-bold text-lg transition-all shadow-2xl hover:shadow-purple-500/50 hover:scale-105 inline-flex items-center space-x-3"
            >
              <span>Partner with Us Today</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>

            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 text-xs sm:text-sm text-gray-700 px-4">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-3 sm:px-4 py-2 rounded-full border border-purple-200 shadow-sm whitespace-nowrap">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <span className="font-semibold">Free to Join</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-3 sm:px-4 py-2 rounded-full border border-purple-200 shadow-sm whitespace-nowrap">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                <span className="font-semibold">Verified Talent</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-3 sm:px-4 py-2 rounded-full border border-amber-200 shadow-sm whitespace-nowrap">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0" />
                <span className="font-semibold">24hr Connection</span>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
