import React, { useState } from 'react';
import { Check, Copy, RotateCcw, LayoutDashboard, Award, Sparkles, Bell } from 'lucide-react';
import { OnboardingData, OnboardingStepId } from '../types';

interface FinalReviewProps {
  data: OnboardingData;
  onNavigateToStep: (stepId: OnboardingStepId) => void;
  isCompleted: boolean;
  onReset: () => void;
  onCopyJson: () => void;
  copiedState: boolean;
  onEnterDashboard?: () => void;
}

export const OnboardingFinalReview: React.FC<FinalReviewProps> = ({
  data,
  onReset,
  onCopyJson,
  copiedState,
  onEnterDashboard
}) => {
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);
  const displayId = `EVE-ST-${Math.abs(data.fullName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 100))}`;

  // Helper mappings for slugs
  const goalLabels: { [key: string]: string } = {
    'career-advancement': 'Career Advancement',
    'skill-improvement': 'Skill Upgrading',
    'academic-success': 'Academic Excellence',
    'personal-interest': 'Personal Enrichment',
    'exam-prep': 'Exam Certification'
  };

  const interestLabels: { [key: string]: string } = {
    'computer-science': 'Computer Science',
    'mathematics': 'Mathematics',
    'data-science': 'Data Science',
    'design': 'UI/UX Design',
    'languages': 'Languages',
    'science': 'Natural Sciences',
    'business': 'Business & Econ',
    'humanities': 'Humanities & Arts'
  };

  const preferenceLabels: { [key: string]: string } = {
    'visual': 'Visual & Videos',
    'hands-on': 'Hands-on Projects',
    'reading': 'Reading & Text',
    'audio': 'Audio & Podcasts',
    'interactive': 'Gamified Quizzes'
  };

  const commitmentLabels: { [key: string]: string } = {
    'casual': 'Casual Target (10m/day)',
    'regular': 'Regular Study (25m/day)',
    'serious': 'Serious Focus (45m/day)',
    'intensive': 'Intensive Shift (60m+/day)'
  };

  const handleEnterDashboardClick = () => {
    if (onEnterDashboard) {
      onEnterDashboard();
    } else {
      setShowWelcomeModal(true);
    }
  };

  return (
    <div className="space-y-6 text-center animate-fadeIn pr-1 text-sm select-none">
      
      {/* 1. SUCCESS BADGE & TITLE */}
      <div className="space-y-4">
        {/* Apple style pulsing success badge */}
        <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full bg-blue-600/20 animate-ping" />
          <Check className="w-7 h-7 text-white" strokeWidth={3} />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold font-display text-slate-900 tracking-tight">
            AI Personalization Set Up!
          </h2>
          <p className="text-xs text-slate-500 leading-normal max-w-[290px] mx-auto font-medium">
            Your customized EVE study plan is generated. Review your personalized config card below.
          </p>
        </div>
      </div>

      {/* 2. PREMIUM PERSONALIZED SUMMARY CARD */}
      <div className="bg-white border border-slate-200/80 rounded-[24px] p-5 shadow-sm text-left relative space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-[9px] font-mono tracking-wider uppercase bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-bold">
            Student Profile
          </span>
          <span className="text-xs font-mono text-slate-500 font-bold">
            {displayId}
          </span>
        </div>

        {/* Section 1: Demographics & Academics */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="col-span-2">
            <span className="text-slate-400 block text-[8px] font-bold uppercase tracking-wider">Full Name</span>
            <span className="font-semibold text-slate-800 break-words">{data.fullName || 'Not specified'}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[8px] font-bold uppercase tracking-wider">Gender</span>
            <span className="font-semibold text-slate-800 capitalize">{data.gender || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[8px] font-bold uppercase tracking-wider">Highest Degree</span>
            <span className="font-semibold text-slate-800 capitalize">{data.educationLevel?.replace('-', ' ') || 'Not specified'}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[8px] font-bold uppercase tracking-wider">Field of Study</span>
            <span className="font-semibold text-slate-800 break-words">{data.fieldOfStudy || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[8px] font-bold uppercase tracking-wider">Institution</span>
            <span className="font-semibold text-slate-800 break-words">{data.institution || 'Not specified'}</span>
          </div>
        </div>

        {/* Section 2: Parent / Guardian Info */}
        <div className="pt-3 border-t border-slate-100">
          <span className="text-slate-400 block text-[8px] font-bold uppercase tracking-wider mb-1">Parent & Guardian Link</span>
          {data.parentName === 'SKIPPED' ? (
            <span className="inline-flex items-center text-[9px] font-bold text-slate-650 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-md">
              Independent Adult Learner
            </span>
          ) : data.parentName ? (
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[8px] uppercase">Name</span>
                <span className="font-semibold text-slate-800">{data.parentName} ({data.parentRelationship})</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[8px] uppercase">Contact</span>
                <span className="font-semibold text-slate-800">{data.parentEmail} • {data.parentPhone}</span>
              </div>
            </div>
          ) : (
            <span className="text-slate-400 text-xs font-semibold">Not provided</span>
          )}
        </div>

        {/* Section 3: Learning Goals & Subject Interests */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div>
            <span className="text-slate-400 block text-[8px] font-bold uppercase tracking-wider mb-1">Goals</span>
            <div className="flex flex-wrap gap-1">
              {data.learningGoals && data.learningGoals.length > 0 ? (
                data.learningGoals.map((goal) => (
                  <span key={goal} className="bg-blue-50 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-md">
                    {goalLabels[goal] || goal}
                  </span>
                ))
              ) : (
                <span className="text-slate-450 text-[10px] font-semibold">None selected</span>
              )}
            </div>
          </div>
          <div>
            <span className="text-slate-400 block text-[8px] font-bold uppercase tracking-wider mb-1">Interests</span>
            <div className="flex flex-wrap gap-1">
              {data.interests && data.interests.length > 0 ? (
                data.interests.map((interest) => (
                  <span key={interest} className="bg-slate-50 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-md border border-slate-150">
                    {interestLabels[interest] || interest}
                  </span>
                ))
              ) : (
                <span className="text-slate-450 text-[10px] font-semibold">None selected</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: AI & commitment Setup (Module 3 additions) */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[8px] font-bold uppercase tracking-wider">Learning Preference</span>
              <span className="font-semibold text-slate-800">{preferenceLabels[data.learningPreference] || 'Visual Lectures'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[8px] font-bold uppercase tracking-wider">Commitment Target</span>
              <span className="font-semibold text-slate-800">{commitmentLabels[data.dailyCommitment] || 'Regular Study (25m)'}</span>
            </div>
          </div>

          {/* AI toggles summary indicator */}
          <div className="pt-1.5">
            <span className="text-slate-400 block text-[8px] font-bold uppercase tracking-wider mb-1">Active AI Co-pilots</span>
            <div className="flex flex-wrap gap-1.5">
              {data.aiAdaptiveDifficulty && (
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  <Sparkles className="w-2.5 h-2.5" /> Adaptive Difficulty
                </span>
              )}
              {data.aiStudyReminders && (
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  <Sparkles className="w-2.5 h-2.5" /> Peak Focus Reminders
                </span>
              )}
              {data.aiCareerInsights && (
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  <Sparkles className="w-2.5 h-2.5" /> Career Insights
                </span>
              )}
              {data.aiConceptExplainer && (
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  <Sparkles className="w-2.5 h-2.5" /> Modular Explainer
                </span>
              )}
            </div>
          </div>

          {/* Notifications summary indicator */}
          <div className="pt-1.5">
            <span className="text-slate-400 block text-[8px] font-bold uppercase tracking-wider mb-1">Notifications</span>
            <div className="flex flex-wrap gap-1">
              {data.notifyEmailDigest && (
                <span className="text-[9px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 flex items-center gap-1">
                  <Bell className="w-2.5 h-2.5 text-slate-400" /> Weekly Email
                </span>
              )}
              {data.notifyPush && (
                <span className="text-[9px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 flex items-center gap-1">
                  <Bell className="w-2.5 h-2.5 text-slate-400" /> Push Alerts
                </span>
              )}
              {data.notifyWeeklyAchievements && (
                <span className="text-[9px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 flex items-center gap-1">
                  <Bell className="w-2.5 h-2.5 text-slate-400" /> Milestones Alert
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. PRIMARY ACTION: ENTER DASHBOARD CTA */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleEnterDashboardClick}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer transform hover:scale-[1.01]"
        >
          <LayoutDashboard className="w-4 h-4" />
          Enter EVE Dashboard
        </button>

        {/* 4. SUB-ACTIONS BLOCK */}
        <div className="grid grid-cols-2 gap-2.5" id="success-action-buttons">
          <button
            type="button"
            onClick={onCopyJson}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-all bg-white cursor-pointer shadow-sm"
          >
            {copiedState ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                Copied JSON
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-450" />
                Copy Config JSON
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-all bg-white cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            Reset Setup
          </button>
        </div>
      </div>

      {/* SUCCESS WELCOME MODAL */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-[32px] p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-5 text-center select-none animate-scaleIn">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
              <Award className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Welcome to EVE learning</h3>
              <p className="text-xs text-slate-500 leading-normal">
                Your credentials and co-pilot guidelines have been synchronized. Select dashboard options below.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowWelcomeModal(false);
                  window.location.reload();
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Access Courses
              </button>
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full py-2 px-3 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-500 hover:bg-slate-50 transition-all cursor-pointer bg-white"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
