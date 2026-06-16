import { createClient } from '@supabase/supabase-js';
import { OnboardingData } from './types';

// Let's look up environment variables or custom-saved options
const defaultUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'http://localhost:3002';
const defaultKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'local-mock-key';

// Save / Load custom credentials via client-side configuration
export function getStoredSupabaseCredentials() {
  try {
    const url = localStorage.getItem('ewe_supabase_url') || defaultUrl;
    const key = localStorage.getItem('ewe_supabase_key') || defaultKey;
    return { url, key };
  } catch {
    return { url: defaultUrl, key: defaultKey };
  }
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
    age_group: data.ageGroup,
    country: data.country,
    state: data.state,
    city: data.city,
    education_level: data.educationLevel,
    occupation: data.occupation,
    languages: data.languages,
    email: data.email,
    email_verified: data.emailVerified,
    mobile: data.mobile,
    mobile_verified: data.mobileVerified,
    profile_img: data.profileImg,
    avatar_type: data.avatarType,
    preset_avatar_id: data.presetAvatarId,
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
    
    return inserted?.id || '';
  }
}
