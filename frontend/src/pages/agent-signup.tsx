import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '@/components/Logo';
import { signInWithGoogle, handleRedirectResult } from '@/lib/firebase/auth';
import { getFirebaseAuth, getFirebaseFirestore, isFirebaseConfigured } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { ArrowLeft, Check, User, MapPin, Briefcase, Globe, FileText, MessageSquare, Loader, CheckCircle, AlertCircle, Building2, Users, Phone, Mail } from 'lucide-react';

export default function AgentSignup() {
  const router = useRouter();
  const [step, setStep] = useState<'type-selection' | 'google' | 'form' | 'company-form'>('type-selection');
  const [accountType, setAccountType] = useState<'individual' | 'company' | null>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCompanySuccess, setShowCompanySuccess] = useState(false);
  const [showFirebaseWarning, setShowFirebaseWarning] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    city: '',
    phone: '',
    platforms: [] as string[],
    socialAccount: '',
    bio: '',
    whyAgent: '',
  });

  const [companyFormData, setCompanyFormData] = useState({
    companyName: '',
    companySize: '',
    website: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    requestType: '',
    additionalDetails: '',
  });

  const aiPlatforms = [
    'Outlier AI',
    'Mindrift AI',
    'Alignerr',
    'OneForma',
    'Appen',
    'RWS',
    'TELUS Digital',
    'Scale AI',
    'Remotasks',
    'DataAnnotation',
    'Other',
  ];

  useEffect(() => {
    // Only check auth for google and form steps (not for type-selection or company-form)
    if (step !== 'type-selection' && step !== 'company-form') {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [step]);

  const checkAuth = async () => {
    try {
      // Check if Firebase is configured
      if (!isFirebaseConfigured) {
        setShowFirebaseWarning(true);
        setLoading(false);
        return;
      }

      const auth = getFirebaseAuth();

      // First, check for redirect result (for browsers that blocked popup)
      const redirectUser = await handleRedirectResult();
      if (redirectUser) {
        const db = getFirebaseFirestore();
        const profileDoc = await getDoc(doc(db, 'profiles', redirectUser.uid));

        if (profileDoc.exists() && profileDoc.data().firstName) {
          // Profile complete, redirect to dashboard
          router.push('/agent-dashboard');
          return;
        }

        // User signed in via redirect but profile incomplete
        // For agents, show the signup form
        // For candidates, redirect to complete-profile
        if (redirectUser.role === 'candidate') {
          router.push('/complete-profile');
          return;
        }

        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          setUser(firebaseUser);
          setStep('form');
          setLoading(false);
          return;
        }
      }

      // Listen for auth state changes
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // User is logged in, check if they already have a profile
          const db = getFirebaseFirestore();
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Check if profile is complete
            const profileDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
            if (profileDoc.exists() && profileDoc.data().firstName) {
              // Profile complete, redirect to dashboard
              router.push(userData.role === 'agent' ? '/agent-dashboard' : '/candidate-dashboard');
              return;
            }

            // Profile incomplete
            if (userData.role === 'agent') {
              // For agents, show form
              setUser(firebaseUser);
              setStep('form');
            } else {
              // For candidates, redirect to complete-profile
              router.push('/complete-profile');
              return;
            }
          }
        }
        setLoading(false);
      });
    } catch (error: any) {
      console.error('Error checking auth:', error);
      if (error.message?.includes('Firebase is not configured')) {
        setShowFirebaseWarning(true);
      }
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setSubmitting(true);

    try {
      const user = await signInWithGoogle('agent');

      // After successful sign-up, check profile and redirect/show form immediately
      const db = getFirebaseFirestore();
      const profileDoc = await getDoc(doc(db, 'profiles', user.uid));

      if (profileDoc.exists()) {
        const profileData = profileDoc.data();

        if (profileData.firstName) {
          // Profile complete, redirect to dashboard
          router.push('/agent-dashboard');
        } else {
          // Profile incomplete - for agents, show the signup form
          const auth = getFirebaseAuth();
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            setUser(firebaseUser);
            setStep('form');
            setSubmitting(false);
          }
        }
      } else {
        // No profile exists, show the signup form
        const auth = getFirebaseAuth();
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          setUser(firebaseUser);
          setStep('form');
          setSubmitting(false);
        }
      }
    } catch (err: any) {
      console.error('Google signup error:', err);

      // Don't show error if redirect is in progress
      if (err.message === 'REDIRECT_IN_PROGRESS') {
        // Redirect is happening, page will reload
        return;
      }

      // Don't show error if popup was just closed by user
      if (err.message && (err.message.includes('cancelled') || err.message.includes('closed'))) {
        setSubmitting(false);
        return;
      }

      setError(err.message || 'Failed to sign up with Google');
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlatformToggle = (platform: string) => {
    if (formData.platforms.includes(platform)) {
      setFormData({
        ...formData,
        platforms: formData.platforms.filter(p => p !== platform),
      });
    } else {
      setFormData({
        ...formData,
        platforms: [...formData.platforms, platform],
      });
    }
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setCompanyFormData({
      ...companyFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!companyFormData.companyName || !companyFormData.companySize || !companyFormData.contactPerson ||
        !companyFormData.contactEmail || !companyFormData.requestType) {
      setError('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(companyFormData.contactEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmitting(true);

    try {
      const db = getFirebaseFirestore();

      // Save company inquiry to Firestore
      await addDoc(collection(db, 'company_inquiries'), {
        ...companyFormData,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // Show success popup
      setShowCompanySuccess(true);

      // Redirect to home after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error: any) {
      console.error('Error submitting company inquiry:', error);
      setError(error.message || 'Failed to submit inquiry. Please try again.');
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.country || !formData.city) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.platforms.length === 0) {
      setError('Please select at least one AI platform');
      return;
    }

    if (!formData.bio || formData.bio.length < 50) {
      setError('Bio must be at least 50 characters');
      return;
    }

    if (!formData.whyAgent || formData.whyAgent.length < 50) {
      setError('Please explain why you want to be an agent (at least 50 characters)');
      return;
    }

    setSubmitting(true);

    try {
      const db = getFirebaseFirestore();

      // Create or update profile
      await setDoc(doc(db, 'profiles', user.uid), {
        uid: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        country: formData.country,
        city: formData.city,
        location: `${formData.city}, ${formData.country}`,
        phone: formData.phone || '',
        platformsExperience: formData.platforms,
        linkedin: formData.socialAccount || '',
        bio: formData.bio,
        whyAgent: formData.whyAgent,
        avatarURL: user.photoURL || '',
        agentVerificationStatus: 'pending',
        isAgentApproved: false,
        agentServices: formData.platforms,
        agentSuccessRate: 0,
        agentTotalClients: 0,
        agentPricing: {},
        agentPortfolio: [],
        totalEarnings: 0,
        completedProjects: 0,
        averageRating: 0,
        totalReviews: 0,
        specializations: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Show success popup
      setShowSuccess(true);
    } catch (error: any) {
      console.error('Error creating profile:', error);
      setError(error.message || 'Failed to submit application. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Firebase configuration warning
  if (showFirebaseWarning) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Setup Required</h2>
          <p className="text-gray-700 mb-6">
            Firebase authentication is not configured. Please set up your Firebase credentials in the environment variables to enable signup.
          </p>
          <p className="text-sm text-gray-600 bg-white p-4 rounded-lg mb-6 font-mono text-left">
            Create a <strong>.env.local</strong> file in the frontend directory with your Firebase credentials.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Company Success Popup
  if (showCompanySuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center animate-fade-in-scale">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-black mb-4">
            Thank You!
          </h2>
          <p className="text-gray-600 mb-6">
            We've received your inquiry. Our support team will review your request and get back to you shortly.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Redirecting to homepage...
          </p>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  // Individual Success Popup
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center animate-fade-in-scale">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-black mb-4">
            Application Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for applying to become an agent. Our admin team will review your application and get back to you within 24-48 hours.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You'll receive an email notification once your application is reviewed.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Become an Agent - RemoteWorks</title>
        <meta name="description" content="Join RemoteWorks as a verified agent and help candidates get approved for AI training projects." />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <Logo showText={false} size="md" />
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

        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Type Selection Step */}
          {step === 'type-selection' && (
            <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
                  Join RemoteWorks
                </h1>
                <p className="text-xl text-gray-600">
                  Choose how you'd like to sign up
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-12">
                {/* Individual Option */}
                <button
                  onClick={() => {
                    setAccountType('individual');
                    setStep('google');
                  }}
                  className="group bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-black transition-all text-left shadow-lg hover:shadow-2xl hover:-translate-y-1"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-3">Individual Agent</h3>
                  <p className="text-gray-600 mb-4">
                    Sign up as an individual agent to help candidates get approved for AI training platforms
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Help candidates 1-on-1</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Set your own rates</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Flexible work schedule</span>
                    </li>
                  </ul>
                  <div className="mt-6 text-black font-semibold flex items-center">
                    Get Started
                    <ArrowLeft className="w-5 h-5 ml-2 rotate-180 group-hover:translate-x-2 transition-transform" />
                  </div>
                </button>

                {/* Company Option */}
                <button
                  onClick={() => {
                    setAccountType('company');
                    setStep('company-form');
                  }}
                  className="group bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-black transition-all text-left shadow-lg hover:shadow-2xl hover:-translate-y-1"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-3">Company/Organization</h3>
                  <p className="text-gray-600 mb-4">
                    Partner with us as a company to provide bulk services or custom solutions
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Bulk candidate processing</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Custom partnership terms</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Dedicated support</span>
                    </li>
                  </ul>
                  <div className="mt-6 text-black font-semibold flex items-center">
                    Contact Us
                    <ArrowLeft className="w-5 h-5 ml-2 rotate-180 group-hover:translate-x-2 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Company Form Step */}
          {step === 'company-form' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12 animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-black mb-2">
                  Company Partnership Inquiry
                </h1>
                <p className="text-gray-600">
                  Tell us about your company and requirements
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleCompanySubmit} className="space-y-6">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={companyFormData.companyName}
                    onChange={handleCompanyChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>

                {/* Company Size */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Company Size <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="companySize"
                    value={companyFormData.companySize}
                    onChange={handleCompanyChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501+">501+ employees</option>
                  </select>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Company Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={companyFormData.website}
                    onChange={handleCompanyChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="https://yourcompany.com"
                  />
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={companyFormData.contactPerson}
                    onChange={handleCompanyChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>

                {/* Contact Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Contact Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={companyFormData.contactEmail}
                      onChange={handleCompanyChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={companyFormData.contactPhone}
                      onChange={handleCompanyChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="+1 (234) 567-8900"
                    />
                  </div>
                </div>

                {/* Request Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    Type of Service Needed <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="requestType"
                    value={companyFormData.requestType}
                    onChange={handleCompanyChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  >
                    <option value="">Select service type</option>
                    <option value="bulk-candidate-processing">Bulk Candidate Processing</option>
                    <option value="white-label-solution">White Label Solution</option>
                    <option value="custom-integration">Custom Integration</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Additional Details */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Additional Details
                  </label>
                  <textarea
                    name="additionalDetails"
                    value={companyFormData.additionalDetails}
                    onChange={handleCompanyChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                    placeholder="Tell us more about your requirements, expected volume, timeline, etc."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep('type-selection')}
                    className="flex-1 bg-gray-200 text-gray-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-300 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5 inline mr-2" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Inquiry
                        <CheckCircle className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Google Sign In Step */}
          {step === 'google' && (
            <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
              <button
                onClick={() => setStep('type-selection')}
                className="flex items-center text-gray-600 hover:text-black mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to selection
              </button>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
                  Become a Verified Agent
                </h1>
                <p className="text-xl text-gray-600">
                  Help candidates get approved for AI training projects and earn money
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 shadow-lg">
                <h2 className="text-2xl font-bold text-black mb-6">How It Works</h2>
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                    <div>
                      <h3 className="font-semibold text-black mb-1">Sign up with Google</h3>
                      <p className="text-sm text-gray-600">Quick and secure authentication</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                    <div>
                      <h3 className="font-semibold text-black mb-1">Complete application</h3>
                      <p className="text-sm text-gray-600">Share your experience and expertise</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                    <div>
                      <h3 className="font-semibold text-black mb-1">Get verified</h3>
                      <p className="text-sm text-gray-600">Admin review within 24-48 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
                    <div>
                      <h3 className="font-semibold text-black mb-1">Start earning</h3>
                      <p className="text-sm text-gray-600">Accept clients and help them succeed</p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleGoogleSignup}
                disabled={submitting}
                className="w-full max-w-md mx-auto bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover-lift"
              >
                {submitting ? (
                  <>
                    <Loader className="w-5 h-5 mr-3 animate-spin" />
                    Signing up...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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
          )}

          {/* Application Form Step */}
          {step === 'form' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12 animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-black mb-2">
                  Complete Your Application
                </h1>
                <p className="text-gray-600">
                  Tell us about yourself and your experience
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    >
                      <option value="">Select Country</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="India">India</option>
                      <option value="Philippines">Philippines</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="+1 (234) 567-8900"
                  />
                </div>

                {/* AI Platforms */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    AI Training Platforms You're Experienced With <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {aiPlatforms.map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => handlePlatformToggle(platform)}
                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.platforms.includes(platform)
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                        }`}
                      >
                        {formData.platforms.includes(platform) && (
                          <Check className="w-4 h-4 inline mr-1" />
                        )}
                        {platform}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select all platforms you have experience with
                  </p>
                </div>

                {/* Social Account */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Social Account (Optional)
                  </label>
                  <input
                    type="text"
                    name="socialAccount"
                    value={formData.socialAccount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="LinkedIn, Twitter, or personal website"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Bio <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                    placeholder="Tell us about your background, experience with AI platforms, and skills..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 50 characters • {formData.bio.length}/50
                  </p>
                </div>

                {/* Why Agent */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Why do you want to be an agent on RemoteWorks? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="whyAgent"
                    value={formData.whyAgent}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                    placeholder="Share your motivation, goals, and how you can help candidates succeed..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 50 characters • {formData.whyAgent.length}/50
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <CheckCircle className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
