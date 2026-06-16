import React, { useState } from 'react';
import { 
  User, MapPin, Briefcase, Mail, Phone, BookOpen, 
  Languages, Check, Edit2, ShieldCheck, Copy, 
  RotateCcw, Sparkles, AlertCircle, FileText 
} from 'lucide-react';
import { OnboardingData, OnboardingStepId, PersonaDetails } from '../types';
import { OnboardingIllustration } from './OnboardingIllustration';

interface FinalReviewProps {
  data: OnboardingData;
  onNavigateToStep: (stepId: OnboardingStepId) => void;
  isCompleted: boolean;
  onReset: () => void;
  onCopyJson: () => void;
  copiedState: boolean;
}

// Evaluates the user's choices and spawns a specific high-end persona
export function generatePersona(data: OnboardingData): PersonaDetails {
  const isDev = data.occupation === 'developer';
  const isDesigner = data.occupation === 'designer';
  const isStudent = data.occupation === 'student';
  const isTeacher = data.occupation === 'teacher';
  const isBusiness = data.occupation === 'business-owner';
  
  const isYoung = data.ageGroup === 'under-13' || data.ageGroup === '13-17' || data.ageGroup === '18-24';

  if (isDev) {
    if (isYoung) {
      return {
        title: 'Next-Gen Neo Coder',
        gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
        tier: 'Mythic Stack',
        emoji: '👩‍💻',
        borderColor: 'border-cyan-500',
        description: 'Blazing through code space compiling reactive systems before coffee. Powered by future tech stacks.',
        accentColor: '#06b6d4'
      };
    } else {
      return {
        title: 'Senior Systems Architect',
        gradient: 'from-blue-600 to-indigo-900',
        tier: 'Mythic Stack',
        emoji: '🧑‍💻',
        borderColor: 'border-blue-700',
        description: 'Governing container nodes, database pipelines, and high-throughput microservices in deep focused flow.',
        accentColor: '#3b82f6'
      };
    }
  }

  if (isDesigner) {
    return {
      title: 'Visionary Interaction Pioneer',
      gradient: 'from-pink-500 via-purple-500 to-rose-500',
      tier: 'Epic Creative',
      emoji: '🎨',
      borderColor: 'border-pink-500',
      description: 'Crafting mesmerizing interface ecosystems focusing on typography pairing, negative space, and organic animation ripples.',
      accentColor: '#ec4899'
    };
  }

  if (isStudent) {
    return {
      title: 'Cosmic Starlight Scholar',
      gradient: 'from-amber-400 via-teal-500 to-emerald-600',
      tier: 'Rare Explorer',
      emoji: '🧑‍🚀',
      borderColor: 'border-amber-400',
      description: 'Absorbing multi-disciplinary insights. Charting unexplored galaxies of research and intellectual expansion.',
      accentColor: '#fbbf24'
    };
  }

  if (isBusiness) {
    return {
      title: 'Strategic Venture Catalyst',
      gradient: 'from-yellow-500 to-orange-600',
      tier: 'Legendary Leader',
      emoji: '💼',
      borderColor: 'border-yellow-500',
      description: 'Assembling teams, steering seed capital pipelines, and converting complex vectors into market breakthroughs.',
      accentColor: '#eab308'
    };
  }

  if (isTeacher) {
    return {
      title: 'Empowerment Architect',
      gradient: 'from-emerald-400 to-teal-700',
      tier: 'Divine Sage',
      emoji: '🦉',
      borderColor: 'border-emerald-500',
      description: 'Sculpting minds, deploying knowledge frameworks, and molding the innovators of upcoming tech waves.',
      accentColor: '#10b981'
    };
  }

  // Default path
  return {
    title: 'EVE Digital Pathfinder',
    gradient: 'from-purple-500 to-fuchsia-600',
    tier: 'Celestial Citizen',
    emoji: '🦊',
    borderColor: 'border-purple-500',
    description: 'A dynamic pathfinder of the EVE ecosystem traversing local states, cloud nodes, and global parameters.',
    accentColor: '#8b5cf6'
  };
}

