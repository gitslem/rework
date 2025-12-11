import { useState, useEffect } from 'react';
import { Cookie, X, Check, Shield } from 'lucide-react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');

    if (!cookieConsent) {
      // Show banner after a small delay for better UX
      setTimeout(() => {
        setShowBanner(true);
        setTimeout(() => setIsVisible(true), 100);
      }, 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    closeBanner();
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    closeBanner();
  };

  const closeBanner = () => {
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  if (!showBanner) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="mx-4 mb-4 md:mx-6 md:mb-6">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Gradient accent bar */}
          <div className="h-1 bg-gradient-to-r from-purple-600 via-amber-500 to-yellow-500"></div>

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Left side - Icon and Text */}
              <div className="flex items-start gap-4 flex-1">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-amber-100 rounded-xl flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-purple-600" />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-black mb-2 flex items-center gap-2">
                    We value your privacy
                    <Shield className="w-4 h-4 text-gray-600" />
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We use cookies to enhance your browsing experience, provide personalized content, and analyze our traffic.
                    By clicking "Accept", you consent to our use of cookies.{' '}
                    <a href="/privacy" className="text-purple-600 hover:text-purple-700 font-medium underline">
                      Learn more
                    </a>
                  </p>
                </div>
              </div>

              {/* Right side - Action buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleReject}
                  className="flex-1 md:flex-none px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Accept Cookies
                </button>
              </div>
            </div>

            {/* Additional info */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                🍪 We use essential cookies for site functionality and analytics cookies to understand how you use our site.
                You can change your preferences anytime in settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
