import { useRouter } from 'next/router';
import Logo from './Logo';
import { Mail, Phone, MapPin, Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  const router = useRouter();

  const footerSections = [
    {
      title: 'For Candidates',
      links: [
        { label: 'Find an Agent', href: '/register?type=candidate' },
        { label: 'Browse Agents', href: '/agents' },
        { label: 'How It Works', href: '/#how-it-works' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Success Stories', href: '/testimonials' }
      ]
    },
    {
      title: 'For Agents',
      links: [
        { label: 'Become an Agent', href: '/agent-signup' },
        { label: 'Agent Guidelines', href: '/agent-guidelines' },
        { label: 'Pricing & Fees', href: '/agent-pricing' },
        { label: 'Resources', href: '/resources' }
      ]
    },
    {
      title: 'Platforms',
      links: [
        { label: 'Outlier AI', href: '/platforms/outlier' },
        { label: 'Alignerr', href: '/platforms/alignerr' },
        { label: 'OneForma', href: '/platforms/oneforma' },
        { label: 'All Platforms', href: '/platforms' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Contact', href: '/support' },
        { label: 'Careers', href: '/careers' },
        { label: 'Blog', href: '/blog' },
        { label: 'Press Kit', href: '/press' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/support' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Community', href: '/community' },
        { label: 'Status', href: '/status' },
        { label: 'Report Issue', href: '/report' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'GDPR', href: '/gdpr' },
        { label: 'Compliance', href: '/compliance' }
      ]
    }
  ];

  return (
    <footer className="bg-black text-gray-400 py-16 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Logo textClassName="text-white" className="mb-4" />
            <p className="text-gray-500 leading-relaxed text-sm mb-6">
              The trusted marketplace connecting candidates with verified agents for AI training and remote work opportunities worldwide.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-600" />
                <a href="mailto:support@remoteworks.io" className="hover:text-white transition-colors">
                  support@remoteworks.io
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-600" />
                <a href="tel:+1234567890" className="hover:text-white transition-colors">
                  +1 (234) 567-8900
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span>San Francisco, CA</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              <a
                href="https://twitter.com/remoteworks"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/company/remoteworks"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/remoteworks"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation Sections */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-3 text-sm">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <button
                      onClick={() => router.push(link.href)}
                      className="hover:text-white transition-colors inline-block"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 pt-8 pb-8">
          <div className="max-w-md">
            <h3 className="font-bold text-white mb-2">Stay Updated</h3>
            <p className="text-sm text-gray-500 mb-4">
              Subscribe to our newsletter for the latest updates and opportunities.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:border-gray-700 text-white text-sm"
              />
              <button
                type="submit"
                className="bg-white text-black px-6 py-2 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-gray-600">
            © {new Date().getFullYear()} RemoteWorks. All rights reserved.
          </p>

          <div className="flex space-x-6 mt-4 md:mt-0">
            <button
              onClick={() => router.push('/sitemap')}
              className="hover:text-white transition-colors"
            >
              Sitemap
            </button>
            <button
              onClick={() => router.push('/accessibility')}
              className="hover:text-white transition-colors"
            >
              Accessibility
            </button>
            <button
              onClick={() => router.push('/security')}
              className="hover:text-white transition-colors"
            >
              Security
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
