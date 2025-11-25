import { useRouter } from 'next/router';
import Logo from './Logo';
import { Mail, MapPin, ArrowRight, Briefcase, Phone, Send, Linkedin, Star } from 'lucide-react';

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="bg-black text-gray-400">
      {/* Agent CTA Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Become a Verified Agent
              </h3>
              <p className="text-white text-opacity-90 text-lg">
                Help candidates succeed and earn money doing it
              </p>
            </div>
            <button
              onClick={() => router.push('/agent-signup')}
              className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all flex items-center shadow-xl hover-lift"
            >
              <Briefcase className="w-5 h-5 mr-2" />
              Apply Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>

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
                  <a href="tel:+19253754195" className="hover:text-white transition-colors">
                    +1 (925) 375-4195
                  </a>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <span>5 Buttermill Ave, ON CA</span>
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
