export interface OnboardingData {
  id?: string;
  fullName: string;
  preferredName: string;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | '';
  educationLevel: 'high-school' | 'undergraduate' | 'postgraduate' | 'doctorate' | 'other' | '';
  fieldOfStudy: string;
  institution: string;
  createdAt?: string;
  step?: number;
  completed?: boolean;
}

export type OnboardingStepId = 1 | 2 | 3;
