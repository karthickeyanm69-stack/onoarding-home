import React from 'react';
import { User, BookOpen, GraduationCap, School, Check } from 'lucide-react';
import { OnboardingData, OnboardingStepId } from '../types';

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

  // Step 2: Personal Details
  if (stepId === 2) {
    const genders = [
      { id: 'male', label: 'Male', desc: 'Identify as male' },
      { id: 'female', label: 'Female', desc: 'Identify as female' },
      { id: 'non-binary', label: 'Non-Binary', desc: 'Identify as non-binary' },
      { id: 'prefer-not-to-say', label: 'Prefer not to say', desc: 'Keep this private' }
    ];

    return (
      <div className="space-y-6 text-left animate-fadeIn">
        {/* Full Name input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider" htmlFor="fullName">
            Full Name <span className="text-blue-600">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="fullName"
              type="text"
              placeholder="e.g. Sarah Jenkins"
              value={data.fullName}
              onChange={(e) => {
                const val = e.target.value;
                const firstWord = val.trim().split(' ')[0] || '';
                const shouldUpdatePref = !data.preferredName || data.preferredName === (data.fullName.trim().split(' ')[0] || '');
                updateData({
                  fullName: val,
                  ...(shouldUpdatePref && { preferredName: firstWord })
                });
              }}
              autoFocus
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium"
            />
          </div>
        </div>

        {/* Preferred Name input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider" htmlFor="preferredName">
            Preferred Name <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            id="preferredName"
            type="text"
            placeholder="e.g. Sarah"
            value={data.preferredName}
            onChange={(e) => updateData({ preferredName: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium"
          />
        </div>

        {/* Gender Choice Cards */}
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Gender Identity <span className="text-blue-600">*</span>
          </label>
          <div className="grid grid-cols-1 gap-2">
            {genders.map((gender) => {
              const isSelected = data.gender === gender.id;
              return (
                <button
                  key={gender.id}
                  type="button"
                  onClick={() => updateData({ gender: gender.id as any })}
                  className={`w-full flex items-center justify-between p-3.5 bg-white rounded-xl text-left transition-all ${
                    isSelected
                      ? 'border-2 border-blue-600 shadow-sm'
                      : 'border border-slate-200 hover:border-slate-350'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{gender.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-medium">{gender.desc}</div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
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

  // Step 3: Academic Details
  if (stepId === 3) {
    const educationLevels = [
      { id: 'high-school', label: 'High School', desc: 'Secondary education' },
      { id: 'undergraduate', label: 'Undergraduate', desc: 'Bachelor’s degree or equivalent' },
      { id: 'postgraduate', label: 'Postgraduate', desc: 'Master’s degree or equivalent' },
      { id: 'doctorate', label: 'Doctorate', desc: 'Ph.D. or doctoral studies' },
      { id: 'other', label: 'Other', desc: 'Alternative education paths' }
    ];

    return (
      <div className="space-y-6 text-left animate-fadeIn">
        {/* Highest Education Selection */}
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Highest Education Level <span className="text-blue-600">*</span>
          </label>
          <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
            {educationLevels.map((level) => {
              const isSelected = data.educationLevel === level.id;
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => updateData({ educationLevel: level.id as any })}
                  className={`w-full flex items-center justify-between p-3.5 bg-white rounded-xl text-left transition-all ${
                    isSelected
                      ? 'border-2 border-blue-600 shadow-sm'
                      : 'border border-slate-200 hover:border-slate-350'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{level.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-medium">{level.desc}</div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Field of Study */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider" htmlFor="fieldOfStudy">
            Field of Study <span className="text-blue-600">*</span>
          </label>
          <div className="relative">
            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="fieldOfStudy"
              type="text"
              placeholder="e.g. Computer Science"
              value={data.fieldOfStudy}
              onChange={(e) => updateData({ fieldOfStudy: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium"
            />
          </div>
        </div>

        {/* Institution / School */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider" htmlFor="institution">
            School / Institution <span className="text-blue-600">*</span>
          </label>
          <div className="relative">
            <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="institution"
              type="text"
              placeholder="e.g. Stanford University"
              value={data.institution}
              onChange={(e) => updateData({ institution: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};