export const OnboardingFinalReview: React.FC<FinalReviewProps> = ({
  data,
  onNavigateToStep,
  isCompleted,
  onReset,
  onCopyJson,
  copiedState
}) => {
  const persona = generatePersona(data);
  const mockupId = `EVE-77-${Math.abs(data.fullName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 100))}-${data.country ? data.country.slice(0, 2).toUpperCase() : 'GL'}`;

  // ==========================================
  // VIEW A: REVIEW STATE (STEP 10 PANEL)
  // ==========================================
  if (!isCompleted) {
    return (
      <div className="space-y-4 text-left max-h-[460px] overflow-y-auto custom-scrollbar pr-1.5 animate-fadeIn">
        <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
          Observe and review all choices before publishing. Select 'Edit' to make updates fast.
        </p>

        {/* Section 1: Personal Details */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5 shadow-sm relative hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              Personal Details
            </span>
            <button
              onClick={() => onNavigateToStep(2)}
              className="text-[10px] font-semibold text-indigo-600 hover:underline flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded"
            >
              <Edit2 className="w-2.5 h-2.5" />
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Full Name</span>
              <span className="font-semibold text-slate-800 break-words">{data.fullName || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Preferred Name</span>
              <span className="font-semibold text-slate-800 break-words">{data.preferredName || '—'}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-slate-100 flex items-center gap-2">
              <span className="text-slate-400 text-[10px] uppercase">Gender:</span>
              <span className="font-semibold text-slate-700 capitalize">{data.gender || 'Not chosen'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Location Detail */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5 shadow-sm relative hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              Location Settings
            </span>
            <button
              onClick={() => onNavigateToStep(4)}
              className="text-[10px] font-semibold text-indigo-600 hover:underline flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded"
            >
              <Edit2 className="w-2.5 h-2.5" />
              Edit
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Country</span>
              <span className="font-semibold text-slate-800 truncate block">{data.country || 'Skipped'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Province/State</span>
              <span className="font-semibold text-slate-800 truncate block">{data.state || 'Skipped'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">City</span>
              <span className="font-semibold text-slate-800 truncate block">{data.city || 'Skipped'}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Academic & Career Profile */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5 shadow-sm relative hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              Experience & Domain
            </span>
            <button
              onClick={() => onNavigateToStep(6)}
              className="text-[10px] font-semibold text-indigo-600 hover:underline flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded"
            >
              <Edit2 className="w-2.5 h-2.5" />
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Academic Level</span>
              <span className="font-semibold text-slate-800 capitalize">{data.educationLevel?.replace('-', ' ') || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Occupation</span>
              <span className="font-semibold text-slate-800 capitalize">{data.occupation?.replace('-', ' ') || '—'}</span>
            </div>
          </div>
        </div>

        {/* Section 4: Security & Preference Info */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5 shadow-sm relative hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Verified Accounts
            </span>
            <button
              onClick={() => onNavigateToStep(8)}
              className="text-[10px] font-semibold text-indigo-600 hover:underline flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded"
            >
              <Edit2 className="w-2.5 h-2.5" />
              Edit
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
              <span className="text-slate-500 font-medium truncate max-w-[120px]">{data.email || 'No email'}</span>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono">
                <Check className="w-2.5 h-2.5 text-emerald-500" />
                VERIFIED
              </span>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
              <span className="text-slate-500 font-medium">{data.mobile || 'No mobile'}</span>
              {data.mobileVerified ? (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono">
                  <Check className="w-2.5 h-2.5 text-emerald-500" />
                  VERIFIED
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-mono">
                  <AlertCircle className="w-2.5 h-2.5 text-rose-500" />
                  UNVERIFIED
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase block mb-1">Languages:</span>
              <div className="flex flex-wrap gap-1">
                {data.languages.map((l) => (
                  <span key={l} className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW B: PREMIUM SUCCESS ARCHETYPE GENERATOR
  // ==========================================
  return (
    <div className="space-y-4 text-center animate-fadeIn pr-1 text-sm max-h-[500px] overflow-y-auto custom-scrollbar">
      {/* Visual Header */}
      <OnboardingIllustration type="success" />

      {/* Success Messages */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold font-display text-slate-900 tracking-tight flex items-center justify-center gap-1.5">
          <Sparkles className="w-5 h-5 text-indigo-500 animate-spin" />
          Onboarding Success!
        </h2>
        <p className="text-xs text-slate-500 leading-normal max-w-[280px] mx-auto">
          Congratulations, your digital record is active. EVE has diagnosed your characteristics and unlocked your custom badge.
        </p>
      </div>

      {/* GAME-STYLE BADGE SYSTEM CARD */}
      <div className={`p-4 rounded-[28px] bg-gradient-to-br ${persona.gradient} text-white shadow-xl relative overflow-hidden border-2 border-white/20 select-none text-left`}>
        {/* Absolute floating grid styling */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
        
        {/* Tier badge pill */}
        <div className="flex justify-between items-center relative z-10 mb-5">
          <span className="text-[10px] font-mono tracking-widest uppercase bg-white/25 px-2.5 py-1 rounded-full font-bold backdrop-blur-md">
            {persona.tier} Tier
          </span>
          <span className="text-xs font-mono text-white/80 font-bold">
            {mockupId}
          </span>
        </div>

        {/* Profile elements */}
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="relative">
            {data.profileImg ? (
              <img
                src={data.profileImg}
                alt={data.fullName}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover bg-white/10 border-2 border-white/50 shadow"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur flex items-center justify-center text-3xl font-display">
                {persona.emoji}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-full bg-white text-slate-950 flex items-center justify-center text-xs shadow font-bold">
              {persona.emoji}
            </div>
          </div>

          <div className="space-y-0.5">
            <h3 className="font-display font-medium text-lg leading-tight tracking-tight text-white">
              {data.preferredName || data.fullName}
            </h3>
            <p className="text-xs text-white/85 font-mono flex items-center gap-1 font-bold">
              <MapPin className="w-3.5 h-3.5 text-white/50" />
              {data.city ? `${data.city}, ${data.country}` : 'Global Citizen'}
            </p>
          </div>
        </div>

        {/* Archetype naming and design */}
        <div className="mt-4 pt-3.5 border-t border-white/20 relative z-10 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-white/70">Assigned Archetype</div>
          <h4 className="text-lg font-bold font-display leading-tight text-yellow-300 drop-shadow flex items-center gap-1">
            {persona.title}
          </h4>
          <p className="text-xs text-white/90 leading-tight">
            {persona.description}
          </p>
        </div>
      </div>

      {/* DETAILED ACTION CLUSTER */}
      <div className="grid grid-cols-2 gap-2.5 pt-2" id="success-action-buttons">
        <button
          type="button"
          onClick={onCopyJson}
          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-all bg-white cursor-pointer"
        >
          {copiedState ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              Copied JSON!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-400" />
              Copy Profile JSON
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-950 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Settings
        </button>
      </div>
    </div>
  );
};
