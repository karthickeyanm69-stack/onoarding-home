export interface OnboardingData {
  id?: string;
  fullName: string;
  preferredName: string;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | '';
  ageGroup: 'under-13' | '13-17' | '18-24' | '25-34' | '35-44' | '45+' | '';
  country: string;
  state: string;
  city: string;
  educationLevel: 'school' | 'higher-secondary' | 'diploma' | 'undergraduate' | 'postgraduate' | 'professional' | 'other' | '';
  occupation: 'student' | 'developer' | 'designer' | 'teacher' | 'business-owner' | 'freelancer' | 'job-seeker' | 'other' | '';
  languages: string[];
  email: string;
  emailVerified: boolean;
  mobile: string;
  mobileVerified: boolean;
  profileImg: string; // Base64 or preset image source URL
  avatarType: 'upload' | 'camera' | 'preset';
  presetAvatarId: string;
  createdAt?: string;
}

export type OnboardingStepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface PersonaDetails {
  title: string;
  gradient: string;
  tier: string;
  emoji: string;
  borderColor: string;
  description: string;
  accentColor: string;
}
