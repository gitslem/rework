import { useRouter } from 'next/router';
import Logo from './Logo';
import { Mail, MapPin, Star, BookOpen, Twitter } from 'lucide-react';

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="bg-black text-gray-400">
      {/* Main Footer Content */}
      <div className="py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {/* Brand Section */}
            <div>
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
                  <MapPin className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <span>5 buttermill ave L4K 0J5, CA</span>
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
                    onClick={() => router.push('/faq')}
                    className="hover:text-white transition-colors inline-block"
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/code-of-conduct')}
                    className="hover:text-white transition-colors inline-block"
                  >
                    Code of Conduct
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/gdpr-compliance')}
                    className="hover:text-white transition-colors inline-block"
                  >
                    GDPR Compliance
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/agent-signup?type=individual')}
                    className="hover:text-white transition-colors inline-block"
                  >
                    Become an Agent
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
                    onClick={() => router.push('/company')}
                    className="hover:text-white transition-colors inline-block"
                  >
                    For Companies
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/trust-transparency')}
                    className="hover:text-white transition-colors inline-block"
                  >
                    Trust & Transparency
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
                Online
              </h4>
              <div className="space-y-3">
                {/* Blog */}
                <a
                  href="https://ai.remote-works.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-amber-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium">Blog</span>
                </a>

                {/* Twitter/X */}
                <a
                  href="https://x.com/remote_worksio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Twitter className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium">Twitter/X</span>
                </a>

                {/* Trustpilot */}
                <a
                  href="https://ca.trustpilot.com/review/remote-works.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Star className="w-5 h-5 text-white fill-current" />
                  </div>
                  <span className="text-sm font-medium">Trustpilot</span>
                </a>
              </div>
            </div>
          </div>

          {/* Disclaimer Section */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <p className="text-gray-400 text-sm leading-relaxed text-center">
                <strong className="text-gray-300">Legal Disclaimer:</strong> Remote-Works.io is an independent platform providing career enablement and recruitment support services.
                We are not affiliated with, endorsed by, or acting on behalf of any third-party company unless explicitly stated in writing.
              </p>
            </div>
            <p className="text-gray-600 text-sm text-center">
              © {new Date().getFullYear()} Remote-Works. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
