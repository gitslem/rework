import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Users, DollarSign, Star, TrendingUp, Settings, MessageSquare, LogOut,
  User, MapPin, Mail, Phone, Calendar, CheckCircle, Clock, X, Edit, Upload as UploadIcon, Plus, Trash2
} from 'lucide-react';
import Head from 'next/head';
import Logo from '@/components/Logo';
import { getFirebaseAuth, getFirebaseFirestore, getFirebaseStorage } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface AgentProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  location: string;
  bio: string;
  socialLinks: {
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
  };
  agentVerificationStatus: string;
  isAgentApproved: boolean;
  agentServices: string[];
  agentPricing: {
    [key: string]: number | undefined;
  };
  agentPortfolio: string[];
  agentTotalClients: number;
  agentSuccessRate: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  createdAt: any;
}

export default function AgentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showRatesModal, setShowRatesModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [pricing, setPricing] = useState<{[key: string]: number | undefined}>({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const availablePlatforms = [
    'Outlier AI',
    'Alignerr',
    'Mindrift AI',
    'OneForma',
    'Appen',
    'TELUS Digital',
    'RWS',
    'DataAnnotation',
    'Lionbridge',
    'Clickworker'
  ];

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

        // Get user document to check role
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (!userDoc.exists()) {
          router.push('/complete-profile');
          return;
        }

        const userData = userDoc.data();

        // Redirect candidates to their dashboard
        if (userData.role === 'candidate') {
          router.push('/candidate-dashboard');
          return;
        }

        // Get profile document
        const profileDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
        if (!profileDoc.exists()) {
          router.push('/complete-profile');
          return;
        }

        const profileData = profileDoc.data() as AgentProfile;
        profileData.email = firebaseUser.email || '';
        profileData.uid = firebaseUser.uid;
        setProfile(profileData);

        // Check if agent is approved
        const approved = profileData.isAgentApproved === true || profileData.agentVerificationStatus === 'verified';
        setIsApproved(approved);

        // Load current services and pricing
        if (profileData.agentServices) {
          setSelectedServices(profileData.agentServices);
        }
        if (profileData.agentPricing) {
          setPricing(profileData.agentPricing);
        }

        setLoading(false);
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    }
  };

  const handleSaveServices = async () => {
    if (!profile || selectedServices.length === 0) {
      alert('Please select at least one service');
      return;
    }

    try {
      setSaving(true);
      const db = getFirebaseFirestore();

      await updateDoc(doc(db, 'profiles', profile.uid), {
        agentServices: selectedServices,
        updatedAt: Timestamp.now()
      });

      setProfile({ ...profile, agentServices: selectedServices });
      setShowServicesModal(false);
      alert('Services updated successfully!');
    } catch (error: any) {
      console.error('Error saving services:', error);
      alert('Failed to save services: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRates = async () => {
    if (!profile || Object.keys(pricing).length === 0) {
      alert('Please set at least one rate');
      return;
    }

    try {
      setSaving(true);
      const db = getFirebaseFirestore();

      await updateDoc(doc(db, 'profiles', profile.uid), {
        agentPricing: pricing,
        updatedAt: Timestamp.now()
      });

      setProfile({ ...profile, agentPricing: pricing });
      setShowRatesModal(false);
      alert('Rates updated successfully!');
    } catch (error: any) {
      console.error('Error saving rates:', error);
      alert('Failed to save rates: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadCredential = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('File must be an image (JPEG, PNG, WebP) or PDF');
      return;
    }

    try {
      setUploading(true);
      const storage = getFirebaseStorage();
      const db = getFirebaseFirestore();

      // Upload file
      const credentialRef = ref(storage, `portfolio/${profile.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(credentialRef, file);
      const credentialUrl = await getDownloadURL(credentialRef);

      // Update profile with new credential
      const updatedPortfolio = [...(profile.agentPortfolio || []), credentialUrl];
      await updateDoc(doc(db, 'profiles', profile.uid), {
        agentPortfolio: updatedPortfolio,
        updatedAt: Timestamp.now()
      });

      setProfile({ ...profile, agentPortfolio: updatedPortfolio });
      alert('Credential uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading credential:', error);
      alert('Failed to upload credential: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCredential = async (urlToDelete: string) => {
    if (!profile || !confirm('Are you sure you want to delete this credential?')) return;

    try {
      const db = getFirebaseFirestore();
      const updatedPortfolio = profile.agentPortfolio.filter(url => url !== urlToDelete);

      await updateDoc(doc(db, 'profiles', profile.uid), {
        agentPortfolio: updatedPortfolio,
        updatedAt: Timestamp.now()
      });

      setProfile({ ...profile, agentPortfolio: updatedPortfolio });
      alert('Credential deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting credential:', error);
      alert('Failed to delete credential: ' + error.message);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const stats = [
    { label: 'Total Clients', value: profile.agentTotalClients || 0, icon: <Users className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500' },
    { label: 'Success Rate', value: `${profile.agentSuccessRate || 0}%`, icon: <TrendingUp className="w-6 h-6" />, color: 'from-green-500 to-emerald-500' },
    { label: 'Total Earnings', value: `$${profile.totalEarnings || 0}`, icon: <DollarSign className="w-6 h-6" />, color: 'from-purple-500 to-pink-500' },
    { label: 'Rating', value: (profile.averageRating || 0).toFixed(1), icon: <Star className="w-6 h-6" />, color: 'from-orange-500 to-red-500' },
  ];

  if (!isApproved) {
    return (
      <>
        <Head>
          <title>Agent Dashboard | Remote-Works</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16 md:h-20">
                <Logo showText={false} onClick={() => router.push('/')} />
                <div className="flex items-center space-x-4">
                  <button onClick={() => router.push('/login')} className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="hidden md:inline">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold text-yellow-900 mb-2">⚠️ Pending Verification</h3>
              <p className="text-yellow-800">
                Your agent account is pending verification. Our team will review your credentials within 24-48 hours.
                You'll receive an email notification once you're approved.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                Your Profile
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="text-gray-900 font-semibold">{profile.firstName} {profile.lastName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-gray-900 font-semibold">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="text-gray-900 font-semibold">{profile.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="text-gray-900 font-semibold">{profile.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Joined</p>
                    <p className="text-gray-900 font-semibold">{formatDate(profile.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-yellow-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Account Status</p>
                    <p className="text-yellow-600 font-semibold">Pending Approval</p>
                  </div>
                </div>
              </div>

              {profile.bio && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Bio</h3>
                  <p className="text-gray-700">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Agent Dashboard | Remote-Works</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              <Logo showText={false} onClick={() => router.push('/')} />
              <div className="flex items-center space-x-4">
                <button onClick={() => router.push('/profile-settings')} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Settings className="w-5 h-5" />
                  <span className="hidden md:inline">Settings</span>
                </button>
                <button onClick={() => router.push('/login')} className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 md:p-8 mb-8 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {profile.firstName}! 👋</h1>
            <p className="text-lg md:text-xl text-blue-100">Your agent account is active and ready to help candidates</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl text-white mb-4`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Profile Management */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gray-200 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Agent Profile</h2>
              <button
                onClick={() => router.push('/profile-settings')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
              >
                <Edit className="w-5 h-5" />
                Edit Profile
              </button>
            </div>

            <div className="space-y-4">
              {/* Services */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Services</h3>
                  <p className="text-sm text-gray-600 mb-2">Platforms you help with</p>
                  {profile.agentServices && profile.agentServices.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.agentServices.map((service, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {service}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No services added yet</p>
                  )}
                </div>
                <button
                  onClick={() => setShowServicesModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {profile.agentServices?.length > 0 ? 'Edit' : 'Add'}
                </button>
              </div>

              {/* Rates */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Pricing</h3>
                  <p className="text-sm text-gray-600 mb-2">Your rates for each service</p>
                  {profile.agentPricing && Object.keys(profile.agentPricing).length > 0 ? (
                    <div className="space-y-1">
                      {Object.entries(profile.agentPricing).map(([service, price]) => (
                        <p key={service} className="text-sm text-gray-700">
                          <span className="font-medium">{service}:</span> ${price}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No rates set yet</p>
                  )}
                </div>
                <button
                  onClick={() => setShowRatesModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {Object.keys(profile.agentPricing || {}).length > 0 ? 'Edit' : 'Set'}
                </button>
              </div>

              {/* Credentials */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Credentials & Portfolio</h3>
                  <p className="text-sm text-gray-600 mb-2">Proof of successful placements</p>
                  {profile.agentPortfolio && profile.agentPortfolio.length > 0 ? (
                    <p className="text-sm text-gray-700">{profile.agentPortfolio.length} credential(s) uploaded</p>
                  ) : (
                    <p className="text-sm text-gray-500">No credentials uploaded yet</p>
                  )}
                </div>
                <button
                  onClick={() => setShowCredentialsModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <UploadIcon className="w-4 h-4" />
                  Manage
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Modal */}
      {showServicesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Select Your Services</h3>
              <button onClick={() => setShowServicesModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">Choose the platforms you can help candidates with</p>
            <div className="grid md:grid-cols-2 gap-3 mb-6">
              {availablePlatforms.map((platform) => (
                <label key={platform} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(platform)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedServices([...selectedServices, platform]);
                      } else {
                        setSelectedServices(selectedServices.filter(s => s !== platform));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-900">{platform}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowServicesModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveServices}
                disabled={saving || selectedServices.length === 0}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Services'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rates Modal */}
      {showRatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Set Your Rates</h3>
              <button onClick={() => setShowRatesModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">Define your pricing for each platform you support</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Base Price (applies to all services)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    value={pricing.basePrice || ''}
                    onChange={(e) => setPricing({ ...pricing, basePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="100"
                  />
                </div>
              </div>
              {selectedServices.map((service) => (
                <div key={service}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {service}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      min="0"
                      value={pricing[service] || pricing.basePrice || ''}
                      onChange={(e) => setPricing({ ...pricing, [service]: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder={`${pricing.basePrice || 100}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRatesModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRates}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Rates'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredentialsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Manage Credentials</h3>
              <button onClick={() => setShowCredentialsModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">Upload proof of successful placements and credentials</p>

            {/* Upload Section */}
            <div className="mb-6">
              <label className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-colors">
                <UploadIcon className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, WebP or PDF (max. 10MB)</p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleUploadCredential}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              {uploading && (
                <p className="text-sm text-blue-600 mt-2 text-center">Uploading...</p>
              )}
            </div>

            {/* Existing Credentials */}
            {profile.agentPortfolio && profile.agentPortfolio.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Your Credentials ({profile.agentPortfolio.length})</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {profile.agentPortfolio.map((url, idx) => (
                    <div key={idx} className="relative border border-gray-200 rounded-lg p-3">
                      {url.endsWith('.pdf') ? (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center">
                            <span className="text-red-600 text-xs font-bold">PDF</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 truncate">Document {idx + 1}</p>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View</a>
                          </div>
                        </div>
                      ) : (
                        <img src={url} alt={`Credential ${idx + 1}`} className="w-full h-32 object-cover rounded" />
                      )}
                      <button
                        onClick={() => handleDeleteCredential(url)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
