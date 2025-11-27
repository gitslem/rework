import { useRouter } from 'next/router';
import Head from 'next/head';
import { ArrowRight, CheckCircle, Star, Zap, Shield, Rocket, Globe, DollarSign, Clock, TrendingUp } from 'lucide-react';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';

export default function Platforms() {
  const router = useRouter();

  const allPlatforms = [
    {
      name: 'Outlier AI',
      category: 'AI Training & Data',
      description: 'Leading platform for AI training and machine learning projects. Work on cutting-edge AI models and earn competitive rates.',
      features: ['High pay rates', 'Flexible hours', 'Multiple projects'],
      popular: true
    },
    {
      name: 'Alignerr',
      category: 'AI & ML Training',
      description: 'Specialized in AI alignment and machine learning tasks. Perfect for those with technical backgrounds.',
      features: ['Technical tasks', 'Good compensation', 'Remote work'],
      popular: true
    },
    {
      name: 'OneForma',
      category: 'Data Annotation',
      description: 'Global platform offering diverse data annotation and collection projects in multiple languages.',
      features: ['Multi-language', 'Various tasks', 'Worldwide'],
      popular: true
    },
    {
      name: 'Appen',
      category: 'AI Training Data',
      description: 'One of the largest AI training data platforms with projects ranging from data collection to annotation.',
      features: ['Established platform', 'Regular work', 'Multiple domains'],
      popular: true
    },
    {
      name: 'RWS',
      category: 'Translation & Localization',
      description: 'Premier language services company offering translation, localization, and content creation opportunities.',
      features: ['Language work', 'Professional projects', 'Global reach']
    },
    {
      name: 'Mindrift AI',
      category: 'AI & ML',
      description: 'Innovative platform focusing on AI model training and evaluation with competitive compensation.',
      features: ['AI evaluation', 'Competitive pay', 'Flexible schedule']
    },
    {
      name: 'TELUS Digital',
      category: 'Digital Solutions',
      description: 'Large-scale digital solutions provider offering diverse opportunities in AI training and content moderation.',
      features: ['Diverse projects', 'Stable income', 'Growth opportunities']
    },
    {
      name: 'Scale AI',
      category: 'AI Training',
      description: 'High-quality AI training data platform working with leading tech companies on advanced AI projects.',
      features: ['Premium projects', 'Top companies', 'High standards']
    },
    {
      name: 'Remotasks',
      category: 'Microtasks',
      description: 'Platform for various microtasks including image annotation, data categorization, and transcription.',
      features: ['Quick tasks', 'Fast payments', 'No experience needed']
    },
    {
      name: 'Clickworker',
      category: 'Crowdworking',
      description: 'Established crowdworking platform with diverse tasks from data entry to AI training.',
      features: ['Variety of tasks', 'Reliable platform', 'Quick approval']
    },
    {
      name: 'Toloka AI',
      category: 'Data Labeling',
      description: 'Yandex-powered platform for data labeling and annotation tasks supporting AI development.',
      features: ['Simple interface', 'Multiple tasks', 'Regular updates']
    },
    {
      name: 'Surge AI',
      category: 'AI Training',
      description: 'Platform specializing in high-quality AI training data with focus on natural language processing.',
      features: ['NLP focused', 'Quality work', 'Good rates']
    },
    {
      name: 'CloudFactory',
      category: 'Data Processing',
      description: 'Managed workforce platform providing data processing and annotation services for AI companies.',
      features: ['Structured work', 'Training provided', 'Team environment']
    },
    {
      name: 'Welocalize',
      category: 'Translation',
      description: 'Global leader in translation and localization services with opportunities for linguists worldwide.',
      features: ['Language experts', 'Professional work', 'Long-term projects']
    },
    {
      name: 'Hive AI',
      category: 'AI Moderation',
      description: 'Platform focused on content moderation and AI training for visual content understanding.',
      features: ['Visual content', 'AI training', 'Flexible work']
    },
    {
      name: 'UserTesting',
      category: 'User Research',
      description: 'Get paid to test websites and apps by providing feedback on user experience.',
      features: ['Easy tasks', 'Quick pay', 'No special skills']
    },
    {
      name: 'TaskMate',
      category: 'Microtasks',
      description: 'Google\'s platform for completing simple tasks like data collection and verification.',
      features: ['Google platform', 'Mobile-friendly', 'Simple tasks']
    },
    {
      name: 'TranscribeMe',
      category: 'Transcription',
      description: 'Specialized transcription platform offering audio and video transcription opportunities.',
      features: ['Audio work', 'Flexible hours', 'Quality focus']
    },
    {
      name: 'Rev',
      category: 'Transcription & Captions',
      description: 'Popular platform for transcription, captioning, and translation services with fast turnaround.',
      features: ['Quick payments', 'Established', 'Various services']
    },
    {
      name: 'Lionbridge',
      category: 'AI Training & Translation',
      description: 'Major player in translation and AI training data services with global opportunities.',
      features: ['Global platform', 'Multiple domains', 'Reliable work']
    },
    {
      name: 'DataForce',
      category: 'AI Data Collection',
      description: 'Specialized platform for AI data collection and annotation supporting autonomous vehicles and more.',
      features: ['Specialized work', 'Tech projects', 'Good compensation']
    }
  ];

  const benefits = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Access All Platforms',
      description: 'Get help with applications across 20+ platforms from a single place'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Fast Approval Process',
      description: 'Our verified agents know exactly what each platform looks for'
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Maximize Your Earnings',
      description: 'Work on multiple platforms simultaneously to maximize income'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: '100% Free to Use',
      description: 'Connect with agents for free - no subscription fees or hidden charges'
    }
  ];

  const whyRemoteWorks = [
    {
      stat: '20+',
      label: 'Platforms Supported',
      description: 'We help you get approved on all major remote gig platforms'
    },
    {
      stat: '98%',
      label: 'Success Rate',
      description: 'Our agents have a proven track record of successful approvals'
    },
    {
      stat: '24hr',
      label: 'Response Time',
      description: 'Get matched with an agent and start within 24 hours'
    },
    {
      stat: '$3k+',
      label: 'Avg. Monthly Income',
      description: 'Candidates earn on average across multiple platforms'
    }
  ];

  return (
    <>
      <Head>
        <title>All Platforms - Remote-Works</title>
        <meta name="description" content="Explore all 20+ platforms we help you get approved for. Sign up on Remote-Works and access Outlier, Alignerr, OneForma, Appen, and more." />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Logo size="md" showText={true} />
              <div className="flex items-center space-x-4">
                <button onClick={() => router.push('/')} className="text-gray-600 hover:text-black transition-colors font-medium text-sm">
                  Back to Home
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-20 pb-16 px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-blue-50 to-white overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-full shadow-lg mb-8">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold text-sm">20+ Platforms Available</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-black leading-tight mb-6">
              Your Gateway to
              <span className="block mt-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                All Remote Gigs
              </span>
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
              Why apply to platforms one by one? Sign up on <span className="font-bold text-black">Remote-Works</span> and get expert help to get approved on all major remote work platforms. Start earning extra cash across multiple platforms today.
            </p>

            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => router.push('/register?type=candidate')}
                className="group bg-black text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-all hover-lift shadow-xl"
              >
                <span className="flex items-center">
                  <Rocket className="mr-2 w-5 h-5" />
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
            </div>

            <div className="flex items-center justify-center flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">98% Success Rate</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">100% Free Platform</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-gray-700">24hr Response</span>
              </div>
            </div>
          </div>
        </section>

        {/* Why Remote-Works Stats */}
        <section className="py-16 px-6 lg:px-8 bg-gradient-to-r from-black via-gray-900 to-black text-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Remote-Works is #1 for Remote Gigs
              </h2>
              <p className="text-lg text-gray-300">
                The most efficient way to maximize your remote earning potential
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {whyRemoteWorks.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    {item.stat}
                  </div>
                  <div className="text-lg font-bold mb-2">{item.label}</div>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All Platforms Grid */}
        <section className="py-20 px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-4">
                All Supported Platforms
              </h2>
              <p className="text-xl text-gray-600">
                Get expert help to get approved on any of these platforms
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPlatforms.map((platform, index) => (
                <div
                  key={platform.name}
                  className="group relative bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-purple-500 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  {platform.popular && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      POPULAR
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-black mb-1 group-hover:text-purple-600 transition-colors">
                        {platform.name}
                      </h3>
                      <p className="text-xs text-purple-600 font-semibold">{platform.category}</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {platform.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {platform.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-purple-600 via-blue-600 to-black text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
              Ready to Start Earning on
              <span className="block mt-2">Multiple Platforms?</span>
            </h2>

            <p className="text-xl text-white text-opacity-90 mb-12">
              Sign up on Remote-Works today and get expert help to get approved on all platforms. Maximize your remote earnings and join 50,000+ successful candidates.
            </p>

            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => router.push('/register?type=candidate')}
                className="group bg-white text-black px-12 py-5 rounded-full font-bold text-lg hover:bg-gray-100 transition-all hover-lift shadow-2xl"
              >
                <span className="flex items-center">
                  Sign Up Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
            </div>

            <p className="text-sm text-white text-opacity-80">
              <CheckCircle className="inline w-4 h-4 mr-1" />
              No credit card required
              <span className="mx-3">•</span>
              <Shield className="inline w-4 h-4 mr-1" />
              100% Free to use
              <span className="mx-3">•</span>
              <Clock className="inline w-4 h-4 mr-1" />
              24/7 support
            </p>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
