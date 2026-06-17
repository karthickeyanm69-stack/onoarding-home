import { createClient } from '@supabase/supabase-js';
import { OnboardingData } from './types';

// Let's look up environment variables or custom-saved options
const defaultUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://jhvjbizzwaykqhpnblmv.supabase.co';
const defaultKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpodmpiaXp6d2F5a3FocG5ibG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjAxMTUsImV4cCI6MjA5NzE5NjExNX0.fxBaGpjtvrPLJPFnP0aEfP1oUhxbCbpQKKF5fhBd2jI';

// Save / Load custom credentials via client-side configuration
export function getStoredSupabaseCredentials() {
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

  const payload = {
    full_name: data.fullName,
    preferred_name: data.preferredName,
    gender: data.gender,
    education_level: data.educationLevel,
    field_of_study: data.fieldOfStudy,
    institution: data.institution,
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
