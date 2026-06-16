import React, { useState, useEffect, useRef } from 'react';
import { 
  User, GraduationCap, Code, Palette, Briefcase, Laptop, 
  Search, Sparkles, Check, Mail, Phone, Upload, Camera, 
  Trash2, ChevronDown, MapPin, Eye, Shield, CheckCircle2, 
  Video, VideoOff, RefreshCw, X
} from 'lucide-react';
import { OnboardingData, OnboardingStepId } from '../types';
import { locationData } from '../geoData';

interface StepRendererProps {
  stepId: OnboardingStepId;
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  setErrors: (errors: string[]) => void;
}

export const OnboardingStepRenderer: React.FC<StepRendererProps> = ({
  stepId,
  data,
  updateData,
  setErrors
}) => {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  // Custom Location dropdown open states
  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Email auto-verify simulation state
  const [emailTypingTimer, setEmailTypingTimer] = useState<NodeJS.Timeout | null>(null);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  // Phone SMS OTP state
  const [showOtpDrawer, setShowOtpDrawer] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [smsSending, setSmsSending] = useState(false);

  // Camera stream states
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Preset emojis for Step 9 profile canvas
  const presets = [
    { id: '1', emoji: '👩‍💻', colors: ['#f472b6', '#6366f1'] }, // Pink to Indigo
    { id: '2', emoji: '🧑‍🚀', colors: ['#22d3ee', '#2563eb'] }, // Cyan to Blue
    { id: '3', emoji: '🦊', colors: ['#fb923c', '#db2777'] }, // Orange to Pink
    { id: '4', emoji: '🦉', colors: ['#a78bfa', '#4f46e5'] }, // Violet to Indigo
    { id: '5', emoji: '🎨', colors: ['#34d399', '#0d9488'] }, // Emerald to Teal
    { id: '6', emoji: '🦁', colors: ['#facc15', '#ea580c'] }, // Yellow to Orange
    { id: '7', emoji: '🐼', colors: ['#e2e8f0', '#475569'] }  // Slate to Dark Slate
  ];

  // Helper references for click-outside close
  const countryRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (stateRef.current && !stateRef.current.contains(event.target as Node)) {
        setShowStateDropdown(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==========================================
  // STEP 2: PERSONAL INFO LOGIC
  // ==========================================
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const firstWord = val.trim().split(' ')[0] || '';
    
    // Auto populate preferred name to first name if it hasn't been touched or is empty
    const shouldUpdatePreferredName = !data.preferredName || data.preferredName === (data.fullName.trim().split(' ')[0] || '');
    
    updateData({
      fullName: val,
      ...(shouldUpdatePreferredName && { preferredName: firstWord })
    });
  };

  // ==========================================
  // STEP 4: GEOGRAPHICAL DROPDOWNS
  // ==========================================
  const selectedCountryObj = locationData.find(c => c.name === data.country);
  const availableStates = selectedCountryObj ? selectedCountryObj.states : [];
  const selectedStateObj = availableStates.find(s => s.name === data.state);
  const availableCities = selectedStateObj ? selectedStateObj.cities : [];

  const filteredCountries = locationData.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );
  const filteredStates = availableStates.filter(s => 
    s.name.toLowerCase().includes(stateSearch.toLowerCase())
  );
  const filteredCities = availableCities.filter(c => 
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  // ==========================================
  // STEP 8: SECURITIES & SIMULATED OTP
  // ==========================================
  // Auto integrity check on email
  useEffect(() => {
    if (stepId !== 8) return;

    if (emailTypingTimer) {
      clearTimeout(emailTypingTimer);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && emailRegex.test(data.email)) {
      setIsVerifyingEmail(true);
      updateData({ emailVerified: false }); // Reset verification until timeout

      const timer = setTimeout(() => {
        setIsVerifyingEmail(false);
        updateData({ emailVerified: true });
      }, 1500);

      setEmailTypingTimer(timer);
    } else {
      updateData({ emailVerified: false });
      setIsVerifyingEmail(false);
    }

    return () => {
      if (emailTypingTimer) clearTimeout(emailTypingTimer);
    };
  }, [data.email, stepId]);

  const isValidPhone = (phone: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    return clean.length >= 10;
  };

  const handleSendSms = () => {
    if (!isValidPhone(data.mobile)) return;
    setSmsSending(true);
    setTimeout(() => {
      setSmsSending(false);
      setShowOtpDrawer(true);
      setOtpCode('');
      setOtpError('');
    }, 1000);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setOtpCode(val);
    
    if (val === '1234') {
      updateData({ mobileVerified: true });
      setTimeout(() => {
        setShowOtpDrawer(false);
      }, 1000);
    } else if (val.length === 4) {
      setOtpError('Invalid code. Please use hint code: 1234');
    } else {
      setOtpError('');
    }
  };

  // ==========================================
  // STEP 9: PROFILE AVATAR DYNAMICS
  // ==========================================
  // Canvas presets generator
  const drawPresetAvatar = (emoji: string, gradientColors: string[], presetId: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background gradient
    const grad = ctx.createLinearGradient(0, 0, 300, 300);
    grad.addColorStop(0, gradientColors[0]);
    grad.addColorStop(1, gradientColors[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 300, 300);

    // Draw border circles or grid patterns
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.arc(150, 150, 120, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Emoji
    ctx.font = '130px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 150, 150);

    // Save
    const base64 = canvas.toDataURL('image/png');
    updateData({
      profileImg: base64,
      avatarType: 'preset',
      presetAvatarId: presetId
    });
  };

  // Handle local File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const base64 = loadEvent.target?.result as string;
      updateData({
        profileImg: base64,
        avatarType: 'upload',
        presetAvatarId: ''
      });
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const base64 = loadEvent.target?.result as string;
        updateData({
          profileImg: base64,
          avatarType: 'upload',
          presetAvatarId: ''
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Camera Capture Modules
  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 300, facingMode: 'user' },
        audio: false
      });
      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera capture access blocked:', err);
      setCameraError('Permission denied. Please configure permissions or use Presets/Uploads.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setCameraStream(null);
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw mirror imaged for standard front-facing look
    ctx.translate(300, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0, 300, 300);

    const base64 = canvas.toDataURL('image/png');
    updateData({
      profileImg: base64,
      avatarType: 'camera',
      presetAvatarId: ''
    });
    stopCamera();
  };

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);


  // ==========================================
  // CONDITIONAL STEP SECTIONS
  // ==========================================
  
  // Step 2: Personal Info (Required Validations)
  if (stepId === 2) {
    return (
      <div className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="full-name-field">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              id="full-name-field"
              type="text"
              placeholder="e.g. Karthick Ryan"
              value={data.fullName}
              onChange={handleFullNameChange}
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="preferred-name-field">
            Preferred Name <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            id="preferred-name-field"
            type="text"
            placeholder="e.g. Karthick"
            value={data.preferredName}
            onChange={(e) => updateData({ preferredName: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            If left blank, EVE will address you as <strong>"{data.preferredName || 'Guest'}"</strong>
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Gender Preference <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2" id="gender-selection-grid">
            {[
              { id: 'male', label: 'Male', symbol: '♂', color: 'from-blue-50 to-blue-100/50 text-blue-700' },
              { id: 'female', label: 'Female', symbol: '♀', color: 'from-pink-50 to-pink-100/50 text-pink-700' },
              { id: 'non-binary', label: 'Non-Binary', symbol: '◈', color: 'from-purple-50 to-purple-100/50 text-purple-700' },
              { id: 'prefer-not-to-say', label: 'Skip Label', symbol: '•••', color: 'from-slate-50 to-slate-100/50 text-slate-700' }
            ].map((genderOption) => {
              const isSelected = data.gender === genderOption.id;
              return (
                <button
                  key={genderOption.id}
                  type="button"
                  onClick={() => updateData({ gender: genderOption.id as any })}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl font-bold mb-1">{genderOption.symbol}</span>
                  <span className="text-xs font-medium text-slate-800">{genderOption.label}</span>
                  {isSelected && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-indigo-600 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Age Category
  if (stepId === 3) {
    const ageOptions = [
      { id: 'under-13', age: 'Under 13', desc: 'Junior Explorer' },
      { id: '13-17', age: '13–17', desc: 'Sovereign Scholar' },
      { id: '18-24', age: '18–24', desc: 'Striving Academic' },
      { id: '25-34', age: '25–34', desc: 'Working Innovator' },
      { id: '35-44', age: '35–44', desc: 'Strategic Leader' },
      { id: '45+', age: '45+', desc: 'Wise Mentor' }
    ];

    return (
      <div className="space-y-3.5 text-left">
        <div>
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Select Your Age Stage <span className="text-red-500">*</span>
          </h4>
          <div className="grid grid-cols-2 gap-2.5" id="age-selector-grid">
            {ageOptions.map((opt) => {
              const isSelected = data.ageGroup === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateData({ ageGroup: opt.id as any })}
                  className={`p-3 text-left rounded-xl border transition-all relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/30 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="font-semibold text-sm text-slate-800">{opt.age}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-display">{opt.desc}</div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Location Detail
  if (stepId === 4) {
    return (
      <div className="space-y-4 text-left">
        <p className="text-xs text-slate-500 leading-relaxed bg-blue-50/60 p-2.5 rounded-xl border border-blue-100/50 flex gap-2">
          <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
          Specify your local territory details. Use the query box inside each dropdown to filter.
        </p>

        {/* COUNTRY SELECT */}
        <div ref={countryRef} className="relative">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Country / Region <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => {
              setShowCountryDropdown(!showCountryDropdown);
              setShowStateDropdown(false);
              setShowCityDropdown(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none text-slate-700 hover:bg-slate-100/50"
          >
            <span className="flex items-center gap-2">
              {selectedCountryObj ? (
                <>
                  <span className="text-base">{selectedCountryObj.flag}</span>
                  <span className="font-medium text-slate-800">{selectedCountryObj.name}</span>
                </>
              ) : (
                'Select Country'
              )}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showCountryDropdown && (
            <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl p-2 max-h-48 overflow-y-auto custom-scrollbar">
              <input
                type="text"
                placeholder="Search country..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 mb-2"
              />
              <div className="space-y-0.5">
                {filteredCountries.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      updateData({ country: c.name, state: '', city: '' });
                      setShowCountryDropdown(false);
                      setCountrySearch('');
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span>{c.flag}</span>
                    <span className="font-medium text-slate-700">{c.name}</span>
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <div className="text-center py-3 text-xs text-slate-400">No country found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* STATE SELECT */}
        <div ref={stateRef} className="relative">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Province / State <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            disabled={!data.country}
            onClick={() => {
              if (!data.country) return;
              setShowStateDropdown(!showStateDropdown);
              setShowCountryDropdown(false);
              setShowCityDropdown(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none disabled:opacity-50 text-slate-700 hover:bg-slate-100/50"
          >
            <span className="font-medium text-slate-800">
              {data.state || (data.country ? 'Select State' : 'Choose Country First')}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showStateDropdown && data.country && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl p-2 max-h-48 overflow-y-auto custom-scrollbar">
              <input
                type="text"
                placeholder="Search state..."
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 mb-2"
              />
              <div className="space-y-0.5">
                {filteredStates.map((s) => (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => {
                      updateData({ state: s.name, city: '' });
                      setShowStateDropdown(false);
                      setStateSearch('');
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-50"
                  >
                    <span className="font-medium text-slate-700">{s.name}</span>
                  </button>
                ))}
                {filteredStates.length === 0 && (
                  <div className="text-center py-3 text-xs text-slate-400">No states found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CITY SELECT */}
        <div ref={cityRef} className="relative">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            disabled={!data.state}
            onClick={() => {
              if (!data.state) return;
              setShowCityDropdown(!showCityDropdown);
              setShowCountryDropdown(false);
              setShowStateDropdown(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none disabled:opacity-50 text-slate-700 hover:bg-slate-100/50"
          >
            <span className="font-medium text-slate-800">
              {data.city || (data.state ? 'Select City' : 'Choose State First')}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showCityDropdown && data.state && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl p-2 max-h-48 overflow-y-auto custom-scrollbar">
              <input
                type="text"
                placeholder="Search city..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 mb-2"
              />
              <div className="space-y-0.5">
                {filteredCities.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      updateData({ city: c });
                      setShowCityDropdown(false);
                      setCitySearch('');
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-50"
                  >
                    <span className="font-medium text-slate-700">{c}</span>
                  </button>
                ))}
                {filteredCities.length === 0 && (
                  <div className="text-center py-3 text-xs text-slate-400">No cities found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 5: Academic Level
  if (stepId === 5) {
    const educationOptions = [
      { id: 'school', title: 'School Student', icon: '🎒' },
      { id: 'higher-secondary', title: 'Higher Secondary', icon: '📝' },
      { id: 'diploma', title: 'Diploma Holder', icon: '📜' },
      { id: 'undergraduate', title: 'Undergraduate', icon: '🎓' },
      { id: 'postgraduate', title: 'Postgraduate Study', icon: '🧬' },
      { id: 'professional', title: 'Working Professional', icon: '💼' },
      { id: 'other', title: 'Other Domain', icon: '⚜️' }
    ];

    return (
      <div className="space-y-2 text-left max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
        <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Highest Academic Qualification <span className="text-red-500">*</span>
        </span>
        {educationOptions.map((opt) => {
          const isSelected = data.educationLevel === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => updateData({ educationLevel: opt.id as any })}
              className={`w-full p-3 text-left rounded-xl border flex items-center justify-between transition-all relative ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/30'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{opt.icon}</span>
                <span className="text-xs font-semibold text-slate-800">{opt.title}</span>
              </div>
              {isSelected && (
                <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Step 6: Occupation Profile
  if (stepId === 6) {
    const occupations = [
      { id: 'student', title: 'Student', icon: <GraduationCap className="w-5 h-5" /> },
      { id: 'developer', title: 'Software Developer', icon: <Code className="w-5 h-5" /> },
      { id: 'designer', title: 'UI/UX Designer', icon: <Palette className="w-5 h-5" /> },
      { id: 'teacher', title: 'Professional Teacher', icon: <Briefcase className="w-5 h-5 animate-pulse" /> },
      { id: 'business-owner', title: 'Business Owner', icon: <Briefcase className="w-5 h-5 text-indigo-500" /> },
      { id: 'freelancer', title: 'Freelancer', icon: <Laptop className="w-5 h-5" /> },
      { id: 'job-seeker', title: 'Active Job Seeker', icon: <Search className="w-5 h-5" /> },
      { id: 'other', title: 'Other Mission', icon: <Sparkles className="w-5 h-5 text-amber-500" /> }
    ];

    return (
      <div className="space-y-3.5 text-left">
        <div>
          <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Select Your Primary Occupation <span className="text-red-500">*</span>
          </span>
          <div className="grid grid-cols-2 gap-2" id="occupation-selection-grid">
            {occupations.map((opt) => {
              const isSelected = data.occupation === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateData({ occupation: opt.id as any })}
                  className={`p-3 text-left rounded-xl border flex flex-col gap-2 transition-all relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg w-fit ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                    {opt.icon}
                  </div>
                  <div className="text-xs font-semibold text-slate-800 leading-tight">{opt.title}</div>
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Step 7: Fluent Languages (Required Validation - Min 1 Choice)
  if (stepId === 7) {
    const languageOptions = [
      { code: 'English', native: 'English', flag: '🇺🇸', meta: 'Global standard' },
      { code: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', meta: 'Classical language' },
      { code: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', meta: 'Northern standard' },
      { code: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', meta: 'Southern regional' },
      { code: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳', meta: 'Coastal regional' },
      { code: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', meta: 'Tech-hub regional' }
    ];

    const toggleLanguage = (code: string) => {
      const current = [...data.languages];
      if (current.includes(code)) {
        updateData({ languages: current.filter(l => l !== code) });
      } else {
        updateData({ languages: [...current, code] });
      }
    };

    return (
      <div className="space-y-3 text-left">
        <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Languages Fluent In <span className="text-red-500">*</span>
        </span>
        <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5">
          Choose all languages you read and write fluently. Minimum 1 required.
        </p>

        <div className="space-y-1.5 max-h-[290px] overflow-y-auto custom-scrollbar" id="languages-checkbox-list">
          {languageOptions.map((opt) => {
            const isChecked = data.languages.includes(opt.code);
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => toggleLanguage(opt.code)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                  isChecked
                    ? 'border-indigo-600 bg-indigo-50/40'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{opt.flag}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{opt.native}</div>
                    <div className="text-[10px] text-slate-500 font-display">{opt.meta}</div>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                }`}>
                  {isChecked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Step 8: Secure Verification
  if (stepId === 8) {
    return (
      <div className="space-y-4 text-left">
        {/* EMAIL BLOCK */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="email-verification-input">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              id="email-verification-input"
              type="email"
              placeholder="name@domain.com"
              value={data.email}
              onChange={(e) => updateData({ email: e.target.value })}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
              {isVerifyingEmail && (
                <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
              )}
              {!isVerifyingEmail && data.emailVerified && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
              )}
            </div>
          </div>
          {isVerifyingEmail && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-indigo-600">
              <span className="w-22 h-1 bg-slate-200 rounded-full overflow-hidden block">
                <span className="h-full bg-indigo-600 block animate-[pulse_1s_infinite]" style={{ width: '60%' }} />
              </span>
              <span>Scanning domain...</span>
            </div>
          )}
          {!isVerifyingEmail && data.emailVerified && (
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Active verification complete. Domain safe.
            </p>
          )}
          {!data.emailVerified && !isVerifyingEmail && data.email && (
            <p className="text-[10px] text-slate-400 mt-1">
              Provide valid format to trigger instant auto-verify step.
            </p>
          )}
        </div>

        {/* MOBILE BLOCK */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="phone-verification-input">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <div className="relative flex gap-1.5">
            <div className="relative flex-1">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                id="phone-verification-input"
                type="tel"
                placeholder="+1 (555) 019-2834"
                value={data.mobile}
                onChange={(e) => updateData({ mobile: e.target.value, mobileVerified: false })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              type="button"
              disabled={!isValidPhone(data.mobile) || smsSending || data.mobileVerified}
              onClick={handleSendSms}
              className="px-3 py-2.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {smsSending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : data.mobileVerified ? (
                'Verified'
              ) : (
                'Send Verification SMS'
              )}
            </button>
          </div>
          {data.mobileVerified && (
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Mobile Verified (OTP Verified).
            </p>
          )}
        </div>

        {/* INLINE OTP CODE DRAWER */}
        {showOtpDrawer && (
          <div className="bg-indigo-50/70 border border-indigo-200/60 rounded-xl p-3.5 space-y-2 animate-fadeIn" id="otp-otp-drawer">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-900 tracking-wide">Enter 4-Digit Security PIN</span>
              <button onClick={() => setShowOtpDrawer(false)} className="text-indigo-400 hover:text-indigo-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={4}
                value={otpCode}
                placeholder="••••"
                onChange={handleOtpChange}
                className="w-24 text-center tracking-widest text-lg font-bold font-mono px-3 py-1 bg-white border border-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded-lg text-indigo-950"
              />
              <span className="text-xs text-indigo-700">
                Hint: Use code <strong>1234</strong>
              </span>
            </div>

            {otpError && (
              <p className="text-[10px] text-red-600 font-medium">{otpError}</p>
            )}
            
            {data.mobileVerified && (
              <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                SMS Security Passed! Drawer closing.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Step 9: Profile Avatar
  if (stepId === 9) {
    return (
      <div className="space-y-4 text-left">
        <div>
          <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Configure Your Avatar <span className="text-red-500">*</span>
          </span>

          {/* AVATAR SELECT METHOD TAB HEADER */}
          <div className="flex border-b border-slate-200 bg-slate-50 p-1 rounded-xl mb-3.5" id="avatar-mode-tabs">
            {[
              { id: 'preset', label: 'Presets' },
              { id: 'upload', label: 'File Upload' },
              { id: 'camera', label: 'Live Camera' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  updateData({ avatarType: tab.id as any });
                  if (tab.id !== 'camera') stopCamera();
                }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg text-center transition-all ${
                  data.avatarType === tab.id
                    ? 'bg-white text-indigo-950 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* PRESETS ENGINE */}
          {data.avatarType === 'preset' && (
            <div className="space-y-3 animate-fadeIn">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Click any layout below. We'll render a high-contrast gradient canvas instantly.
              </p>
              <div className="grid grid-cols-4 gap-2.5" id="avatars-preset-grid">
                {presets.map((p) => {
                  const isSelected = data.presetAvatarId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => drawPresetAvatar(p.emoji, p.colors, p.id)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 relative ${
                        isSelected ? 'ring-2 ring-indigo-600 ring-offset-2' : ''
                      }`}
                      style={{ background: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[1]})` }}
                    >
                      <span className="text-xl select-none">{p.emoji}</span>
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-indigo-600 rounded-full border border-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* FILE UPLOAD */}
          {data.avatarType === 'upload' && (
            <div className="space-y-3 animate-fadeIn">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500/80 bg-slate-50/50 rounded-2xl p-5 text-center transition-all cursor-pointer relative"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <span className="block text-xs font-semibold text-slate-700">Drag & Drop Image Here</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Or tap to choose from gallery</span>
              </div>
            </div>
          )}

          {/* CAMERA FEED */}
          {data.avatarType === 'camera' && (
            <div className="space-y-3 animate-fadeIn">
              {!cameraActive ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full p-4 border border-dashed border-indigo-300 hover:border-indigo-500 rounded-2xl flex flex-col items-center justify-center bg-indigo-50/40 text-indigo-700 gap-1 inline-flex cursor-pointer"
                >
                  <Camera className="w-7 h-7" />
                  <span className="text-xs font-semibold">Initialize Lens Platform</span>
                  <span className="text-[10px] text-indigo-500">Enable webcam capture</span>
                </button>
              ) : (
                <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-square max-w-[200px] mx-auto border-2 border-slate-950">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover -scale-x-100"
                  />
                  <div className="absolute bottom-2 inset-x-0 flex justify-center gap-2 px-2">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-2.5 py-1 text-[10px] font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="w-3 h-3" />
                      Shutter
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-2.5 py-1 text-[10px] font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700 shadow flex items-center gap-1 cursor-pointer"
                    >
                      <VideoOff className="w-3 h-3" />
                      Stop
                    </button>
                  </div>
                </div>
              )}
              {cameraError && (
                <p className="text-[10px] text-rose-600 font-semibold leading-normal">{cameraError}</p>
              )}
            </div>
          )}

          {/* GENERATED AVATAR DISPLAY */}
          {data.profileImg && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3 bg-indigo-50/30 p-2.5 rounded-xl border border-indigo-100/50">
              <img
                src={data.profileImg}
                alt="Onboard Avatar"
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full object-cover bg-white ring-2 ring-indigo-500/20"
              />
              <div>
                <span className="block text-xs font-bold text-slate-800">Active Avatar Ready</span>
                <button
                  type="button"
                  onClick={() => updateData({ profileImg: '', presetAvatarId: '' })}
                  className="text-[10px] text-rose-500 hover:underline font-bold flex items-center gap-1 mt-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                  Discard and Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
