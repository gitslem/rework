import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Loader, CheckCircle, XCircle } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../lib/authStore';

export default function GitHubCallback() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting your GitHub account...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL
        const { code } = router.query;

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received from GitHub');
          return;
        }

        if (!user) {
          // If not logged in, use GitHub OAuth to login
          setMessage('Logging in with GitHub...');

          const response = await api.post('/auth/github', {
            code: code as string,
            role: 'freelancer' // Default role
          });

          if (response.data.access_token) {
            // Store tokens and redirect
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);

            setStatus('success');
            setMessage('GitHub login successful! Redirecting...');

            setTimeout(() => {
              router.push('/dashboard');
            }, 1500);
          }
        } else {
          // If logged in, connect GitHub to existing account
          setMessage('Connecting GitHub to your account...');

          const response = await api.post('/auth/github/connect', {
            code: code as string
          });

          setStatus('success');
          setMessage(response.data.message || 'GitHub account connected successfully!');

          setTimeout(() => {
            router.push('/proofs');
          }, 1500);
        }
      } catch (error: any) {
        console.error('GitHub OAuth error:', error);
        setStatus('error');
        setMessage(
          error.response?.data?.detail ||
          'Failed to connect GitHub account. Please try again.'
        );
      }
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router.isReady, router.query, user]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {status === 'loading' && (
          <div className="text-center">
            <Loader className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connecting GitHub
            </h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Success!
            </h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => router.push(user ? '/proofs' : '/login')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {user ? 'Back to Proofs' : 'Back to Login'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
