import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '@/components/Logo';
import { CheckCircle, Clock, Mail, ArrowRight } from 'lucide-react';

export default function AgentSignupSuccess() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Application Submitted - RemoteWorks</title>
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Logo />
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <div className="space-y-8 animate-fade-in">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            </div>

            {/* Main Message */}
            <div>
              <h1 className="text-4xl font-bold text-black mb-4">
                Application Submitted!
              </h1>
              <p className="text-xl text-gray-600">
                Thank you for applying to become a verified agent on RemoteWorks
              </p>
            </div>

            {/* What's Next Section */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 text-left">
              <h2 className="text-2xl font-bold text-black mb-6 text-center">What Happens Next?</h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold mr-4">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Review Process</h3>
                    <p className="text-gray-600">
                      Our admin team will carefully review your application and verify your credentials
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold mr-4">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Email Notification</h3>
                    <p className="text-gray-600">
                      You'll receive an email within 24-48 hours with the approval decision
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold mr-4">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Start Working</h3>
                    <p className="text-gray-600">
                      Once approved, you can immediately start accepting clients and earning
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-left">
                <Clock className="w-8 h-8 text-black mb-3" />
                <h3 className="font-bold text-black mb-2">Review Timeline</h3>
                <p className="text-sm text-gray-600">
                  Most applications are reviewed within 24-48 hours. You'll be notified via email as soon as a decision is made.
                </p>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-left">
                <Mail className="w-8 h-8 text-black mb-3" />
                <h3 className="font-bold text-black mb-2">Check Your Email</h3>
                <p className="text-sm text-gray-600">
                  We've sent a confirmation email. Please check your inbox (and spam folder) for updates.
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="pt-8 space-y-4">
              <button
                onClick={() => router.push('/')}
                className="bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-all inline-flex items-center"
              >
                Return to Homepage
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>

              <p className="text-sm text-gray-500">
                Have questions?{' '}
                <button
                  onClick={() => router.push('/support')}
                  className="text-black font-semibold hover:underline"
                >
                  Contact Support
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
