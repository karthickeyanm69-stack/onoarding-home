export interface OnboardingData {
  id?: string;
  fullName: string;
  preferredName: string;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | '';
  educationLevel: 'high-school' | 'undergraduate' | 'postgraduate' | 'doctorate' | 'other' | '';
  fieldOfStudy: string;
  institution: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentRelationship: 'father' | 'mother' | 'guardian' | 'other' | '';
  learningGoals: string[];
  interests: string[];
  // Module 3: AI Personalization
  learningPreference: 'visual' | 'hands-on' | 'reading' | 'audio' | 'interactive' | '';
  dailyCommitment: 'casual' | 'regular' | 'serious' | 'intensive' | '';
  aiAdaptiveDifficulty: boolean;
  aiStudyReminders: boolean;
  aiCareerInsights: boolean;
  aiConceptExplainer: boolean;
  notifyEmailDigest: boolean;
  notifyPush: boolean;
  notifyWeeklyAchievements: boolean;
  createdAt?: string;
  step?: number;
  completed?: boolean;
}

export type OnboardingStepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;


