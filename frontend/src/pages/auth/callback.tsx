import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getFirebaseAuth, getFirebaseFirestore, isFirebaseConfigured } from '@/lib/firebase/config';
import { getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserRole } from '@/types';
import Logo from '@/components/Logo';

/**
 * Dedicated OAuth Callback Handler
 *
 * This page handles ALL OAuth redirects (Google, GitHub, etc.) for the application.
 * It's designed to work reliably on iPhone Chrome by using URL parameters instead
 * of sessionStorage/localStorage which can be blocked by privacy controls.
 *
 * Flow:
 * 1. User clicks "Sign in with Google" on /register or /agent-signup
 * 2. signInWithRedirect() is called with state in URL
 * 3. User authenticates with Google
 * 4. Google redirects back to THIS page with the auth result
 * 5. We process the result and redirect to the appropriate page
 */

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Completing sign-in...');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      console.log('=== AUTH CALLBACK PAGE LOADED ===');
      console.log('URL:', window.location.href);
      console.log('Query params:', router.query);

      if (!isFirebaseConfigured) {
        throw new Error('Firebase is not configured. Please contact support.');
      }

      const auth = getFirebaseAuth();
      const db = getFirebaseFirestore();

      // Get the intended role from URL parameters (set before redirect)
      // Fallback to storage for backward compatibility
      let role = (router.query.role as UserRole) ||
                 sessionStorage.getItem('pendingRole') as UserRole ||
                 localStorage.getItem('pendingRole') as UserRole ||
                 'candidate';

      console.log('Role from URL or storage:', role);

      setMessage('Retrieving authentication result...');

      // Wait a moment for Firebase to be ready (especially on iOS)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the redirect result
      console.log('Calling getRedirectResult...');
      const result = await getRedirectResult(auth);
      console.log('Redirect result:', result ? 'Found' : 'None');

      if (!result || !result.user) {
        // No redirect result - check if user is already signed in
        if (auth.currentUser) {
          console.log('No redirect result, but user is already signed in:', auth.currentUser.email);
          await processAuthenticatedUser(auth.currentUser, role, db);
          return;
        }

        // No result and no current user - something went wrong
        console.error('No redirect result and no current user');
        throw new Error('Authentication failed. Please try again.');
      }

      // Process the authenticated user
      const firebaseUser = result.user;
      console.log('Authenticated user:', firebaseUser.email);

      await processAuthenticatedUser(firebaseUser, role, db);

    } catch (error: any) {
      console.error('Auth callback error:', error);
      setStatus('error');
      setError(error.message || 'Authentication failed');
      setMessage('Authentication failed. Please try again.');

      // Clear any stored role
      sessionStorage.removeItem('pendingRole');
      localStorage.removeItem('pendingRole');

      // Redirect to login after showing error
      setTimeout(() => {
        router.push('/register?error=auth_failed');
      }, 3000);
    }
  };

  const processAuthenticatedUser = async (firebaseUser: any, role: UserRole, db: any) => {
    try {
      setMessage('Setting up your account...');

      // Clear stored role
      sessionStorage.removeItem('pendingRole');
      localStorage.removeItem('pendingRole');

      // Check if user already exists in Firestore
      console.log('Checking if user exists in Firestore...');
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (userDoc.exists()) {
        // Existing user
        const userData = userDoc.data();
        console.log('Existing user found, role:', userData.role);

        // Check if profile is complete
        const profileDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));

        if (profileDoc.exists()) {
          const profileData = profileDoc.data();

          if (profileData.firstName && profileData.firstName.trim() !== '') {
            // Profile is complete - redirect to dashboard
            console.log('Profile complete, redirecting to dashboard');
            setStatus('success');
            setMessage('Welcome back! Redirecting to dashboard...');

            setTimeout(() => {
              if (userData.role === 'agent') {
                router.push('/agent-dashboard');
              } else {
                router.push('/candidate-dashboard');
              }
            }, 1000);
            return;
          }
        }

        // Profile is incomplete - redirect to complete profile
        console.log('Profile incomplete, redirecting to complete-profile');
        setStatus('success');
        setMessage('Please complete your profile...');

        setTimeout(() => {
          router.push('/complete-profile');
        }, 1000);
        return;
      }

      // New user - create user and profile documents
      console.log('Creating new user with role:', role);
      setMessage('Creating your account...');

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        role: role,
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
        isActive: true,
        isVerified: firebaseUser.emailVerified,
        isCandidateApproved: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      console.log('User document created');

      // Create empty profile
      const profileData = {
        uid: firebaseUser.uid,
        firstName: '',
        lastName: '',
        bio: '',
        avatarURL: firebaseUser.photoURL || '',
        location: '',
        phone: '',
        website: '',
        linkedin: '',
        totalEarnings: 0,
        completedProjects: 0,
        averageRating: 0,
        totalReviews: 0,
        isAgentApproved: false,
        agentServices: [],
        agentSuccessRate: 0,
        agentTotalClients: 0,
        agentVerificationStatus: 'pending',
        agentPricing: {},
        agentPortfolio: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'profiles', firebaseUser.uid), profileData);
      console.log('Profile document created');

      // Redirect based on role
      setStatus('success');
      setMessage('Account created! Please complete your profile...');

      setTimeout(() => {
        if (role === 'candidate') {
          router.push('/complete-profile');
        } else {
          // For agents, go to agent-signup to fill in additional details
          router.push('/agent-signup?step=form');
        }
      }, 1000);

    } catch (error: any) {
      console.error('Error processing authenticated user:', error);
      throw error;
    }
  };

  return (
    <>
      <Head>
        <title>Completing Sign In - Remote Works</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <Logo className="h-12 mx-auto" />
          </div>

          {status === 'processing' && (
            <>
              <div className="mb-6">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Completing Sign In
              </h1>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Success!
              </h1>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Authentication Failed
              </h1>
              <p className="text-gray-600 mb-4">{error || message}</p>
              <button
                onClick={() => router.push('/register')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
