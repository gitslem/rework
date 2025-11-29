import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';
import { signInWithGoogle } from '@/lib/firebase/auth';
import { getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for auth state changes to handle redirect after popup closes
    const auth = getFirebaseAuth();
    const db = getFirebaseFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !loading) {
        setLoading(true);

        try {
          // Get user data to determine role
          const userDoc = await getDoc(doc(db, 'users', user.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();

            // Redirect based on role
            if (userData.role === 'agent') {
              router.push('/agent-dashboard');
            } else {
              router.push('/candidate-dashboard');
            }
          }
        } catch (err) {
          console.error('Error checking user role:', err);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      // Sign in with Google (popup will open)
      await signInWithGoogle('candidate');

      // Auth state listener above will handle the redirect
    } catch (err: any) {
      console.error('Login error:', err);

      // Don't show error if popup was just closed by user
      if (err.message && !err.message.includes('cancelled') && !err.message.includes('closed')) {
        setError(err.message || 'Google login failed. Please try again.');
      }
      setLoading(false);
    }
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
              <Logo size="lg" showText={true} />
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
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
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
