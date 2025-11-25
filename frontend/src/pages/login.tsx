import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/authStore';
import Link from 'next/link';
import Head from 'next/head';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Globe2, ArrowLeft } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const googleAuth = useAuthStore((state) => state.googleAuth);
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

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError('');
    setLoading(true);

    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      await googleAuth(credentialResponse.credential);

      // Get user data to check role
      const { user } = useAuthStore.getState();

      // Redirect based on role
      if (user?.role === 'business') {
        router.push('/company-dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  return (
    <>
      <Head>
        <title>Login - Remote-Works</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-accent-gray-200">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
                <Globe2 className="w-10 h-10 text-primary-500 mr-2" />
                <div className="text-3xl font-bold text-accent-dark">
                  Remote-<span className="gradient-text">Works</span>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-accent-dark mb-2">
                Welcome Back
              </h1>
              <p className="text-accent-gray-600">Sign in with your Google account to continue</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {loading && (
              <div className="text-center mb-6">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <p className="mt-2 text-accent-gray-600">Signing in...</p>
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
                  text="signin_with"
                  shape="rectangular"
                />
              ) : (
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 font-semibold mb-2">Google OAuth Not Configured</p>
                  <p className="text-yellow-700 text-sm">
                    Please configure your Google OAuth credentials to enable sign in.
                  </p>
                  <p className="text-yellow-600 text-xs mt-2">
                    See GOOGLE_OAUTH_SETUP.md for instructions
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-accent-gray-200">
              <div className="text-center">
                <p className="text-accent-gray-600 mb-4">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="text-primary-500 hover:text-primary-600 font-semibold">
                    Sign up
                  </Link>
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="text-accent-gray-600 hover:text-accent-dark text-sm inline-flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-accent-gray-500">
              <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
