import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/authStore';
import Link from 'next/link';
import Head from 'next/head';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Users, Briefcase, Building } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const googleAuth = useAuthStore((state) => state.googleAuth);
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('freelancer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
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
      title: 'Freelancer',
      description: 'Work on projects and earn 99.9% of your income',
      icon: <Users className="w-12 h-12" />,
      color: 'blue'
    },
    {
      value: 'agent',
      title: 'Agent',
      description: 'Work on behalf of others and earn 3x more',
      icon: <Briefcase className="w-12 h-12" />,
      color: 'purple'
    },
    {
      value: 'business',
      title: 'Business',
      description: 'Hire talented remote workers for your projects',
      icon: <Building className="w-12 h-12" />,
      color: 'green'
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
        <title>Sign Up - Remote Works</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Create Your Account
              </h1>
              <p className="text-gray-600">Start your remote work journey today</p>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  1
                </div>
                <div className={`w-20 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
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
                <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  Choose Your Role
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => {
                        setRole(r.value);
                        setStep(2);
                      }}
                      className={`p-6 border-2 rounded-xl hover:shadow-lg transition transform hover:-translate-y-1 ${
                        role === r.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className={`text-${r.color}-600 mb-4 flex justify-center`}>
                        {r.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{r.title}</h3>
                      <p className="text-gray-600 text-sm">{r.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Sign Up as {roles.find(r => r.value === role)?.title}
                  </h2>
                  <p className="text-gray-600">Sign in with your Google account</p>
                </div>

                {loading && (
                  <div className="text-center mb-6">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Creating your account...</p>
                  </div>
                )}

                <div className="flex justify-center mb-6">
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
                    <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
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

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    ← Back to Role Selection
                  </button>
                </div>

                <div className="mt-6 text-center text-xs text-gray-500">
                  <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 mb-4">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Login
                </Link>
              </p>
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                ← Back to Home
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
