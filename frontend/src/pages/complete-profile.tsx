import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '@/components/Logo';
import { User, MapPin, Globe, FileText, Check, Loader, Upload, MessageCircle } from 'lucide-react';
import { getFirebaseAuth, getFirebaseFirestore, getFirebaseStorage } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';

export default function CompleteProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    city: '',
    bio: '',
    contactMethodType: 'telegram' as 'telegram' | 'whatsapp',
    contactMethodValue: '',
  });

  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string>('');
  const [uploadingIdCard, setUploadingIdCard] = useState(false);

  useEffect(() => {
    checkAuthAndProfile();
  }, []);

  const checkAuthAndProfile = async () => {
    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseFirestore();

      onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          router.push('/login');
          return;
        }

        setUser(firebaseUser);

        // Check if profile already exists and is complete
        const profileDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          // If profile has firstName, consider it complete
          if (profileData.firstName) {
            // Redirect to dashboard
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              if (userData.role === 'agent') {
                router.push('/agent-dashboard');
              } else {
                router.push('/candidate-dashboard');
              }
              return;
            }
          }
        }

        setLoading(false);
      });
    } catch (error) {
      console.error('Error checking auth:', error);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('ID card file size must be less than 5MB');
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('ID card must be an image (JPEG, PNG, WebP) or PDF file');
        return;
      }

      setIdCardFile(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setIdCardPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setIdCardPreview(''); // Clear preview for PDFs
      }
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

    // Validate contact method
    if (!formData.contactMethodValue.trim()) {
      setError('Please provide your Telegram or WhatsApp contact for verification');
      return;
    }

    // Validate ID card upload (required)
    if (!idCardFile) {
      setError('Please upload your ID card for verification');
      return;
    }

    setSubmitting(true);

    try {
      const db = getFirebaseFirestore();
      const storage = getFirebaseStorage();

      let idCardUrl = '';

      // Upload ID card (required)
      setUploadingIdCard(true);

      // Sanitize candidate name for file path
      const sanitizeName = (name: string) => {
        return name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]/g, '_') // Replace special chars with underscore
          .replace(/_+/g, '_') // Replace multiple underscores with single
          .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
      };

      const sanitizedFirstName = sanitizeName(formData.firstName);
      const sanitizedLastName = sanitizeName(formData.lastName);
      const fileExtension = idCardFile.name.split('.').pop() || 'jpg';

      // Use candidate name in file path: id-cards/{userId}/firstName_lastName_uid.extension
      const idCardFileName = `${sanitizedFirstName}_${sanitizedLastName}_${user.uid}.${fileExtension}`;
      const idCardRef = ref(storage, `id-cards/${user.uid}/${idCardFileName}`);
      await uploadBytes(idCardRef, idCardFile);
      idCardUrl = await getDownloadURL(idCardRef);
      setUploadingIdCard(false);

      // Create or update profile
      await setDoc(doc(db, 'profiles', user.uid), {
        uid: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: `${formData.firstName} ${formData.lastName}`, // Full name for easy admin identification
        country: formData.country,
        city: formData.city,
        bio: formData.bio || '',
        location: `${formData.city}, ${formData.country}`,
        avatarURL: user.photoURL || '',
        phone: '', // Initialize empty, can be updated later in profile settings
        socialLinks: {
          linkedin: '',
          twitter: '',
          facebook: '',
          instagram: ''
        },
        // Contact method for verification (Telegram or WhatsApp)
        contactMethodType: formData.contactMethodType,
        contactMethodValue: formData.contactMethodValue,
        // ID card URL (required)
        idCardUrl: idCardUrl,
        // Verification status
        verificationStatus: 'pending',
        isVerified: false,
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
      }, { merge: true });

      // Show success message
      setShowSuccess(true);

      // Determine redirect based on user role
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const redirectPath = userDoc.exists() && userDoc.data().role === 'agent'
        ? '/agent-dashboard'
        : '/candidate-dashboard';

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(redirectPath);
      }, 2000);
    } catch (error: any) {
      console.error('Error creating profile:', error);
      // Ensure error is always a string, never an object
      const errorMessage = error?.message || error?.toString?.() || 'Failed to create profile. Please try again.';
      setError(errorMessage);
      setSubmitting(false);
      setUploadingIdCard(false);
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

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Profile Created!</h1>
          <p className="text-gray-600 mb-4">Redirecting to your dashboard...</p>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Complete Your Profile - RemoteWorks</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Logo showText={false} size="md" />
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12 animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-black mb-2">
                Complete Your Profile
              </h1>
              <p className="text-gray-600">
                Just a few more details to get you started
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
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="John"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              {/* Location Fields */}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
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
                    <option value="Brazil">Brazil</option>
                    <option value="Mexico">Mexico</option>
                    <option value="Spain">Spain</option>
                    <option value="Italy">Italy</option>
                    <option value="Poland">Poland</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="Kenya">Kenya</option>
                    <option value="South Africa">South Africa</option>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="New York"
                    required
                  />
                </div>
              </div>

              {/* Contact Method for Verification */}
              <div className="border-t border-gray-200 pt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Contact Method for Verification
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="text-red-500 font-semibold">* Required:</span> Our support team will contact you via your chosen method for verification
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Platform <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="contactMethodType"
                      value={formData.contactMethodType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                      required
                    >
                      <option value="telegram">Telegram</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Username or Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactMethodValue"
                      value={formData.contactMethodValue}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder={formData.contactMethodType === 'telegram' ? '@username or +1234567890' : '+1234567890'}
                      required
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  <strong>Note:</strong> Support will reach out to verify your identity. Make sure you provide accurate contact information.
                </p>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Bio (Optional)
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                  placeholder="Tell us a bit about yourself and what you're looking for..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  This helps agents understand your background and goals
                </p>
              </div>

              {/* ID Card Upload */}
              <div className="border-t border-gray-200 pt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Upload className="w-5 h-5 mr-2" />
                    Identity Verification
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Upload a valid government-issued ID card for verification
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ID Card <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleIdCardChange}
                      className="hidden"
                      id="idCardUpload"
                    />
                    <label
                      htmlFor="idCardUpload"
                      className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-black hover:bg-gray-50 transition-colors"
                    >
                      {idCardPreview ? (
                        <div className="relative w-full">
                          <img src={idCardPreview} alt="ID Card Preview" className="max-h-48 mx-auto rounded" />
                          <p className="text-sm text-gray-600 mt-2 text-center">{idCardFile?.name}</p>
                        </div>
                      ) : idCardFile ? (
                        <div className="text-center">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">{idCardFile.name}</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, WebP or PDF (max. 5MB)</p>
                        </>
                      )}
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Accepted documents: Driver's License, Passport, National ID Card, or other government-issued ID
                  </p>
                </div>
              </div>

              {/* Terms and Privacy Notice */}
              <div className="border-t border-gray-200 pt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600">
                    By completing your profile, you agree to our{' '}
                    <Link href="/terms" className="text-black font-semibold hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-black font-semibold hover:underline">
                      Privacy Policy
                    </Link>
                    . Your information will be securely stored and used for verification purposes only.
                  </p>
                </div>
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
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      Complete Profile
                      <Check className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer Note */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                Your profile information will be visible to verified agents
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
