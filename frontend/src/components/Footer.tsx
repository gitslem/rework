import { useRouter } from 'next/router';
import Logo from './Logo';
import { Mail, MapPin, ArrowRight, Briefcase } from 'lucide-react';

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
              <Logo textClassName="text-white" className="mb-4" showText={true} size="sm" />
              <p className="text-gray-500 leading-relaxed text-sm mb-6">
                Connecting candidates with verified agents for AI training opportunities.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <a href="mailto:support@remoteworks.io" className="hover:text-white transition-colors">
                    support@remoteworks.io
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span>Available Worldwide</span>
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

            {/* Stay Connected */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
                Stay Connected
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Get updates on new opportunities and platform features.
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-gray-700 text-white text-sm"
                />
                <button
                  type="submit"
                  className="w-full bg-white text-black px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm gap-4">
            <p className="text-gray-600 text-center md:text-left">
              © {new Date().getFullYear()} RemoteWorks. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <button
                onClick={() => router.push('/about')}
                className="hover:text-white transition-colors"
              >
                About
              </button>
              <button
                onClick={() => router.push('/faq')}
                className="hover:text-white transition-colors"
              >
                FAQ
              </button>
              <button
                onClick={() => router.push('/support')}
                className="hover:text-white transition-colors"
              >
                Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
