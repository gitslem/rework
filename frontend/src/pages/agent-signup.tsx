import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '@/components/Logo';
import AgentRegistrationForm from '@/components/AgentRegistrationForm';
import { signInWithGoogle } from '@/lib/firebase/auth';
import { getFirebaseFirestore } from '../../firebase.config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';

export default function AgentSignup() {
  const router = useRouter();
  const [step, setStep] = useState<'select' | 'google' | 'form'>('select');
  const [userUid, setUserUid] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);

    try {
      const user = await signInWithGoogle('agent');
      setUserUid(user.uid);
      setStep('form');
    } catch (err: any) {
      console.error('Google signup error:', err);
      setError(err.message || 'Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    if (!userUid) {
      throw new Error('User not authenticated');
    }

    try {
      const db = getFirebaseFirestore();

      // Update profile with all the collected data
      await updateDoc(doc(db, 'profiles', userUid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        timezone: formData.timezone,
        bio: formData.bio,
        yearsOfExperience: formData.yearsOfExperience,
        education: formData.education,
        languagesSpoken: formData.languagesSpoken,
        devices: formData.devices,
        internetSpeed: formData.internetSpeed,
        workingHours: formData.workingHours,
        platformsExperience: formData.platformsExperience,
        specializations: formData.specializations,
        linkedin: formData.linkedin,
        website: formData.website,
        agentVerificationStatus: 'pending',
        isAgentApproved: false,
        updatedAt: serverTimestamp(),
      });

      // Redirect to a thank you page
      router.push('/agent-signup-success');
    } catch (error: any) {
      console.error('Error submitting form:', error);
      throw new Error(error.message || 'Failed to submit application');
    }
  };

  return (
    <>
      <Head>
        <title>Become an Agent - RemoteWorks</title>
        <meta name="description" content="Join RemoteWorks as a verified agent and help candidates get approved for AI training projects." />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <Logo />
              <button
                onClick={() => router.push('/')}
                className="text-sm font-medium text-gray-600 hover:text-black flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Home
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Method Selection */}
          {step === 'select' && (
            <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
              <div>
                <h1 className="text-4xl font-bold text-black mb-4">
                  Become a Verified Agent
                </h1>
                <p className="text-xl text-gray-600">
                  Join our platform and help candidates get approved for AI training projects
                </p>
              </div>

              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
                <h2 className="text-2xl font-bold text-black mb-6">How It Works</h2>
                <ol className="text-left space-y-4">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold mr-4">1</span>
                    <div>
                      <h3 className="font-semibold text-black">Sign up with Google</h3>
                      <p className="text-sm text-gray-600">Quick and secure authentication</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold mr-4">2</span>
                    <div>
                      <h3 className="font-semibold text-black">Complete your profile</h3>
                      <p className="text-sm text-gray-600">Share your experience and expertise</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold mr-4">3</span>
                    <div>
                      <h3 className="font-semibold text-black">Get verified</h3>
                      <p className="text-sm text-gray-600">Admin review (24-48 hours)</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold mr-4">4</span>
                    <div>
                      <h3 className="font-semibold text-black">Start earning</h3>
                      <p className="text-sm text-gray-600">Accept clients and help them succeed</p>
                    </div>
                  </li>
                </ol>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleGoogleSignup}
                  disabled={loading}
                  className="w-full bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing up...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>

                <p className="text-sm text-gray-500">
                  Already have an account?{' '}
                  <button
                    onClick={() => router.push('/login')}
                    className="text-black font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Registration Form */}
          {step === 'form' && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-black mb-2">
                  Complete Your Profile
                </h1>
                <p className="text-gray-600">
                  Help us understand your expertise and experience
                </p>
              </div>

              <AgentRegistrationForm
                onSubmit={handleFormSubmit}
                initialData={{
                  email: '',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
