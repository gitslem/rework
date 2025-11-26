import { useState } from 'react';
import { useRouter } from 'next/router';
import Logo from './Logo';
import { Mail, MapPin, ArrowRight, Briefcase, Phone, Send, Linkedin, Star, CheckCircle, Loader } from 'lucide-react';
import { getFirebaseFirestore } from '@/lib/firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default function Footer() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      setSubscriptionStatus('error');
      setTimeout(() => setSubscriptionStatus('idle'), 3000);
      return;
    }

    setSubscriptionStatus('loading');
    setErrorMessage('');

    try {
      const db = getFirebaseFirestore();
      await addDoc(collection(db, 'newsletter_subscriptions'), {
        email: email.toLowerCase().trim(),
        subscribedAt: Timestamp.now(),
        source: 'footer',
        status: 'active'
      });

      setSubscriptionStatus('success');
      setEmail('');
      setTimeout(() => setSubscriptionStatus('idle'), 5000);
    } catch (error: any) {
      console.error('Subscription error:', error);
      setErrorMessage('Failed to subscribe. Please try again.');
      setSubscriptionStatus('error');
      setTimeout(() => setSubscriptionStatus('idle'), 3000);
    }
  };

  return (
    <footer className="bg-black text-gray-400">
      {/* Main Footer Content */}
      <div className="py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <Logo textClassName="text-white" className="mb-4" showText={true} size="md" />
              <p className="text-gray-500 leading-relaxed text-sm mb-6">
                Connecting candidates with verified agents for AI training opportunities.
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <Mail className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <a href="mailto:support@remote-works.io" className="hover:text-white transition-colors break-all">
                    support@remote-works.io
                  </a>
                </div>
                <div className="flex items-start space-x-2">
                  <Phone className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <a href="tel:+16479821234" className="hover:text-white transition-colors">
                    +1 (647) 982-1234
                  </a>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <span>5 Buttermill Avenue, Concord, ON L4K 3X2, Canada</span>
                </div>
              </div>
            </div>

            {/* For Candidates */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
                For Candidates
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button
                    onClick={() => router.push('/register?type=candidate')}
                    className="hover:text-white transition-colors inline-block"
                  >
                    Find an Agent
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/agents')}
                    className="hover:text-white transition-colors inline-block"
                  >
                    Browse Agents
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/#how-it-works')}
                    className="hover:text-white transition-colors inline-block"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/faq')}
                    className="hover:text-white transition-colors inline-block"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
                Company
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button
                    onClick={() => router.push('/about')}
                    className="hover:text-white transition-colors inline-block"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/support')}
                    className="hover:text-white transition-colors inline-block"
                  >
                    Support
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/terms')}
                    className="hover:text-white transition-colors inline-block"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/privacy')}
                    className="hover:text-white transition-colors inline-block"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/agent-signup')}
                    className="hover:text-white transition-colors inline-block"
                  >
                    Become an Agent
                  </button>
                </li>
              </ul>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
                Connect With Us
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Follow us on social media and leave a review.
              </p>
              <div className="space-y-3">
                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/company/remo-teworks/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">LinkedIn</span>
                </a>

                {/* Telegram */}
                <a
                  href="https://t.me/remote_worksio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                    <Send className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Telegram</span>
                </a>

                {/* Trustpilot */}
                <a
                  href="https://ca.trustpilot.com/review/remote-works.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <span className="text-sm font-medium">Trustpilot</span>
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter Subscription Section */}
          <div className="border-t border-gray-800 mt-12 pt-12">
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-purple-900 via-pink-900 to-blue-900 rounded-2xl p-8 md:p-10 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-5 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full opacity-5 blur-3xl"></div>

                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-10 rounded-full mb-4 backdrop-blur-sm">
                    <Mail className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Stay Updated
                  </h3>
                  <p className="text-gray-300 mb-6 text-sm md:text-base">
                    Get the latest opportunities, success stories, and exclusive tips delivered to your inbox.
                  </p>

                  <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          disabled={subscriptionStatus === 'loading'}
                          className="w-full px-5 py-4 rounded-full bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={subscriptionStatus === 'loading' || subscriptionStatus === 'success'}
                        className="bg-white text-black px-8 py-4 rounded-full font-bold text-sm hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        {subscriptionStatus === 'loading' ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            <span>Subscribing...</span>
                          </>
                        ) : subscriptionStatus === 'success' ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Subscribed!</span>
                          </>
                        ) : (
                          <>
                            <span>Subscribe</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Status Messages */}
                    {subscriptionStatus === 'success' && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-green-300 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>Successfully subscribed! Check your inbox.</span>
                      </div>
                    )}
                    {subscriptionStatus === 'error' && errorMessage && (
                      <div className="mt-4 text-red-300 text-sm text-center">
                        {errorMessage}
                      </div>
                    )}
                  </form>

                  <p className="text-gray-400 text-xs mt-4">
                    No spam, unsubscribe anytime. We respect your privacy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Remote-Works. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
