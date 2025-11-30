import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Users, Building, Globe2, ArrowLeft, Check, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { registerWithEmail, signInWithGoogle, handleRedirectResult } from '@/lib/firebase/auth';
import { UserRole } from '@/types';
import { isFirebaseConfigured, getFirebaseFirestore } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export default function RegisterNew() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>('candidate');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    if (typeParam === 'candidate' || typeParam === 'agent') {
      setRole(typeParam as UserRole);
      setStep(2);
    }

    // Check for redirect result
    checkRedirectResult();
  }, []);

  const checkRedirectResult = async () => {
    try {
      if (!isFirebaseConfigured) {
        setInitializing(false);
        return;
      }

      const user = await handleRedirectResult();
      if (user) {
        // Check if profile is complete
        const db = getFirebaseFirestore();
        const profileDoc = await getDoc(doc(db, 'profiles', user.uid));

        if (profileDoc.exists() && profileDoc.data().firstName) {
          // Profile complete, navigate to dashboard
          if (user.role === 'agent') {
            router.push('/agent-dashboard');
          } else {
            router.push('/candidate-dashboard');
          }
        } else {
          // Profile incomplete, navigate to complete-profile
          router.push('/complete-profile');
        }
      }
    } catch (error) {
      console.error('Error checking redirect result:', error);
    } finally {
      setInitializing(false);
    }
  };

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
    }
  ];

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await registerWithEmail(
        formData.email,
        formData.password,
        role,
        formData.firstName,
        formData.lastName
      );

      // Redirect based on role
      if (role === 'agent') {
        router.push('/agent-dashboard');
      } else {
        router.push('/candidate-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      if (!isFirebaseConfigured) {
        setError('Firebase is not configured. Please contact support.');
        setLoading(false);
        return;
      }

      const user = await signInWithGoogle(role);

      // After successful sign-up, check profile and redirect immediately
      const db = getFirebaseFirestore();
      const profileDoc = await getDoc(doc(db, 'profiles', user.uid));

      if (profileDoc.exists()) {
        const profileData = profileDoc.data();

        if (profileData.firstName) {
          // Profile complete, redirect to dashboard
          if (user.role === 'agent') {
            router.push('/agent-dashboard');
          } else {
            router.push('/candidate-dashboard');
          }
        } else {
          // Profile incomplete, redirect to complete-profile form
          router.push('/complete-profile');
        }
      } else {
        // No profile exists, redirect to complete-profile form
        router.push('/complete-profile');
      }
    } catch (err: any) {
      // Don't show error if redirect is in progress
      if (err.message === 'REDIRECT_IN_PROGRESS') {
        return;
      }

      setError(err.message || 'Google sign up failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up - Remote-Works</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-5xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-200">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
                <Globe2 className="w-10 h-10 text-blue-600 mr-2" />
                <div className="text-3xl font-bold text-gray-900">
                  Remote-<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Works</span>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Create Your Account
              </h1>
              <p className="text-gray-600 text-lg">Join the marketplace for remote work success</p>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-center mb-12">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {step > 1 ? <Check className="w-6 h-6" /> : '1'}
                </div>
                <div className={`w-24 h-1 transition ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
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
                        role === r.value ? 'border-blue-600 bg-blue-50 shadow-lg' : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-blue-600 mb-6">
                        {r.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{r.title}</h3>
                      <p className="text-gray-600 mb-6">{r.description}</p>
                      <ul className="space-y-3">
                        {r.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
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
                  <div className="inline-flex items-center space-x-3 bg-blue-100 px-6 py-3 rounded-full mb-4">
                    <span className="text-blue-700 font-semibold">
                      Signing up as {roles.find(r => r.value === role)?.title}
                    </span>
                  </div>
                </div>

                {loading && (
                  <div className="text-center mb-6">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <p className="mt-3 text-gray-600 font-medium">Creating your account...</p>
                  </div>
                )}

                {/* Email Registration Form */}
                <form onSubmit={handleEmailRegister} className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                          placeholder="John"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Account
                  </button>
                </form>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                {/* Google Sign In */}
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
                  Sign up with Google
                </button>

                <div className="flex justify-center mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Change Role
                  </button>
                </div>

                <div className="text-center text-xs text-gray-500 mt-6">
                  <p>By signing up, you agree to our <button onClick={() => router.push('/terms')} className="text-blue-600 hover:underline">Terms of Service</button> and <button onClick={() => router.push('/privacy')} className="text-blue-600 hover:underline">Privacy Policy</button></p>
                </div>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-600 mb-4">
                Already have an account?{' '}
                <Link href="/login-new" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Login
                </Link>
              </p>
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900 text-sm inline-flex items-center"
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
