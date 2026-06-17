import { createClient } from '@supabase/supabase-js';
import { OnboardingData } from './types';

// Let's look up environment variables or custom-saved options
const isLocal = (import.meta as any).env?.DEV === true || (typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.startsWith('10.') ||
  window.location.hostname.startsWith('172.')
));
const localHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const defaultUrl = (import.meta as any).env?.VITE_SUPABASE_URL || (isLocal ? `http://${localHost}:3000` : 'https://jhvjbizzwaykqhpnblmv.supabase.co');
const defaultKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (isLocal ? 'dummy-local-key-value-1234567890' : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpodmpiaXp6d2F5a3FocG5ibG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjAxMTUsImV4cCI6MjA5NzE5NjExNX0.fxBaGpjtvrPLJPFnP0aEfP1oUhxbCbpQKKF5fhBd2jI');

// Save / Load custom credentials via client-side configuration
export function getStoredSupabaseCredentials() {
  try {
    const url = localStorage.getItem('ewe_supabase_url');
    const key = localStorage.getItem('ewe_supabase_key');
    if (url && key) {
      return { url, key };
    }
  } catch (e) {
    console.error('Error reading localStorage credentials', e);
  }
  return { 
    url: defaultUrl, 
    key: defaultKey 
  };
}

export function saveSupabaseCredentials(url: string, key: string) {
  try {
    localStorage.setItem('ewe_supabase_url', url);
    localStorage.setItem('ewe_supabase_key', key);
  } catch (e) {
    console.error('Error saving credentials to local storage', e);
  }
}

export function clearSupabaseCredentials() {
  try {
    localStorage.removeItem('ewe_supabase_url');
    localStorage.removeItem('ewe_supabase_key');
  } catch (e) {
    console.error('Error removing credentials', e);
  }
}

// Get client loader
export function getSupabaseClient() {
  const { url, key } = getStoredSupabaseCredentials();
  if (!url || !key) {
    return null;
  }
  try {
    // Create & return client
    return createClient(url, key);
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e);
    return null;
  }
}

/**
 * Sync profile data to Supabase database.
 * If Supabase is not configured or fails, it throws an error so we can display the offline state.
 */
export async function syncProfileToCloud(data: OnboardingData, currentStep: number, isCompleted: boolean): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const isIndependentAdult = data.parentName === 'SKIPPED';

  const payload = {
    full_name: data.fullName,
    preferred_name: data.preferredName,
    gender: data.gender,
    education_level: data.educationLevel,
    field_of_study: data.fieldOfStudy,
    institution: data.institution,
    // For independent adults: store null for parent fields, but flag is_independent_adult = true
    is_independent_adult: isIndependentAdult,
    parent_name: isIndependentAdult ? null : (data.parentName || null),
    parent_email: isIndependentAdult ? null : (data.parentEmail || null),
    parent_phone: isIndependentAdult ? null : (data.parentPhone || null),
    parent_relationship: isIndependentAdult ? null : (data.parentRelationship || null),
    learning_goals: data.learningGoals,
    interests: data.interests,
    learning_preference: data.learningPreference,
    daily_commitment: data.dailyCommitment,
    ai_adaptive_difficulty: data.aiAdaptiveDifficulty,
    ai_study_reminders: data.aiStudyReminders,
    ai_career_insights: data.aiCareerInsights,
    ai_concept_explainer: data.aiConceptExplainer,
    notify_email_digest: data.notifyEmailDigest,
    notify_push: data.notifyPush,
    notify_weekly_achievements: data.notifyWeeklyAchievements,
    step: currentStep,
    completed: isCompleted,
    updated_at: new Date().toISOString()
  };

  // If we already have a record ID, perform an update. Else, insert and return the new ID.
  if (data.id && data.id.length > 10) {
    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', data.id);

    if (error) {
      console.error('Supabase update failure:', error);
      throw error;
    }
    return data.id;
  } else {
    const { data: inserted, error } = await supabase
      .from('profiles')
      .insert([payload])
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert failure:', error);
      throw error;
    }
    
    const record = Array.isArray(inserted) ? inserted[0] : inserted;
    return record?.id || '';
  }
}

/**
 * Fetch all onboarding profiles from database.
 */
