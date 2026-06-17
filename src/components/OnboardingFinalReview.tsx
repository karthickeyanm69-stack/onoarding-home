import React from 'react';
import { User, GraduationCap, School, Check, Copy, RotateCcw, FileText } from 'lucide-react';
import { OnboardingData, OnboardingStepId } from '../types';

interface FinalReviewProps {
  data: OnboardingData;
  onNavigateToStep: (stepId: OnboardingStepId) => void;
  isCompleted: boolean;
  onReset: () => void;
  onCopyJson: () => void;
  copiedState: boolean;
}

export const OnboardingFinalReview: React.FC<FinalReviewProps> = ({
  data,
  isCompleted,
  onReset,
  onCopyJson,
  copiedState
}) => {
  const displayId = `EVE-ST-${Math.abs(data.fullName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 100))}`;

  // Success view (when completed)
  return (
    <div className="space-y-6 text-center animate-fadeIn pr-1 text-sm max-h-[500px] overflow-y-auto custom-scrollbar">
      {/* minimalist check badge */}
      <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 shadow-sm border border-blue-100 flex items-center justify-center">
        <Check className="w-6 h-6 text-blue-600" strokeWidth={3} />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-bold font-display text-slate-900 tracking-tight">
          Profile Setup Complete
        </h2>
        <p className="text-xs text-slate-500 leading-normal max-w-[280px] mx-auto">
          Your profile has been saved successfully. Your learning path on the EVE platform is ready.
        </p>
      </div>

      {/* Notion/Linear clean details card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-left relative select-none">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
          <span className="text-[10px] font-mono tracking-wider uppercase bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
            Student ID
          </span>
          <span className="text-xs font-mono text-slate-500 font-bold">
            {displayId}
          </span>
        </div>

        {/* Profile Grid */}
        <div className="space-y-3">
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Full Name</span>
            <span className="font-semibold text-slate-800 break-words">{data.fullName || 'Sarah Jenkins'}</span>
          </div>

          {data.preferredName && (
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Preferred Name</span>
              <span className="font-semibold text-slate-800 break-words">{data.preferredName}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Gender</span>
              <span className="font-semibold text-slate-800 capitalize">{data.gender || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Education Level</span>
              <span className="font-semibold text-slate-800 capitalize">{data.educationLevel?.replace('-', ' ') || 'Undergraduate'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Field of Study</span>
              <span className="font-semibold text-slate-800 break-words">{data.fieldOfStudy || 'Computer Science'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Institution</span>
              <span className="font-semibold text-slate-800 break-words">{data.institution || 'Stanford University'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* action buttons */}
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
              Copy JSON
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-950 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Profile
        </button>
      </div>
    </div>
  );
};
