import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/authStore';
import Link from 'next/link';
import Head from 'next/head';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

export default function Login() {
  const router = useRouter();
  const googleAuth = useAuthStore((state) => state.googleAuth);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError('');
    setLoading(true);

    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      await googleAuth(credentialResponse.credential);
      router.push('/dashboard');
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
        <title>Login - Remote Works</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600">Sign in with your Google account to continue</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {loading && (
              <div className="text-center mb-6">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Signing in...</p>
              </div>
            )}

            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Sign up
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

            <div className="mt-6 text-center text-xs text-gray-500">
              <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
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
