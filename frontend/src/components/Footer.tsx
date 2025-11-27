import { useState } from 'react';
import { useRouter } from 'next/router';
import Logo from './Logo';
import { Mail, MapPin, Phone, Send, Linkedin, Star, CheckCircle, Loader } from 'lucide-react';
import { getFirebaseFirestore, isFirebaseConfigured } from '@/lib/firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default function Footer() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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

    // Check Firebase configuration
    if (!isFirebaseConfigured) {
      setErrorMessage('Service temporarily unavailable. Please try again later.');
      setSubscriptionStatus('error');
      setTimeout(() => {
        setSubscriptionStatus('idle');
        setErrorMessage('');
      }, 3000);
      return;
    }

    setSubscriptionStatus('loading');

    try {
      const db = getFirebaseFirestore();
      const emailLower = email.toLowerCase().trim();

      // Add new subscription (removed duplicate check as it requires read permission)
      await addDoc(collection(db, 'newsletter_subscriptions'), {
        email: emailLower,
        subscribedAt: Timestamp.now(),
        source: 'footer',
        status: 'active'
      });

      setSubscriptionStatus('success');
      setEmail('');
      setTimeout(() => setSubscriptionStatus('idle'), 5000);
    } catch (error: any) {
      console.error('Subscription error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      // Provide specific error messages
      if (error.code === 'permission-denied') {
        setErrorMessage('Please check Firebase rules. See browser console for details.');
      } else if (error.code === 'unavailable') {
        setErrorMessage('Service temporarily unavailable. Please try again later.');
      } else if (error.code === 'already-exists') {
        setErrorMessage('This email is already subscribed');
      } else {
        setErrorMessage(`Error: ${error.message || 'Failed to subscribe. Please try again.'}`);
      }

      setSubscriptionStatus('error');
      setTimeout(() => {
        setSubscriptionStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  return (
    <footer className="bg-black text-gray-400">
      {/* Main Footer Content */}
      <div className="py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-start mb-4">
                <Logo textClassName="text-white" showText={true} size="sm" />
              </div>
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
              <ul className="space-y-3 text-sm mb-6">
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
                    onClick={() => router.push('/#how-it-works')}
                    className="hover:text-white transition-colors inline-block"
                  >
                    How It Works
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
                    onClick={() => router.push('/faq')}
                    className="hover:text-white transition-colors inline-block"
                  >
                    FAQ
                  </button>
                </li>
              </ul>

              {/* Newsletter Subscription */}
              <div className="mt-6">
                <h5 className="text-white font-semibold text-xs mb-3 uppercase tracking-wider">Stay Updated</h5>
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    disabled={subscriptionStatus === 'loading' || subscriptionStatus === 'success'}
                    className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                  <button
                    type="submit"
                    disabled={subscriptionStatus === 'loading' || subscriptionStatus === 'success'}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                      <span>Subscribe</span>
                    )}
                  </button>

                  {/* Status Messages */}
                  {subscriptionStatus === 'success' && (
                    <p className="text-green-400 text-xs animate-fade-in">Thanks for subscribing!</p>
                  )}
                  {subscriptionStatus === 'error' && errorMessage && (
                    <p className="text-red-400 text-xs animate-fade-in">{errorMessage}</p>
                  )}
                </form>
              </div>
            </div>

            {/* For Agents */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
                For Agents
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button
                    onClick={() => router.push('/agent-signup')}
                    className="hover:text-white transition-colors inline-block"
                  >
                    Become an Agent
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/agent-signup#how-it-works')}
                    className="hover:text-white transition-colors inline-block"
                  >
                    Agent Benefits
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/support')}
                    className="hover:text-white transition-colors inline-block"
                  >
                    Get Support
                  </button>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
                Resources
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
