import { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowRight, CheckCircle, Users, Briefcase, TrendingUp, Zap, Globe, Shield, Star } from 'lucide-react';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      name: "El Gill",
      role: "Freelance Evaluator",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      quote: "Rework changed my life. I went from inconsistent gigs to steady $3,000+ monthly income. The platform is intuitive and the support is incredible."
    },
    {
      name: "Maia Chung",
      role: "Rework Agent",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      quote: "As an agent, I earn 3x more than traditional freelancing. The training was thorough and the projects are consistent. Best decision I've made!"
    },
    {
      name: "Hakeem B.",
      role: "Business Owner",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      quote: "Finding quality remote workers was always a challenge. Rework's AI matching saved us weeks of hiring time and delivered exceptional talent."
    }
  ];

  const howItWorks = [
    {
      icon: <Users className="w-12 h-12" />,
      title: "Create Your Profile",
      description: "Sign up for free, upload your resume, and complete a quick onboarding. Your journey to remote work starts here."
    },
    {
      icon: <Briefcase className="w-12 h-12" />,
      title: "Choose Your Work Style",
      description: "Decide how you want to earn: Work on projects yourself or let a trained Rework Agent do the tasks for you."
    },
    {
      icon: <CheckCircle className="w-12 h-12" />,
      title: "Get Matched & Approved",
      description: "Our personalized support and AI matching connects you with the best opportunities. Pass quick tests and get approved to start."
    },
    {
      icon: <TrendingUp className="w-12 h-12" />,
      title: "Start Working or Earning",
      description: "Begin completing tasks — or let your agent handle the work. Track progress, get paid, and scale your income."
    }
  ];

  const userTypes = [
    {
      icon: "💼",
      title: "Rater",
      subtitle: "For Freelancers",
      features: [
        "Work remotely in roles like evaluator, transcriptionist, translator, and more",
        "Keep 99.9% of your earnings (minus a small admin fee)",
        "Or earn passively with a Rework Agent"
      ],
      cta: "Apply as Freelancer",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: "🤝",
      title: "Reworker",
      subtitle: "For Agents",
      features: [
        "Only a rater can apply",
        "Get approved and trained",
        "Get matched to available projects",
        "Work on behalf of clients and build your portfolio",
        "Earn 3x more"
      ],
      cta: "Become an Agent",
      color: "from-purple-500 to-purple-600",
      popular: true
    },
    {
      icon: "🏢",
      title: "Enterprise",
      subtitle: "For Businesses",
      features: [
        "Hire flexible, verified, and AI-matched remote workers or agents",
        "Scale your projects without overhead",
        "Reliable quality through our AI + human quality checks",
        "Resources for training tailored to your services"
      ],
      cta: "Hire Talent",
      color: "from-green-500 to-green-600"
    }
  ];

  const benefits = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI-Powered Job Matching",
      description: "Get instantly connected to remote jobs that match your skills, experience, and preferences."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global, Pre-Screened Talent Pool",
      description: "Access a curated database of skilled freelancers and agents from around the world."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Personalized Support",
      description: "From resume evaluation to testing and project ratings, we guide you at every step to succeed."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Unlimited Earning Potential",
      description: "No income caps — earn from $500 to $5,000+ monthly depending on the type of projects."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Reliable Quality & Accountability",
      description: "Benefit from built-in testing, rating systems, and human oversight to ensure consistent results."
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Work or Outsource Flexibility",
      description: "Choose to complete projects yourself or assign them to a trained Rework Agent and earn passively."
    }
  ];

  return (
    <>
      <Head>
        <title>Remote Works - A Smarter Path to Remote Income</title>
        <meta name="description" content="Earn from global projects in evaluation, transcription, translation, and more. Work flexibly or earn passively with Rework." />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Navigation */}
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Remote Works
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition">How It Works</a>
                <a href="#opportunities" className="text-gray-700 hover:text-blue-600 transition">Opportunities</a>
                <button onClick={() => router.push('/login')} className="text-gray-700 hover:text-blue-600 transition">Login</button>
                <button onClick={() => router.push('/register')} className="btn-primary">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-block">
                  <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                    🚀 Join 10,000+ Remote Workers
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                  A Smarter Path to{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Remote Income
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Rework gives you flexible ways to earn from global projects in evaluation, transcription, translation, 
                  data labeling, and more. Work on your schedule or earn passively with our agent system.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => router.push('/register')} className="btn-primary flex items-center justify-center group">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                  </button>
                  <button onClick={() => router.push('/register?role=business')} className="btn-secondary">
                    For Businesses
                  </button>
                </div>
                <div className="flex items-center space-x-8 pt-4">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">$5M+</div>
                    <div className="text-gray-600">Paid to Workers</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">10K+</div>
                    <div className="text-gray-600">Active Users</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">4.9★</div>
                    <div className="text-gray-600">User Rating</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="relative z-10">
                  <img 
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop" 
                    alt="Remote team collaboration"
                    className="rounded-2xl shadow-2xl"
                  />
                </div>
                <div className="absolute -bottom-8 -right-8 w-72 h-72 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -top-8 -left-8 w-72 h-72 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Start earning remotely in four simple steps. We make it easy to get started and scale your income.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl hover:shadow-xl transition transform hover:-translate-y-2">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                      {step.icon}
                    </div>
                    <div className="absolute -top-4 -right-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* User Types / Opportunities */}
        <section id="opportunities" className="py-20 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Opportunities for Everyone
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Rework connects you to remote jobs or agents who can work for you – earn actively or passively 
                with flexible, AI-matched & personalized support.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {userTypes.map((type, index) => (
                <div key={index} className="relative">
                  {type.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                        ⭐ Most Popular
                      </span>
                    </div>
                  )}
                  <div className={`bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 ${type.popular ? 'border-4 border-yellow-400' : ''}`}>
                    <div className={`bg-gradient-to-r ${type.color} text-white p-8 text-center`}>
                      <div className="text-5xl mb-4">{type.icon}</div>
                      <h3 className="text-2xl font-bold mb-2">{type.title}</h3>
                      <p className="text-blue-100">{type.subtitle}</p>
                    </div>
                    <div className="p-8">
                      <ul className="space-y-4 mb-8">
                        {type.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <button onClick={() => router.push('/register')} className={`w-full bg-gradient-to-r ${type.color} text-white py-4 rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-105`}>
                        {type.cta}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Why Thousands Choose Rework
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We've built the most comprehensive platform for remote work, combining AI technology 
                with human expertise to deliver exceptional results.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl hover:shadow-xl transition">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Freelancers Love Our Platform
              </h2>
              <p className="text-xl text-gray-600">Real stories from real people earning remotely with Rework</p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-12">
                <div className="flex justify-center mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-2xl text-gray-700 text-center mb-8 leading-relaxed italic">
                  &quot;{testimonials[activeTestimonial].quote}&quot;
                </blockquote>
                <div className="flex items-center justify-center space-x-4">
                  <img 
                    src={testimonials[activeTestimonial].image} 
                    alt={testimonials[activeTestimonial].name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-blue-500"
                  />
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{testimonials[activeTestimonial].name}</div>
                    <div className="text-gray-600">{testimonials[activeTestimonial].role}</div>
                  </div>
                </div>
                <div className="flex justify-center space-x-3 mt-8">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition ${
                        activeTestimonial === index ? 'bg-blue-600 w-8' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Earning Remotely?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of freelancers, agents, and businesses who trust Rework for their remote work needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => router.push('/register')} className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:shadow-2xl transition transform hover:scale-105 flex items-center justify-center">
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition">
                Talk to Sales
              </button>
            </div>
            <p className="text-blue-100 mt-6">No credit card required • Free forever • Cancel anytime</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                  Remote Works
                </div>
                <p className="text-gray-400 mb-4">
                  Empowering anyone, anywhere to earn remotely and unlock real income through AI-driven opportunities.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4">For Workers</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-blue-400 transition">Become a Freelancer</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition">Become an Agent</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition">Browse Projects</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition">How It Works</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4">For Businesses</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-blue-400 transition">Hire Talent</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition">Pricing</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition">Enterprise Solutions</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition">Success Stories</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-blue-400 transition">About Us</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition">Contact</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">© 2025 Remote Works. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-blue-400 transition">Twitter</a>
                <a href="#" className="hover:text-blue-400 transition">LinkedIn</a>
                <a href="#" className="hover:text-blue-400 transition">Facebook</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
