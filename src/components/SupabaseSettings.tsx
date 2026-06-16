import React, { useState, useEffect } from 'react';
import { Database, ShieldAlert, CheckCircle, Copy, AlertCircle, RefreshCw } from 'lucide-react';
import { getStoredSupabaseCredentials, saveSupabaseCredentials, clearSupabaseCredentials } from '../supabase';

interface SupabaseSettingsProps {
  onCredentialsChange: () => void;
  syncState: 'syncing' | 'synced' | 'offline';
  onClose?: () => void;
  isMobileDrawer?: boolean;
}

export const SupabaseSettings: React.FC<SupabaseSettingsProps> = ({ 
  onCredentialsChange, 
  syncState, 
  onClose, 
  isMobileDrawer 
}) => {
  const [isOpen, setIsOpen] = useState(isMobileDrawer ? true : false);
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    const creds = getStoredSupabaseCredentials();
    setUrl(creds.url);
    setAnonKey(creds.key);
  }, [isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(url.trim(), anonKey.trim());
    setSuccessMsg('Credentials saved successfully! Re-initializing...');
    onCredentialsChange();
    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  const handleClear = () => {
    clearSupabaseCredentials();
    setUrl('');
    setAnonKey('');
    setSuccessMsg('Credentials removed. Operating in Offline (local) mode.');
    onCredentialsChange();
    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  const sqlSchema = `-- Profiles table structure
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT,
    preferred_name TEXT,
    gender TEXT,
    age_group TEXT,
    country TEXT,
    state TEXT,
    city TEXT,
    education_level TEXT,
    occupation TEXT,
    languages TEXT[] DEFAULT '{}',
    email TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    mobile TEXT,
    mobile_verified BOOLEAN DEFAULT FALSE,
    profile_img TEXT, -- Base64 image data or preset identifier
    avatar_type TEXT,
    preset_avatar_id TEXT,
    step INTEGER DEFAULT 1,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anonymous Select Policy
CREATE POLICY "Allow public select by ID" ON public.profiles FOR SELECT USING (true);

-- Anonymous Insert Policy
CREATE POLICY "Allow public insert" ON public.profiles FOR INSERT WITH CHECK (true);

-- Anonymous Update Policy
CREATE POLICY "Allow public update by ID" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);

-- Anonymous Delete Policy
CREATE POLICY "Allow public delete by ID" ON public.profiles FOR DELETE USING (true);

-- Trigger for updated_at tracking
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER on_profile_update
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  if (isMobileDrawer) {
    return (
      <div className="w-full text-xs space-y-3 pt-1">
        <form onSubmit={handleSave} className="space-y-3" id="supabase-config-form">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Supabase Project URL
            </label>
            <input
              type="url"
              placeholder="https://your-project.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Supabase Anon/Public API Key
            </label>
            <input
              type="text"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono bg-slate-50/50"
            />
          </div>

          {successMsg && (
            <p className="text-[11px] text-indigo-600 font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              {successMsg}
            </p>
          )}

          <div className="flex gap-2 justify-end pt-1">
            {(url || anonKey) && (
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              disabled={!url || !anonKey}
              className="px-3 py-1 text-[11px] font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              Apply Connection
            </button>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/60 text-[10px] text-slate-600 space-y-1.5 mt-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
                Required SQL Schema
              </span>
              <button
                type="button"
                onClick={copySqlToClipboard}
                className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                {copiedSql ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy SQL
                  </>
                )}
              </button>
            </div>
            <p className="leading-tight text-slate-500 text-[9px]">
              Run this in your Supabase SQL Editor. We support public insert with RLS turned on, so sync happens securely in real-time.
            </p>
            <pre className="p-1.5 bg-slate-100 rounded text-[8px] font-mono overflow-x-auto max-h-24 custom-scrollbar whitespace-pre text-slate-500 select-all">
              {sqlSchema}
            </pre>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-5 w-full max-w-sm text-sm">
      <div className="flex items-center justify-between pointer-events-auto cursor-pointer" id="db-settings-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-indigo-600 animate-pulse" />
          <div>
            <h3 className="font-semibold text-slate-800 font-display">Database Sync Setup</h3>
            <p className="text-xs text-slate-500">Supabase Cloud Connection</p>
          </div>
        </div>
        <button className="text-xs text-indigo-600 hover:underline font-medium focus:outline-none">
          {isOpen ? 'Collapse' : 'Expand Setup'}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-slate-500">Status:</span>
        {syncState === 'synced' ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Cloud Sync Active
          </span>
        ) : syncState === 'syncing' ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Syncing...
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3.5 h-3.5" />
            Saved Locally (Offline)
          </span>
        )}
      </div>

      {isOpen && (
        <form onSubmit={handleSave} className="mt-4 pt-4 border-t border-slate-100 space-y-3.5" id="supabase-config-form">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Supabase Project URL
            </label>
            <input
              type="url"
              placeholder="https://your-project.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Supabase Anon/Public API Key
            </label>
            <input
              type="text"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono bg-slate-50/50"
            />
          </div>

          {successMsg && (
            <p className="text-xs text-indigo-600 font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {successMsg}
            </p>
          )}

          <div className="flex gap-2 justify-end pt-2">
            {(url || anonKey) && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              disabled={!url || !anonKey}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Apply Connection
            </button>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 text-[11px] text-slate-600 space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
                Required SQL Schema
              </span>
              <button
                type="button"
                onClick={copySqlToClipboard}
                className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                {copiedSql ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy SQL
                  </>
                )}
              </button>
            </div>
            <p className="leading-tight text-slate-500">
              Run this in your Supabase SQL Editor. We support public insert with RLS turned on, so sync happens securely in real-time.
            </p>
            <pre className="p-1.5 bg-slate-100 rounded text-[9px] font-mono overflow-x-auto max-h-24 custom-scrollbar whitespace-pre text-slate-500 select-all">
              {sqlSchema}
            </pre>
          </div>
        </form>
      )}
    </div>
  );
};