export async function fetchProfiles(): Promise<OnboardingData[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Supabase select failure:', error);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    fullName: row.full_name || '',
    preferredName: row.preferred_name || '',
    gender: row.gender || '',
    educationLevel: row.education_level || '',
    fieldOfStudy: row.field_of_study || '',
    institution: row.institution || '',
    // If is_independent_adult flag is set, restore the 'SKIPPED' sentinel value for frontend logic
    parentName: row.is_independent_adult ? 'SKIPPED' : (row.parent_name || ''),
    parentEmail: row.parent_email || '',
    parentPhone: row.parent_phone || '',
    parentRelationship: row.parent_relationship || '',
    learningGoals: row.learning_goals || [],
    interests: row.interests || [],
    learningPreference: row.learning_preference || '',
    dailyCommitment: row.daily_commitment || '',
    aiAdaptiveDifficulty: row.ai_adaptive_difficulty !== undefined ? row.ai_adaptive_difficulty : true,
    aiStudyReminders: row.ai_study_reminders !== undefined ? row.ai_study_reminders : true,
    aiCareerInsights: row.ai_career_insights !== undefined ? row.ai_career_insights : false,
    aiConceptExplainer: row.ai_concept_explainer !== undefined ? row.ai_concept_explainer : true,
    notifyEmailDigest: row.notify_email_digest !== undefined ? row.notify_email_digest : true,
    notifyPush: row.notify_push !== undefined ? row.notify_push : true,
    notifyWeeklyAchievements: row.notify_weekly_achievements !== undefined ? row.notify_weekly_achievements : true,
    createdAt: row.created_at,
    step: row.step,
    completed: row.completed
  }));
}

/**
 * Delete a profile by ID.
 */
export async function deleteProfile(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase delete failure:', error);
    throw error;
  }
}

/**
 * Delete multiple profiles by IDs.
 */
export async function deleteProfiles(ids: string[]): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from('profiles')
    .delete()
    .in('id', ids);

  if (error) {
    console.error('Supabase batch delete failure:', error);
    throw error;
  }
}


/**
 * Update any profile fields.
 */
export async function updateProfile(
  id: string,
  updates: Partial<OnboardingData>,
  currentStep: number,
  isCompleted: boolean
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const payload: any = {};
  if (updates.fullName !== undefined) payload.full_name = updates.fullName;
  if (updates.preferredName !== undefined) payload.preferred_name = updates.preferredName;
  if (updates.gender !== undefined) payload.gender = updates.gender;
  if (updates.educationLevel !== undefined) payload.education_level = updates.educationLevel;
  if (updates.fieldOfStudy !== undefined) payload.field_of_study = updates.fieldOfStudy;
  if (updates.institution !== undefined) payload.institution = updates.institution;
  if (updates.parentName !== undefined) {
    const isIndependent = updates.parentName === 'SKIPPED';
    payload.is_independent_adult = isIndependent;
    payload.parent_name = isIndependent ? null : (updates.parentName || null);
    payload.parent_email = isIndependent ? null : (updates.parentEmail ?? undefined);
    payload.parent_phone = isIndependent ? null : (updates.parentPhone ?? undefined);
    payload.parent_relationship = isIndependent ? null : (updates.parentRelationship ?? undefined);
  } else {
    if (updates.parentEmail !== undefined) payload.parent_email = updates.parentEmail;
    if (updates.parentPhone !== undefined) payload.parent_phone = updates.parentPhone;
    if (updates.parentRelationship !== undefined) payload.parent_relationship = updates.parentRelationship;
  }
  if (updates.learningGoals !== undefined) payload.learning_goals = updates.learningGoals;
  if (updates.interests !== undefined) payload.interests = updates.interests;
  if (updates.learningPreference !== undefined) payload.learning_preference = updates.learningPreference;
  if (updates.dailyCommitment !== undefined) payload.daily_commitment = updates.dailyCommitment;
  if (updates.aiAdaptiveDifficulty !== undefined) payload.ai_adaptive_difficulty = updates.aiAdaptiveDifficulty;
  if (updates.aiStudyReminders !== undefined) payload.ai_study_reminders = updates.aiStudyReminders;
  if (updates.aiCareerInsights !== undefined) payload.ai_career_insights = updates.aiCareerInsights;
  if (updates.aiConceptExplainer !== undefined) payload.ai_concept_explainer = updates.aiConceptExplainer;
  if (updates.notifyEmailDigest !== undefined) payload.notify_email_digest = updates.notifyEmailDigest;
  if (updates.notifyPush !== undefined) payload.notify_push = updates.notifyPush;
  if (updates.notifyWeeklyAchievements !== undefined) payload.notify_weekly_achievements = updates.notifyWeeklyAchievements;

  payload.step = currentStep;
  payload.completed = isCompleted;
  payload.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('Supabase update failure:', error);
    throw error;
  }
}
