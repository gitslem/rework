import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Save, Loader, CheckCircle, User, Briefcase, Globe, ArrowLeft,
  Play, BookOpen, Lightbulb, Target, Zap, Shield, ArrowRight, DollarSign,
  Award, TrendingUp, Clock, Star, ChevronRight, Monitor, Video, Lock,
  UserCheck, Calendar, FileCheck, Eye, Users, Settings as SettingsIcon,
  AlertTriangle, X, Download, Smartphone, Laptop, Home, Bell, Mail,
  Facebook, Twitter, Linkedin, Instagram, Phone, MapPin, CreditCard,
  Key, Palette, Moon, Sun, Languages, HelpCircle, LogOut, Camera,
  Edit3, Trash2, Upload, Check, AlertCircle, Info, ChevronDown,
  Activity, BarChart3, Folder, Link as LinkIcon, Code, Rocket,
  Building, Heart, Sparkles, Gift, Crown, Radio, Film, Image
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
  const [activeSection, setActiveSection] = useState<'profile' | 'account' | 'learn' | 'screen' | 'security' | 'notifications'>('profile');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  // Agent-specific availability fields
  const [timezone, setTimezone] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [agentResponseTime, setAgentResponseTime] = useState('');
  const [internetSpeed, setInternetSpeed] = useState('');

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

          // Load agent-specific availability fields
          setTimezone((profileData as any).timezone || '');
          setWorkingHours((profileData as any).workingHours || '');
          setAgentResponseTime((profileData as any).agentResponseTime || '');
          setInternetSpeed((profileData as any).internetSpeed || '');
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

      const updateData: any = {
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`, // Keep displayName in sync with name changes
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

      // Add agent-specific availability fields if user is an agent
      if (userRole === 'agent') {
        updateData.timezone = timezone;
        updateData.workingHours = workingHours;
        updateData.agentResponseTime = agentResponseTime;
        updateData.internetSpeed = internetSpeed;
      }

      await updateDoc(doc(db, 'profiles', user.uid), updateData);

      setSuccess(true);
      setShowSuccessModal(true);

      // Hide success modal after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = async () => {
    try {
      // Ensure userRole is loaded before navigating
      if (!userRole && user) {
        const db = getFirebaseFirestore();
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role || '';

          if (role === 'agent') {
            await router.push('/agent-dashboard');
          } else if (role === 'candidate') {
            await router.push('/candidate-dashboard');
          } else {
            await router.push('/dashboard');
          }
          return;
        }
      }

      // Navigate based on userRole
      if (userRole === 'agent') {
        await router.push('/agent-dashboard');
      } else if (userRole === 'candidate') {
        await router.push('/candidate-dashboard');
      } else {
        await router.push('/dashboard');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      window.location.href = userRole === 'agent' ? '/agent-dashboard' :
                             userRole === 'candidate' ? '/candidate-dashboard' : '/dashboard';
    }
  };

  // Navigation items
  const navigationItems = [
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" />, description: 'Personal information' },
    { id: 'account', label: 'Account', icon: <SettingsIcon className="w-5 h-5" />, description: 'Account settings' },
    { id: 'learn', label: 'Learn', icon: <BookOpen className="w-5 h-5" />, description: 'Platform guide' },
    { id: 'screen', label: 'Screen Sharing', icon: <Monitor className="w-5 h-5" />, description: 'Remote access' },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" />, description: 'Privacy & security' },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" />, description: 'Alerts & updates' },
  ];

  // Features data based on role
  const candidateFeatures = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Vetted Expert Agents",
      description: "Access to authenticated agents experienced in 20+ platforms including Outlier, TELUS, OneForma, and more",
      color: "from-blue-500 to-cyan-500",
      badge: "Verified"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Get Approved Faster",
      description: "Our agents know exactly what platforms look for and can guide you through the approval process efficiently",
      color: "from-purple-500 to-pink-500",
      badge: "98% Success"
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Flexible Payment Options",
      description: "Choose between one-time fees or revenue sharing based on what works best for you",
      color: "from-green-500 to-emerald-500",
      badge: "Flexible"
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Multiple Income Streams",
      description: "Access various remote work opportunities across AI training, translation, transcription, and more",
      color: "from-orange-500 to-red-500",
      badge: "20+ Platforms"
    }
  ];

  const agentFeatures = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Build Your Client Base",
      description: "Access a steady stream of qualified candidates actively seeking expertise in remote platform approvals",
      color: "from-blue-500 to-cyan-500",
      badge: "Growing"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Establish Your Brand",
      description: "Create a professional profile showcasing your success metrics, platform expertise, and client testimonials",
      color: "from-purple-500 to-pink-500",
      badge: "Professional"
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Control Your Revenue",
      description: "Set competitive rates and choose between upfront project fees or recurring revenue share models",
      color: "from-green-500 to-emerald-500",
      badge: "Profitable"
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Scale Your Business",
      description: "Serve multiple clients simultaneously using our efficient workflow and communication tools",
      color: "from-orange-500 to-red-500",
      badge: "Scalable"
    }
  ];

  const features = userRole === 'agent' ? agentFeatures : candidateFeatures;

  const platforms = [
    { name: "Outlier AI", logo: "🤖", category: "AI Training" },
    { name: "TELUS Digital", logo: "📱", category: "Data Annotation" },
    { name: "OneForma", logo: "🌐", category: "Translation" },
    { name: "RWS", logo: "🗣️", category: "Localization" },
    { name: "Appen", logo: "🎯", category: "Data Collection" },
    { name: "Alignerr", logo: "⚡", category: "AI Training" },
    { name: "Mindrift AI", logo: "🧠", category: "AI Projects" },
    { name: "DataAnnotation", logo: "📊", category: "Labeling" },
    { name: "Lionbridge", logo: "🦁", category: "Translation" },
    { name: "Clickworker", logo: "👆", category: "Microtasks" },
    { name: "Scale AI", logo: "📈", category: "ML Training" },
    { name: "Remotasks", logo: "💼", category: "Data Tasks" }
  ];

  const workTypes = [
    { name: "AI Training", icon: <Zap className="w-5 h-5" />, color: "from-yellow-400 to-orange-500" },
    { name: "Translation", icon: <Globe className="w-5 h-5" />, color: "from-blue-400 to-cyan-500" },
    { name: "Transcription", icon: <BookOpen className="w-5 h-5" />, color: "from-green-400 to-emerald-500" },
    { name: "Data Labeling", icon: <Target className="w-5 h-5" />, color: "from-purple-400 to-pink-500" },
    { name: "Evaluation", icon: <CheckCircle className="w-5 h-5" />, color: "from-red-400 to-rose-500" },
    { name: "Research", icon: <Award className="w-5 h-5" />, color: "from-indigo-400 to-blue-500" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Settings | Remote-Works</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Settings</h1>
                  <p className="text-xs text-gray-500">Manage your account and preferences</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {profile && (
                  <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {firstName[0]}{lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{firstName} {lastName}</p>
                      <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar Navigation */}
          <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} hidden lg:block bg-white border-r border-gray-200 min-h-screen transition-all duration-300`}>
            <div className="p-4">
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`${activeSection === item.id ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'} transition-colors`}>
                      {item.icon}
                    </div>
                    {!sidebarCollapsed && (
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className={`text-xs ${activeSection === item.id ? 'text-blue-100' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                      </div>
                    )}
                    {!sidebarCollapsed && activeSection === item.id && (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </nav>

              {/* Quick Stats */}
              {!sidebarCollapsed && (
                <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900 text-sm">Quick Stats</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Profile Strength</span>
                      <span className="text-xs font-bold text-green-600">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Mobile Navigation */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
            <div className="grid grid-cols-6 gap-1 p-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    activeSection === item.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600'
                  }`}
                >
                  <div className="w-5 h-5">{item.icon}</div>
                  <span className="text-xs font-medium">{item.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-8 overflow-y-auto">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Profile Settings</h2>
                    <p className="text-gray-600 mt-1">Manage your personal information and public profile</p>
                  </div>
                </div>

                {/* Profile Picture */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-blue-600" />
                    Profile Picture
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {firstName[0]}{lastName[0]}
                      </div>
                      <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border-2 border-blue-500 hover:bg-blue-50 transition-colors">
                        <Camera className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{firstName} {lastName}</h4>
                      <p className="text-sm text-gray-500 mb-3">Upload a new profile picture</p>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Upload
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Basic Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Enter first name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                        placeholder="Tell us about yourself..."
                      />
                      <p className="text-xs text-gray-500 mt-1">{bio.length}/500 characters</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-blue-600" />
                    Contact Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PayPal Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={paypalEmail}
                          onChange={(e) => setPaypalEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="paypal@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Enter city"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Enter country"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Availability & Working Hours - Agent Only */}
                {userRole === 'agent' && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 shadow-md border-2 border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-600" />
                      Availability & Working Hours
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Set your availability information so admins and clients can better coordinate with you
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                          >
                            <option value="">Select timezone...</option>
                            <option value="America/New_York">Eastern Time (ET)</option>
                            <option value="America/Chicago">Central Time (CT)</option>
                            <option value="America/Denver">Mountain Time (MT)</option>
                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                            <option value="America/Anchorage">Alaska Time (AKT)</option>
                            <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                            <option value="Europe/London">London (GMT/BST)</option>
                            <option value="Europe/Paris">Central European Time (CET)</option>
                            <option value="Europe/Moscow">Moscow Time (MSK)</option>
                            <option value="Asia/Dubai">Dubai (GST)</option>
                            <option value="Asia/Kolkata">India (IST)</option>
                            <option value="Asia/Singapore">Singapore (SGT)</option>
                            <option value="Asia/Shanghai">China (CST)</option>
                            <option value="Asia/Tokyo">Japan (JST)</option>
                            <option value="Australia/Sydney">Sydney (AEDT/AEST)</option>
                            <option value="Pacific/Auckland">New Zealand (NZDT/NZST)</option>
                            <option value="UTC">UTC</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <select
                            value={workingHours}
                            onChange={(e) => setWorkingHours(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                          >
                            <option value="">Select working hours...</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Flexible">Flexible</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Response Time</label>
                        <div className="relative">
                          <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <select
                            value={agentResponseTime}
                            onChange={(e) => setAgentResponseTime(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                          >
                            <option value="">Select response time...</option>
                            <option value="< 6 hours">Less than 6 hours</option>
                            <option value="< 12 hours">Less than 12 hours</option>
                            <option value="< 24 hours">Less than 24 hours</option>
                            <option value="< 48 hours">Less than 48 hours</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Internet Speed</label>
                        <div className="relative">
                          <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <select
                            value={internetSpeed}
                            onChange={(e) => setInternetSpeed(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                          >
                            <option value="">Select internet speed...</option>
                            <option value="Slow">Slow (Below 10 Mbps)</option>
                            <option value="Medium">Medium (10-50 Mbps)</option>
                            <option value="Fast">Fast (50-100 Mbps)</option>
                            <option value="Very Fast">Very Fast (100+ Mbps)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Social Links */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-blue-600" />
                    Social Media Links
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                        <input
                          type="url"
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="linkedin.com/in/username"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                      <div className="relative">
                        <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                        <input
                          type="url"
                          value={twitter}
                          onChange={(e) => setTwitter(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="twitter.com/username"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                      <div className="relative">
                        <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-700" />
                        <input
                          type="url"
                          value={facebook}
                          onChange={(e) => setFacebook(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="facebook.com/username"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-600" />
                        <input
                          type="url"
                          value={instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="instagram.com/username"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex gap-3 sticky bottom-0 bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-2xl border border-blue-100">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
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
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-all border-2 border-gray-200"
                  >
                    Cancel
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3 animate-slideDown">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Account Section */}
            {activeSection === 'account' && (
              <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Account Settings</h2>
                    <p className="text-gray-600 mt-1">Manage your account preferences and authentication</p>
                  </div>
                </div>

                {/* Email & Password */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    Email & Password
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email Address</p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Change Email
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Password</p>
                        <p className="text-sm text-gray-600">••••••••</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Two-Factor Authentication
                  </h3>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="text-gray-700 mb-2">Add an extra layer of security to your account</p>
                      <p className="text-sm text-gray-500">Protect your account with 2FA using an authenticator app</p>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors whitespace-nowrap">
                      Enable 2FA
                    </button>
                  </div>
                </div>

                {/* Sessions */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Active Sessions
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Monitor className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Current Device</p>
                          <p className="text-xs text-gray-600">Chrome on Windows • Active now</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">Active</span>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6 shadow-md border-2 border-red-200">
                  <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Danger Zone
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Deactivate Account</p>
                        <p className="text-xs text-gray-600">Temporarily disable your account</p>
                      </div>
                      <button className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors">
                        Deactivate
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Delete Account</p>
                        <p className="text-xs text-gray-600">Permanently delete your account and all data</p>
                      </div>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Learn Section */}
            {activeSection === 'learn' && (
              <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {userRole === 'agent' ? 'Agent Resources' : 'Learn About Remote-Works'}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {userRole === 'agent'
                        ? 'Professional guidance for building and scaling your consulting business'
                        : 'Everything you need to know about working with agents and getting approved'}
                    </p>
                  </div>
                </div>

                {/* Hero Banner */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <Rocket className="w-8 h-8" />
                      </div>
                      <h3 className="text-3xl font-bold">
                        {userRole === 'agent' ? 'Build Your Consulting Empire' : 'Start Your Remote Work Journey'}
                      </h3>
                    </div>
                    <p className="text-xl text-blue-100 mb-6 max-w-2xl">
                      {userRole === 'agent'
                        ? 'Professional marketplace designed specifically for experienced agents who specialize in remote work platform approvals. Turn your expertise into sustainable revenue.'
                        : 'Marketplace platform that connects talented individuals with expert agents who have proven success in getting candidates approved for 20+ remote work platforms.'}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">98% Success Rate</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <Users className="w-5 h-5" />
                        <span className="font-semibold">1000+ Users</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <Star className="w-5 h-5" />
                        <span className="font-semibold">4.9 Rating</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all group cursor-pointer"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                          {feature.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                            <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                              {feature.badge}
                            </span>
                          </div>
                          <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Supported Platforms */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Supported Platforms</h3>
                      <p className="text-gray-600">Access to 20+ leading remote work platforms</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {platforms.map((platform, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl group-hover:scale-125 transition-transform">{platform.logo}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate text-sm">{platform.name}</p>
                            <p className="text-xs text-gray-500">{platform.category}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Work Types */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Types of Work</h3>
                      <p className="text-gray-600">Diverse opportunities across multiple domains</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    {workTypes.map((type, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group cursor-pointer"
                      >
                        <div className={`inline-block p-3 rounded-lg bg-gradient-to-br ${type.color} text-white mb-3 group-hover:scale-110 transition-transform`}>
                          {type.icon}
                        </div>
                        <h4 className="font-semibold text-gray-900">{type.name}</h4>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Models */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-md border-2 border-green-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {userRole === 'agent' ? 'Revenue Models' : 'Payment Options'}
                      </h3>
                      <p className="text-gray-700">
                        {userRole === 'agent'
                          ? 'Choose how you monetize your expertise'
                          : 'Flexible payment structures to match your budget'}
                      </p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 border-2 border-green-300 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CreditCard className="w-6 h-6 text-green-600" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">
                          {userRole === 'agent' ? 'Project-Based Fees' : 'One-Time Fee'}
                        </h4>
                      </div>
                      <p className="text-gray-700 mb-4">
                        {userRole === 'agent'
                          ? 'Set competitive upfront rates for platform approval services. Typically $100-$200 per engagement with instant payment upon successful approval.'
                          : 'Pay a one-time fee upfront for approval assistance. Typical range: $100-$150 per platform. No ongoing commitments.'}
                      </p>
                      <ul className="space-y-2">
                        {(userRole === 'agent' ? [
                          'Set your own pricing tiers',
                          'Instant payment on completion',
                          'No long-term obligations',
                          'Scale with volume discounts'
                        ] : [
                          'Clear, upfront pricing',
                          'No hidden costs',
                          'Pay only once',
                          'Get full support'
                        ]).map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white rounded-xl p-6 border-2 border-blue-300 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">
                          {userRole === 'agent' ? 'Revenue Share Partnership' : 'Revenue Share'}
                        </h4>
                      </div>
                      <p className="text-gray-700 mb-4">
                        {userRole === 'agent'
                          ? 'Build recurring revenue by partnering with candidates long-term. Earn 40-50% of their platform earnings with optional task management services.'
                          : 'Share 40-50% of your earnings with your agent. No upfront costs. Your agent may also handle tasks on your behalf with your authorization.'}
                      </p>
                      <ul className="space-y-2">
                        {(userRole === 'agent' ? [
                          'Recurring monthly revenue',
                          '40-50% earnings share',
                          'Optional task management',
                          'Long-term client relationships'
                        ] : [
                          'No money upfront',
                          'Share 40-50% of earnings',
                          'Agent may handle tasks',
                          'Flexible arrangements'
                        ]).map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Success Tips */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-md border-2 border-purple-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {userRole === 'agent' ? 'Business Success Tips' : 'Success Tips'}
                      </h3>
                      <p className="text-gray-700">
                        {userRole === 'agent'
                          ? 'Proven strategies to grow your consulting business'
                          : 'Expert advice to maximize your success'}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    {(userRole === 'agent' ? [
                      {
                        title: 'Build Your Reputation',
                        desc: 'Maintain a high success rate and collect positive reviews. Your track record is your most valuable asset.',
                        tips: ['Deliver consistent results', 'Communicate proactively', 'Set realistic expectations', 'Showcase success metrics']
                      },
                      {
                        title: 'Set Competitive Pricing',
                        desc: 'Research market rates and position yourself strategically based on your expertise and specializations.',
                        tips: ['Study competitor pricing', 'Offer tiered packages', 'Bundle services for value', 'Consider seasonal promotions']
                      },
                      {
                        title: 'Scale Systematically',
                        desc: 'Develop efficient workflows and leverage platform tools to serve more clients without sacrificing quality.',
                        tips: ['Create process templates', 'Use automation tools', 'Build a knowledge base', 'Track key metrics']
                      },
                      {
                        title: 'Maintain Professionalism',
                        desc: 'Professional communication and service delivery distinguish top agents from the rest.',
                        tips: ['Respond within 24 hours', 'Keep detailed records', 'Honor commitments', 'Continuous learning']
                      }
                    ] : [
                      {
                        title: 'Complete Your Profile',
                        desc: 'A complete profile increases credibility and helps agents understand your background better.',
                        tips: ['Add professional bio', 'List relevant skills', 'Upload verification docs', 'Connect social profiles']
                      },
                      {
                        title: 'Choose the Right Agent',
                        desc: 'Review agent profiles carefully. Look for specialists in the platforms you\'re interested in.',
                        tips: ['Check ratings & reviews', 'Review success rates', 'Read terms carefully', 'Ask questions first']
                      },
                      {
                        title: 'Follow Agent Guidelines',
                        desc: 'Your success depends on following the guidance provided by your agent.',
                        tips: ['Read instructions carefully', 'Meet submission deadlines', 'Be responsive to messages', 'Ask when unclear']
                      },
                      {
                        title: 'Stay Professional',
                        desc: 'Clear and professional communication ensures smooth collaboration.',
                        tips: ['Respond promptly', 'Be honest about skills', 'Meet agreed deadlines', 'Maintain regular contact']
                      }
                    ]).map((tip, index) => (
                      <div key={index} className="bg-white rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-all">
                        <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white text-sm font-bold">
                            {index + 1}
                          </span>
                          {tip.title}
                        </h4>
                        <p className="text-gray-700 mb-4">{tip.desc}</p>
                        <ul className="grid md:grid-cols-2 gap-2">
                          {tip.tips.map((t, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                              <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Screen Sharing Section */}
            {activeSection === 'screen' && (
              <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {userRole === 'agent' ? 'Professional Screen Sharing Protocol' : 'Screen Sharing Guide'}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {userRole === 'agent'
                        ? 'Master secure remote access tools to deliver efficient, compliant client services'
                        : 'Learn how to safely share your screen for efficient remote assistance'}
                    </p>
                  </div>
                </div>

                {/* Hero Section */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-48 -mt-48"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <Monitor className="w-8 h-8" />
                      </div>
                      <h3 className="text-3xl font-bold">
                        {userRole === 'agent' ? 'Deliver Premium Remote Services' : 'Why Screen Sharing?'}
                      </h3>
                    </div>
                    <p className="text-xl text-indigo-100 mb-6 max-w-3xl">
                      {userRole === 'agent'
                        ? 'Screen sharing is your primary service delivery mechanism. Provide real-time guidance, complete platform applications, and demonstrate your expertise while maintaining the highest security and compliance standards.'
                        : 'Screen sharing allows your agent to guide you through platform applications in real-time, ensuring every detail is perfect. It\'s faster, more efficient, and leads to better approval rates.'}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <Zap className="w-5 h-5" />
                        <span className="font-semibold">60-70% Faster</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <Shield className="w-5 h-5" />
                        <span className="font-semibold">Bank-Level Security</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Verified Tools</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="grid md:grid-cols-3 gap-6">
                  {(userRole === 'agent' ? [
                    {
                      icon: <TrendingUp className="w-8 h-8" />,
                      title: 'Efficiency Gains',
                      desc: 'Complete client onboarding 60-70% faster compared to email-based guidance',
                      color: 'from-green-500 to-emerald-500'
                    },
                    {
                      icon: <Target className="w-8 h-8" />,
                      title: 'Service Excellence',
                      desc: 'Demonstrate expertise in real-time, building trust and client satisfaction',
                      color: 'from-blue-500 to-cyan-500'
                    },
                    {
                      icon: <Users className="w-8 h-8" />,
                      title: 'Client Capacity',
                      desc: 'Handle 10+ active engagements simultaneously with streamlined workflows',
                      color: 'from-purple-500 to-pink-500'
                    }
                  ] : [
                    {
                      icon: <Clock className="w-8 h-8" />,
                      title: 'Save Time',
                      desc: 'Complete applications 60-70% faster with real-time guidance',
                      color: 'from-blue-500 to-cyan-500'
                    },
                    {
                      icon: <Target className="w-8 h-8" />,
                      title: 'Higher Success',
                      desc: 'Agents can catch and fix mistakes before submission',
                      color: 'from-green-500 to-emerald-500'
                    },
                    {
                      icon: <Shield className="w-8 h-8" />,
                      title: 'Safe & Secure',
                      desc: 'All recommended tools use bank-level encryption',
                      color: 'from-purple-500 to-pink-500'
                    }
                  ]).map((benefit, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all">
                      <div className={`inline-block p-3 rounded-xl bg-gradient-to-br ${benefit.color} text-white mb-4`}>
                        {benefit.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Recommended Tools */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Monitor className="w-7 h-7 text-blue-600" />
                    Recommended Tools
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      {
                        name: 'AnyDesk',
                        icon: <Monitor className="w-6 h-6" />,
                        features: ['Fast & lightweight', 'Cross-platform', 'File transfer', '256-bit encryption'],
                        best: 'Best for quick sessions',
                        color: 'from-red-500 to-rose-600'
                      },
                      {
                        name: 'TeamViewer',
                        icon: <Laptop className="w-6 h-6" />,
                        features: ['Industry standard', 'Session recording', 'Whiteboard tools', 'Enterprise security'],
                        best: 'Best for professional use',
                        color: 'from-blue-500 to-cyan-600'
                      },
                      {
                        name: 'Chrome Remote Desktop',
                        icon: <Globe className="w-6 h-6" />,
                        features: ['Free to use', 'Works in browser', 'Simple setup', 'Google security'],
                        best: 'Best for beginners',
                        color: 'from-green-500 to-emerald-600'
                      },
                      {
                        name: 'Zoom Screen Share',
                        icon: <Video className="w-6 h-6" />,
                        features: ['Video + screen', 'Easy scheduling', 'Cloud recording', 'Annotation tools'],
                        best: 'Best for video calls',
                        color: 'from-purple-500 to-pink-600'
                      }
                    ].map((tool, index) => (
                      <div key={index} className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.color} text-white`}>
                            {tool.icon}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">{tool.name}</h4>
                            <p className="text-sm text-gray-600">{tool.best}</p>
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {tool.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Best Practices */}
                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 shadow-md border-2 border-red-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-7 h-7 text-red-600" />
                    {userRole === 'agent' ? 'Non-Negotiable Security Compliance' : 'Security Guidelines'}
                  </h3>
                  <p className="text-gray-700 mb-6">
                    {userRole === 'agent'
                      ? 'Professional service delivery requires strict adherence to security protocols. These practices protect both you and your clients.'
                      : 'Your safety is our priority. Always follow these security guidelines when sharing your screen.'}
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {(userRole === 'agent' ? [
                      { icon: <Lock className="w-5 h-5" />, text: 'Require password-protected sessions', color: 'text-red-600' },
                      { icon: <Eye className="w-5 h-5" />, text: 'Maintain professional boundaries at all times', color: 'text-orange-600' },
                      { icon: <Shield className="w-5 h-5" />, text: 'Never request or store sensitive credentials', color: 'text-red-600' },
                      { icon: <FileCheck className="w-5 h-5" />, text: 'Document all client interactions', color: 'text-orange-600' },
                      { icon: <UserCheck className="w-5 h-5" />, text: 'Verify client identity before sessions', color: 'text-red-600' },
                      { icon: <AlertTriangle className="w-5 h-5" />, text: 'Report suspicious requests immediately', color: 'text-orange-600' }
                    ] : [
                      { icon: <Lock className="w-5 h-5" />, text: 'Only use verified agents from our platform', color: 'text-red-600' },
                      { icon: <Eye className="w-5 h-5" />, text: 'Close sensitive apps before sharing', color: 'text-orange-600' },
                      { icon: <Shield className="w-5 h-5" />, text: 'Never share banking or payment passwords', color: 'text-red-600' },
                      { icon: <Clock className="w-5 h-5" />, text: 'End session immediately if uncomfortable', color: 'text-orange-600' },
                      { icon: <UserCheck className="w-5 h-5" />, text: 'Verify agent identity before starting', color: 'text-red-600' },
                      { icon: <AlertTriangle className="w-5 h-5" />, text: 'Report suspicious behavior to support', color: 'text-orange-600' }
                    ]).map((item, index) => (
                      <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-4">
                        <div className={`${item.color} mt-1`}>{item.icon}</div>
                        <p className="text-gray-900 font-medium">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Use Cases */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Briefcase className="w-7 h-7 text-blue-600" />
                    {userRole === 'agent' ? 'Service Scenarios' : 'Common Use Cases'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {(userRole === 'agent' ? [
                      {
                        title: 'Platform Onboarding Services',
                        desc: 'Guide candidates through initial registration, profile setup, and verification processes',
                        time: '30-45 min per platform'
                      },
                      {
                        title: 'Assessment & Certification Support',
                        desc: 'Provide real-time guidance during qualification tests and skill assessments',
                        time: '15-60 min per test'
                      },
                      {
                        title: 'Application Optimization',
                        desc: 'Review and enhance existing profiles, portfolios, and application materials',
                        time: '20-30 min per review'
                      },
                      {
                        title: 'Technical Issue Resolution',
                        desc: 'Troubleshoot platform-specific technical problems and account issues',
                        time: '15-30 min per issue'
                      }
                    ] : [
                      {
                        title: 'Platform Applications',
                        desc: 'Agent guides you through filling out platform applications with optimal answers',
                        time: '30-45 minutes'
                      },
                      {
                        title: 'Profile Optimization',
                        desc: 'Agent reviews and improves your profile, portfolio, and application materials',
                        time: '20-30 minutes'
                      },
                      {
                        title: 'Test Preparation',
                        desc: 'Agent helps you prepare for and complete platform qualification tests',
                        time: '15-60 minutes'
                      },
                      {
                        title: 'Technical Issues',
                        desc: 'Agent helps troubleshoot technical problems with platform access',
                        time: '15-30 minutes'
                      }
                    ]).map((useCase, index) => (
                      <div key={index} className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                        <h4 className="font-bold text-gray-900 mb-2">{useCase.title}</h4>
                        <p className="text-sm text-gray-700 mb-2">{useCase.desc}</p>
                        <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold">
                          <Clock className="w-4 h-4" />
                          {useCase.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Security & Privacy</h2>
                    <p className="text-gray-600 mt-1">Manage your security settings and privacy preferences</p>
                  </div>
                </div>

                {/* Security Score */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-md border-2 border-green-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="w-7 h-7 text-green-600" />
                        Security Score
                      </h3>
                      <p className="text-gray-700">Your account security rating</p>
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-bold text-green-600">85</div>
                      <p className="text-sm text-gray-600">/ 100</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <p className="text-sm text-gray-700">
                    Good! Enable two-factor authentication to reach 100.
                  </p>
                </div>

                {/* Security Features */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Lock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Password Strength</h3>
                        <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 bg-green-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                      <span className="text-sm font-semibold text-green-600">Strong</span>
                    </div>
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Change Password
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <Shield className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Two-Factor Auth</h3>
                        <p className="text-sm text-gray-600">Not enabled</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Add an extra layer of security to your account
                    </p>
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Eye className="w-6 h-6 text-blue-600" />
                    Privacy Settings
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Show profile to other users', desc: 'Make your profile visible in search results' },
                      { label: 'Allow messages from anyone', desc: 'Receive messages from all platform users' },
                      { label: 'Show online status', desc: 'Display when you\'re active on the platform' },
                      { label: 'Share activity data', desc: 'Help us improve by sharing anonymous usage data' }
                    ].map((setting, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{setting.label}</p>
                          <p className="text-sm text-gray-600">{setting.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data & Privacy */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Folder className="w-6 h-6 text-blue-600" />
                    Data Management
                  </h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Download className="w-5 h-5 text-blue-600" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Download Your Data</p>
                          <p className="text-sm text-gray-600">Get a copy of your account data</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileCheck className="w-5 h-5 text-green-600" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Privacy Policy</p>
                          <p className="text-sm text-gray-600">Read our privacy policy</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Notification Settings</h2>
                    <p className="text-gray-600 mt-1">Manage how you receive updates and alerts</p>
                  </div>
                </div>

                {/* Email Notifications */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-6 h-6 text-blue-600" />
                    Email Notifications
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'New messages', desc: 'Get notified when you receive a new message' },
                      { label: 'Project updates', desc: 'Updates on your active projects' },
                      { label: 'Payment notifications', desc: 'Receipts and payment confirmations' },
                      { label: 'Security alerts', desc: 'Important account security updates' },
                      { label: 'Marketing emails', desc: 'Product updates and promotional offers' }
                    ].map((notification, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{notification.label}</p>
                          <p className="text-sm text-gray-600">{notification.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked={index < 3} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Bell className="w-6 h-6 text-purple-600" />
                    Push Notifications
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Browser notifications', desc: 'Receive notifications in your browser' },
                      { label: 'Sound alerts', desc: 'Play a sound for important notifications' },
                      { label: 'Desktop notifications', desc: 'Show desktop notifications' }
                    ].map((notification, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{notification.label}</p>
                          <p className="text-sm text-gray-600">{notification.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notification Frequency */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-orange-600" />
                    Notification Frequency
                  </h3>
                  <div className="space-y-3">
                    {[
                      { value: 'real-time', label: 'Real-time', desc: 'Get notified immediately' },
                      { value: 'hourly', label: 'Hourly digest', desc: 'Summary every hour' },
                      { value: 'daily', label: 'Daily digest', desc: 'One email per day' },
                      { value: 'weekly', label: 'Weekly digest', desc: 'One email per week' }
                    ].map((option, index) => (
                      <label key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                        <input type="radio" name="frequency" defaultChecked={index === 0} className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">{option.label}</p>
                          <p className="text-sm text-gray-600">{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scaleIn">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Changes Saved!</h3>
                <p className="text-gray-600 mb-6">Your profile has been updated successfully.</p>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
