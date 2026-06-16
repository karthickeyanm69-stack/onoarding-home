import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Signal, Wifi, Battery, Lock, Play, ArrowRight, ArrowLeft, 
  Sparkle, Terminal, ExternalLink, RefreshCw, CheckCircle, Database 
} from 'lucide-react';
import { OnboardingData, OnboardingStepId } from './types';
import { OnboardingIllustration } from './components/OnboardingIllustration';
import { OnboardingStepRenderer } from './components/OnboardingStepRenderer';
import { OnboardingFinalReview } from './components/OnboardingFinalReview';
import { SupabaseSettings } from './components/SupabaseSettings';

const initialData: OnboardingData = {
  fullName: '',
  preferredName: '',
  gender: '',
  ageGroup: '',
  country: '',
  state: '',
  city: '',
  educationLevel: '',
  occupation: '',
  languages: [],
  email: '',
  emailVerified: false,
  mobile: '',
  mobileVerified: false,
  profileImg: '',
  avatarType: 'preset',
  presetAvatarId: ''
};

export default function App() {
  // ==========================================
  // CLIENT STATE MANAGEMENT ORCHESTRATION
  // ==========================================
  const [data, setData] = useState<OnboardingData>(() => {
    try {
      const saved = localStorage.getItem('ewe_onboarding_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error recovering draft data:', e);
    }
    return initialData;
  });

  const [step, setStep] = useState<OnboardingStepId>(() => {
    try {
      const savedStep = localStorage.getItem('ewe_onboarding_step');
      if (savedStep) {
        const parsed = parseInt(savedStep, 10);
        if (parsed >= 1 && parsed <= 10) return parsed as OnboardingStepId;
      }
    } catch {}
    return 1;
  });

  const [completed, setCompleted] = useState<boolean>(() => {
    try {
      const savedCompleted = localStorage.getItem('ewe_onboarding_completed');
      return savedCompleted === 'true';
    } catch {}
    return false;
  });

  // Fast routing loop flag
  const [hasFastReviewPath, setHasFastReviewPath] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [copiedState, setCopiedState] = useState<boolean>(false);

  // Supabase states
  const [syncState, setSyncState] = useState<'syncing' | 'synced' | 'offline'>('offline');
  const [showSyncBadge, setShowSyncBadge] = useState<boolean>(true);
  const [reinitCounter, setReinitCounter] = useState<number>(0);
  const [showDbDrawer, setShowDbDrawer] = useState<boolean>(false);

  // ==========================================
  // SYNC ACTION WITH 1S DEBOUNCE
  // ==========================================
  useEffect(() => {
    // Write state locally immediately
    try {
      localStorage.setItem('ewe_onboarding_data', JSON.stringify(data));
      localStorage.setItem('ewe_onboarding_step', step.toString());
      localStorage.setItem('ewe_onboarding_completed', completed.toString());
    } catch (e) {
      console.error(e);
    }

    // Don't auto sync step 1 before launch
    if (step === 1 && !completed) {
      setSyncState('offline');
      return;
    }

    setSyncState('syncing');
    setShowSyncBadge(true);

    const timer = setTimeout(async () => {
      try {
        const { syncProfileToCloud } = await import('./supabase');
        const newId = await syncProfileToCloud(data, step, completed);
        if (newId) {
          setData(prev => {
            if (prev.id !== newId) {
              return { ...prev, id: newId };
            }
            return prev;
          });
        }
        setSyncState('synced');
        
        // Success ping timer
        const fadeTimer = setTimeout(() => {
          setShowSyncBadge(false);
        }, 3000);
        return () => clearTimeout(fadeTimer);
      } catch (err) {
        console.warn('Sync failed or offline mode:', err);
        setSyncState('offline');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    data.fullName, data.preferredName, data.gender, data.ageGroup, 
    data.country, data.state, data.city, data.educationLevel, 
    data.occupation, data.languages, data.email, data.emailVerified, 
    data.mobile, data.mobileVerified, data.profileImg, data.avatarType, 
    data.presetAvatarId, step, completed, reinitCounter
  ]);

  // Validate step requirements
  const validateStep = (currentStep: OnboardingStepId): boolean => {
    const currentErrors: string[] = [];

    if (currentStep === 2) {
      if (!data.fullName.trim()) {
        currentErrors.push('Full name is required.');
      }
      if (!data.gender) {
        currentErrors.push('Please choose a gender preference.');
      }
    } else if (currentStep === 3) {
      if (!data.ageGroup) {
        currentErrors.push('Please select your age staging category.');
      }
    } else if (currentStep === 5) {
      if (!data.educationLevel) {
        currentErrors.push('Please specify your current academic level.');
      }
    } else if (currentStep === 6) {
      if (!data.occupation) {
        currentErrors.push('Please select your primary industrial occupation.');
      }
    } else if (currentStep === 7) {
      if (data.languages.length === 0) {
        currentErrors.push('Please check at least one fluent language.');
      }
    } else if (currentStep === 8) {
      if (!data.emailVerified) {
        currentErrors.push('Valid email address (and automatic verification scan) is required.');
      }
      if (!data.mobileVerified) {
        currentErrors.push('Please enter mobile phone number and security PIN "1234".');
      }
    } else if (currentStep === 9) {
      if (!data.profileImg) {
        currentErrors.push('Please configure either a preset avatar, camera snapshot, or uploaded photo.');
      }
    }

    setErrors(currentErrors);
    return currentErrors.length === 0;
  };

  // ==========================================
  // NAVIGATION CLUSTERS
  // ==========================================
  const handleNext = () => {
    if (!validateStep(step)) return;

    // Clear previous errors
    setErrors([]);

    if (hasFastReviewPath) {
      // If user came via edit, jump right back to Review
      setStep(10);
      setHasFastReviewPath(false);
      return;
    }

    if (step < 10) {
      setStep((step + 1) as OnboardingStepId);
    } else {
      // Final confirmation
      setCompleted(true);
    }
  };

  const handleBack = () => {
    setErrors([]);
    if (step > 1) {
      setStep((step - 1) as OnboardingStepId);
    }
  };

  const handleSkip = () => {
    setErrors([]);
    // Step 4 allow skip
    if (step === 4) {
      setData(prev => ({ ...prev, country: '', state: '', city: '' }));
      if (hasFastReviewPath) {
        setStep(10);
        setHasFastReviewPath(false);
      } else {
        setStep(5);
      }
    }
  };

  const handleJumpToReview = () => {
    setErrors([]);
    setStep(10);
    setHasFastReviewPath(false);
  };

  const handleEditNav = (targetStep: OnboardingStepId) => {
    setHasFastReviewPath(true);
    setStep(targetStep);
  };

  const handleReset = () => {
    localStorage.removeItem('ewe_onboarding_data');
    localStorage.removeItem('ewe_onboarding_step');
    localStorage.removeItem('ewe_onboarding_completed');
    setData(initialData);
    setStep(1);
    setCompleted(false);
    setHasFastReviewPath(false);
    setErrors([]);
  };

  const copyJsonToClipboard = () => {
    const rawMeta = {
      instanceId: data.id || 'EVE-LOCAL-SANDBOX',
      fullName: data.fullName,
      preferredName: data.preferredName,
      gender: data.gender,
      demographics: {
         ageGroup: data.ageGroup,
         origin: {
            country: data.country || 'Not specified',
            state: data.state || 'Not specified',
            city: data.city || 'Not specified'
         }
      },
      archetypeProfile: {
         education: data.educationLevel,
         occupation: data.occupation,
         primaryLanguages: data.languages
      },
      verifiedCredentials: {
         emailAddress: data.email,
         mobilePhone: data.mobile,
         securityPassed: data.emailVerified && data.mobileVerified
      },
      metadata: {
         timestamp: new Date().toISOString(),
         originSystem: 'EVE Onboarding Platform v4'
      }
    };

    navigator.clipboard.writeText(JSON.stringify(rawMeta, null, 2));
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden">
      
      {/* BACKGROUND FLOATING ORNAMENTAL BLUR BLOBS */}
      <div className="absolute top-[-50px] left-[-100px] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-3xl animate-blob-left pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-3xl animate-blob-right pointer-events-none" />
      <div className="absolute top-[30%] left-[10%] w-[350px] h-[350px] bg-purple-100/50 rounded-full blur-3xl animate-blob-center pointer-events-none" />

      {/* CORE WORKSPACE INNER CONTENT */}
      <div className="relative z-20 flex justify-center py-2">
        
        <div className="w-full max-w-[360px] h-[730px] relative pointer-events-auto">
          
          {/* REALISTIC PHONE SHELL DECORATORS */}
          <div className="absolute inset-0 bg-slate-950 rounded-[44px] -m-[10px] shadow-2xl border-4 border-slate-800/20 pointer-events-none" />
          
          {/* CORE DEVICE FRAME */}
          <div className="w-full h-full bg-white rounded-[40px] border-[8px] border-slate-950 flex flex-col justify-between overflow-hidden relative shadow-inner">
            
            {/* TOP SPEAKER NOTCH AREA */}
            <div className="absolute top-0 inset-x-0 flex justify-center z-50 pointer-events-none select-none">
              <div className="w-28 h-4 bg-slate-950 rounded-b-xl flex items-center justify-center relative">
                {/* Speaker Slot */}
                <div className="w-8 h-1 bg-slate-800 rounded-full" />
                {/* Small Camera Dot */}
                <div className="w-1.5 h-1.5 bg-slate-900 rounded-full absolute right-5" />
              </div>
            </div>

            {/* PHONE HEADER: STATUS BAR */}
            <div className="h-10 pt-4 px-6 flex items-center justify-between z-40 bg-white/90 backdrop-blur-sm border-b border-slate-50 select-none text-slate-950">
              <span className="text-xs font-bold font-sans tracking-tight">11:30</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowDbDrawer(true)} 
                  className="p-1 -m-1 hover:bg-slate-100 rounded-full transition-colors pointer-events-auto cursor-pointer"
                  title="Database Settings"
                >
                  <Database className="w-3 h-3 text-indigo-600 hover:text-indigo-800" />
                </button>
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4" />
              </div>
            </div>

            {/* PRIMARY PHONE INTERACTIVE BODY */}
            <div className="flex-1 overflow-x-hidden overflow-y-auto px-5 py-4 custom-scrollbar bg-white flex flex-col">
              
              {completed ? (
                // Success Completion Module
                <OnboardingFinalReview
                  data={data}
                  onNavigateToStep={handleEditNav}
                  isCompleted={true}
                  onReset={handleReset}
                  onCopyJson={copyJsonToClipboard}
                  copiedState={copiedState}
                />
              ) : (
                <div className="flex-1 flex flex-col">
                  
                  {/* Welcome Screen (Step 1) */}
                  {step === 1 && (
                    <div className="flex-1 flex flex-col justify-between text-center py-2 animate-fadeIn">
                      <div className="space-y-4">
                        <OnboardingIllustration type="welcome" />
                        <div className="space-y-1.5">
                          <h2 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
                            Welcome to EVE
                          </h2>
                          <p className="text-xs text-slate-500 leading-normal max-w-[260px] mx-auto">
                            Experience premium interactive onboarding that gathers your demographics, career profile, and verification keys efficiently.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3.5 mt-6">
                        <button
                          type="button"
                          onClick={handleNext}
                          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs tracking-wide uppercase transition-colors shadow-md flex items-center justify-center gap-1.5 group cursor-pointer"
                        >
                          Get Started
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </button>

                        <div className="text-[10px] text-slate-400 font-mono tracking-wide flex items-center justify-center gap-1 flex-wrap">
                          <Lock className="w-3 h-3 text-emerald-500" />
                          Data auto-saves locally instantly
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step-by-Step Forms (Steps 2 to 9) */}
                  {step >= 2 && step <= 9 && (
                    <div className="flex-1 flex flex-col justify-between animate-fadeIn">
                      
                      {/* Step Label Header */}
                      <div className="mb-4 text-left select-none">
                        <span className="text-[9px] font-mono tracking-widest text-indigo-600 font-bold uppercase block">
                          Platform Step {step} of 10
                        </span>
                        <h3 className="text-lg font-bold font-display text-slate-950 tracking-tight leading-snug">
                          {step === 2 && 'Personal Attributes'}
                          {step === 3 && 'Demographics Sage'}
                          {step === 4 && 'Geographical Location'}
                          {step === 5 && 'Academic Qualification'}
                          {step === 6 && 'Career & Occupation'}
                          {step === 7 && 'Fluency Languages'}
                          {step === 8 && 'Security Verification'}
                          {step === 9 && 'Design Avatar'}
                        </h3>
                      </div>

                      {/* Core Form Area */}
                      <div className="flex-1 py-1">
                        <OnboardingStepRenderer
                          stepId={step}
                          data={data}
                          updateData={(updates) => setData(p => ({ ...p, ...updates }))}
                          setErrors={setErrors}
                        />

                        {/* Errors Display block */}
                        {errors.length > 0 && (
                          <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-2.5 text-left animate-fadeIn">
                            {errors.map((err, i) => (
                              <p key={i} className="text-[11px] text-red-600 font-medium">
                                {err}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* Final Review (Step 10) */}
                  {step === 10 && (
                    <div className="flex-1 flex flex-col justify-between animate-fadeIn">
                      <div className="text-left mb-3">
                        <span className="text-[9px] font-mono tracking-widest text-indigo-600 font-bold uppercase block">
                          Platform Step 10 of 10
                        </span>
                        <h3 className="text-lg font-bold font-display text-slate-950 tracking-tight leading-snug">
                          Final Review Setup
                        </h3>
                      </div>

                      <OnboardingFinalReview
                        data={data}
                        onNavigateToStep={handleEditNav}
                        isCompleted={false}
                        onReset={handleReset}
                        onCopyJson={copyJsonToClipboard}
                        copiedState={copiedState}
                      />
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* NAVIGATION FOOTER (Steps 2 to 10) */}
            {!completed && step >= 2 && (
              <div className="bg-slate-50 border-t border-slate-100 px-4 py-3 flex flex-col gap-2 relative z-30 select-none">
                
                {/* Back path loops to return to review */}
                {hasFastReviewPath && (
                  <button
                    type="button"
                    onClick={handleJumpToReview}
                    className="text-[10px] text-indigo-600 hover:underline font-bold text-center block mb-1 cursor-pointer"
                  >
                    Return to Final Review (Step 10)
                  </button>
                )}

                <div className="flex items-center justify-between gap-2">
                  
                  {/* LEFT BUTTON: BACK or SKIP */}
                  {step === 4 ? (
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="py-1.5 px-3 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      Skip
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="py-1.5 px-3 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>
                  )}

                  {/* CENTERING DOCK CAPSULES */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 10 }).map((_, idx) => {
                      const stepNum = idx + 1;
                      const isActive = step === stepNum;
                      return (
                        <div
                          key={stepNum}
                          onClick={() => {
                            // Enable jump navigation on already completed/reveified
                            if (stepNum < step || step === 10) {
                              setStep(stepNum as OnboardingStepId);
                            }
                          }}
                          className={`h-1.5 rounded-full cursor-pointer transition-all ${
                            isActive
                              ? 'w-4.5 bg-blue-600'
                              : stepNum < step
                              ? 'w-1.5 bg-blue-400'
                              : 'w-1.5 bg-slate-300'
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* RIGHT BUTTON: NEXT */}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="py-1.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs tracking-wider uppercase flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {step === 10 ? 'Publish' : 'Next'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                </div>
              </div>
            )}

            {/* INTEGRATED LIVE SYNC NOTIFICATION DOT */}
            {showSyncBadge && (
              <div 
                onClick={() => setShowDbDrawer(true)}
                className="absolute bottom-11 right-3 py-1 px-2.5 bg-slate-900/90 hover:bg-slate-800 text-white text-[9px] font-mono rounded-full flex items-center gap-1.5 shadow backdrop-blur-md transition-all duration-300 z-50 pointer-events-auto cursor-pointer"
              >
                {syncState === 'syncing' && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                    <span>Syncing with cloud...</span>
                  </>
                )}
                {syncState === 'synced' && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Cloud Sync Active</span>
                  </>
                )}
                {syncState === 'offline' && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Saved Locally (Offline)</span>
                  </>
                )}
              </div>
            )}

            {/* Bottom Sheet Drawer for Database Settings */}
            <AnimatePresence>
              {showDbDrawer && (
                <>
                  {/* Backdrop overlay */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowDbDrawer(false)}
                    className="absolute inset-0 bg-slate-950/60 z-40 pointer-events-auto cursor-pointer"
                  />
                  {/* Drawer container */}
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl z-50 p-4 pointer-events-auto overflow-y-auto max-h-[85%] custom-scrollbar flex flex-col"
                  >
                    {/* Drag handle */}
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3 shrink-0" />
                    
                    <div className="flex items-center justify-between mb-2 shrink-0">
                      <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 font-display">
                        <Database className="w-3.5 h-3.5 text-indigo-600" />
                        Database Connection
                      </h3>
                      <button 
                        onClick={() => setShowDbDrawer(false)}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        Close
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5">
                      <SupabaseSettings 
                        syncState={syncState} 
                        onCredentialsChange={() => setReinitCounter(c => c + 1)}
                        onClose={() => setShowDbDrawer(false)}
                        isMobileDrawer={true}
                      />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

          </div>
        </div>

      </div>

    </div>
  );
}
