import { useRouter } from 'next/router';
import Head from 'next/head';
import { ArrowRight, CheckCircle, Users, TrendingUp, Shield, Zap, Globe, DollarSign, Award, Target, Briefcase, Clock, Building2, Sparkles } from 'lucide-react';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';

export default function Company() {
  const router = useRouter();

  const benefits = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Access to Pre-Qualified Talent",
      description: "Tap into a pool of verified candidates already approved for top AI training platforms. Save time on vetting and onboarding."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Scalable Workforce Solutions",
      description: "Whether you need 10 or 1,000 candidates, our platform scales with your business needs seamlessly."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Quality Assurance",
      description: "Every candidate is vetted by our verified agents who maintain a 98% success rate in platform approvals."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Rapid Deployment",
      description: "Get candidates approved and working on your projects within 24-48 hours, not weeks or months."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Reach",
      description: "Access talent from around the world, enabling 24/7 operations and diverse perspectives on your projects."
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Cost-Effective",
      description: "Reduce recruitment costs and overhead. Pay only for successful placements with flexible partnership models."
    }
  ];

  const useCases = [
    {
      title: "AI Training Companies",
      description: "Need hundreds of annotators for your next AI model? We connect you with pre-approved candidates ready to start immediately.",
      icon: <Sparkles className="w-12 h-12" />
    },
    {
      title: "Data Annotation Firms",
      description: "Scale your annotation team instantly with vetted professionals who understand quality standards and platform requirements.",
      icon: <Target className="w-12 h-12" />
    },
    {
      title: "Outsourcing Companies",
      description: "Partner with us to expand your service offerings and provide guaranteed platform approvals to your clients.",
      icon: <Briefcase className="w-12 h-12" />
    },
    {
      title: "Tech Startups",
      description: "Build your initial data labeling team quickly without the overhead of traditional recruitment processes.",
      icon: <Building2 className="w-12 h-12" />
    }
  ];

  const stats = [
    { number: "20+", label: "Platforms Covered", description: "Access to major AI training platforms" },
    { number: "98%", label: "Approval Success", description: "Industry-leading success rate" },
    { number: "24hr", label: "Time to Deploy", description: "Fast candidate onboarding" },
    { number: "27000", label: "Active Candidates", description: "Growing talent pool" }
  ];

  const features = [
    "Bulk candidate processing and approval",
    "Custom integration with your systems",
    "White-label solution options",
    "Dedicated account management",
    "Real-time analytics and reporting",
    "Flexible pricing models",
    "Quality assurance guarantees",
    "Priority support 24/7"
  ];

  return (
    <>
      <Head>
        <title>For Companies - Hire Pre-Approved Remote AI Talent | Rework Enterprise Solutions</title>
        <meta name="description" content="Scale your AI training & data annotation teams with Rework. Access 27,000+ pre-qualified professionals approved for Outlier, Appen, Welocalize, TELUS Digital & RWS. Reduce recruitment costs by 80%. Deploy teams in 24 hours. B2B workforce solutions for AI companies." />
        <meta name="keywords" content="hire AI trainers, data annotation workforce, remote AI team, AI training talent, data labeling team, outsource AI training, AI workforce solutions, machine learning annotators, hire remote data scientists, AI training recruitment, enterprise AI solutions" />

        {/* Open Graph Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rework.com/company" />
        <meta property="og:title" content="Hire Pre-Approved AI Training & Data Annotation Teams - Rework" />
        <meta property="og:description" content="Access 27,000+ pre-qualified professionals. Deploy teams in 24 hours. 98% approval rate. Enterprise workforce solutions." />
        <meta property="og:site_name" content="Rework" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Rework for Companies - Enterprise AI Workforce Solutions" />
        <meta name="twitter:description" content="Hire pre-approved AI training & data annotation professionals. 24hr deployment. 27,000+ talent pool." />

        {/* Additional SEO Tags */}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rework.com/company" />

        {/* Structured Data - Service */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "name": "Rework Enterprise Workforce Solutions",
              "description": "Pre-qualified AI training and data annotation workforce for companies",
              "provider": {
                "@type": "Organization",
                "name": "Rework"
              },
              "areaServed": "Worldwide",
              "audience": {
                "@type": "BusinessAudience",
                "audienceType": "AI Training Companies, Data Annotation Firms, Tech Startups"
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
              <span className="font-semibold text-sm">Enterprise Solutions</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-black leading-tight mb-6">
              Scale Your Workforce with
              <span className="block mt-2 bg-gradient-to-r from-purple-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                Pre-Qualified Talent
              </span>
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
              Partner with Remote-Works to access thousands of verified candidates already approved for top AI training platforms. Reduce recruitment time from months to days.
            </p>

            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => router.push('/agent-signup?type=company')}
                className="group relative bg-black text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-all hover-lift shadow-xl overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  <Users className="mr-2 w-5 h-5" />
                  Start Partnership
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>

            <div className="flex items-center justify-center flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border-2 border-purple-200 shadow-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700 font-semibold">No Setup Fees</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border-2 border-amber-200 shadow-sm">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-gray-700 font-semibold">24hr Deployment</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border-2 border-purple-200 shadow-sm">
                <Award className="w-4 h-4 text-purple-600" />
                <span className="text-gray-700 font-semibold">98% Success Rate</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-6 lg:px-8 bg-gradient-to-br from-purple-900 via-purple-800 to-black text-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group hover:scale-105 transition-transform">
                  <div className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-lg font-bold mb-2">{stat.label}</div>
                  <p className="text-sm text-gray-300">{stat.description}</p>
                </div>
              ))}
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
                Transform your workforce recruitment with our proven platform
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

        {/* Use Cases Section */}
        <section className="py-20 px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-4">
                Perfect For Your Business
              </h2>
              <p className="text-xl text-gray-600">
                Trusted by companies across multiple industries
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
                What's Included
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to scale your workforce efficiently
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

        {/* CTA Section */}
        <section className="relative py-24 px-6 lg:px-8 bg-gradient-to-br from-purple-900 via-purple-800 to-black text-white overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-amber-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              Ready to Transform Your Recruitment?
            </h2>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              Join leading companies who trust Remote-Works for their workforce needs. Let's discuss how we can help you scale.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => router.push('/agent-signup?type=company')}
                className="group bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:scale-105"
              >
                <span className="flex items-center justify-center">
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
              <button
                onClick={() => router.push('/about')}
                className="group bg-transparent border-2 border-white text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-black transition-all"
              >
                Learn More About Us
              </button>
            </div>

            <p className="text-sm text-gray-300 mt-8">
              Have questions? Contact us at{' '}
              <a href="mailto:partnerships@remote-works.io" className="text-amber-400 hover:text-amber-300 font-semibold">
                partnerships@remote-works.io
              </a>
            </p>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
