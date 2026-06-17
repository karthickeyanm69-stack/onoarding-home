import React from 'react';
import { 
  User, BookOpen, GraduationCap, School, Check, Shield, Mail, Phone, Heart, Award,
  Video, Terminal, FileText, Headphones, Sparkles, Clock, Sliders, Bell, Activity
} from 'lucide-react';
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

  // Step 4: Parent / Guardian Information
  if (stepId === 4) {
    const relationships = [
      { id: 'father', label: 'Father' },
      { id: 'mother', label: 'Mother' },
      { id: 'guardian', label: 'Guardian' },
      { id: 'other', label: 'Other' }
    ];

    const isSkipped = data.parentName === 'SKIPPED';

    const handleSkipToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        updateData({
          parentName: 'SKIPPED',
          parentEmail: '',
          parentPhone: '',
          parentRelationship: ''
        });
      } else {
        updateData({
          parentName: '',
          parentEmail: '',
          parentPhone: '',
          parentRelationship: ''
        });
      }
    };

    return (
      <div className="space-y-5 text-left animate-fadeIn">
        {/* Skip option toggle banner */}
        <label className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer select-none transition-all hover:bg-slate-100/50">
          <input
            type="checkbox"
            checked={isSkipped}
            onChange={handleSkipToggle}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
          />
          <div>
            <span className="text-xs font-bold text-slate-900">Independent Adult Learner</span>
            <p className="text-[10px] text-slate-500 font-medium">I don't need to link a parent or guardian account.</p>
          </div>
        </label>

        {isSkipped ? (
          <div className="animate-fadeIn space-y-3">
            {/* Independent Adult Confirmation Card */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-amber-800">Independent Adult — No Guardian Required</div>
                  <p className="text-[10px] text-amber-600 font-medium mt-0.5">Your account will be registered without a linked parent/guardian.</p>
                </div>
              </div>
              <div className="border-t border-amber-200 pt-2.5 mt-2">
                <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                  As an independent adult learner, you take full responsibility for your learning journey. 
                  Your profile will be saved with this status. You can still receive all AI personalization 
                  and notification features in the next steps.
                </p>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium px-1">
              ✓ Your independent adult status will be stored securely. Click <strong>Next</strong> to continue.
            </p>
          </div>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            {/* Parent Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider" htmlFor="parentName">
                Parent / Guardian Name <span className="text-blue-600">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="parentName"
                  type="text"
                  placeholder="e.g. Alice Jenkins"
                  value={data.parentName}
                  onChange={(e) => updateData({ parentName: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium"
                />
              </div>
            </div>

            {/* Parent Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider" htmlFor="parentEmail">
                Email Address <span className="text-blue-600">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="parentEmail"
                  type="email"
                  placeholder="e.g. alice@jenkins.com"
                  value={data.parentEmail}
                  onChange={(e) => updateData({ parentEmail: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium"
                />
              </div>
            </div>

            {/* Parent Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider" htmlFor="parentPhone">
                Contact Number <span className="text-blue-600">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="parentPhone"
                  type="tel"
                  placeholder="e.g. 555-019-2000"
                  value={data.parentPhone}
                  onChange={(e) => updateData({ parentPhone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium"
                />
              </div>
            </div>

            {/* Parent Relationship */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Relationship <span className="text-blue-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {relationships.map((rel) => {
                  const isSelected = data.parentRelationship === rel.id;
                  return (
                    <button
                      key={rel.id}
                      type="button"
                      onClick={() => updateData({ parentRelationship: rel.id as any })}
                      className={`py-2.5 px-4 bg-white rounded-xl text-center text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'border-2 border-blue-600 text-blue-600 shadow-sm'
                          : 'border-slate-200 text-slate-700 hover:border-slate-350'
                      }`}
                    >
                      {rel.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 5: Learning Goals
  if (stepId === 5) {
    const goals = [
      { id: 'career-advancement', label: 'Career Advancement', desc: 'Acquire high-demand capabilities to transition roles or earn promotions.' },
      { id: 'skill-improvement', label: 'Skill Upgrading', desc: 'Master specific engineering, design, or professional technologies.' },
      { id: 'academic-success', label: 'Academic Excellence', desc: 'Secure top test scores and master school or college curricula.' },
      { id: 'personal-interest', label: 'Personal Enrichment', desc: 'Learn subjects out of sheer intellectual curiosity and passion.' },
      { id: 'exam-prep', label: 'Exam Certification', desc: 'Rigorous preparation for professional licensing or entrance credentials.' }
    ];

    const toggleGoal = (id: string) => {
      const current = data.learningGoals || [];
      if (current.includes(id)) {
        updateData({ learningGoals: current.filter(x => x !== id) });
      } else {
        updateData({ learningGoals: [...current, id] });
      }
    };

    return (
      <div className="space-y-4 text-left animate-fadeIn">
        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Primary Learning Goals <span className="text-blue-600">*</span>
        </span>
        <p className="text-[10px] text-slate-400 font-medium">Select all goals that align with your study track (minimum 1).</p>

        <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
          {goals.map((goal) => {
            const isSelected = data.learningGoals?.includes(goal.id) || false;
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => toggleGoal(goal.id)}
                className={`w-full flex items-start justify-between p-3.5 bg-white rounded-xl text-left transition-all ${
                  isSelected
                    ? 'border-2 border-blue-600 shadow-sm'
                    : 'border border-slate-200 hover:border-slate-350'
                }`}
              >
                <div className="pr-4">
                  <div className="text-xs font-bold text-slate-900">{goal.label}</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-medium leading-normal">{goal.desc}</div>
                </div>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                  isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Step 6: Interests Selection
  if (stepId === 6) {
    const interests = [
      { id: 'computer-science', label: 'Computer Science' },
      { id: 'mathematics', label: 'Mathematics' },
      { id: 'data-science', label: 'Data Science' },
      { id: 'design', label: 'UI/UX Design' },
      { id: 'languages', label: 'Languages' },
      { id: 'science', label: 'Natural Sciences' },
      { id: 'business', label: 'Business & Econ' },
      { id: 'humanities', label: 'Humanities & Arts' }
    ];

    const toggleInterest = (id: string) => {
      const current = data.interests || [];
      if (current.includes(id)) {
        updateData({ interests: current.filter(x => x !== id) });
      } else {
        updateData({ interests: [...current, id] });
      }
    };

    return (
      <div className="space-y-4 text-left animate-fadeIn">
        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Subject Interests <span className="text-blue-600">*</span>
        </span>
        <p className="text-[10px] text-slate-400 font-medium">Select your favorite subjects to customize course suggestions (minimum 1).</p>

        <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
          {interests.map((item) => {
            const isSelected = data.interests?.includes(item.id) || false;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleInterest(item.id)}
                className={`p-3.5 rounded-xl text-left transition-all border flex flex-col justify-between h-24 ${
                  isSelected
                    ? 'border-2 border-blue-600 bg-blue-50/10 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-350'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors self-end ${
                  isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </div>
                <span className="text-xs font-bold text-slate-900 leading-tight block">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Step 7: Learning Preferences
  if (stepId === 7) {
    const preferences = [
      { id: 'visual', label: 'Visual & Video Lectures', desc: 'Watch video presentations, interactive animations, and visual diagrams.', icon: Video },
      { id: 'hands-on', label: 'Hands-on Projects', desc: 'Write code, build mock models, and learn by active doing.', icon: Terminal },
      { id: 'reading', label: 'Reading & Writing text', desc: 'Read curated document libraries, study textbooks, and summarize articles.', icon: FileText },
      { id: 'audio', label: 'Audio & Podcasts', desc: 'Listen to conceptual summaries, guest audio interviews, and podcasts.', icon: Headphones },
      { id: 'interactive', label: 'Gamified & Interactive Quizzes', desc: 'Test retention using flashcards, challenges, and spaced-repetition.', icon: Sparkles }
    ];

    return (
      <div className="space-y-4 text-left animate-fadeIn">
        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Learning Preference <span className="text-blue-600">*</span>
        </span>
        <p className="text-[10px] text-slate-400 font-medium">Choose your primary method to custom-tailor lesson formats.</p>

        <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
          {preferences.map((pref) => {
            const Icon = pref.icon;
            const isSelected = data.learningPreference === pref.id;
            return (
              <button
                key={pref.id}
                type="button"
                onClick={() => updateData({ learningPreference: pref.id as any })}
                className={`w-full flex items-start p-3.5 bg-white rounded-xl text-left transition-all border cursor-pointer ${
                  isSelected
                    ? 'border-2 border-blue-600 shadow-sm'
                    : 'border-slate-200 hover:border-slate-350'
                }`}
              >
                <div className={`p-2 rounded-lg mr-3.5 ${isSelected ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 pr-2">
                  <div className="text-xs font-bold text-slate-900">{pref.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-normal font-medium">{pref.desc}</div>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Step 8: Daily Commitment
  if (stepId === 8) {
    const commitments = [
      { id: 'casual', label: 'Casual Pace', duration: '10 min / day', desc: 'Perfect for light reading and maintaining streak points.', progress: 15 },
      { id: 'regular', label: 'Regular Study', duration: '25 min / day', desc: 'Standard track for consistent knowledge retention.', progress: 40 },
      { id: 'serious', label: 'Serious Track', duration: '45 min / day', desc: 'Deeper learning focus to master complex modules faster.', progress: 70 },
      { id: 'intensive', label: 'Intensive Shift', duration: '60+ min / day', desc: 'Fast-track career transition or exam certification prep.', progress: 100 }
    ];

    return (
      <div className="space-y-4 text-left animate-fadeIn">
        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Daily Commitment <span className="text-blue-600">*</span>
        </span>
        <p className="text-[10px] text-slate-400 font-medium">Establish a daily learning target. You can adjust this anytime.</p>

        <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
          {commitments.map((item) => {
            const isSelected = data.dailyCommitment === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => updateData({ dailyCommitment: item.id as any })}
                className={`w-full p-4 bg-white rounded-xl text-left transition-all border cursor-pointer ${
                  isSelected
                    ? 'border-2 border-blue-600 shadow-sm'
                    : 'border-slate-200 hover:border-slate-350'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{item.label}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{item.desc}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.duration}
                  </span>
                </div>
                
                {/* Horizontal Progress bar for visual premium design */}
                <div className="mt-3.5 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      isSelected ? 'bg-blue-600' : 'bg-slate-300'
                    }`} 
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Step 9: Personalization Settings
  if (stepId === 9) {
    const settings = [
      { 
        key: 'aiAdaptiveDifficulty', 
        label: 'Adaptive Difficulty', 
        desc: 'Dynamically adjust challenge levels based on response speed and error patterns.' 
      },
      { 
        key: 'aiStudyReminders', 
        label: 'AI Smart Study Reminders', 
        desc: 'Receive push alerts personalized to your peak intellectual focus times.' 
      },
      { 
        key: 'aiCareerInsights', 
        label: 'AI-Powered Career Insights', 
        desc: 'Map course progress directly against live industry job matching data.' 
      },
      { 
        key: 'aiConceptExplainer', 
        label: 'Modular Concept Explainer', 
        desc: 'Unlock instant simpler breakdowns when highlighting complex text blocks.' 
      }
    ];

    return (
      <div className="space-y-4 text-left animate-fadeIn">
        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          AI Co-Pilot Settings
        </span>
        <p className="text-[10px] text-slate-400 font-medium">Customize the autonomous AI learning assistant tools.</p>

        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {settings.map((item) => {
            const isEnabled = !!(data as any)[item.key];
            return (
              <div 
                key={item.key} 
                className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl transition-all"
              >
                <div className="flex-grow pr-4">
                  <span className="text-xs font-bold text-slate-900">{item.label}</span>
                  <p className="text-[9px] text-slate-500 mt-0.5 leading-relaxed font-medium">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateData({ [item.key]: !isEnabled })}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isEnabled ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      isEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Step 10: Notification Preferences
  if (stepId === 10) {
    const notifications = [
      { 
        key: 'notifyEmailDigest', 
        label: 'Weekly Email Digest', 
        desc: 'Comprehensive summary reports on your streak gains, completed modules, and roadmap suggestions.' 
      },
      { 
        key: 'notifyPush', 
        label: 'Immediate Push Notifications', 
        desc: 'Receive flash notifications for assignment grading, tutor responses, and forum comments.' 
      },
      { 
        key: 'notifyWeeklyAchievements', 
        label: 'Milestones & Badges alerts', 
        desc: 'Alerts when unlocking new learning milestones, credentials, and profile rewards.' 
      }
    ];

    return (
      <div className="space-y-4 text-left animate-fadeIn">
        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Notification Preferences
        </span>
        <p className="text-[10px] text-slate-400 font-medium">Control how and when you receive progress communications.</p>

        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {notifications.map((item) => {
            const isEnabled = !!(data as any)[item.key];
            return (
              <div 
                key={item.key} 
                className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl transition-all"
              >
                <div className="flex-grow pr-4">
                  <span className="text-xs font-bold text-slate-900">{item.label}</span>
                  <p className="text-[9px] text-slate-500 mt-0.5 leading-relaxed font-medium">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateData({ [item.key]: !isEnabled })}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isEnabled ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      isEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};
