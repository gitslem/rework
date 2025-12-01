import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Save, Loader, CheckCircle, User, Briefcase, Globe, ArrowLeft,
  Play, BookOpen, Lightbulb, Target, Zap, Shield, ArrowRight, DollarSign,
  Award, TrendingUp, Clock, Star, ChevronRight, Monitor, Video, Lock,
  UserCheck, Calendar, FileCheck, Eye, Users, Settings as SettingsIcon,
  AlertTriangle, X, Download, Smartphone, Laptop, Home
} from 'lucide-react';
import Head from 'next/head';
import { getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

interface Profile {
  uid: string;
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  city: string;
  country: string;
  phone: string;
  socialLinks: {
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
  };
  paypalEmail: string;
  createdAt: any;
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'info' | 'screen'>('profile');
  const [isPlaying, setIsPlaying] = useState(false);
  const [infoSubTab, setInfoSubTab] = useState<'learn' | 'tips'>('learn');
  const [screenSubTab, setScreenSubTab] = useState<'overview' | 'how-it-works' | 'security'>('overview');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  const checkAuthAndLoadProfile = async () => {
    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseFirestore();

      onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          router.push('/login');
          return;
        }

        setUser(firebaseUser);

        // Get user role
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role || '');
        }

        // Get profile document
        const profileDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
        if (profileDoc.exists()) {
          const profileData = profileDoc.data() as Profile;
          setProfile(profileData);

          // Populate form fields
          setFirstName(profileData.firstName || '');
          setLastName(profileData.lastName || '');
          setBio(profileData.bio || '');
          setCity(profileData.city || '');
          setCountry(profileData.country || '');
          setPhone(profileData.phone || '');
          setLinkedin(profileData.socialLinks?.linkedin || '');
          setTwitter(profileData.socialLinks?.twitter || '');
          setFacebook(profileData.socialLinks?.facebook || '');
          setInstagram(profileData.socialLinks?.instagram || '');
          setPaypalEmail(profileData.paypalEmail || '');
        }

        setLoading(false);
      });
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      if (!user) {
        setError('Not authenticated');
        return;
      }

      const db = getFirebaseFirestore();

      const updateData = {
        firstName,
        lastName,
        bio,
        city,
        country,
        location: `${city}, ${country}`,
        phone,
        socialLinks: {
          linkedin,
          twitter,
          facebook,
          instagram
        },
        paypalEmail,
        updatedAt: Timestamp.now()
      };

      await updateDoc(doc(db, 'profiles', user.uid), updateData);

      setSuccess(true);

      // Redirect back to appropriate dashboard after 1.5 seconds
      setTimeout(() => {
        if (userRole === 'agent') {
          router.push('/agent-dashboard');
        } else if (userRole === 'candidate') {
          router.push('/candidate-dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 1500);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (userRole === 'agent') {
      router.push('/agent-dashboard');
    } else if (userRole === 'candidate') {
      router.push('/candidate-dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Info tab data
  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Vetted Expert Agents",
      description: "Access to authenticated agents experienced in 20+ platforms",
      color: "from-amber-500 to-yellow-500"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Get Approved Faster",
      description: "Agents know the ins and outs of approval processes",
      color: "from-gray-800 to-black"
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Flexible Payment Options",
      description: "Choose between one-time fees or revenue sharing",
      color: "from-amber-600 to-yellow-600"
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Multiple Income Streams",
      description: "Access to various remote work opportunities",
      color: "from-gray-700 to-gray-900"
    }
  ];

  const platforms = [
    "Outlier AI", "TELUS Digital", "OneForma", "RWS", "Appen",
    "Alignerr", "Mindrift AI", "DataAnnotation", "Lionbridge", "Clickworker"
  ];

  const workTypes = [
    { name: "AI Training", icon: <Zap className="w-5 h-5" /> },
    { name: "Translation", icon: <Globe className="w-5 h-5" /> },
    { name: "Transcription", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Data Labeling", icon: <Target className="w-5 h-5" /> },
    { name: "Evaluation", icon: <CheckCircle className="w-5 h-5" /> },
    { name: "Research", icon: <Award className="w-5 h-5" /> }
  ];

  const successTips = [
    {
      title: "1. Complete Your Profile Thoroughly",
      description: "A complete profile increases your credibility and helps agents understand your background better. Include all relevant skills, experience, and certifications.",
      tips: [
        "Add a professional bio",
        "List all relevant skills",
        "Upload ID verification documents",
        "Connect social media profiles"
      ]
    },
    {
      title: "2. Choose the Right Agent",
      description: "Review agent profiles carefully. Look for specialists in the platforms you're interested in.",
      tips: [
        "Check agent ratings and reviews",
        "Review their success rate",
        "Read their terms carefully",
        "Ask questions before committing"
      ]
    },
    {
      title: "3. Understand Payment Options",
      description: "Remote-Works offers two flexible payment models to suit your needs.",
      tips: [
        "One-Time Fee: Pay upfront for approval assistance (e.g., $100-150 per project)",
        "Revenue Share: Split earnings 50/50 or as agreed with your agent",
        "Agents can handle tasks on your behalf if authorized",
        "All terms are clearly defined before you start"
      ]
    },
    {
      title: "4. Follow Agent Guidelines",
      description: "Your success depends on following the guidance provided by your agent.",
      tips: [
        "Read all instructions carefully",
        "Meet deadlines for document submissions",
        "Be responsive to agent messages",
        "Ask questions if anything is unclear"
      ]
    },
    {
      title: "5. Maintain Professional Communication",
      description: "Clear and professional communication ensures smooth collaboration.",
      tips: [
        "Respond to messages within 24 hours",
        "Be honest about your availability",
        "Keep agents updated on your progress",
        "Report any issues immediately"
      ]
    },
    {
      title: "6. Maximize Your Earnings",
      description: "Once approved, you can work on multiple projects simultaneously.",
      tips: [
        "Start with one platform and expand gradually",
        "Meet quality standards to maintain approval",
        "Track your earnings across platforms",
        "Request agent assistance for additional platforms"
      ]
    },
    {
      title: "7. Stay Consistent and Reliable",
      description: "Building a reputation takes time and consistency.",
      tips: [
        "Deliver high-quality work consistently",
        "Meet project deadlines",
        "Follow platform guidelines strictly",
        "Build long-term relationships with agents"
      ]
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to edit your profile</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Settings - Remote-Works</title>
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white py-8 border-b-4 border-amber-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold">Settings</h1>
            <p className="mt-2 text-gray-300">
              Manage your profile, learn about the platform, and explore secure screen sharing
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-4 transition-all whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-amber-500 text-black bg-amber-50'
                    : 'border-transparent text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5" />
                Profile Settings
              </button>
              <button
                onClick={() => setActiveTab('info')}
                className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-4 transition-all whitespace-nowrap ${
                  activeTab === 'info'
                    ? 'border-amber-500 text-black bg-amber-50'
                    : 'border-transparent text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                {userRole === 'agent' ? 'Agent Guide' : 'Learn Center'}
              </button>
              <button
                onClick={() => setActiveTab('screen')}
                className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-4 transition-all whitespace-nowrap ${
                  activeTab === 'screen'
                    ? 'border-amber-500 text-black bg-amber-50'
                    : 'border-transparent text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                <Monitor className="w-5 h-5" />
                Screen Sharing
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Settings Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Success Message */}
              {success && (
                <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-800 font-medium">Profile updated successfully!</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Personal Information */}
              <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-black">
                  <User className="w-6 h-6 text-amber-500" />
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-black">
                  <Briefcase className="w-6 h-6 text-amber-500" />
                  Social Links
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Twitter
                    </label>
                    <input
                      type="url"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="https://twitter.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-black">
                  <Globe className="w-6 h-6 text-amber-500" />
                  Payment Information
                </h2>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    PayPal Email *
                  </label>
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="your@email.com"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    This email will be used for receiving payments
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleBack}
                  className="px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !firstName || !lastName || !city || !country || !paypalEmail}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-bold hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg transition-all"
                >
                  {saving ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-8">
              {/* Agent-specific Info Tab Content */}
              {userRole === 'agent' ? (
                <div className="space-y-8">
                  {/* Agent Welcome */}
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border-2 border-amber-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-amber-500 p-3 rounded-xl">
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-black">Welcome, Agent!</h2>
                    </div>
                    <p className="text-gray-800 text-lg leading-relaxed">
                      As a verified agent on Remote-Works, you have the opportunity to help candidates get approved on remote work platforms
                      and earn income through flexible payment models. This guide will help you maximize your success on the platform.
                    </p>
                  </div>

                  {/* What You Do as an Agent */}
                  <section className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
                    <h2 className="text-3xl font-bold text-black mb-6 flex items-center gap-3">
                      <Users className="w-8 h-8 text-amber-600" />
                      Your Role as an Agent
                    </h2>
                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-800 leading-relaxed mb-4">
                        As an <strong className="text-amber-600">agent</strong>, your primary responsibility is to help candidates get approved
                        on various remote work platforms like Outlier AI, TELUS Digital, OneForma, RWS, Appen, and 20+ others. You leverage your
                        expertise and experience to guide candidates through approval processes, handle tasks on their behalf (if authorized),
                        and ensure they can start earning income.
                      </p>
                      <p className="text-gray-800 leading-relaxed">
                        Agents earn through two flexible models: <strong className="text-black">One-Time Fees</strong> for specific approval services,
                        or <strong className="text-black">Revenue Sharing</strong> arrangements where you split earnings with candidates while providing
                        ongoing support and task management.
                      </p>
                    </div>
                  </section>

                  {/* How to Succeed as an Agent */}
                  <section>
                    <h2 className="text-3xl font-bold text-black mb-8 text-center">
                      Keys to Success as an Agent
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        {
                          icon: <Target className="w-8 h-8" />,
                          title: "Specialize in Platforms",
                          description: "Focus on 3-5 platforms you know extremely well. Deep expertise beats broad knowledge.",
                          color: "from-amber-500 to-yellow-500"
                        },
                        {
                          icon: <Users className="w-8 h-8" />,
                          title: "Build Trust",
                          description: "Communicate clearly, meet deadlines, and deliver on your promises. Your reputation is everything.",
                          color: "from-gray-800 to-black"
                        },
                        {
                          icon: <TrendingUp className="w-8 h-8" />,
                          title: "Set Fair Rates",
                          description: "Price competitively based on your experience and the platforms you service.",
                          color: "from-amber-600 to-yellow-600"
                        },
                        {
                          icon: <Calendar className="w-8 h-8" />,
                          title: "Maintain Availability",
                          description: "Keep your working hours updated and respond to candidate requests within 24 hours.",
                          color: "from-gray-700 to-gray-900"
                        },
                        {
                          icon: <Shield className="w-8 h-8" />,
                          title: "Follow Platform Rules",
                          description: "Strictly adhere to Remote-Works policies and candidate authorization boundaries.",
                          color: "from-amber-500 to-yellow-500"
                        },
                        {
                          icon: <Star className="w-8 h-8" />,
                          title: "Earn Great Reviews",
                          description: "Provide excellent service to earn 5-star reviews and build your reputation.",
                          color: "from-gray-800 to-black"
                        }
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-amber-400 hover:scale-105 transform duration-300"
                        >
                          <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${item.color} rounded-xl text-white mb-4`}>
                            {item.icon}
                          </div>
                          <h3 className="text-xl font-bold text-black mb-2">{item.title}</h3>
                          <p className="text-gray-700">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Agent Payment Models */}
                  <section className="grid md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-300">
                      <div className="flex items-center gap-3 mb-4">
                        <DollarSign className="w-8 h-8 text-green-600" />
                        <h3 className="text-2xl font-bold text-black">One-Time Fees</h3>
                      </div>
                      <p className="text-gray-800 mb-6">
                        Charge a fixed fee for approval services. Clear, straightforward transactions.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-gray-800">Typical range: $100-$150 per platform approval</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-gray-800">Offer package deals (e.g., $400 for 4 platform approvals)</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-gray-800">Get paid upfront or upon successful approval</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-gray-800">No ongoing obligations after approval</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border-2 border-amber-300">
                      <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-8 h-8 text-amber-600" />
                        <h3 className="text-2xl font-bold text-black">Revenue Share</h3>
                      </div>
                      <p className="text-gray-800 mb-6">
                        Partner with candidates for ongoing earnings. Higher long-term income potential.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                          <p className="text-gray-800">Typical split: 50/50 or negotiated percentage</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                          <p className="text-gray-800">Can work on candidate's behalf (with authorization)</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                          <p className="text-gray-800">Ongoing support and task management included</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                          <p className="text-gray-800">Passive income potential as candidates scale</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Best Practices */}
                  <section className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 text-white border-2 border-amber-500">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <Award className="w-7 h-7 text-amber-500" />
                      Agent Best Practices
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        {
                          title: "Always Get Written Authorization",
                          description: "Before accessing any candidate account or platform, ensure you have clear written authorization"
                        },
                        {
                          title: "Document Everything",
                          description: "Keep records of all communications, agreements, and work completed for each candidate"
                        },
                        {
                          title: "Honor Your Commitments",
                          description: "If you promise approval within a timeframe, deliver on that promise or communicate delays early"
                        },
                        {
                          title: "Stay Within Scope",
                          description: "Only access platforms and perform tasks explicitly authorized by the candidate"
                        },
                        {
                          title: "Maintain Confidentiality",
                          description: "Protect candidate personal information and account credentials at all times"
                        },
                        {
                          title: "Update Your Profile",
                          description: "Keep your services, rates, and availability current to attract the right candidates"
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-bold mb-1">{item.title}</h4>
                            <p className="text-gray-300 text-sm">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Call to Action */}
                  <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-8 text-white text-center border-2 border-amber-500">
                    <h3 className="text-3xl font-bold mb-4">Ready to Help Candidates Succeed?</h3>
                    <p className="text-xl text-gray-300 mb-6">
                      Start browsing candidate service requests and build your reputation on Remote-Works
                    </p>
                    <button
                      onClick={() => router.push('/agent-dashboard')}
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-amber-600 hover:to-yellow-600 transition-all inline-flex items-center gap-2 shadow-lg"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Candidate Info Tab Content */
                <div className="space-y-8">
                  {/* Info Sub-tabs */}
                  <div className="flex gap-4 border-b-2 border-gray-200">
                    <button
                      onClick={() => setInfoSubTab('learn')}
                      className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-4 transition-all ${
                        infoSubTab === 'learn'
                          ? 'border-amber-500 text-black'
                          : 'border-transparent text-gray-600 hover:text-black'
                      }`}
                    >
                      <BookOpen className="w-5 h-5" />
                      Learn
                    </button>
                    <button
                      onClick={() => setInfoSubTab('tips')}
                      className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-4 transition-all ${
                        infoSubTab === 'tips'
                          ? 'border-amber-500 text-black'
                          : 'border-transparent text-gray-600 hover:text-black'
                      }`}
                    >
                      <Lightbulb className="w-5 h-5" />
                      Tips for Success
                    </button>
                  </div>

              {/* Learn Content */}
              {infoSubTab === 'learn' && (
                <div className="space-y-12">
                  {/* What is Remote-Works */}
                  <section className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border-2 border-amber-200">
                    <h2 className="text-3xl font-bold text-black mb-6 flex items-center gap-3">
                      <Globe className="w-8 h-8 text-amber-600" />
                      What is Remote-Works?
                    </h2>
                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-800 leading-relaxed mb-4">
                        Remote-Works is a <strong className="text-amber-600">marketplace platform</strong> that connects talented individuals
                        with expert agents who specialize in remote work opportunities. We bridge the gap between candidates seeking
                        flexible work and the growing demand for AI projects, translation, transcription, data labeling, evaluation,
                        research, and more.
                      </p>
                      <p className="text-gray-800 leading-relaxed">
                        Our platform features <strong className="text-black">vetted, authenticated agents</strong> who have proven
                        expertise in getting candidates approved on 20+ remote work platforms including industry leaders like
                        TELUS Digital, OneForma, Outlier, RWS, and many others.
                      </p>
                    </div>
                  </section>

                  {/* Key Features Grid */}
                  <section>
                    <h2 className="text-3xl font-bold text-black mb-8 text-center">
                      Why Choose Remote-Works?
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {features.map((feature, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-amber-400 hover:scale-105 transform duration-300"
                        >
                          <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl text-white mb-4`}>
                            {feature.icon}
                          </div>
                          <h3 className="text-xl font-bold text-black mb-2">{feature.title}</h3>
                          <p className="text-gray-700">{feature.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* How It Works */}
                  <section className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
                    <h2 className="text-3xl font-bold text-black mb-8 flex items-center gap-3">
                      <Target className="w-8 h-8 text-amber-600" />
                      How It Works
                    </h2>
                    <div className="space-y-6">
                      {[
                        {
                          step: "1",
                          title: "Sign Up & Get Verified",
                          description: "Create your account, complete your profile, and upload verification documents. Our admin team reviews applications within 24-48 hours.",
                          color: "amber"
                        },
                        {
                          step: "2",
                          title: "Browse Vetted Agents",
                          description: "Once approved, explore our marketplace of authenticated agents. View their expertise, success rates, pricing, and reviews from other candidates.",
                          color: "yellow"
                        },
                        {
                          step: "3",
                          title: "Request Services",
                          description: "Send a service request to an agent explaining which platforms you're interested in and your goals. Agents respond with their terms and availability.",
                          color: "amber"
                        },
                        {
                          step: "4",
                          title: "Choose Your Payment Model",
                          description: "Select between one-time payment or revenue sharing based on what works best for you.",
                          color: "yellow"
                        },
                        {
                          step: "5",
                          title: "Get Approved & Start Earning",
                          description: "Follow your agent's guidance to get approved on platforms. Once approved, start working on projects and earning income!",
                          color: "amber"
                        }
                      ].map((item, index) => (
                        <div key={index} className="flex gap-6 items-start">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
                            <span className="text-xl font-bold text-white">{item.step}</span>
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                            <h3 className="text-xl font-bold text-black mb-2">{item.title}</h3>
                            <p className="text-gray-700 leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Payment Models */}
                  <section className="grid md:grid-cols-2 gap-8">
                    {/* One-Time Payment */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-300">
                      <div className="flex items-center gap-3 mb-4">
                        <DollarSign className="w-8 h-8 text-green-600" />
                        <h3 className="text-2xl font-bold text-black">One-Time Payment</h3>
                      </div>
                      <p className="text-gray-800 mb-6">
                        Pay a specific fee for approval assistance. Perfect for those who want a straightforward transaction.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-gray-800">Fixed fee per project (e.g., $100 per platform)</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-gray-800">Package deals available (e.g., $150 for 4 approvals)</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-gray-800">No ongoing obligations</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-gray-800">You keep 100% of earnings</p>
                        </div>
                      </div>
                    </div>

                    {/* Revenue Share */}
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border-2 border-amber-300">
                      <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-8 h-8 text-amber-600" />
                        <h3 className="text-2xl font-bold text-black">Revenue Share</h3>
                      </div>
                      <p className="text-gray-800 mb-6">
                        Share earnings with your agent. Ideal for ongoing support and task management.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                          <p className="text-gray-800">No upfront payment required</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                          <p className="text-gray-800">50/50 split or as agreed with agent</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                          <p className="text-gray-800">Agent can work on projects on your behalf (if authorized)</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                          <p className="text-gray-800">Ongoing agent support included</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Work Types */}
                  <section className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
                    <h2 className="text-3xl font-bold text-black mb-6 flex items-center gap-3">
                      <Briefcase className="w-8 h-8 text-amber-600" />
                      Types of Remote Work Available
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {workTypes.map((work, index) => (
                        <div key={index} className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 text-center hover:shadow-md transition-all border-2 border-amber-200">
                          <div className="bg-white rounded-lg p-3 w-fit mx-auto mb-2">
                            <div className="text-amber-600">
                              {work.icon}
                            </div>
                          </div>
                          <p className="font-semibold text-black text-sm">{work.name}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Supported Platforms */}
                  <section className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 text-white border-2 border-amber-500">
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                      <Shield className="w-8 h-8 text-amber-500" />
                      20+ Supported Platforms
                    </h2>
                    <p className="text-gray-300 mb-6">
                      Our agents have expertise across industry-leading platforms. No limit to the number of gigs you can pursue!
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {platforms.map((platform, index) => (
                        <span
                          key={index}
                          className="bg-white bg-opacity-10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium hover:bg-opacity-20 transition-all border border-amber-500"
                        >
                          {platform}
                        </span>
                      ))}
                      <span className="bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 rounded-full text-sm font-bold">
                        +10 More
                      </span>
                    </div>
                  </section>
                </div>
              )}

              {/* Tips Content */}
              {infoSubTab === 'tips' && (
                <div className="space-y-8">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border-2 border-amber-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-amber-500 p-3 rounded-xl">
                        <Lightbulb className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-black">7 Tips to Succeed with Remote-Works</h2>
                    </div>
                    <p className="text-gray-800 text-lg">
                      Follow these proven strategies to maximize your success and earnings on our platform.
                      These tips come from our most successful candidates and experienced agents.
                    </p>
                  </div>

                  {/* Tips List */}
                  {successTips.map((tip, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200 hover:border-amber-400 transition-all"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="bg-amber-100 rounded-full p-3 flex-shrink-0">
                          <Star className="w-6 h-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-black mb-2">{tip.title}</h3>
                          <p className="text-gray-700 text-lg leading-relaxed mb-4">{tip.description}</p>
                          <div className="space-y-2">
                            {tip.tips.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <ChevronRight className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-800">{item}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Call to Action */}
                  <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-8 text-white text-center border-2 border-amber-500">
                    <h3 className="text-3xl font-bold mb-4">Ready to Start Your Remote Work Journey?</h3>
                    <p className="text-xl text-gray-300 mb-6">
                      Join thousands of candidates who are already earning with Remote-Works
                    </p>
                    <button
                      onClick={() => router.push('/candidate-dashboard')}
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-amber-600 hover:to-yellow-600 transition-all inline-flex items-center gap-2 shadow-lg"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Screen Sharing Tab */}
          {activeTab === 'screen' && (
            <div className="space-y-8">
              {/* Agent-specific Screen Tab Content */}
              {userRole === 'agent' ? (
                <div className="space-y-12">
                  {/* Agent Screen Sharing Welcome */}
                  <div className="bg-gradient-to-r from-gray-900 to-black text-white py-12 px-8 rounded-2xl border-2 border-amber-500">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                          <Monitor className="w-5 h-5" />
                          <span className="font-semibold">Powered by Google Remote Desktop</span>
                        </div>
                        <h1 className="text-4xl font-bold mb-4">
                          Screen Sharing: Your Tool for Helping Candidates
                        </h1>
                        <p className="text-lg text-gray-300">
                          Use secure screen sharing to assist candidates with approvals, testing, and project execution
                          while maintaining complete transparency and security.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Why Agents Use Screen Sharing */}
                  <section>
                    <h2 className="text-3xl font-bold text-black mb-6">Why Use Screen Sharing as an Agent</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border-2 border-amber-200">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mb-4">
                          <Users className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-black mb-3">Help Multiple Candidates</h3>
                        <p className="text-gray-800 leading-relaxed">
                          Manage multiple candidate accounts simultaneously, helping them complete platform registrations,
                          testing, and project submissions efficiently.
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-300">
                        <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-black rounded-xl flex items-center justify-center mb-4">
                          <Target className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-black mb-3">Efficient Task Execution</h3>
                        <p className="text-gray-800 leading-relaxed">
                          Complete platform approvals, qualification tests, and routine tasks on behalf of authorized
                          candidates, maximizing your efficiency and earnings.
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border-2 border-amber-200">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mb-4">
                          <Shield className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-black mb-3">Maintain Trust & Transparency</h3>
                        <p className="text-gray-800 leading-relaxed">
                          Candidates can monitor your work in real-time and record sessions. This transparency builds
                          trust and protects both parties.
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-300">
                        <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-black rounded-xl flex items-center justify-center mb-4">
                          <Calendar className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-black mb-3">Flexible Scheduling</h3>
                        <p className="text-gray-800 leading-relaxed">
                          Coordinate screen sharing sessions with candidates through the project page. Work at times
                          that suit both your schedule and theirs.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* How Agents Use Screen Sharing */}
                  <section className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
                    <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                      <Monitor className="w-7 h-7 text-amber-600" />
                      Common Use Cases for Agents
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        {
                          icon: <CheckCircle className="w-6 h-6 text-amber-600" />,
                          title: "Platform Registration & Setup",
                          description: "Help candidates create accounts, complete profiles, upload verification documents, and navigate approval processes on 20+ platforms."
                        },
                        {
                          icon: <FileCheck className="w-6 h-6 text-amber-600" />,
                          title: "Skills Testing & Exams",
                          description: "Assist with or complete platform qualification tests, skills assessments, and certification exams to improve candidate rankings."
                        },
                        {
                          icon: <Award className="w-6 h-6 text-amber-600" />,
                          title: "Project Execution",
                          description: "Work on authorized candidate accounts to deliver projects, especially for revenue-share arrangements where you handle ongoing tasks."
                        },
                        {
                          icon: <SettingsIcon className="w-6 h-6 text-amber-600" />,
                          title: "Account Management",
                          description: "Handle routine tasks like responding to platform messages, submitting deliverables, updating statuses, and managing deadlines."
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                              {item.icon}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-bold text-black mb-2">{item.title}</h4>
                            <p className="text-gray-700 text-sm">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Critical Agent Responsibilities */}
                  <section className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 border-2 border-red-300">
                    <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                      <AlertTriangle className="w-7 h-7 text-red-600" />
                      Critical Agent Responsibilities
                    </h2>
                    <div className="space-y-4">
                      {[
                        {
                          title: "Only Access Authorized Platforms",
                          description: "Work ONLY on platforms and tasks explicitly authorized by the candidate. Unauthorized access is strictly prohibited and will result in permanent ban.",
                          severity: "high"
                        },
                        {
                          title: "Respect Candidate Privacy",
                          description: "Never access personal files, emails, banking information, or any data outside the authorized work scope. Violations are taken extremely seriously.",
                          severity: "high"
                        },
                        {
                          title: "Maintain Session Records",
                          description: "Keep detailed records of all screen sharing sessions, tasks completed, and candidate authorizations for transparency and dispute resolution.",
                          severity: "medium"
                        },
                        {
                          title: "End Sessions Immediately on Request",
                          description: "If a candidate asks to end a session for any reason, terminate access immediately without question or argument.",
                          severity: "high"
                        }
                      ].map((item, idx) => (
                        <div key={idx} className={`flex items-start gap-4 bg-white rounded-xl p-6 border-2 ${item.severity === 'high' ? 'border-red-300' : 'border-orange-300'}`}>
                          <div className={`w-10 h-10 ${item.severity === 'high' ? 'bg-red-100' : 'bg-orange-100'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <AlertTriangle className={`w-6 h-6 ${item.severity === 'high' ? 'text-red-600' : 'text-orange-600'}`} />
                          </div>
                          <div>
                            <h4 className="font-bold text-black mb-2">{item.title}</h4>
                            <p className="text-gray-700 text-sm">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Setup Instructions for Agents */}
                  <section className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
                    <h2 className="text-2xl font-bold text-black mb-6">Getting Started with Screen Sharing</h2>
                    <div className="space-y-6">
                      {[
                        {
                          step: "1",
                          title: "Install Google Remote Desktop",
                          description: "Download Chrome Remote Desktop extension or desktop app from remotedesktop.google.com. It's free and works across all devices.",
                          color: "amber"
                        },
                        {
                          step: "2",
                          title: "Get Candidate Authorization",
                          description: "Before any session, obtain clear written authorization from the candidate specifying which platforms and tasks you can access.",
                          color: "yellow"
                        },
                        {
                          step: "3",
                          title: "Schedule Sessions",
                          description: "Coordinate session timing through the candidate's project page. Schedule sessions at mutually convenient times.",
                          color: "amber"
                        },
                        {
                          step: "4",
                          title: "Access & Complete Work",
                          description: "Candidate provides computer name and PIN. Request access, they approve it, and you can begin authorized tasks. Stay within the agreed scope.",
                          color: "yellow"
                        }
                      ].map((item, index) => (
                        <div key={index} className="flex gap-6">
                          <div className="flex-shrink-0">
                            <div className={`w-12 h-12 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                              {item.step}
                            </div>
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                            <h4 className="text-xl font-bold text-black mb-2">{item.title}</h4>
                            <p className="text-gray-700">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Violation Consequences */}
                  <section className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 text-white border-2 border-red-500">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <X className="w-7 h-7 text-red-500" />
                      Consequences of Policy Violations
                    </h2>
                    <div className="space-y-4">
                      <p className="text-lg text-gray-300 leading-relaxed">
                        Remote-Works enforces a <strong className="text-red-400">zero-tolerance policy</strong> for unauthorized
                        access or misuse of screen sharing privileges. Violations result in:
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          {
                            title: "Immediate Account Termination",
                            description: "Permanent ban from the platform with no appeal process"
                          },
                          {
                            title: "Loss of All Earnings",
                            description: "Forfeiture of pending payments and revenue share agreements"
                          },
                          {
                            title: "Public Record",
                            description: "Violation noted in your permanent agent record"
                          },
                          {
                            title: "Legal Action",
                            description: "Potential prosecution for unauthorized access to computer systems"
                          }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <X className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                            <div>
                              <h4 className="font-bold mb-1 text-red-400">{item.title}</h4>
                              <p className="text-gray-300 text-sm">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Call to Action */}
                  <section className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-8 md:p-12 text-white text-center border-2 border-amber-500">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Help Candidates Succeed?</h2>
                    <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                      Use screen sharing responsibly to help candidates achieve their goals while maintaining
                      the highest standards of professionalism and security.
                    </p>
                    <button
                      onClick={() => router.push('/agent-dashboard')}
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-8 py-4 rounded-lg font-bold hover:from-amber-600 hover:to-yellow-600 transition-all shadow-lg text-lg"
                    >
                      <Calendar className="w-6 h-6" />
                      Go to Dashboard
                    </button>
                  </section>
                </div>
              ) : (
                /* Candidate Screen Tab Content */
                <div className="space-y-8">
                  {/* Screen Sub-tabs */}
                  <div className="flex gap-4 border-b-2 border-gray-200 overflow-x-auto">
                    <button
                      onClick={() => setScreenSubTab('overview')}
                      className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-4 transition-all whitespace-nowrap ${
                        screenSubTab === 'overview'
                          ? 'border-amber-500 text-black'
                          : 'border-transparent text-gray-600 hover:text-black'
                      }`}
                    >
                      <TrendingUp className="w-5 h-5" />
                      Why Screen Sharing
                    </button>
                    <button
                      onClick={() => setScreenSubTab('how-it-works')}
                      className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-4 transition-all whitespace-nowrap ${
                        screenSubTab === 'how-it-works'
                          ? 'border-amber-500 text-black'
                          : 'border-transparent text-gray-600 hover:text-black'
                      }`}
                    >
                  <Play className="w-5 h-5" />
                  How It Works
                </button>
                <button
                  onClick={() => setScreenSubTab('security')}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-4 transition-all whitespace-nowrap ${
                    screenSubTab === 'security'
                      ? 'border-amber-500 text-black'
                      : 'border-transparent text-gray-600 hover:text-black'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  Security & Privacy
                </button>
              </div>

              {/* Overview Content */}
              {screenSubTab === 'overview' && (
                <div className="space-y-12">
                  {/* Hero */}
                  <div className="bg-gradient-to-r from-gray-900 to-black text-white py-12 px-8 rounded-2xl border-2 border-amber-500">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                          <Monitor className="w-5 h-5" />
                          <span className="font-semibold">Powered by Google Remote Desktop</span>
                        </div>
                        <h1 className="text-4xl font-bold mb-4">
                          Secure Screen Sharing for Maximum Earnings
                        </h1>
                        <p className="text-lg text-gray-300">
                          Let our trained agents help you manage multiple gigs while you stay in complete control
                          and security.
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="bg-white rounded-2xl p-6 shadow-2xl">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center">
                              <Monitor className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-lg">Google Remote Desktop</div>
                              <div className="text-sm text-gray-600">Official Partner</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                            <CheckCircle className="w-4 h-4" />
                            Verified & Trusted
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Why Screen Sharing Matters */}
                  <section>
                    <h2 className="text-3xl font-bold text-black mb-6">Why Screen Sharing Matters</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border-2 border-amber-200">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mb-4">
                          <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-black mb-3">Maximize Your Earnings</h3>
                        <p className="text-gray-800 leading-relaxed">
                          Can't handle all your approved gigs alone? Our trained agents help you manage multiple projects
                          simultaneously from different platforms, ensuring you never miss earning opportunities.
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-300">
                        <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-black rounded-xl flex items-center justify-center mb-4">
                          <Zap className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-black mb-3">Efficient Task Management</h3>
                        <p className="text-gray-800 leading-relaxed">
                          Our professional team handles routine tasks on platforms you authorize, freeing you to focus on
                          high-value work while we ensure deadlines are met across all your gigs.
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border-2 border-amber-200">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mb-4">
                          <Users className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-black mb-3">Expert Support Team</h3>
                        <p className="text-gray-800 leading-relaxed">
                          Access a trained team of professionals who specialize in managing gigs across multiple platforms.
                          They know the ins and outs of registration, testing, exams, and project execution.
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-300">
                        <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-black rounded-xl flex items-center justify-center mb-4">
                          <Calendar className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-black mb-3">Flexible Scheduling</h3>
                        <p className="text-gray-800 leading-relaxed">
                          Schedule screen sharing sessions at your convenience. Both you and assigned agents can coordinate
                          timing through the project page to ensure optimal workflow.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* When Screen Sharing is Essential */}
                  <section className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
                    <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-3">
                      <FileCheck className="w-7 h-7 text-amber-600" />
                      When Screen Sharing is Essential
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        {
                          icon: <CheckCircle className="w-6 h-6 text-amber-600" />,
                          title: "Platform Registration",
                          description: "Agents help you register on multiple freelance platforms simultaneously, completing verification processes and profile optimization."
                        },
                        {
                          icon: <FileCheck className="w-6 h-6 text-amber-600" />,
                          title: "Skills Testing & Exams",
                          description: "Get support during platform qualification tests, skills assessments, and certification exams to improve your profile ranking."
                        },
                        {
                          icon: <Award className="w-6 h-6 text-amber-600" />,
                          title: "Project Execution",
                          description: "Agents work on authorized platforms to deliver projects when you're managing multiple gigs and need additional hands to meet deadlines."
                        },
                        {
                          icon: <SettingsIcon className="w-6 h-6 text-amber-600" />,
                          title: "Account Management",
                          description: "Routine tasks like responding to messages, submitting deliverables, and updating project statuses across your authorized platforms."
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                              {item.icon}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-bold text-black mb-2">{item.title}</h4>
                            <p className="text-gray-700 text-sm">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* How It Works Content */}
              {screenSubTab === 'how-it-works' && (
                <div className="space-y-12">
                  {/* Getting Started */}
                  <section>
                    <h2 className="text-3xl font-bold text-black mb-6">Getting Started with Google Remote Desktop</h2>

                    <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-8 text-white mb-8 border-2 border-amber-500">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-amber-500 rounded-xl flex items-center justify-center">
                          <Monitor className="w-9 h-9 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">Google Remote Desktop</h3>
                          <p className="text-gray-300">Trusted by millions worldwide for secure remote access</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-amber-500">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-semibold">Free to Use</span>
                          </div>
                          <p className="text-sm text-gray-300">No cost for personal use</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-amber-500">
                          <div className="flex items-center gap-2 mb-2">
                            <Lock className="w-5 h-5" />
                            <span className="font-semibold">End-to-End Encrypted</span>
                          </div>
                          <p className="text-sm text-gray-300">Military-grade security</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-amber-500">
                          <div className="flex items-center gap-2 mb-2">
                            <Smartphone className="w-5 h-5" />
                            <span className="font-semibold">Cross-Platform</span>
                          </div>
                          <p className="text-sm text-gray-300">Works on all devices</p>
                        </div>
                      </div>
                    </div>

                    {/* Setup Instructions */}
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-black">Setup Instructions</h3>

                      {[
                        {
                          step: "1",
                          title: "Download & Install",
                          icon: <Download className="w-6 h-6 text-amber-600" />,
                          description: "Visit remotedesktop.google.com and download the Chrome Remote Desktop extension or desktop app for your device.",
                          color: "amber"
                        },
                        {
                          step: "2",
                          title: "Set Up Remote Access",
                          icon: <SettingsIcon className="w-6 h-6 text-yellow-600" />,
                          description: "Sign in with your Google account, then click 'Set up Remote Access' and create a unique name for your computer. Set a PIN (at least 6 digits) for secure access.",
                          color: "yellow"
                        },
                        {
                          step: "3",
                          title: "Schedule a Session",
                          icon: <Calendar className="w-6 h-6 text-amber-600" />,
                          description: "Go to your Projects page on Remote-Works and schedule a screen sharing session with your assigned agent.",
                          color: "amber"
                        },
                        {
                          step: "4",
                          title: "Start Screen Sharing",
                          icon: <Video className="w-6 h-6 text-yellow-600" />,
                          description: "At your scheduled time, share your computer name with the agent. They'll request access, and you'll approve it by entering your PIN. You can end the session at any time.",
                          color: "yellow"
                        }
                      ].map((item, index) => (
                        <div key={index} className="flex gap-6">
                          <div className="flex-shrink-0">
                            <div className={`w-12 h-12 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                              {item.step}
                            </div>
                          </div>
                          <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="text-xl font-bold text-black">{item.title}</h4>
                              {item.icon}
                            </div>
                            <p className="text-gray-700">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* Security Content */}
              {screenSubTab === 'security' && (
                <div className="space-y-12">
                  {/* Security Guarantee */}
                  <section className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-8 md:p-12 text-white border-2 border-green-700">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Shield className="w-9 h-9 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">Your Security is Our Priority</h2>
                        <p className="text-green-100 text-lg">Comprehensive protection at every level</p>
                      </div>
                    </div>
                    <p className="text-lg text-green-50 leading-relaxed">
                      We understand that sharing screen access requires trust. That's why we've implemented
                      industry-leading security measures and strict policies to protect your data, privacy,
                      and earning potential.
                    </p>
                  </section>

                  {/* Security Features */}
                  <section>
                    <h2 className="text-2xl font-bold text-black mb-6">Security Measures & Guarantees</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        {
                          icon: <Video className="w-6 h-6 text-white" />,
                          title: "Session Recording Rights",
                          description: "You have the full right to record all screen sharing sessions using any recording software. Keep records for your protection and peace of mind.",
                          tip: "Recommended: OBS Studio, Screen Recorder, or built-in OS recording tools",
                          color: "green"
                        },
                        {
                          icon: <Lock className="w-6 h-6 text-white" />,
                          title: "Restricted Access Scope",
                          description: "Agents can ONLY operate within the specific platforms and tasks you authorize. They cannot access personal files, emails, or unrelated applications.",
                          tip: "Unauthorized access outside task scope is strictly prohibited",
                          color: "amber"
                        },
                        {
                          icon: <UserCheck className="w-6 h-6 text-white" />,
                          title: "Verified Agent Identities",
                          description: "All agents are verified with real personal data, background checks, and can be tracked. Request agent ID anytime for additional transparency.",
                          tip: "Every agent maintains a detailed track record and performance history",
                          color: "gray"
                        },
                        {
                          icon: <AlertTriangle className="w-6 h-6 text-white" />,
                          title: "Zero Tolerance Policy",
                          description: "Remote-Works enforces strict rules with severe penalties for violations. Any unauthorized activity results in immediate termination and legal action.",
                          tip: "Violations are taken seriously with permanent bans and potential prosecution",
                          color: "red"
                        }
                      ].map((item, idx) => (
                        <div key={idx} className={`bg-white rounded-xl p-6 shadow-lg border-2 border-${item.color}-200`}>
                          <div className="flex items-start gap-4 mb-4">
                            <div className={`w-12 h-12 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-xl flex items-center justify-center flex-shrink-0`}>
                              {item.icon}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-black mb-2">{item.title}</h3>
                              <p className="text-gray-800">{item.description}</p>
                            </div>
                          </div>
                          <div className={`bg-${item.color}-50 rounded-lg p-4 border border-${item.color}-200`}>
                            <p className={`text-sm text-${item.color}-900 font-medium`}>{item.tip}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Your Rights */}
                  <section className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 text-white border-2 border-amber-500">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <Shield className="w-7 h-7 text-amber-500" />
                      Your Rights as a Candidate
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        {
                          title: "Right to Terminate",
                          description: "End any screen sharing session immediately, for any reason, without explanation"
                        },
                        {
                          title: "Right to Record",
                          description: "Record all sessions for your records and use them as evidence if needed"
                        },
                        {
                          title: "Right to Request Agent Change",
                          description: "Request a different agent if you're uncomfortable or unsatisfied"
                        },
                        {
                          title: "Right to Full Transparency",
                          description: "Access complete information about your agent's identity and track record"
                        },
                        {
                          title: "Right to Limit Scope",
                          description: "Specify exactly which platforms and tasks agents can access and work on"
                        },
                        {
                          title: "Right to Report Violations",
                          description: "Report any suspicious activity with guaranteed investigation and action"
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-bold mb-1">{item.title}</h4>
                            <p className="text-gray-300 text-sm">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* Call to Action */}
              <section className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-8 md:p-12 text-white text-center border-2 border-amber-500">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Maximize Your Earnings?</h2>
                <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                  Let our trained agents help you manage multiple gigs while you maintain complete control
                  and security. Start with a scheduled session today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push('/candidate-projects')}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-8 py-4 rounded-lg font-bold hover:from-amber-600 hover:to-yellow-600 transition-all shadow-lg text-lg"
                  >
                    <Calendar className="w-6 h-6" />
                    Schedule a Session
                  </button>
                  <button
                    onClick={() => setActiveTab('info')}
                    className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all shadow-lg text-lg"
                  >
                    <FileCheck className="w-6 h-6" />
                    Learn More
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
