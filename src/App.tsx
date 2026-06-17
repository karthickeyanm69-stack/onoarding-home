import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Signal, Wifi, Battery, Lock, Play, ArrowRight, ArrowLeft, 
  Sparkle, Terminal, ExternalLink, RefreshCw, CheckCircle, Database, Shield,
  Monitor, Tablet, Smartphone, AlertCircle
} from 'lucide-react';
import { OnboardingData, OnboardingStepId } from './types';
import { OnboardingIllustration } from './components/OnboardingIllustration';
import { OnboardingStepRenderer } from './components/OnboardingStepRenderer';
import { OnboardingFinalReview } from './components/OnboardingFinalReview';
import { SupabaseSettings } from './components/SupabaseSettings';
import { AdminDashboard } from './components/AdminDashboard';

const initialData: OnboardingData = {
  fullName: '',
  preferredName: '',
  gender: '',
  educationLevel: '',
  fieldOfStudy: '',
  institution: '',
  parentName: '',
  parentEmail: '',
  parentPhone: '',
  parentRelationship: '',
  learningGoals: [],
  interests: [],
  learningPreference: '',
  dailyCommitment: '',
  aiAdaptiveDifficulty: true,
  aiStudyReminders: true,
  aiCareerInsights: false,
  aiConceptExplainer: true,
  notifyEmailDigest: true,
  notifyPush: true,
  notifyWeeklyAchievements: true
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
  const [currentRoute, setCurrentRoute] = useState<string>(window.location.pathname);
  const [deviceMode, setDeviceMode] = useState<'pc' | 'tablet' | 'mobile'>('mobile');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ADMIN_PASSWORD = (import.meta as any).env?.VITE_ADMIN_PASSWORD || 'admin123';
    
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setLoginError('');
      setPasswordInput('');
    } else {
      setLoginError('Invalid administrator credentials.');
      setPasswordInput('');
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const newRoute = window.location.pathname;
      setCurrentRoute(newRoute);
      if (newRoute !== '/admin' && newRoute !== '/admine') {
        setIsAdminAuthenticated(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentRoute(path);
    if (path !== '/admin' && path !== '/admine') {
      setIsAdminAuthenticated(false);
    }
  };

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
    data.fullName, data.preferredName, data.gender, data.educationLevel,
    data.fieldOfStudy, data.institution, data.parentName, data.parentEmail,
    data.parentPhone, data.parentRelationship, data.learningGoals, data.interests,
    data.learningPreference, data.dailyCommitment, data.aiAdaptiveDifficulty,
    data.aiStudyReminders, data.aiCareerInsights, data.aiConceptExplainer,
    data.notifyEmailDigest, data.notifyPush, data.notifyWeeklyAchievements,
    step, completed, reinitCounter
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
      if (!data.educationLevel) {
        currentErrors.push('Highest education level is required.');
      }
      if (!data.fieldOfStudy.trim()) {
        currentErrors.push('Field of study is required.');
      }
      if (!data.institution.trim()) {
        currentErrors.push('Institution / School is required.');
      }
    } else if (currentStep === 4) {
      const isSkipped = data.parentName === 'SKIPPED';
      if (!isSkipped) {
        if (!data.parentName.trim()) {
          currentErrors.push('Parent name is required.');
        }
        if (!data.parentEmail.trim()) {
          currentErrors.push('Parent email is required.');
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(data.parentEmail)) {
            currentErrors.push('Valid parent email is required.');
          }
        }
        if (!data.parentPhone.trim()) {
          currentErrors.push('Parent phone number is required.');
        }
        if (!data.parentRelationship) {
          currentErrors.push('Parent relationship indicator is required.');
        }
      }
    } else if (currentStep === 5) {
      if (!data.learningGoals || data.learningGoals.length === 0) {
        currentErrors.push('Please select at least one learning goal.');
      }
    } else if (currentStep === 6) {
      if (!data.interests || data.interests.length === 0) {
        currentErrors.push('Please select at least one subject area.');
      }
    } else if (currentStep === 7) {
      if (!data.learningPreference) {
        currentErrors.push('Please select a learning preference.');
      }
    } else if (currentStep === 8) {
      if (!data.dailyCommitment) {
        currentErrors.push('Please select a daily commitment target.');
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
      academicProfile: {
         educationLevel: data.educationLevel,
         fieldOfStudy: data.fieldOfStudy,
         institution: data.institution
      },
      parentProfile: {
         name: data.parentName,
         email: data.parentEmail,
         phone: data.parentPhone,
         relationship: data.parentRelationship
      },
      learningProfile: {
         goals: data.learningGoals,
         interests: data.interests
      },
      metadata: {
         timestamp: new Date().toISOString(),
         originSystem: 'EVE Onboarding Platform v4 (Module 2)'
      }
    };

    navigator.clipboard.writeText(JSON.stringify(rawMeta, null, 2));
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  if (currentRoute === '/admin' || currentRoute === '/admine') {
    if (!isAdminAuthenticated) {
      return (
        <div className="min-h-screen bg-slate-50 relative flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden">
          {/* BACKGROUND FLOATING ORNAMENTAL BLUR BLOBS */}
          <div className="absolute top-[-50px] left-[-100px] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-3xl animate-blob-left pointer-events-none" />
          <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-3xl animate-blob-right pointer-events-none" />
          <div className="absolute top-[30%] left-[10%] w-[350px] h-[350px] bg-purple-100/50 rounded-full blur-3xl animate-blob-center pointer-events-none" />

          {/* LOGIN CARD */}
          <div className="w-full max-w-sm bg-white rounded-[32px] border border-slate-200/80 shadow-2xl p-6 sm:p-8 flex flex-col relative z-10 animate-fadeIn text-left select-none">
            {/* Logo Brand */}
            <div className="flex flex-col items-center text-center space-y-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                E
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-display">Admin Portal Access</h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">Please enter your password to unlock the dashboard.</p>
              </div>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Dashboard Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="Enter admin password..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all font-medium font-mono text-slate-700 placeholder:text-slate-400"
                  required
                />
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10px] text-rose-700 font-semibold flex items-center gap-1.5 shrink-0 animate-fadeIn z-15">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-650" />
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                Unlock Dashboard
              </button>
            </form>

            <button
              onClick={() => navigateTo('/')}
              className="mt-4 py-2 px-3 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-500 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-1 bg-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to User App
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 relative flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden">
        {/* BACKGROUND FLOATING ORNAMENTAL BLUR BLOBS */}
        <div className="absolute top-[-50px] left-[-100px] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-3xl animate-blob-left pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-3xl animate-blob-right pointer-events-none" />
        <div className="absolute top-[30%] left-[10%] w-[350px] h-[350px] bg-purple-100/50 rounded-full blur-3xl animate-blob-center pointer-events-none" />

        <AdminDashboard 
          onBackToOnboarding={() => navigateTo('/')} 
          syncState={syncState} 
        />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col overflow-hidden font-sans select-none animate-fadeIn">
      
      {/* 1. TOP UTILITY HEADER BAR */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between z-30 shrink-0 shadow-sm">
        <div className="flex items-center gap-3 select-none">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold font-display shadow-md">
            E
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">EVE Onboarding</h1>
            <span className="hidden sm:block text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Interactive Wizard Setup</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sync status badge */}
          <div 
            className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-[10px] font-semibold border flex items-center gap-1.5 transition-all shadow-sm ${
              syncState === 'synced' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                : syncState === 'syncing' 
                ? 'bg-blue-50 border-blue-100 text-blue-700' 
                : 'bg-amber-50 border-amber-100 text-amber-700'
            }`}
          >
            {syncState === 'syncing' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />}
            {syncState === 'synced' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
            {syncState === 'offline' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
            <span className="hidden sm:inline">
              {syncState === 'syncing' && 'Syncing...'}
              {syncState === 'synced' && 'Cloud Active'}
              {syncState === 'offline' && 'Offline / Local'}
            </span>
          </div>
        </div>
      </header>

      {/* 2. SPLIT WORKSPACE FILLING REST OF SCREEN */}
      <div className="flex-1 bg-slate-100/60 flex items-center justify-center overflow-hidden relative p-4">
        
        {/* Simulated mobile phone preview chassis (matches uploaded frame) */}
        <div className="w-full h-full sm:w-[375px] sm:h-[740px] sm:max-h-[96%] rounded-none sm:rounded-[48px] border-0 sm:border-[14px] border-slate-955 bg-white shadow-none sm:shadow-2xl flex flex-col overflow-hidden relative transition-all duration-300">
          
          {/* Speaker Notch Bezel (visible on desktop frame) */}
          <div className="hidden sm:flex absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4.5 bg-slate-950 rounded-b-2xl z-50 items-center justify-center">
            {/* Speaker line */}
            <div className="w-10 h-0.5 bg-slate-800 rounded-full" />
          </div>

          {/* Smartphone Status Bar (visible on desktop frame) */}
          <header className="hidden sm:flex h-10 px-6 pt-3 select-none items-center justify-between text-[10px] font-bold text-slate-800 shrink-0 z-40 bg-white">
            <span className="font-semibold tracking-tight">11:30</span>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </header>

          {/* Floating sync status badge (matches user image layout) */}
          {!completed && step >= 2 && (
            <div className="absolute bottom-18 right-5 z-40 select-none">
              <div className="py-1 px-2.5 rounded-full bg-slate-900 text-[9px] font-mono font-bold text-white shadow-lg border border-slate-800 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  syncState === 'synced' 
                    ? 'bg-emerald-500' 
                    : syncState === 'syncing' 
                    ? 'bg-blue-400 animate-pulse' 
                    : 'bg-amber-400'
                }`} />
                <span>
                  {syncState === 'syncing' && 'Saving Changes'}
                  {syncState === 'synced' && 'Cloud Active'}
                  {syncState === 'offline' && 'Saved Locally (Offline)'}
                </span>
              </div>
            </div>
          )}

          {/* LEFT PANEL: VERTICAL STEPS (Hidden by default in mobile viewport chassis) */}
          <aside className="hidden bg-gradient-to-b from-blue-600 to-indigo-800 p-6 flex-col justify-between text-white relative overflow-hidden select-none border-r border-slate-200/20">
            <div className="absolute top-[-40px] left-[-40px] w-[130px] h-[130px] bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute bottom-[-40px] right-[-40px] w-[130px] h-[130px] bg-white/10 rounded-full blur-xl pointer-events-none" />

            <div className="w-full space-y-6 relative z-10">
              <div className="pl-1">
                <span className="font-bold text-xs font-mono uppercase tracking-widest text-blue-200">ONBOARDING SETUP</span>
              </div>

              {/* Vertical Stepper List */}
              <div className="w-full space-y-2.5 pl-1">
                {[
                  { id: 1, title: 'Welcome' },
                  { id: 2, title: 'Personal Details' },
                  { id: 3, title: 'Academic Details' },
                  { id: 4, title: 'Guardian Contact' },
                  { id: 5, title: 'Learning Goals' },
                  { id: 6, title: 'Subject Interests' },
                  { id: 7, title: 'Learning Style' },
                  { id: 8, title: 'Commitment Target' },
                  { id: 9, title: 'AI Settings' },
                  { id: 10, title: 'Notifications' }
                ].map((sConfig) => {
                  const stepNum = sConfig.id;
                  const isActive = step === stepNum && !completed;
                  const isPassed = stepNum < step || completed;
                  return (
                    <div key={stepNum} className="flex items-center gap-3 text-left">
                      {/* Bullet number / check */}
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isActive 
                          ? 'bg-white text-blue-600 ring-4 ring-white/20' 
                          : isPassed 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-white/20 text-white/50'
                      }`}>
                        {isPassed ? '✓' : stepNum}
                      </div>
                      <span className={`text-[11px] font-semibold transition-all ${
                        isActive 
                          ? 'text-white font-bold' 
                          : isPassed 
                          ? 'text-white/80' 
                          : 'text-white/40'
                      }`}>
                        {sConfig.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Info text instead of illustration */}
            <div className="w-full relative z-10 text-[10px] text-white/50 text-center font-mono border-t border-white/10 pt-3">
              EVE Platform v1.0
            </div>
          </aside>

          {/* RIGHT PANEL: DYNAMIC FORM/REVIEW PANEL */}
          <main className={`flex-grow bg-white flex flex-col justify-between overflow-y-auto custom-scrollbar relative min-h-0 ${
            deviceMode === 'mobile' 
              ? 'p-4' 
              : deviceMode === 'tablet' 
              ? 'p-6' 
              : 'p-4 sm:p-8 md:p-12'
          }`}>
            
            {completed ? (
              // Success Completion Module
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
                <OnboardingFinalReview
                  data={data}
                  onNavigateToStep={handleEditNav}
                  isCompleted={true}
                  onReset={handleReset}
                  onCopyJson={copyJsonToClipboard}
                  copiedState={copiedState}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between min-h-0">
                                {/* Welcome Screen (Step 1) */}
                {step === 1 && (
                  <div className="flex-1 flex flex-col justify-between text-center py-6 animate-fadeIn">
                    <div className="my-auto space-y-5">
                      {/* Typographic book SVG icon */}
                      <div className="w-full flex justify-center">
                        <svg className="w-16 h-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      
                      <div className="space-y-3">
                        <h2 className={`font-extrabold font-display text-slate-900 tracking-tight ${
                          deviceMode === 'mobile' ? 'text-2xl' : 'text-3xl'
                        }`}>
                          Build your profile.
                        </h2>
                        <p className={`text-slate-500 leading-relaxed mx-auto ${
                          deviceMode === 'mobile' ? 'text-xs max-w-[280px]' : 'text-sm max-w-[420px]'
                        }`}>
                          Welcome to EVE Learning Platform. Set up your academic details to unlock personalized courses, assignments, and certificates.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 mt-6 shrink-0">
                      <button
                        type="button"
                        onClick={handleNext}
                        className={`w-full max-w-sm mx-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase transition-colors shadow-md flex items-center justify-center gap-1.5 group cursor-pointer ${
                          deviceMode === 'mobile' ? 'py-2.5 px-4 text-xs' : 'py-3.5 px-6 text-xs tracking-wide'
                        }`}
                      >
                        Get Started
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </button>

                      <div className="text-[10px] text-slate-400 font-mono tracking-wide flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-500" />
                        Your progress auto-saves instantly
                      </div>
                    </div>
                  </div>
                )}

                {/* Step-by-Step Forms (Steps 2 to 10) */}
                {step >= 2 && step <= 10 && (
                  <div className="flex-1 flex flex-col justify-between animate-fadeIn min-h-0">
                    
                    {/* Step Label Header */}
                    <div className="mb-4 md:mb-6 text-left select-none border-b border-slate-100 pb-3 md:pb-4 shrink-0">
                      <span className="text-[10px] font-mono tracking-widest text-blue-600 font-bold uppercase block">
                        Step {step} of 10
                      </span>
                      <h3 className={`font-bold font-display text-slate-900 tracking-tight leading-snug ${
                        deviceMode === 'mobile' ? 'text-lg' : 'text-xl'
                      }`}>
                        {step === 2 && 'Personal Details'}
                        {step === 3 && 'Academic Details'}
                        {step === 4 && 'Parent / Guardian Info'}
                        {step === 5 && 'Learning Goals'}
                        {step === 6 && 'Subject Interests'}
                        {step === 7 && 'Learning Style'}
                        {step === 8 && 'Commitment Target'}
                        {step === 9 && 'AI Settings'}
                        {step === 10 && 'Notifications'}
                      </h3>
                    </div>

                    {/* Core Form Area */}
                    <div className="flex-grow overflow-y-auto pr-1 py-1 custom-scrollbar min-h-0 text-left">
                      <OnboardingStepRenderer
                        stepId={step}
                        data={data}
                        updateData={(updates) => setData(p => ({ ...p, ...updates }))}
                        setErrors={setErrors}
                      />

                      {/* Errors Display block */}
                      {errors.length > 0 && (
                        <div className="mt-4 bg-red-50 border border-red-150 rounded-xl p-4 text-left animate-fadeIn">
                          {errors.map((err, i) => (
                            <p key={i} className="text-xs text-red-600 font-semibold">
                              {err}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* NAVIGATION FOOTER (Steps 2 to 3) */}
            {!completed && step >= 2 && (
              <div className={`bg-slate-50 border-t border-slate-100 flex flex-col gap-2 relative z-30 select-none mt-6 shrink-0 ${
                deviceMode === 'mobile' 
                  ? '-mx-4 -mb-4 px-4 py-3.5' 
                  : deviceMode === 'tablet' 
                  ? '-mx-6 -mb-6 px-6 py-4' 
                  : '-mx-4 sm:-mx-8 md:-mx-12 -mb-4 sm:-mb-8 md:-mb-12 px-4 sm:px-8 md:px-12 py-4 md:py-5'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  
                  {/* LEFT BUTTON: BACK */}
                  <button
                    type="button"
                    onClick={handleBack}
                    className={`border border-slate-200 hover:bg-slate-100 rounded-lg font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors shadow-sm bg-white ${
                      deviceMode === 'mobile' ? 'py-1.5 px-2.5 text-[11px]' : 'py-1.5 px-3.5 sm:py-2 sm:px-4 text-xs'
                    }`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>

                  {/* CENTERING DOCK CAPSULES */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 10 }).map((_, idx) => {
                      const stepNum = idx + 1;
                      const isActive = step === stepNum;
                      return (
                        <div
                          key={stepNum}
                          onClick={() => {
                            if (stepNum < step) {
                              setStep(stepNum as OnboardingStepId);
                            }
                          }}
                          className={`h-1.5 rounded-full cursor-pointer transition-all ${
                            isActive
                              ? 'w-4.5 sm:w-6 bg-blue-600'
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
                    className={`bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold uppercase flex items-center gap-1 transition-colors cursor-pointer ${
                      deviceMode === 'mobile' ? 'py-1.5 px-3.5 text-[11px]' : 'py-1.5 px-3.5 sm:py-2 sm:px-5 text-xs tracking-wider'
                    }`}
                  >
                    {step === 10 ? 'Complete' : 'Next'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                </div>
              </div>
            )}

          </main>



        </div>

      </div>
    </div>
  );
}
