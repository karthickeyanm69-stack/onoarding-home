import React, { useState, useEffect, useRef } from 'react';
import { 
  Trash2, Edit, Check, ArrowLeft, User, Calendar, 
  AlertCircle, AlertTriangle, Settings, ChevronDown, Users, RefreshCw
} from 'lucide-react';
import { OnboardingData } from '../types';
import { fetchProfiles, deleteProfile, updateProfile, deleteProfiles } from '../supabase';

interface AdminDashboardProps {
  onBackToOnboarding: () => void;
  syncState: 'syncing' | 'synced' | 'offline';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToOnboarding, syncState }) => {
  const [profiles, setProfiles] = useState<OnboardingData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Navigation Tabs (All, In Progress, Drafts, Completed)
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'drafts' | 'completed'>('all');
  
  // Selected row for the "active highlight" pop-out style shown in reference image
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Active Dropdown context menu state
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Sorting states
  const [sortField, setSortField] = useState<'id' | 'name' | 'date' | 'step'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Interactive Date Range picker states (default covers all-time, cached in localStorage)
  const [startDate, setStartDate] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('ewe_admin_start_date');
      if (saved) return saved;
    } catch {}
    return '';
  });
  const [endDate, setEndDate] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('ewe_admin_end_date');
      if (saved) return saved;
    } catch {}
    return '';
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 7;

  // Modals & form edit states
  const [editingProfile, setEditingProfile] = useState<OnboardingData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Multiple Delete selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState<boolean>(false);

  // Close dropdown context menu on click outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdownId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Save selected date range to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem('ewe_admin_start_date', startDate);
      localStorage.setItem('ewe_admin_end_date', endDate);
    } catch (e) {
      console.error('Error saving date filters to localStorage', e);
    }
  }, [startDate, endDate]);

  // Reset row selection when filters or pages change to avoid off-screen batch operations
  useEffect(() => {
    setSelectedIds([]);
  }, [activeTab, searchQuery, startDate, endDate, currentPage, sortField, sortDirection]);

  // Reset current page to 1 when filters change to avoid empty pages on search/filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, startDate, endDate]);

  // Stable Mock/Real Data construction helpers
  const getProfileDate = (p: OnboardingData): Date => {
    const rawDate = p.createdAt || (p as any).created_at || (p as any).createdAt;
    if (rawDate) return new Date(rawDate);
    const hash = p.id ? p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 123;
    const daysAgo = hash % 20;
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d;
  };

  const getProfileStatus = (p: OnboardingData): 'Completed' | 'In Progress' | 'Draft' => {
    if ((p as any).completed === true) return 'Completed';
    const stepVal = (p as any).step || 1;
    if (stepVal >= 2) return 'In Progress';
    return 'Draft';
  };

  // Load profiles on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchProfiles();
      setProfiles(data);
      // Auto-select first item if available to show the beautiful active row style initially
      if (data.length > 0 && !selectedRowId) {
        setSelectedRowId(data[0].id || null);
      }
      setErrorMsg('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to fetch database profiles.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 3005);
    }
  };

  // Delete Action
  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteProfile(deletingId);
      showToast('Profile deleted successfully.');
      setDeletingId(null);
      await loadData();
    } catch (err: any) {
      console.error(err);
      showToast('Delete failed. Make sure your database DELETE policy is enabled.', true);
    } finally {
      setIsDeleting(false);
    }
  };

  // Multiple Delete Action
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      await deleteProfiles(selectedIds);
      showToast(`${selectedIds.length} profiles deleted successfully.`);
      setSelectedIds([]);
      setShowBulkDeleteModal(false);
      await loadData();
    } catch (err: any) {
      console.error(err);
      showToast('Bulk delete failed. Make sure your database DELETE policy is enabled.', true);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Edit Action - save updates
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile || !editingProfile.id) return;
    if (!editingProfile.fullName.trim()) {
      showToast('Full name is required.', true);
      return;
    }
    
    setSaving(true);
    try {
      const stepValue = (editingProfile as any).step || 10;
      const completedValue = (editingProfile as any).completed !== undefined 
        ? (editingProfile as any).completed 
        : true;

      await updateProfile(
        editingProfile.id, 
        editingProfile, 
        stepValue, 
        completedValue
      );
      
      showToast('Profile updated successfully.');
      setEditingProfile(null);
      await loadData();
    } catch (err: any) {
      console.error(err);
      showToast('Update failed. Try again.', true);
    } finally {
      setSaving(false);
    }
  };

  // Filter profiles based on Search, Tabs and Date Range
  const filteredProfiles = profiles.filter((p) => {
    // Search filter
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchesSearch = 
        p.fullName.toLowerCase().includes(q) ||
        p.preferredName.toLowerCase().includes(q) ||
        (p.educationLevel && p.educationLevel.toLowerCase().includes(q)) ||
        (p.fieldOfStudy && p.fieldOfStudy.toLowerCase().includes(q)) ||
        (p.institution && p.institution.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }

    // Status tab filter
    const status = getProfileStatus(p);
    if (activeTab === 'completed' && status !== 'Completed') return false;
    if (activeTab === 'in_progress' && status !== 'In Progress') return false;
    if (activeTab === 'drafts' && status !== 'Draft') return false;

    // Date range filter (optional)
    const profileDate = getProfileDate(p);
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0,0,0,0);
      if (profileDate < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23,59,59,999);
      if (profileDate > end) return false;
    }

    return true;
  });

  // Sort profiles
  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    if (sortField === 'name') {
      const nameA = a.fullName.trim();
      const nameB = b.fullName.trim();
      if (nameA === nameB) return 0;
      if (!nameA) return sortDirection === 'asc' ? 1 : -1;
      if (!nameB) return sortDirection === 'asc' ? -1 : 1;

      const charA = nameA.charAt(0);
      const charB = nameB.charAt(0);

      const isLetterA = /^[a-zA-Z]/.test(charA);
      const isLetterB = /^[a-zA-Z]/.test(charB);

      const isDigitA = /^[0-9]/.test(charA);
      const isDigitB = /^[0-9]/.test(charB);

      // Category priorities: Letters (1) > Numbers (2) > Emojis/Symbols (3)
      let categoryA = 3;
      if (isLetterA) categoryA = 1;
      else if (isDigitA) categoryA = 2;

      let categoryB = 3;
      if (isLetterB) categoryB = 1;
      else if (isDigitB) categoryB = 2;

      if (categoryA !== categoryB) {
        const diff = categoryA - categoryB;
        return sortDirection === 'asc' ? diff : -diff;
      }

      // Same category, standard locale comparison
      const comp = nameA.localeCompare(nameB, undefined, { sensitivity: 'base', numeric: true });
      return sortDirection === 'asc' ? comp : -comp;
    }

    let valA: any = '';
    let valB: any = '';
    
    if (sortField === 'id') {
      valA = a.id || '';
      valB = b.id || '';
    } else if (sortField === 'date') {
      valA = getProfileDate(a).getTime();
      valB = getProfileDate(b).getTime();
    } else if (sortField === 'step') {
      valA = (a as any).step || 1;
      valB = (b as any).step || 1;
    }
    
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalItems = sortedProfiles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Guard against currentPage being out of range (e.g. during search filter application)
  const activePage = Math.min(Math.max(1, currentPage), totalPages);
  const indexOfLastItem = activePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProfiles.slice(indexOfFirstItem, indexOfLastItem);

  // Page selection states & togglers
  const pageIds = currentItems.map(p => p.id).filter((id): id is string => !!id);
  const selectedPageIds = selectedIds.filter(id => pageIds.includes(id));
  const isAllPageSelected = pageIds.length > 0 && selectedPageIds.length === pageIds.length;
  const isSomePageSelected = selectedPageIds.length > 0 && selectedPageIds.length < pageIds.length;

  const masterCheckboxRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = isSomePageSelected;
    }
  }, [isSomePageSelected]);

  const handleToggleSelectAllPage = () => {
    if (isAllPageSelected) {
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedIds(prev => {
        const otherIds = prev.filter(id => !pageIds.includes(id));
        return [...otherIds, ...pageIds];
      });
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  // Set selected ID to first item on page/data changes
  useEffect(() => {
    if (currentItems.length > 0) {
      const idsOnPage = currentItems.map(item => item.id);
      if (!selectedRowId || !idsOnPage.includes(selectedRowId)) {
        setSelectedRowId(currentItems[0].id || null);
      }
    } else {
      setSelectedRowId(null);
    }
  }, [currentPage, activeTab, sortField, sortDirection, startDate, endDate]);

  // Metrics & counts
  const totalCount = profiles.length;

  const handleSort = (field: 'id' | 'name' | 'date' | 'step') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="w-full max-w-6xl h-[680px] bg-white rounded-[32px] border border-slate-200/80 shadow-2xl flex overflow-hidden font-sans select-none relative animate-fadeIn">
      
      {/* ======================================================== */}
      {/* 1. LEFT SIDEBAR                                         */}
      {/* ======================================================== */}
      <div className="w-[210px] bg-[#0052ff] shrink-0 py-6 flex flex-col justify-between text-white relative">
        <div className="w-full space-y-8">
          {/* Logo Brand */}
          <div className="flex items-center gap-2 pl-6">
            <span className="font-bold text-lg font-display tracking-tight text-white select-none">eOnboard</span>
          </div>

          {/* Navigation Links */}
          <div className="w-full space-y-1">
            <button className="w-full flex items-center gap-3 pl-6 pr-3 py-2.5 text-xs font-bold sidebar-active-tab cursor-pointer">
              <Users className="w-4 h-4" />
              Profiles
            </button>
            <button 
              onClick={onBackToOnboarding}
              className="w-full flex items-center gap-3 pl-6 pr-3 py-2 text-xs font-semibold rounded-xl text-white/70 hover:bg-white/10 transition-all cursor-pointer border-t border-white/10 mt-4 pt-4"
            >
              <ArrowLeft className="w-4 h-4" />
              User App
            </button>
          </div>
        </div>

        {/* Footer / Social links */}
        <div className="space-y-4 pl-6 select-none">
          <div className="text-[10px] text-white/60 space-x-3 font-semibold tracking-wide">
            <span className="hover:underline hover:text-white cursor-pointer transition-colors">Facebook</span>
            <span className="hover:underline hover:text-white cursor-pointer transition-colors">Twitter</span>
            <span className="hover:underline hover:text-white cursor-pointer transition-colors">Google</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN WORKSPACE CONTAINER                             */}
      {/* ======================================================== */}
      <div className="flex-1 bg-white p-7 flex flex-col justify-between overflow-hidden relative">
        
        {/* top header bar */}
        <div className="space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-display">Profiles</h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{totalCount} profiles found</p>
              </div>
              <button
                onClick={loadData}
                disabled={loading}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-650 hover:text-blue-600 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
                title="Refresh profiles"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filtering tabs and dates */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex gap-5 text-xs font-semibold text-slate-400">
              <button 
                onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                className={`pb-1 cursor-pointer transition-colors relative ${activeTab === 'all' ? 'text-slate-900 font-bold' : 'hover:text-slate-650'}`}
              >
                All profiles
                {activeTab === 'all' && <div className="absolute bottom-[-13px] left-0 right-0 h-[3px] bg-[#0052ff] rounded-full" />}
              </button>
              <button 
                onClick={() => { setActiveTab('in_progress'); setCurrentPage(1); }}
                className={`pb-1 cursor-pointer transition-colors relative ${activeTab === 'in_progress' ? 'text-slate-900 font-bold' : 'hover:text-slate-650'}`}
              >
                In Progress
                {activeTab === 'in_progress' && <div className="absolute bottom-[-13px] left-0 right-0 h-[3px] bg-[#0052ff] rounded-full" />}
              </button>
              <button 
                onClick={() => { setActiveTab('drafts'); setCurrentPage(1); }}
                className={`pb-1 cursor-pointer transition-colors relative ${activeTab === 'drafts' ? 'text-slate-900 font-bold' : 'hover:text-slate-655'}`}
              >
                Drafts
                {activeTab === 'drafts' && <div className="absolute bottom-[-13px] left-0 right-0 h-[3px] bg-[#0052ff] rounded-full" />}
              </button>
              <button 
                onClick={() => { setActiveTab('completed'); setCurrentPage(1); }}
                className={`pb-1 cursor-pointer transition-colors relative ${activeTab === 'completed' ? 'text-slate-900 font-bold' : 'hover:text-slate-650'}`}
              >
                Completed
                {activeTab === 'completed' && <div className="absolute bottom-[-13px] left-0 right-0 h-[3px] bg-[#0052ff] rounded-full" />}
              </button>
            </div>

            {/* Date filter pickers */}
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1.5 shadow-sm select-none">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent outline-none text-[10px] font-mono cursor-pointer text-slate-700"
              />
              <span className="text-slate-400 px-0.5 text-[9px] font-bold">To</span>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent outline-none text-[10px] font-mono cursor-pointer text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Floating compact search drawer */}
        <div className="flex items-center gap-2 mt-2 px-1 relative shrink-0">
          <input
            id="search-input"
            type="text"
            placeholder="Search profiles by name, email, or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200/80 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all font-medium text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Database notification overlays */}
        {successMsg && (
          <div className="mt-2 mx-1 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] text-emerald-750 font-semibold flex items-center gap-1.5 shrink-0 animate-fadeIn z-15">
            <Check className="w-3.5 h-3.5 text-emerald-650" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mt-2 mx-1 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl text-[10px] text-rose-700 font-semibold flex items-center gap-1.5 shrink-0 animate-fadeIn z-15">
            <AlertCircle className="w-3.5 h-3.5 text-rose-650" />
            {errorMsg}
          </div>
        )}

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="mt-2 mx-1 px-4 py-2 bg-[#0052ff]/10 border border-[#0052ff]/20 rounded-xl flex items-center justify-between animate-fadeIn shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0052ff]">
                {selectedIds.length} profiles selected
              </span>
              <button 
                onClick={() => setSelectedIds([])}
                className="text-[10px] font-bold text-[#0052ff] hover:underline cursor-pointer"
              >
                Clear selection
              </button>
            </div>
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              Delete Selected
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. PROFILES TABLE                                       */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 custom-scrollbar min-h-0">
          
          {/* Table Header Labels */}
          <div className="grid grid-cols-12 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none shrink-0 mb-1">
            <div 
              onClick={() => handleSort('id')} 
              className="col-span-3 flex items-center gap-2 cursor-pointer hover:text-slate-600"
            >
              <input
                type="checkbox"
                ref={masterCheckboxRef}
                checked={isAllPageSelected}
                onChange={handleToggleSelectAllPage}
                onClick={(e) => e.stopPropagation()}
                className="rounded border-slate-300 text-[#0052ff] focus:ring-blue-500/20 w-3.5 h-3.5 cursor-pointer shrink-0"
              />
              User / Id {sortField === 'id' ? (sortDirection === 'asc' ? '▴' : '▾') : <span className="text-slate-300">▴</span>}
            </div>
            <div className="col-span-2">Gender</div>
            <div className="col-span-2">Education</div>
            <div className="col-span-2">Field of Study</div>
            <div className="col-span-2">Institution</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-xs gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-[#0052ff] border-t-transparent animate-spin" />
              <span>Loading profiles from database...</span>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="text-center py-20 text-slate-400 text-xs font-semibold">
              No matching profiles found.
            </div>
          ) : (
            currentItems.map((p, index) => {
              const globalIndex = indexOfFirstItem + index + 1;
              const displayId = `#10${globalIndex.toString().padStart(2, '0')}`;
              const isSelected = selectedRowId === p.id;
              
              const status = getProfileStatus(p);
              const stepVal = (p as any).step || 1;
              const profileDate = getProfileDate(p);

              // Location construct
              const locationStr = [p.city, p.state, p.country].filter(Boolean).join(', ');
              const displayLocation = locationStr || 'Skipped / Remote';

              // Occupation & Education construct
              const occupationStr = p.occupation 
                ? p.occupation.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                : '';
              const educationStr = p.educationLevel
                ? p.educationLevel.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                : '';

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedRowId(p.id || null)}
                  className={`grid grid-cols-12 items-center px-4 py-2.5 rounded-xl border border-slate-100 table-row-interactive ${
                    isSelected 
                      ? 'active-row-highlight' 
                      : 'bg-slate-50/40 border-slate-100 hover:border-slate-200 text-slate-700'
                  }`}
                >
                  {/* User / ID */}
                  <div className="col-span-3 flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id || '')}
                      onChange={() => handleToggleSelect(p.id || '')}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-slate-300 text-[#0052ff] focus:ring-blue-500/20 w-3.5 h-3.5 cursor-pointer shrink-0"
                    />
                    <div className={`w-8 h-8 rounded-full overflow-hidden shrink-0 border flex items-center justify-center ${isSelected ? 'border-white/40 bg-white/25' : 'border-slate-200 bg-slate-100'}`}>
                      {p.profileImg ? (
                        <img src={p.profileImg} alt="user" className="w-full h-full object-cover" />
                      ) : (
                        <User className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      )}
                    </div>
                    <div className="truncate min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-[10px] font-bold font-mono ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>{displayId}</span>
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {p.fullName || 'Anonymous'}
                        </span>
                      </div>
                      {p.preferredName && p.preferredName !== p.fullName.split(' ')[0] && (
                        <div className={`text-[10px] font-semibold truncate ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                          Pref: {p.preferredName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gender */}
                  <div className={`col-span-2 text-[11px] font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                    {p.gender || 'Not specified'}
                  </div>

                  {/* Education */}
                  <div className={`col-span-2 text-[11px] font-semibold truncate capitalize ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                    {p.educationLevel?.replace('-', ' ') || 'Undergraduate'}
                  </div>

                  {/* Field of Study */}
                  <div className={`col-span-2 text-[11px] font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                    {p.fieldOfStudy || '—'}
                  </div>

                  {/* Institution */}
                  <div className={`col-span-2 text-[11px] font-semibold truncate pr-2 ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                    <div className="truncate">{p.institution || '—'}</div>
                    <div className={`text-[9px] ${isSelected ? 'text-blue-200' : 'text-slate-400'} font-mono mt-0.5`}>
                      Reg: {formatDateDisplay(profileDate)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-center items-center gap-1.5 relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProfile({ ...p });
                      }}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                      }`}
                      title="Edit details"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownId(activeDropdownId === p.id ? null : (p.id || null));
                      }}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                      }`}
                      title="More actions"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Compact Dropdown Bubble Menu */}
                    {activeDropdownId === p.id && (
                      <div 
                        className="absolute right-0 top-7 w-32 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 text-left text-slate-700 animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setEditingProfile({ ...p });
                            setActiveDropdownId(null);
                          }}
                          className="w-full px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer font-bold text-slate-700"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-600" />
                          Modify Row
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(p.id || null);
                            setActiveDropdownId(null);
                          }}
                          className="w-full px-3 py-1.5 text-xs hover:bg-rose-50 text-rose-600 flex items-center gap-1.5 cursor-pointer font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Row
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ======================================================== */}
        {/* 4. PAGINATION FOOTER CONTROL PANEL                      */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 shrink-0 select-none">
          <span className="text-[10px] text-slate-400 font-mono font-bold">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} profiles
          </span>
          
          <div className="flex items-center gap-2">
            <button
              disabled={activePage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:hover:text-slate-400 cursor-pointer transition-colors font-bold text-xs"
            >
              &lt;
            </button>
            
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isPageActive = activePage === pageNum;
              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-6 h-6 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    isPageActive
                      ? 'text-[#0052ff] scale-110 font-black'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              disabled={activePage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:hover:text-slate-400 cursor-pointer transition-colors font-bold text-xs"
            >
              &gt;
            </button>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 5. EDIT SLIDE-OVER DRAWER                                */}
      {/* ======================================================== */}
      {editingProfile && (
        <div 
          className="absolute inset-0 bg-slate-950/60 z-40 flex justify-end pointer-events-auto cursor-pointer animate-fadeIn" 
          onClick={() => setEditingProfile(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[360px] h-full bg-white border-l border-slate-200 p-5 overflow-y-auto custom-scrollbar flex flex-col cursor-default"
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-display">
                <Edit className="w-4 h-4 text-[#0052ff]" />
                Modify User Details
              </h3>
              <button 
                onClick={() => setEditingProfile(null)}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 flex-1">
              
              {/* Identity Segment */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-mono tracking-widest text-[#2563EB] uppercase font-bold block">
                  Identity Details
                </span>
                
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editingProfile.fullName}
                      onChange={(e) => setEditingProfile(prev => prev ? ({ ...prev, fullName: e.target.value }) : null)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Preferred Name</label>
                    <input
                      type="text"
                      value={editingProfile.preferredName}
                      onChange={(e) => setEditingProfile(prev => prev ? ({ ...prev, preferredName: e.target.value }) : null)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Gender</label>
                  <select
                    value={editingProfile.gender}
                    onChange={(e: any) => setEditingProfile(prev => prev ? ({ ...prev, gender: e.target.value }) : null)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="">Choose...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-Binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Academic Segment */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <span className="text-[9px] font-mono tracking-widest text-[#2563EB] uppercase font-bold block">
                  Academic Details
                </span>
                
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Education Level</label>
                    <select
                      value={editingProfile.educationLevel}
                      onChange={(e: any) => setEditingProfile(prev => prev ? ({ ...prev, educationLevel: e.target.value }) : null)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="">Choose...</option>
                      <option value="high-school">High School</option>
                      <option value="undergraduate">Undergraduate Degree</option>
                      <option value="postgraduate">Postgraduate Degree</option>
                      <option value="doctorate">Doctorate</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Field of Study</label>
                    <input
                      type="text"
                      value={editingProfile.fieldOfStudy}
                      onChange={(e) => setEditingProfile(prev => prev ? ({ ...prev, fieldOfStudy: e.target.value }) : null)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">School / Institution</label>
                    <input
                      type="text"
                      value={editingProfile.institution}
                      onChange={(e) => setEditingProfile(prev => prev ? ({ ...prev, institution: e.target.value }) : null)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Step and completion state */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <span className="text-[9px] font-mono tracking-widest text-[#2563EB] uppercase font-bold block">
                  App Progress Status
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Step Location</label>
                    <select
                      value={(editingProfile as any).step || 3}
                      onChange={(e: any) => setEditingProfile(prev => prev ? ({ ...prev, step: parseInt(e.target.value, 10) }) : null)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="1">Step 1</option>
                      <option value="2">Step 2</option>
                      <option value="3">Step 3</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Onboarding State</label>
                    <select
                      value={(editingProfile as any).completed === true ? 'true' : 'false'}
                      onChange={(e: any) => setEditingProfile(prev => prev ? ({ ...prev, completed: e.target.value === 'true' }) : null)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="false">Active Draft</option>
                      <option value="true">Onboarded / Done</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase transition-colors shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {saving && <div className="w-3.5 h-3.5 rounded-full border border-white border-t-transparent animate-spin" />}
                  Apply Updates
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. DELETE CONFIRMATION MODAL                             */}
      {/* ======================================================== */}
      {deletingId && (
        <div className="absolute inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 pointer-events-auto cursor-pointer animate-fadeIn" onClick={() => setDeletingId(null)}>
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[280px] bg-white rounded-2xl border border-slate-150 p-4 text-center cursor-default space-y-3 shadow-2xl"
          >
            <div className="mx-auto w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
            </div>
            
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-display">Delete Profile?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this onboarding record? This action cannot be undone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer"
              >
                {isDeleting && <div className="w-3.5 h-3.5 rounded-full border border-white border-t-transparent animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. BULK DELETE CONFIRMATION MODAL                        */}
      {/* ======================================================== */}
      {showBulkDeleteModal && (
        <div className="absolute inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 pointer-events-auto cursor-pointer animate-fadeIn" onClick={() => setShowBulkDeleteModal(false)}>
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[280px] bg-white rounded-2xl border border-slate-150 p-4 text-center cursor-default space-y-3 shadow-2xl"
          >
            <div className="mx-auto w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
            </div>
            
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-display">Delete Profiles?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete the {selectedIds.length} selected onboarding records? This action cannot be undone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={handleBulkDelete}
                className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer"
              >
                {isBulkDeleting && <div className="w-3.5 h-3.5 rounded-full border border-white border-t-transparent animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
