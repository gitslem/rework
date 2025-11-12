import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/authStore';
import Link from 'next/link';
import Head from 'next/head';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Users, Building, Globe2, ArrowLeft, Check } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const googleAuth = useAuthStore((state) => state.googleAuth);
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('freelancer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    // Check if there's a pre-selected role from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    if (typeParam === 'client') {
      setRole('business');
      setStep(2);
    } else if (typeParam === 'freelancer') {
      setRole('freelancer');
      setStep(2);
    }

    // Check if Google OAuth is configured
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === '') {
      setIsConfigured(false);
      setError('Google OAuth is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables.');
    }
  }, []);

  const roles = [
    {
      value: 'freelancer',
      title: 'AI Freelancer',
      description: 'Work on AI projects, automations, and get verified for your skills',
      icon: <Users className="w-12 h-12" />,
      features: [
        'Access to global AI projects',
        'Verified freelancer badge',
        'Portfolio & skills showcase',
        'Flexible async work'
      ],
      color: 'primary'
    },
    {
      value: 'business',
      title: 'Company',
      description: 'Hire verified AI freelancers and manage projects across time zones',
      icon: <Building className="w-12 h-12" />,
      features: [
        'Access verified AI talent',
        'Project management tools',
        'AI PM Co-Pilot',
        'Shared sandbox environment'
      ],
      color: 'purple'
    }
  ];

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError('');
    setLoading(true);

    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      await googleAuth(credentialResponse.credential, role);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || 'Google sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign up failed. Please try again.');
  };

  return (
    <>
      <Head>
        <title>Sign Up - Relaywork</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-5xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-accent-gray-200">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
                <Globe2 className="w-10 h-10 text-primary-500 mr-2" />
                <div className="text-3xl font-bold text-accent-dark">
                  Relay<span className="gradient-text">work</span>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-accent-dark mb-2">
                Create Your Account
              </h1>
              <p className="text-accent-gray-600 text-lg">Join the async AI workspace</p>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-center mb-12">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition ${step >= 1 ? 'bg-primary-500 text-white' : 'bg-accent-gray-200 text-accent-gray-600'}`}>
                  {step > 1 ? <Check className="w-6 h-6" /> : '1'}
                </div>
                <div className={`w-24 h-1 transition ${step >= 2 ? 'bg-primary-500' : 'bg-accent-gray-200'}`}></div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition ${step >= 2 ? 'bg-primary-500 text-white' : 'bg-accent-gray-200 text-accent-gray-600'}`}>
                  2
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-accent-dark mb-8 text-center">
                  How will you use Relaywork?
                </h2>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => {
                        setRole(r.value);
                        setStep(2);
                      }}
                      className={`p-8 border-2 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-1 text-left ${
                        role === r.value ? 'border-primary-500 bg-primary-50 shadow-lg' : 'border-accent-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className={`text-primary-500 mb-6`}>
                        {r.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-accent-dark mb-3">{r.title}</h3>
                      <p className="text-accent-gray-600 mb-6">{r.description}</p>
                      <ul className="space-y-3">
                        {r.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-sm text-accent-gray-700">
                            <Check className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center space-x-3 bg-primary-100 px-6 py-3 rounded-full mb-4">
                    <span className="text-primary-700 font-semibold">
                      Signing up as {roles.find(r => r.value === role)?.title}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-accent-dark mb-2">
                    Sign Up with Google
                  </h2>
                  <p className="text-accent-gray-600">Quick and secure authentication</p>
                </div>

                {loading && (
                  <div className="text-center mb-6">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
                    <p className="mt-3 text-accent-gray-600 font-medium">Creating your account...</p>
                  </div>
                )}

                <div className="flex justify-center mb-8">
                  {isConfigured ? (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap
                      theme="outline"
                      size="large"
                      text="signup_with"
                      shape="rectangular"
                    />
                  ) : (
                    <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg w-full">
                      <p className="text-yellow-800 font-semibold mb-2">Google OAuth Not Configured</p>
                      <p className="text-yellow-700 text-sm mb-2">
                        Please configure your Google OAuth credentials to enable sign up.
                      </p>
                      <details className="text-left mt-3">
                        <summary className="cursor-pointer text-yellow-800 font-medium text-sm mb-2">
                          Setup Instructions
                        </summary>
                        <div className="text-yellow-700 text-xs space-y-2 mt-2 pl-4">
                          <p>1. Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></p>
                          <p>2. Create OAuth 2.0 credentials</p>
                          <p>3. Add http://localhost:3000 to authorized origins</p>
                          <p>4. Create frontend/.env.local file:</p>
                          <pre className="bg-yellow-100 p-2 rounded mt-1 text-xs">
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
                          </pre>
                          <p className="mt-2">See GOOGLE_OAUTH_SETUP.md for detailed instructions</p>
                        </div>
                      </details>
                    </div>
                  )}
                </div>

                <div className="flex justify-center mb-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-outline inline-flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Change Role
                  </button>
                </div>

                <div className="text-center text-xs text-accent-gray-500">
                  <p>By signing up, you agree to our <a href="#" className="text-primary-500 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-500 hover:underline">Privacy Policy</a></p>
                </div>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-accent-gray-200 text-center">
              <p className="text-accent-gray-600 mb-4">
                Already have an account?{' '}
                <Link href="/login" className="text-primary-500 hover:text-primary-600 font-semibold">
                  Login
                </Link>
              </p>
              <button
                onClick={() => router.push('/')}
                className="text-accent-gray-600 hover:text-accent-dark text-sm inline-flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Force server-side rendering to avoid static generation issues with GoogleLogin
export async function getServerSideProps() {
  return { props: {} };
}
