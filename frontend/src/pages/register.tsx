import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Users, Building, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { signInWithGoogle, handleRedirectResult } from '@/lib/firebase/auth';
import { UserRole } from '@/types';
import Logo from '@/components/Logo';
import { isFirebaseConfigured, getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(2); // Skip role selection, go directly to candidate sign up
  const [role, setRole] = useState<UserRole>('candidate'); // Always candidate
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [redirecting, setRedirecting] = useState(false); // Flag to prevent multiple redirects

  useEffect(() => {
    // Always set role as candidate for register page
    // Agent sign up is only available through footer "Become an Agent" link
    setRole('candidate');
    setStep(2);

    console.log('=== REGISTER PAGE LOADED ===');
    console.log('Checking for redirect result...');

    let hasHandledRedirect = false;

    // Check for redirect result first (for mobile/redirect flow)
    const checkAndHandleRedirect = async () => {
      try {
        console.log('Calling handleRedirectResult...');
        const redirectUser = await handleRedirectResult();
        console.log('handleRedirectResult returned:', redirectUser);

        if (redirectUser && !hasHandledRedirect) {
          hasHandledRedirect = true;
          setRedirecting(true);
          setInitializing(false);

          console.log('Redirect user found:', redirectUser.email, 'Role:', redirectUser.role);

          // Small delay to ensure Firestore has replicated
          await new Promise(resolve => setTimeout(resolve, 500));

          // User signed in via redirect, check profile and redirect
          const db = getFirebaseFirestore();
          console.log('Fetching profile for redirect user:', redirectUser.uid);
          const profileDoc = await getDoc(doc(db, 'profiles', redirectUser.uid));
          console.log('Profile exists:', profileDoc.exists());

          if (profileDoc.exists()) {
            const profileData = profileDoc.data();
            console.log('Profile firstName:', profileData.firstName);

            if (profileData.firstName && profileData.firstName.trim() !== '') {
              // Profile complete
              console.log('REDIRECT: Profile complete, going to dashboard');
              if (redirectUser.role === 'agent') {
                console.log('Redirecting to /agent-dashboard');
                router.push('/agent-dashboard');
              } else {
                console.log('Redirecting to /candidate-dashboard');
                router.push('/candidate-dashboard');
              }
            } else {
              // Profile incomplete - redirect to complete-profile
              console.log('REDIRECT: Profile incomplete, going to /complete-profile');
              router.push('/complete-profile');
            }
          } else {
            // No profile found
            console.log('REDIRECT: No profile found, going to /complete-profile');
            router.push('/complete-profile');
          }
          return true;
        } else {
          console.log('No redirect user found');
        }
        return false;
      } catch (err) {
        console.error('Error in checkAndHandleRedirect:', err);
        return false;
      }
    };

    checkAndHandleRedirect().then(handled => {
      if (handled) {
        console.log('Redirect handled successfully');
        return;
      }

      console.log('No redirect to handle, showing sign-up page');
      // Only set initializing to false if no redirect happened
      setInitializing(false);
    });
  }, [router]);

  const roles = [
    {
      value: 'candidate' as UserRole,
      title: 'Candidate',
      description: 'Connect with verified professionals who provide expert guidance for remote work platform applications',
      icon: <Users className="w-12 h-12" />,
      features: [
        'Browse verified agents',
        'Direct messaging with agents',
        'Flexible pricing options: free, paid, and revenue-share models',
        '98% success rate'
      ],
      color: 'primary'
    },
    {
      value: 'agent' as UserRole,
      title: 'Agent',
      description: 'Help candidates get approved and earn money for each successful placement',
      icon: <Building className="w-12 h-12" />,
      features: [
        'Build your client base',
        'Set your own rates',
        'Secure payment processing',
        'Verified agent badge'
      ],
      color: 'purple'
    }
  ];

  const handleGoogleSignUp = async () => {
    // Prevent multiple redirects
    if (redirecting) {
      console.log('Already redirecting, blocking duplicate request');
      return;
    }

    setError('');
    setLoading(true);
    console.log('=== GOOGLE SIGN-UP STARTED ===');
    console.log('Role:', role);

    try {
      if (!isFirebaseConfigured) {
        setError('Firebase is not configured. Please contact support.');
        setLoading(false);
        return;
      }

      console.log('Calling signInWithGoogle...');
      const user = await signInWithGoogle(role);
      console.log('signInWithGoogle completed, user:', user);

      // Mark that we're redirecting to prevent auth listener from interfering
      setRedirecting(true);

      // Small delay to ensure Firestore has replicated the data
      await new Promise(resolve => setTimeout(resolve, 500));

      // After successful sign-up, check profile and redirect immediately
      const db = getFirebaseFirestore();
      console.log('Fetching profile for user:', user.uid);
      const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
      console.log('Profile exists:', profileDoc.exists());

      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        console.log('Profile data:', profileData);
        console.log('firstName:', profileData.firstName);
        console.log('isEmpty:', !profileData.firstName || profileData.firstName === '');

        if (profileData.firstName && profileData.firstName.trim() !== '') {
          // Profile complete, redirect to dashboard
          console.log('Profile COMPLETE - redirecting to dashboard');
          if (user.role === 'agent') {
            console.log('Redirecting to /agent-dashboard');
            router.push('/agent-dashboard');
          } else {
            console.log('Redirecting to /candidate-dashboard');
            router.push('/candidate-dashboard');
          }
        } else {
          // Profile incomplete, redirect to complete-profile form
          console.log('Profile INCOMPLETE - redirecting to /complete-profile');
          router.push('/complete-profile');
        }
      } else {
        // No profile exists, redirect to complete-profile form
        console.log('NO PROFILE EXISTS - redirecting to /complete-profile');
        router.push('/complete-profile');
      }
    } catch (err: any) {
      console.error('=== REGISTRATION ERROR ===', err);

      // Don't show error if redirect is in progress or popup was closed
      if (err.message === 'REDIRECT_IN_PROGRESS' ||
          err.message?.includes('cancelled') ||
          err.message?.includes('closed')) {
        console.log('Redirect in progress or popup closed, resetting state');
        setLoading(false);
        setRedirecting(false);
        return;
      }

      setError(err.message || 'Google sign up failed. Please try again.');
      setLoading(false);
      setRedirecting(false);
    }
  };

  // Show loading state during initialization
  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
          <p className="text-accent-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sign Up - Remote-Works</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-5xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-accent-gray-200">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Logo size="lg" showText={true} onClick={() => router.push('/')} />
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
                  How will you use Remote-Works?
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
                  <p className="text-accent-gray-600">After signing up, you'll complete your profile</p>
                </div>

                {loading && (
                  <div className="text-center mb-6">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
                    <p className="mt-3 text-accent-gray-600 font-medium">Creating your account...</p>
                  </div>
                )}

                {/* Google Sign-up */}
                <div className="mb-8">
                  <button
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                    type="button"
                    className="w-full bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>
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
                  <p>By signing up, you agree to our <Link href="/terms" className="text-primary-500 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary-500 hover:underline">Privacy Policy</Link></p>
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
