import { useState } from 'react';
import { useRouter } from 'next/router';
import { User, MapPin, Globe, Briefcase, GraduationCap, Monitor, Wifi, Clock, CheckCircle } from 'lucide-react';

interface AgentFormData {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Location
  country: string;
  city: string;
  timezone: string;

  // Professional Info
  bio: string;
  yearsOfExperience: string;
  education: string;
  languagesSpoken: string[];

  // Technical
  devices: string[];
  internetSpeed: string;
  workingHours: string;

  // Platforms & Experience
  platformsExperience: string[];
  specializations: string[];

  // Contact & Links
  linkedin: string;
  website: string;
}

interface Props {
  onSubmit: (data: AgentFormData) => Promise<void>;
  initialData?: Partial<AgentFormData>;
}

export default function AgentRegistrationForm({ onSubmit, initialData }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<AgentFormData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    country: initialData?.country || '',
    city: initialData?.city || '',
    timezone: initialData?.timezone || '',
    bio: initialData?.bio || '',
    yearsOfExperience: initialData?.yearsOfExperience || '',
    education: initialData?.education || '',
    languagesSpoken: initialData?.languagesSpoken || [],
    devices: initialData?.devices || [],
    internetSpeed: initialData?.internetSpeed || '',
    workingHours: initialData?.workingHours || '',
    platformsExperience: initialData?.platformsExperience || [],
    specializations: initialData?.specializations || [],
    linkedin: initialData?.linkedin || '',
    website: initialData?.website || '',
  });

  const platforms = [
    'Outlier AI', 'Alignerr', 'OneForma', 'Appen', 'RWS', 'Mindrift AI',
    'TELUS Digital', 'Scale AI', 'Lionbridge', 'TransPerfect'
  ];

  const specializationOptions = [
    'AI Training', 'Data Annotation', 'Translation', 'Content Moderation',
    'Image Labeling', 'Text Classification', 'Audio Transcription', 'Video Annotation'
  ];

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese',
    'Korean', 'Arabic', 'Portuguese', 'Russian', 'Hindi', 'Italian'
  ];

  const deviceOptions = ['Laptop', 'Desktop', 'Tablet', 'Smartphone'];

  const updateField = (field: keyof AgentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof AgentFormData, item: string) => {
    const currentArray = formData[field] as string[];
    if (currentArray.includes(item)) {
      updateField(field, currentArray.filter(i => i !== item));
    } else {
      updateField(field, [...currentArray, item]);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to submit form');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone;
      case 2:
        return formData.country && formData.city;
      case 3:
        return formData.bio && formData.yearsOfExperience && formData.education;
      case 4:
        return formData.devices.length > 0 && formData.internetSpeed && formData.workingHours;
      case 5:
        return formData.platformsExperience.length > 0 && formData.specializations.length > 0;
      default:
        return true;
    }
  };

  const totalSteps = 5;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[...Array(totalSteps)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 ${i < currentStep - 1 ? 'mx-1' : i === currentStep - 1 ? 'mx-1' : 'mx-1'} rounded-full ${
                i < currentStep ? 'bg-black' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600 text-center">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-black mb-2">Basic Information</h2>
            <p className="text-gray-600">Tell us about yourself</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                className="input-field"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                className="input-field"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="input-field"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="input-field"
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>
      )}

      {/* Step 2: Location */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-black mb-2">Location</h2>
            <p className="text-gray-600">Where are you based?</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => updateField('country', e.target.value)}
              className="input-field"
              placeholder="United States"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => updateField('city', e.target.value)}
              className="input-field"
              placeholder="New York"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => updateField('timezone', e.target.value)}
              className="input-field"
            >
              <option value="">Select timezone</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Dubai">Dubai (GST)</option>
              <option value="Asia/Kolkata">India (IST)</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 3: Professional Background */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-black mb-2">Professional Background</h2>
            <p className="text-gray-600">Share your experience and qualifications</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Bio <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => updateField('bio', e.target.value)}
              className="input-field min-h-[120px]"
              placeholder="Tell us about yourself, your experience, and what makes you a great agent..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Years of Experience <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.yearsOfExperience}
              onChange={(e) => updateField('yearsOfExperience', e.target.value)}
              className="input-field"
            >
              <option value="">Select experience</option>
              <option value="0-1">Less than 1 year</option>
              <option value="1-2">1-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Education Level <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.education}
              onChange={(e) => updateField('education', e.target.value)}
              className="input-field"
            >
              <option value="">Select education</option>
              <option value="high-school">High School</option>
              <option value="associate">Associate Degree</option>
              <option value="bachelor">Bachelor's Degree</option>
              <option value="master">Master's Degree</option>
              <option value="phd">PhD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Languages Spoken
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {languages.map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleArrayItem('languagesSpoken', lang)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    formData.languagesSpoken.includes(lang)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-300 hover:border-black'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                LinkedIn Profile
              </label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => updateField('linkedin', e.target.value)}
                className="input-field"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => updateField('website', e.target.value)}
                className="input-field"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Technical Setup */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-black mb-2">Technical Setup</h2>
            <p className="text-gray-600">Tell us about your work environment</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Devices Available <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {deviceOptions.map(device => (
                <button
                  key={device}
                  type="button"
                  onClick={() => toggleArrayItem('devices', device)}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    formData.devices.includes(device)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-300 hover:border-black'
                  }`}
                >
                  {device}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Internet Speed <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.internetSpeed}
              onChange={(e) => updateField('internetSpeed', e.target.value)}
              className="input-field"
            >
              <option value="">Select speed</option>
              <option value="slow">Slow (1-10 Mbps)</option>
              <option value="medium">Medium (10-50 Mbps)</option>
              <option value="fast">Fast (50-100 Mbps)</option>
              <option value="very-fast">Very Fast (100+ Mbps)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Working Hours <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.workingHours}
              onChange={(e) => updateField('workingHours', e.target.value)}
              className="input-field"
            >
              <option value="">Select availability</option>
              <option value="full-time">Full-time (40+ hours/week)</option>
              <option value="part-time">Part-time (20-40 hours/week)</option>
              <option value="flexible">Flexible (Variable hours)</option>
              <option value="weekends">Weekends only</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 5: Platforms & Specializations */}
      {currentStep === 5 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-black mb-2">Expertise</h2>
            <p className="text-gray-600">What platforms and services do you specialize in?</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Platforms You Have Experience With <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {platforms.map(platform => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => toggleArrayItem('platformsExperience', platform)}
                  className={`px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all ${
                    formData.platformsExperience.includes(platform)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-300 hover:border-black'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Your Specializations <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {specializationOptions.map(spec => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleArrayItem('specializations', spec)}
                  className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    formData.specializations.includes(spec)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-300 hover:border-black'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold text-black mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-black mr-2 flex-shrink-0 mt-0.5" />
                <span>Your application will be reviewed by our admin team</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-black mr-2 flex-shrink-0 mt-0.5" />
                <span>You'll receive an email notification within 24-48 hours</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-black mr-2 flex-shrink-0 mt-0.5" />
                <span>Once approved, you can start accepting clients immediately</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className={`px-6 py-3 rounded-full font-medium transition-all ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-black border-2 border-black hover:bg-gray-50'
          }`}
        >
          Back
        </button>

        {currentStep < totalSteps ? (
          <button
            onClick={() => setCurrentStep(prev => prev + 1)}
            disabled={!canProceed()}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              canProceed()
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || loading}
            className={`px-8 py-3 rounded-full font-medium transition-all ${
              canProceed() && !loading
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        )}
      </div>
    </div>
  );
}
