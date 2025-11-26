import { useRouter } from 'next/router';
import Logo from './Logo';
import { Mail, MapPin, Phone, Send, Linkedin, Star, CheckCircle } from 'lucide-react';

export default function Footer() {
  const router = useRouter();

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
              <p className="text-gray-500 leading-relaxed text-sm mb-4">
                Connecting candidates with verified agents for AI training opportunities.
              </p>
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-xs font-bold mb-6">
                <CheckCircle className="w-4 h-4" />
                <span>100% Free Platform</span>
              </div>
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
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-600 text-sm">
                © {new Date().getFullYear()} Remote-Works. All rights reserved.
              </p>
              <p className="text-gray-500 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Free to join • No hidden fees • No credit card required</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
