import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  ArrowRight, CheckCircle, Star, Zap, Shield, Rocket, Globe,
  DollarSign, Clock, TrendingUp, ExternalLink, X, MapPin,
  Briefcase, Calendar, Users, Award
} from 'lucide-react';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';

interface Project {
  id: string;
  title: string;
  company: string;
  companyUrl: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance';
  category: string;
  description: string;
  requirements: string[];
  skills: string[];
  payRange?: string;
  benefits?: string[];
  applicationUrl: string;
  postedDate: string;
  featured?: boolean;
}

export default function Platforms() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Stats counting animation
  const [projectCount, setProjectCount] = useState(0);
  const [approvalRate, setApprovalRate] = useState(0);
  const [responseTime, setResponseTime] = useState(0);
  const [avgEarnings, setAvgEarnings] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const allProjects: Project[] = [
    {
      id: 'proj-1',
      title: 'AI Data Annotation Specialist',
      company: 'Trusted Partner',
      companyUrl: 'https://www.telusinternational.ai/opportunities',
      location: 'Remote (Worldwide)',
      type: 'Freelance',
      category: 'AI Training & Data',
      description: 'Join a global community of AI trainers and data annotators working with a leading digital solutions provider. Work on cutting-edge machine learning projects, helping to improve AI models through high-quality data annotation and validation.',
      requirements: [
        'Strong attention to detail',
        'Reliable internet connection',
        'Fluency in English',
        'Basic computer literacy',
        'Ability to follow detailed instructions'
      ],
      skills: ['Data Annotation', 'Quality Assurance', 'Pattern Recognition', 'Critical Thinking'],
      payRange: '$15-$25/hour',
      benefits: ['Flexible schedule', 'Work from anywhere', 'Weekly payouts', 'Growth opportunities'],
      applicationUrl: 'https://www.telusinternational.ai/opportunities',
      postedDate: '2025-01-15',
      featured: true
    },
    {
      id: 'proj-2',
      title: 'Data Labeling Specialist',
      company: 'Partner Company',
      companyUrl: 'https://apply.workable.com/toloka-ai/',
      location: 'Remote (Global)',
      type: 'Contract',
      category: 'Data Labeling',
      description: 'Help improve machine learning algorithms by labeling and categorizing data for a global AI platform. Work on diverse projects ranging from image recognition to natural language processing.',
      requirements: [
        'High school diploma or equivalent',
        'Stable internet connection',
        'Basic English proficiency',
        'Detail-oriented mindset',
        'Ability to work independently'
      ],
      skills: ['Data Labeling', 'Image Annotation', 'Text Categorization', 'Quality Control'],
      payRange: '$10-$20/hour',
      benefits: ['Flexible hours', 'Multiple projects', 'Fast payments', 'No experience required'],
      applicationUrl: 'https://apply.workable.com/toloka-ai/',
      postedDate: '2025-01-18',
      featured: true
    },
    {
      id: 'proj-3',
      title: 'Translation & Localization Expert',
      company: 'Language Services Partner',
      companyUrl: 'https://jobs.lever.co/rws',
      location: 'Remote (Multiple Languages)',
      type: 'Freelance',
      category: 'Translation',
      description: 'Provide high-quality translation and localization services for global brands through a premier language services company. Work with cutting-edge translation technology while preserving cultural nuances and brand voice.',
      requirements: [
        'Native-level proficiency in target language',
        'Excellent English skills',
        'Translation or localization experience preferred',
        'Cultural awareness and sensitivity',
        'Familiarity with CAT tools (preferred)'
      ],
      skills: ['Translation', 'Localization', 'Proofreading', 'Cultural Adaptation', 'CAT Tools'],
      payRange: '$20-$40/hour',
      benefits: ['Professional development', 'Diverse projects', 'Long-term contracts', 'Competitive rates'],
      applicationUrl: 'https://jobs.lever.co/rws',
      postedDate: '2025-01-10',
      featured: false
    },
    {
      id: 'proj-4',
      title: 'AI Training Data Contributor',
      company: 'Global AI Partner',
      companyUrl: 'https://jobs.lever.co/appen',
      location: 'Remote (Worldwide)',
      type: 'Part-time',
      category: 'AI Training',
      description: 'Contribute to the development of artificial intelligence by providing high-quality training data for a leading AI training platform. Work on various tasks including speech data collection, image annotation, and text categorization.',
      requirements: [
        'Reliable computer and internet',
        'Strong communication skills',
        'Attention to detail',
        'Ability to meet deadlines',
        'Flexible availability'
      ],
      skills: ['Data Collection', 'Audio Transcription', 'Content Evaluation', 'Search Relevance'],
      payRange: '$12-$22/hour',
      benefits: ['Work from home', 'Choose your schedule', 'Multiple project types', 'Established platform'],
      applicationUrl: 'https://jobs.lever.co/appen',
      postedDate: '2025-01-12',
      featured: true
    },
    {
      id: 'proj-5',
      title: 'Search Quality Rater',
      company: 'Digital Solutions Partner',
      companyUrl: 'https://www.telusinternational.ai/opportunities',
      location: 'Remote (USA)',
      type: 'Part-time',
      category: 'Search Evaluation',
      description: 'Evaluate and improve search engine results by rating the quality and relevance of search queries and results. Help make search engines smarter and more useful for users worldwide through our digital innovation partner.',
      requirements: [
        'Residing in the United States',
        'Excellent web research skills',
        'Strong understanding of search engines',
        'Reliable internet and computer',
        'Minimum 20 hours per week availability'
      ],
      skills: ['Web Research', 'Critical Analysis', 'Content Evaluation', 'Data Entry'],
      payRange: '$14-$16/hour',
      benefits: ['Flexible schedule', 'Remote work', 'Ongoing training', 'Stable income'],
      applicationUrl: 'https://www.telusinternational.ai/opportunities',
      postedDate: '2025-01-14'
    },
    {
      id: 'proj-6',
      title: 'Content Moderator - Multilingual',
      company: 'AI Platform Partner',
      companyUrl: 'https://apply.workable.com/toloka-ai/',
      location: 'Remote (Multilingual)',
      type: 'Contract',
      category: 'Content Moderation',
      description: 'Review and moderate user-generated content across various platforms for a trusted AI partner. Ensure community standards are maintained while respecting cultural differences and freedom of expression.',
      requirements: [
        'Fluency in English plus one additional language',
        'Strong decision-making skills',
        'Emotional resilience',
        'Understanding of cultural contexts',
        'Ability to work in fast-paced environment'
      ],
      skills: ['Content Moderation', 'Policy Enforcement', 'Cultural Sensitivity', 'Quick Decision Making'],
      payRange: '$13-$19/hour',
      benefits: ['Psychological support', 'Flexible shifts', 'Career growth', 'Training provided'],
      applicationUrl: 'https://apply.workable.com/toloka-ai/',
      postedDate: '2025-01-16'
    },
    {
      id: 'proj-7',
      title: 'Linguistic Annotation Specialist',
      company: 'Language Partner',
      companyUrl: 'https://jobs.lever.co/rws',
      location: 'Remote (Worldwide)',
      type: 'Freelance',
      category: 'AI Training & Data',
      description: 'Work with a leading language services provider to annotate and tag linguistic data for NLP and machine learning models. Help improve language understanding in AI systems across multiple languages.',
      requirements: [
        'Native or near-native language proficiency',
        'Understanding of linguistic concepts',
        'Previous annotation experience (preferred)',
        'Strong analytical skills',
        'Ability to work with annotation tools'
      ],
      skills: ['Linguistic Analysis', 'NLP Annotation', 'Language Processing', 'Attention to Detail'],
      payRange: '$18-$30/hour',
      benefits: ['Remote flexibility', 'Language variety', 'Professional growth', 'Ongoing projects'],
      applicationUrl: 'https://jobs.lever.co/rws',
      postedDate: '2025-01-17',
      featured: false
    },
    {
      id: 'proj-8',
      title: 'Speech Data Collection Specialist',
      company: 'AI Training Partner',
      companyUrl: 'https://jobs.lever.co/appen',
      location: 'Remote (Multiple Regions)',
      type: 'Contract',
      category: 'AI Training',
      description: 'Contribute to speech recognition and voice AI projects by recording and validating speech data for a global AI training partner. Help improve voice assistants and speech-to-text accuracy.',
      requirements: [
        'Clear speech and pronunciation',
        'Quiet recording environment',
        'Quality microphone or headset',
        'Native language proficiency',
        'Consistent availability for recordings'
      ],
      skills: ['Audio Recording', 'Speech Validation', 'Quality Control', 'Communication'],
      payRange: '$12-$18/hour',
      benefits: ['Flexible timing', 'Remote work', 'Bonus opportunities', 'Simple tasks'],
      applicationUrl: 'https://jobs.lever.co/appen',
      postedDate: '2025-01-16',
      featured: false
    },
    {
      id: 'proj-9',
      title: 'Image Recognition Validator',
      company: 'Vision AI Partner',
      companyUrl: 'https://www.telusinternational.ai/opportunities',
      location: 'Remote (Global)',
      type: 'Part-time',
      category: 'AI Training & Data',
      description: 'Validate and improve image recognition models by reviewing AI-generated labels and classifications for a leading digital solutions partner. Work on computer vision projects for autonomous systems and visual search.',
      requirements: [
        'Good visual perception',
        'Understanding of object categories',
        'Reliable internet for image loading',
        'Basic technical knowledge',
        'Pattern recognition skills'
      ],
      skills: ['Image Analysis', 'Classification', 'Visual QA', 'Pattern Recognition'],
      payRange: '$14-$20/hour',
      benefits: ['Visual variety', 'Flexible schedule', 'Training provided', 'Remote work'],
      applicationUrl: 'https://www.telusinternational.ai/opportunities',
      postedDate: '2025-01-15',
      featured: false
    },
    {
      id: 'proj-10',
      title: 'Video Content Evaluator',
      company: 'Platform Partner',
      companyUrl: 'https://apply.workable.com/toloka-ai/',
      location: 'Remote (Worldwide)',
      type: 'Contract',
      category: 'Content Moderation',
      description: 'Evaluate video content quality, relevance, and appropriateness for a global content platform partner. Help maintain high standards for user-generated content while supporting content creators.',
      requirements: [
        'Understanding of video formats',
        'Cultural awareness',
        'Judgment and critical thinking',
        'Fluency in English',
        'Stable video streaming capability'
      ],
      skills: ['Video Analysis', 'Content Evaluation', 'Policy Application', 'Communication'],
      payRange: '$13-$21/hour',
      benefits: ['Diverse content', 'Flexible hours', 'Career progression', 'Support team'],
      applicationUrl: 'https://apply.workable.com/toloka-ai/',
      postedDate: '2025-01-14',
      featured: false
    },
    {
      id: 'proj-11',
      title: 'Technical Translation Reviewer',
      company: 'Localization Partner',
      companyUrl: 'https://jobs.lever.co/rws',
      location: 'Remote (Technical Languages)',
      type: 'Freelance',
      category: 'Translation',
      description: 'Review and refine technical translations for software, engineering, and scientific content through a premier localization partner. Ensure accuracy and consistency in specialized terminology across languages.',
      requirements: [
        'Technical background or education',
        'Translation/localization experience',
        'Domain-specific knowledge',
        'Quality assurance mindset',
        'Familiarity with technical glossaries'
      ],
      skills: ['Technical Translation', 'QA Review', 'Terminology Management', 'Subject Matter Expertise'],
      payRange: '$25-$45/hour',
      benefits: ['Expert-level projects', 'Long-term engagement', 'Professional rate', 'Skill development'],
      applicationUrl: 'https://jobs.lever.co/rws',
      postedDate: '2025-01-11',
      featured: true
    },
    {
      id: 'proj-12',
      title: 'Text Categorization Analyst',
      company: 'Data Partner',
      companyUrl: 'https://jobs.lever.co/appen',
      location: 'Remote (Worldwide)',
      type: 'Part-time',
      category: 'Data Labeling',
      description: 'Categorize and tag text data for machine learning models working with a leading AI training partner. Help improve content classification, sentiment analysis, and topic modeling systems.',
      requirements: [
        'Strong reading comprehension',
        'Analytical thinking',
        'Consistency in categorization',
        'Fluency in target language',
        'Basic understanding of ML concepts (helpful)'
      ],
      skills: ['Text Analysis', 'Categorization', 'Pattern Recognition', 'Data Consistency'],
      payRange: '$11-$17/hour',
      benefits: ['Flexible timing', 'Remote location', 'Ongoing work', 'Training materials'],
      applicationUrl: 'https://jobs.lever.co/appen',
      postedDate: '2025-01-13',
      featured: false
    }
  ];

  const categories = ['all', 'AI Training & Data', 'Translation', 'Data Labeling', 'Content Moderation', 'Search Evaluation'];

  const filteredProjects = filter === 'all'
    ? allProjects
    : allProjects.filter(p => p.category === filter);

  const benefits = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Verified Opportunities',
      description: 'All projects are from established, reputable companies'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Application Support',
      description: 'Get expert help with your application through verified agents'
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Competitive Pay',
      description: 'Work on projects with fair compensation and flexible schedules'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Profile Verification',
      description: 'Stand out with our verification process and increase approval rates'
    }
  ];

  const whyRework = [
    {
      stat: '12+',
      label: 'Project Types',
      description: 'Diverse opportunities from our trusted partner network'
    },
    {
      stat: '95%',
      label: 'Approval Rate',
      description: 'Our verified candidates have higher acceptance rates'
    },
    {
      stat: '24hr',
      label: 'Agent Response',
      description: 'Get matched with an expert agent within 24 hours'
    },
    {
      stat: '$4k+',
      label: 'Avg. Monthly',
      description: 'Average earnings across multiple projects'
    }
  ];

  // Intersection Observer for stats animation
  useEffect(() => {
    let intervals: NodeJS.Timeout[] = [];

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          // Animate project count from 0 to 12
          let projectFrame = 0;
          const projectInterval = setInterval(() => {
            projectFrame++;
            setProjectCount(projectFrame);
            if (projectFrame >= 12) clearInterval(projectInterval);
          }, 50);
          intervals.push(projectInterval);

          // Animate approval rate from 0 to 95
          let approvalFrame = 0;
          const approvalInterval = setInterval(() => {
            approvalFrame += 2;
            if (approvalFrame >= 95) {
              setApprovalRate(95);
              clearInterval(approvalInterval);
            } else {
              setApprovalRate(approvalFrame);
            }
          }, 20);
          intervals.push(approvalInterval);

          // Animate response time from 0 to 24
          let responseFrame = 0;
          const responseInterval = setInterval(() => {
            responseFrame++;
            setResponseTime(responseFrame);
            if (responseFrame >= 24) clearInterval(responseInterval);
          }, 40);
          intervals.push(responseInterval);

          // Animate earnings from 0 to 4000
          let earningsFrame = 0;
          const earningsInterval = setInterval(() => {
            earningsFrame += 100;
            if (earningsFrame >= 4000) {
              setAvgEarnings(4000);
              clearInterval(earningsInterval);
            } else {
              setAvgEarnings(earningsFrame);
            }
          }, 20);
          intervals.push(earningsInterval);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      // Clear all intervals on cleanup
      intervals.forEach(interval => clearInterval(interval));
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [hasAnimated]);

  return (
    <>
      <Head>
        <title>Remote Work Projects | AI Training, Data Annotation, Translation & Content Jobs</title>
        <meta name="description" content="Discover verified remote work opportunities across multiple platforms. AI training, data annotation, translation, content moderation, and digital content creation projects. Get personalized application support and professional guidance." />
        <meta name="keywords" content="remote work projects, AI training opportunities, data annotation jobs, translation work, content moderation careers, remote freelance projects, work from home opportunities, digital content jobs, remote AI work, flexible freelance roles, online work platforms, remote career opportunities" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rework.com/platforms" />
        <meta property="og:title" content="Remote Work Projects - Verified Opportunities" />
        <meta property="og:description" content="Verified remote projects across multiple platforms. AI training, data annotation, translation, and content creation. Get expert application support." />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Remote Project Opportunities" />
        <meta name="twitter:description" content="500+ verified remote projects. AI training, data annotation, translation, content moderation & more with personalized support." />

        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rework.com/platforms" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Logo size="md" showText={false} />
              <div className="flex items-center space-x-4">
                <button onClick={() => router.push('/')} className="text-gray-600 hover:text-black transition-colors font-medium text-sm">
                  Home
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="relative group bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all overflow-hidden"
                >
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-20 pb-16 px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-amber-50 to-white overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '3s' }}></div>
          </div>

          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-amber-500 text-white px-6 py-3 rounded-full shadow-lg mb-8">
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="font-semibold text-sm">12+ Verified Project Types from Partners</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-black leading-tight mb-6">
              Your Career Accelerator
              <span className="block mt-2 bg-gradient-to-r from-purple-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                In the Digital Economy
              </span>
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
              We don't just list jobs from partners; we prepare you for them. Get <span className="font-bold text-black">Profile Verification</span>, <span className="font-bold text-black">Application Readiness</span>, and <span className="font-bold text-black">Strategic Onboarding</span> to fast-track your access to curated remote opportunities.
            </p>

            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => router.push('/register?type=candidate')}
                className="group relative bg-black text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-all hover-lift shadow-xl overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  <Rocket className="mr-2 w-5 h-5" />
                  Get Verified & Hired
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>

            <div className="flex items-center justify-center flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border-2 border-purple-200 shadow-sm hover:border-purple-400 transition-colors">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700 font-semibold">95% Approval Rate</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border-2 border-amber-200 shadow-sm hover:border-amber-400 transition-colors">
                <Shield className="w-4 h-4 text-amber-600" />
                <span className="text-gray-700 font-semibold">Verified Opportunities</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border-2 border-purple-200 shadow-sm hover:border-purple-400 transition-colors">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-gray-700 font-semibold">24hr Expert Support</span>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 px-6 lg:px-8 bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${
                    filter === category
                      ? 'bg-gradient-to-r from-purple-600 to-amber-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-400'
                  }`}
                >
                  {category === 'all' ? 'All Projects' : category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-20 px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-4">
                Verified Project Opportunities
              </h2>
              <p className="text-xl text-gray-600">
                Curated opportunities from trusted companies. Apply with confidence.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="group relative bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-purple-500 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  {project.featured && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-600 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      FEATURED
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-black mb-2 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-amber-500 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Briefcase className="w-4 h-4" />
                      <span className="font-semibold text-purple-600">Partner Opportunity</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{project.location}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                      <Calendar className="w-3 h-3" />
                      {project.type}
                    </span>
                    {project.payRange && (
                      <span className="text-green-600 font-bold text-sm">
                        {project.payRange}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.skills.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {project.skills.length > 3 && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        +{project.skills.length - 3} more
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedProject(project)}
                    className="w-full bg-gradient-to-r from-purple-600 to-amber-500 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-amber-600 transition-all flex items-center justify-center gap-2 group"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-4">
                Why Choose Rework?
              </h2>
              <p className="text-xl text-gray-600">
                Stop searching. Get verified, get ready, and get hired.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-gray-200 hover:border-purple-400"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-amber-500 text-white mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section ref={statsRef} className="relative py-16 px-6 lg:px-8 bg-gradient-to-br from-purple-900 via-purple-800 to-black text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-amber-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Proven Results That Matter
              </h2>
              <p className="text-lg text-gray-200">
                Join thousands who've accelerated their remote careers
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {whyRework.map((item, index) => {
                let displayValue = item.stat;
                if (index === 0) {
                  displayValue = `${projectCount}+`;
                } else if (index === 1) {
                  displayValue = `${approvalRate}%`;
                } else if (index === 2) {
                  displayValue = `${responseTime}hr`;
                } else if (index === 3) {
                  displayValue = `$${(avgEarnings / 1000).toFixed(1)}k+`;
                }

                return (
                  <div key={index} className="text-center group hover:scale-105 transition-transform">
                    <div className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent group-hover:from-yellow-300 group-hover:to-amber-400 transition-all">
                      {displayValue}
                    </div>
                    <div className="text-lg font-bold mb-2">{item.label}</div>
                    <p className="text-sm text-gray-300">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-amber-500 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">{selectedProject.title}</h2>
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-5 h-5" />
                    <span className="text-lg font-semibold">Partner Opportunity</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedProject.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{selectedProject.type}</span>
                    </div>
                    {selectedProject.payRange && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-bold">{selectedProject.payRange}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="ml-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-black mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  About This Project
                </h3>
                <p className="text-gray-700 leading-relaxed">{selectedProject.description}</p>
              </div>

              {/* Requirements */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-black mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  Requirements
                </h3>
                <ul className="space-y-2">
                  {selectedProject.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-black mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              {selectedProject.benefits && selectedProject.benefits.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-black mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-600" />
                    Benefits
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {selectedProject.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    router.push('/register?type=candidate');
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-amber-500 text-white py-4 rounded-lg font-bold hover:from-purple-700 hover:to-amber-600 transition-all flex items-center justify-center gap-2"
                >
                  Apply Now
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    router.push('/support');
                  }}
                  className="flex-1 bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                >
                  Get Support
                  <Users className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-500 text-center mt-4">
                Sign up to apply for this opportunity or get expert assistance from our support team
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
