import React, { useState, useEffect, useRef } from 'react';
import { 
  Trash2, Edit, Check, ArrowLeft, User, Calendar, 
  AlertCircle, AlertTriangle, Settings, ChevronDown, Users, RefreshCw,
  LayoutDashboard, TrendingUp, BarChart3, Brain, ArrowUpRight, ArrowDownRight,
  Sparkles, GraduationCap, BookOpen, Clock, Activity, ShieldAlert, Award,
  Plus, Search, FileText, CheckCircle2, XCircle, PlusCircle, Download,
  UserCheck, Mail, History, CreditCard, ShieldCheck, Sliders, Bell
} from 'lucide-react';
import { OnboardingData } from '../types';
import { fetchProfiles, deleteProfile, updateProfile, deleteProfiles } from '../supabase';

interface AdminDashboardProps {
  onBackToOnboarding: () => void;
  syncState: 'syncing' | 'synced' | 'offline';
  theme: string;
  onThemeChange: (theme: string) => void;
}

interface Course {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  status: 'draft' | 'published';
  lessonsCount: number;
}

interface Quiz {
  id: string;
  title: string;
  question: string;
  options: string[];
  answerIndex: number;
}

interface MediaResource {
  id: string;
  title: string;
  type: 'video' | 'document' | 'slide';
  category: string;
  size: string;
}

interface AuditLog {
  time: string;
  action: string;
  user: string;
}

interface DeliveryReport {
  id: string;
  title: string;
  recipient: string;
  status: 'delivered' | 'failed' | 'pending';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onBackToOnboarding, 
  syncState,
  theme,
  onThemeChange
}) => {
  const [profiles, setProfiles] = useState<OnboardingData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAdminThemeDropdownOpen, setIsAdminThemeDropdownOpen] = useState<boolean>(false);
  
  // Navigation Tabs for Profiles (All, In Progress, Drafts, Completed)
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'drafts' | 'completed'>('all');
  
  // Sidebar tab navigation
  const [activeSidebarTab, setActiveSidebarTab] = useState<'overview' | 'kpis' | 'analytics' | 'insights' | 'students' | 'parents' | 'courses' | 'assessments' | 'certificates' | 'content' | 'notifications' | 'reports' | 'revenue' | 'settings' | 'admins'>('overview');

  // Parent search query
  const [parentSearchQuery, setParentSearchQuery] = useState<string>('');

  // Selected row for active highlight style
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Active Dropdown context menu state
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Sorting states
  const [sortField, setSortField] = useState<'id' | 'name' | 'date' | 'step'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Interactive Date Range picker states
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

  // Profile detail overlay state
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<OnboardingData | null>(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);

  // ==========================================
  // MODULE 2 MOCK STATE ENGINES
  // ==========================================
  const [coursesList, setCoursesList] = useState<Course[]>([
    { id: '1', title: 'Intro to Python Coding', category: 'Coding', difficulty: 'Beginner', status: 'published', lessonsCount: 8 },
    { id: '2', title: 'Fundamentals of Machine Learning', category: 'AI Studies', difficulty: 'Intermediate', status: 'published', lessonsCount: 12 },
    { id: '3', title: 'Responsive Web Design Basics', category: 'Web Dev', difficulty: 'Beginner', status: 'published', lessonsCount: 6 },
    { id: '4', title: 'Data Structures & Algorithms', category: 'Coding', difficulty: 'Advanced', status: 'draft', lessonsCount: 15 }
  ]);

  const [quizzesList, setQuizzesList] = useState<Quiz[]>([
    { id: '1', title: 'Loops & Conditionals', question: 'Which keyword defines a function in Python?', options: ['func', 'define', 'def', 'function'], answerIndex: 2 }
  ]);

  // Course Creator form states
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('Coding');
  const [newCourseDifficulty, setNewCourseDifficulty] = useState('Beginner');
  const [newCourseStatus, setNewCourseStatus] = useState<'draft' | 'published'>('draft');
  const [newCourseLessons, setNewCourseLessons] = useState<string[]>([]);
  const [lessonInput, setLessonInput] = useState('');

  // Quiz Creator form states
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizQuestion, setNewQuizQuestion] = useState('');
  const [quizOpt0, setQuizOpt0] = useState('');
  const [quizOpt1, setQuizOpt1] = useState('');
  const [quizOpt2, setQuizOpt2] = useState('');
  const [quizOpt3, setQuizOpt3] = useState('');
  const [newQuizAnswerIndex, setNewQuizAnswerIndex] = useState(0);

  // Certificate Verifier state
  const [certVerifyInput, setCertVerifyInput] = useState('');
  const [certVerifyResult, setCertVerifyResult] = useState<OnboardingData | null>(null);
  const [certVerifySearched, setCertVerifySearched] = useState(false);

  // ==========================================
  // MODULE 3 MOCK STATE ENGINES
  // ==========================================
  const [contentList, setContentList] = useState<MediaResource[]>([
    { id: '1', title: 'Introduction to EVE Platform', type: 'video', category: 'Orientation', size: '42 MB' },
    { id: '2', title: 'Python Reference Cheatsheet', type: 'document', category: 'Coding', size: '1.2 MB' },
    { id: '3', title: 'AI Foundations Lecture Slides', type: 'slide', category: 'AI Studies', size: '15.4 MB' }
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { time: '18:15', action: 'Synchronized onboarding profiles from cloud database', user: 'System' },
    { time: '17:30', action: 'Modified local environment credential settings', user: 'Coordinator' },
    { time: '16:45', action: 'Linked guardian contact verification tables', user: 'System' }
  ]);

  const [deliveryReports, setDeliveryReports] = useState<DeliveryReport[]>([
    { id: '1', title: 'Welcome Orientation Campaign', recipient: 'All Students', status: 'delivered' },
    { id: '2', title: 'Guardian Linkage Reminder Alert', recipient: 'Step 4 Stalled', status: 'delivered' }
  ]);

  // Content library form states
  const [newContentTitle, setNewContentTitle] = useState('');
  const [newContentType, setNewContentType] = useState<'video' | 'document' | 'slide'>('video');
  const [newContentCategory, setNewContentCategory] = useState('Coding');
  const [newContentSize, setNewContentSize] = useState('2.5 MB');

  // Notifications center form states
  const [newNotificationTitle, setNewNotificationTitle] = useState('');
  const [newNotificationRecipient, setNewNotificationRecipient] = useState('All Students');
  const [newNotificationBody, setNewNotificationBody] = useState('');

  // Settings mock states
  const [orgName, setOrgName] = useState('EVE Academy');
  const [orgEmail, setOrgEmail] = useState('admin@eve-platform.org');
  const [aiTemperature, setAiTemperature] = useState(0.7);

  // Admin roles list
  const [adminsList, setAdminsList] = useState([
    { id: '1', name: 'Coordinator Admin', role: 'Coordinator', status: 'Active' },
    { id: '2', name: 'AI Tutor System', role: 'System Admin', status: 'Active' },
    { id: '3', name: 'Onboarding Moderator', role: 'Teacher Manager', status: 'Active' }
  ]);

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

  // Reset row selection when filters or pages change
  useEffect(() => {
    setSelectedIds([]);
  }, [activeTab, searchQuery, startDate, endDate, currentPage, sortField, sortDirection]);

  // Reset current page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, startDate, endDate]);

  // Load profiles on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchProfiles();
      setProfiles(data);
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

  // Add system audit log helper
  const addAuditLog = (action: string, user = 'Coordinator') => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAuditLogs(prev => [{ time: timeStr, action, user }, ...prev]);
  };

  // Delete Action
  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteProfile(deletingId);
      showToast('Profile deleted successfully.');
      addAuditLog(`Deleted profile with ID: ${deletingId}`);
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
      addAuditLog(`Bulk deleted ${selectedIds.length} profiles`);
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
      addAuditLog(`Modified profile records for: ${editingProfile.fullName}`);
      setEditingProfile(null);
      await loadData();
    } catch (err: any) {
      console.error(err);
      showToast('Update failed. Try again.', true);
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // METRICS & ANALYTICS CALCULATIONS
  // ==========================================
  const totalStudents = profiles.length;
  const activeStudents = profiles.filter(p => (p.step || 1) > 1).length;
  const totalParents = profiles.filter(p => p.parentName && p.parentName !== 'SKIPPED').length;
  const completedCourses = profiles.filter(p => p.completed === true).length;
  
  const avgEngagement = totalStudents > 0 
    ? Math.round(profiles.reduce((acc, p) => {
        let score = (p.step || 1) * 10;
        if (p.dailyCommitment === 'intensive') score += 10;
        if (p.dailyCommitment === 'serious') score += 5;
        return acc + Math.min(score, 100);
      }, 0) / totalStudents)
    : 0;

  const growthRate = totalStudents > 0 ? "+12.4%" : "0.0%";

  const studentsAtRisk = profiles
    .filter(p => !p.completed && (p.step || 1) < 4)
    .slice(0, 4);

  const highPotentialLearners = profiles
    .filter(p => p.completed || (p.step || 1) >= 8)
    .slice(0, 4);

  // Filter out parents profiles
  const parentsList = profiles.filter(p => p.parentName && p.parentName !== 'SKIPPED');

  const getRecentActivities = () => {
    const events: { title: string; time: string; desc: string; type: string }[] = [];
    const sorted = [...profiles].sort((a, b) => {
      const dateA = a.createdAt || (a as any).created_at || new Date().toISOString();
      const dateB = b.createdAt || (b as any).created_at || new Date().toISOString();
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    sorted.slice(0, 5).forEach(p => {
      const dateStr = p.createdAt || (p as any).created_at;
      const formattedTime = dateStr 
        ? new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : 'Recently';
      const name = p.fullName || 'Anonymous';
      
      if (p.completed) {
        events.push({
          title: 'Course Setup Completed',
          time: formattedTime,
          desc: `${name} has finished setting up all onboarding details.`,
          type: 'completed'
        });
      } else if ((p.step || 1) >= 4 && p.parentName && p.parentName !== 'SKIPPED') {
        events.push({
          title: 'Parent linked successfully',
          time: formattedTime,
          desc: `${name} completed step 4 by linking guardian ${p.parentName}.`,
          type: 'parent'
        });
      } else {
        events.push({
          title: 'New Student Registered',
          time: formattedTime,
          desc: `${name} started the registration setup wizard.`,
          type: 'enrolled'
        });
      }
    });

    if (events.length === 0) {
      return [
        { title: 'System Online', time: '09:00', desc: 'No active student registrations detected.', type: 'system' }
      ];
    }
    return events;
  };

  const getProfileDate = (p: OnboardingData): Date => {
    const rawDate = p.createdAt || (p as any).created_at;
    if (rawDate) return new Date(rawDate);
    return new Date();
  };

  const getProfileStatus = (p: OnboardingData): 'Completed' | 'In Progress' | 'Draft' => {
    if ((p as any).completed === true) return 'Completed';
    const stepVal = (p as any).step || 1;
    if (stepVal >= 2) return 'In Progress';
    return 'Draft';
  };

  // Filter profiles based on Search, Tabs and Date Range
  const filteredProfiles = profiles.filter((p) => {
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

    const status = getProfileStatus(p);
    if (activeTab === 'completed' && status !== 'Completed') return false;
    if (activeTab === 'in_progress' && status !== 'In Progress') return false;
    if (activeTab === 'drafts' && status !== 'Draft') return false;

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
      return sortDirection === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
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
  const activePage = Math.min(Math.max(1, currentPage), totalPages);
  const indexOfLastItem = activePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProfiles.slice(indexOfFirstItem, indexOfLastItem);

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

  // Sparkline builder
  const Sparkline = ({ values, color = 'var(--eve-accent)' }: { values: number[], color?: string }) => {
    const height = 24;
    const width = 68;
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const points = values.map((val, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((val - min) / (max - min)) * (height - 4) - 2;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
      </svg>
    );
  };

  // Growth curve
  const GrowthChart = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const counts = [10, 18, 30, 48, 62, 62 + totalStudents];
    const maxVal = Math.max(...counts, 10) * 1.25;
    const chartHeight = 160;
    const chartWidth = 420;
    
    const points = counts.map((val, idx) => {
      const x = (idx / (counts.length - 1)) * (chartWidth - 50) + 30;
      const y = chartHeight - (val / maxVal) * (chartHeight - 40) - 25;
      return { x, y, val, label: months[idx] };
    });

    const pathD = points.reduce((acc, p, idx) => {
      if (idx === 0) return `M ${p.x} ${p.y}`;
      const prev = points[idx - 1];
      const cpX1 = prev.x + (p.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (p.x - prev.x) / 2;
      const cpY2 = p.y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - 25} L ${points[0].x} ${chartHeight - 25} Z`;

    return (
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-[160px] overflow-visible">
        <defs>
          <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--eve-accent)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--eve-accent)" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <line x1="30" y1={chartHeight - 25} x2={chartWidth - 20} y2={chartHeight - 25} stroke="#E2E8F0" strokeWidth="1" />
        <line x1="30" y1={chartHeight - 75} x2={chartWidth - 20} y2={chartHeight - 75} stroke="#F1F5F9" strokeWidth="1" />
        <line x1="30" y1={chartHeight - 125} x2={chartWidth - 20} y2={chartHeight - 125} stroke="#F1F5F9" strokeWidth="1" />

        <path d={areaD} fill="url(#growthGrad)" />
        <path d={pathD} fill="none" stroke="var(--eve-accent)" strokeWidth="2" strokeLinecap="round" />

        {points.map((p, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle cx={p.x} cy={p.y} r="3.5" fill="#FFFFFF" stroke="var(--eve-accent)" strokeWidth="1.5" className="transition-all duration-150 hover:r-[5px]" />
            <text x={p.x} y={chartHeight - 8} textAnchor="middle" className="text-[9px] fill-slate-400 font-mono font-semibold">{p.label}</text>
            <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
              <rect x={p.x - 22} y={p.y - 26} width="44" height="16" rx="4" fill="#0F172A" />
              <text x={p.x} y={p.y - 15} textAnchor="middle" className="text-[9px] fill-white font-mono font-bold">{p.val} Users</text>
            </g>
          </g>
        ))}
      </svg>
    );
  };

  const ActivityChart = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const values = [34, 56, 42, 68, 85, 30, 48];
    const chartHeight = 160;
    const chartWidth = 420;
    const maxVal = Math.max(...values) * 1.15;

    return (
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-[160px] overflow-visible">
        <line x1="30" y1={chartHeight - 25} x2={chartWidth - 20} y2={chartHeight - 25} stroke="#E2E8F0" strokeWidth="1" />
        <line x1="30" y1={chartHeight - 75} x2={chartWidth - 20} y2={chartHeight - 75} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="30" y1={chartHeight - 125} x2={chartWidth - 20} y2={chartHeight - 125} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />

        {values.map((val, idx) => {
          const barWidth = 22;
          const spacing = (chartWidth - 50) / days.length;
          const x = 30 + idx * spacing + (spacing - barWidth) / 2;
          const barHeight = (val / maxVal) * (chartHeight - 45);
          const y = chartHeight - 25 - barHeight;

          return (
            <g key={idx} className="group cursor-pointer">
              <rect x={x} y={20} width={barWidth} height={chartHeight - 45} fill="transparent" />
              <rect x={x} y={y} width={barWidth} height={barHeight} rx="3.5" fill="#3B82F6" className="fill-blue-500 hover:fill-blue-600 transition-colors duration-150" />
              <text x={x + barWidth / 2} y={chartHeight - 8} textAnchor="middle" className="text-[9px] fill-slate-400 font-mono font-semibold">{days[idx]}</text>
              <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                <rect x={x + barWidth / 2 - 20} y={y - 24} width="40" height="16" rx="4" fill="#0F172A" />
                <text x={x + barWidth / 2} y={y - 13} textAnchor="middle" className="text-[9px] fill-white font-mono font-bold">{val}%</text>
              </g>
            </g>
          );
        })}
      </svg>
    );
  };

  // ==========================================
  // MODULE 2 HANDLER EVENTS
  // ==========================================
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) {
      showToast('Course title is required.', true);
      return;
    }
    const newCourse: Course = {
      id: (coursesList.length + 1).toString(),
      title: newCourseTitle.trim(),
      category: newCourseCategory,
      difficulty: newCourseDifficulty,
      status: newCourseStatus,
      lessonsCount: newCourseLessons.length || 5
    };
    setCoursesList(prev => [...prev, newCourse]);
    addAuditLog(`Created new course: "${newCourseTitle.trim()}"`);
    setNewCourseTitle('');
    setNewCourseLessons([]);
    showToast('Course created successfully.');
  };

  const handleAddLesson = () => {
    if (lessonInput.trim()) {
      setNewCourseLessons(prev => [...prev, lessonInput.trim()]);
      setLessonInput('');
    }
  };

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizTitle.trim() || !newQuizQuestion.trim()) {
      showToast('Quiz Title and Question are required.', true);
      return;
    }
    const newQuiz: Quiz = {
      id: (quizzesList.length + 1).toString(),
      title: newQuizTitle.trim(),
      question: newQuizQuestion.trim(),
      options: [quizOpt0 || 'Option A', quizOpt1 || 'Option B', quizOpt2 || 'Option C', quizOpt3 || 'Option D'],
      answerIndex: newQuizAnswerIndex
    };
    setQuizzesList(prev => [...prev, newQuiz]);
    addAuditLog(`Added quiz question: "${newQuizTitle.trim()}"`);
    setNewQuizTitle('');
    setNewQuizQuestion('');
    setQuizOpt0('');
    setQuizOpt1('');
    setQuizOpt2('');
    setQuizOpt3('');
    showToast('Quiz added to assessment directory.');
  };

  const handleVerifyCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    setCertVerifySearched(true);
    const matched = profiles.find(p => p.id === certVerifyInput.trim() && p.completed === true);
    setCertVerifyResult(matched || null);
  };

  // ==========================================
  // MODULE 3 HANDLER EVENTS
  // ==========================================
  const handleUploadContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContentTitle.trim()) {
      showToast('Content title is required.', true);
      return;
    }
    const newContent: MediaResource = {
      id: (contentList.length + 1).toString(),
      title: newContentTitle.trim(),
      type: newContentType,
      category: newContentCategory,
      size: newContentSize
    };
    setContentList(prev => [...prev, newContent]);
    addAuditLog(`Uploaded resource file: "${newContentTitle.trim()}"`);
    setNewContentTitle('');
    showToast('Content resource uploaded successfully.');
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotificationTitle.trim() || !newNotificationBody.trim()) {
      showToast('Notification Title and Body are required.', true);
      return;
    }
    const newDelivery: DeliveryReport = {
      id: (deliveryReports.length + 1).toString(),
      title: newNotificationTitle.trim(),
      recipient: newNotificationRecipient,
      status: 'delivered'
    };
    setDeliveryReports(prev => [newDelivery, ...prev]);
    addAuditLog(`Dispatched message alert: "${newNotificationTitle.trim()}" to ${newNotificationRecipient}`);
    setNewNotificationTitle('');
    setNewNotificationBody('');
    showToast('Notification alert dispatched successfully.');
  };

  const handleExportCSVReport = () => {
    // Generate simple mock CSV and trigger download
    const csvContent = "data:text/csv;charset=utf-8,Student ID,Full Name,Step Location,Completed\n"
      + profiles.map(p => `"${p.id}","${p.fullName}",${p.step},${p.completed}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `eve_platform_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLog('Exported onboarding custom CSV report');
    showToast('Platform report exported successfully.');
  };

  return (
    <div className="w-full h-screen bg-[#F8FAFC] flex overflow-hidden font-sans select-none relative z-10 animate-fadeIn admin-dashboard-root">
      
      {/* ======================================================== */}
      {/* 1. LEFT SIDEBAR (Fully Grouped SaaS Layout)             */}
      {/* ======================================================== */}
      <div className="w-[230px] bg-slate-900 shrink-0 py-6 flex flex-col justify-between text-white relative">
        <div className="w-full space-y-5">
          
          <div className="flex items-center gap-3.5 pl-5 select-none py-1.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
              E
            </div>
            <span className="font-black text-lg tracking-tight text-white">eOnboard Control</span>
          </div>

          <div className="w-full space-y-4 px-2 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
            
            {/* GROUP A: DASHBOARDS */}
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-3 mb-1.5">DASHBOARDS</div>
              <button 
                onClick={() => setActiveSidebarTab('overview')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                  activeSidebarTab === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Overview Home
              </button>
              <button 
                onClick={() => setActiveSidebarTab('kpis')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                  activeSidebarTab === 'kpis' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                KPI Overview
              </button>
              <button 
                onClick={() => setActiveSidebarTab('analytics')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                  activeSidebarTab === 'analytics' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Analytics Center
              </button>
              <button 
                onClick={() => setActiveSidebarTab('insights')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                  activeSidebarTab === 'insights' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Brain className="w-4 h-4" />
                AI Insights
              </button>
            </div>

            {/* GROUP B: MANAGEMENT */}
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-3 mb-1.5">LEARNING & USERS</div>
              <button 
                onClick={() => setActiveSidebarTab('students')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                  activeSidebarTab === 'students' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                Students
              </button>
              <button 
                onClick={() => setActiveSidebarTab('parents')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                  activeSidebarTab === 'parents' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Parents
              </button>
              <button 
                onClick={() => setActiveSidebarTab('courses')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                  activeSidebarTab === 'courses' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Courses
              </button>
              <button 
                onClick={() => setActiveSidebarTab('assessments')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                  activeSidebarTab === 'assessments' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                Assessments
              </button>
              <button 
                onClick={() => setActiveSidebarTab('certificates')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                  activeSidebarTab === 'certificates' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Award className="w-4 h-4" />
                Certificates
              </button>
            </div>

            {/* GROUP C: SYSTEM CONTROL */}
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-3 mb-1.5">SYSTEM CONTROL</div>
              <button 
                onClick={() => setActiveSidebarTab('content')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                  activeSidebarTab === 'content' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                Content Library
              </button>
              <button 
                onClick={() => setActiveSidebarTab('notifications')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                  activeSidebarTab === 'notifications' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Bell className="w-4 h-4" />
                Notifications Center
              </button>
              <button 
                onClick={() => setActiveSidebarTab('reports')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                  activeSidebarTab === 'reports' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Download className="w-4 h-4" />
                Reports & Export
              </button>
              <button 
                onClick={() => setActiveSidebarTab('revenue')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                  activeSidebarTab === 'revenue' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Revenue
              </button>
              <button 
                onClick={() => setActiveSidebarTab('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                  activeSidebarTab === 'settings' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Settings className="w-4 h-4" />
                Settings & Control
              </button>
              <button 
                onClick={() => setActiveSidebarTab('admins')}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                  activeSidebarTab === 'admins' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Management
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <button 
                onClick={onBackToOnboarding}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-left cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                User Setup
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 select-none space-y-1 shrink-0">
          <div className="text-[9px] text-slate-500 font-mono tracking-wider font-bold uppercase">MODULE 3</div>
          <div className="text-[11px] text-slate-400 font-semibold">Platform & Control</div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN WORKSPACE CONTAINER                             */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Global Dashboard Top Bar */}
        <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 select-none z-20 shadow-sm text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tracking-widest text-slate-400 font-bold uppercase">Control Panel</span>
            <span className="text-slate-300 font-bold">/</span>
            <span className="text-sm font-bold text-slate-700 capitalize">
              {activeSidebarTab === 'overview' && 'Overview Home'}
              {activeSidebarTab === 'kpis' && 'KPI Overview'}
              {activeSidebarTab === 'analytics' && 'Analytics Center'}
              {activeSidebarTab === 'insights' && 'AI Insights'}
              {activeSidebarTab === 'students' && 'Student Directory'}
              {activeSidebarTab === 'parents' && 'Parents Directory'}
              {activeSidebarTab === 'courses' && 'Course Management'}
              {activeSidebarTab === 'assessments' && 'Assessment Center'}
              {activeSidebarTab === 'certificates' && 'Certificate Verification'}
              {activeSidebarTab === 'content' && 'Content Library'}
              {activeSidebarTab === 'notifications' && 'Notifications Center'}
              {activeSidebarTab === 'reports' && 'Reports & Exports'}
              {activeSidebarTab === 'revenue' && 'Revenue Analytics'}
              {activeSidebarTab === 'settings' && 'System Settings'}
              {activeSidebarTab === 'admins' && 'Admin Permissions'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Sync State Status */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span className={`w-2 h-2 rounded-full ${syncState === 'synced' ? 'bg-emerald-500' : syncState === 'syncing' ? 'bg-blue-500 animate-ping' : 'bg-amber-505'}`} />
              <span className="capitalize">{syncState === 'synced' ? 'Synced' : syncState === 'syncing' ? 'Syncing...' : 'Offline'}</span>
            </div>

            {/* Custom Admin Theme Selector */}
            <div className="relative z-50">
              <button
                onClick={() => setIsAdminThemeDropdownOpen(!isAdminThemeDropdownOpen)}
                className="py-2 px-3.5 rounded-xl text-xs font-bold border bg-slate-50 border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-sm hover:bg-slate-100 transition-all cursor-pointer"
              >
                <span>
                  {theme === 'eve-cosmic' && '🌌 Cosmic'}
                  {theme === 'eve-android' && '🤖 Android'}
                  {theme === 'eve-crimson' && '🌅 Crimson'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              
              {isAdminThemeDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsAdminThemeDropdownOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-38 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 animate-fadeIn text-left">
                    {[
                      { id: 'eve-cosmic', label: '🌌 EVE Cosmic' },
                      { id: 'eve-android', label: '🤖 EVE Android' },
                      { id: 'eve-crimson', label: '🌅 Crimson Horizon' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onThemeChange(t.id);
                          setIsAdminThemeDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-[10px] font-bold flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          theme === t.id ? 'text-blue-600 bg-blue-50/20' : 'text-slate-700'
                        }`}
                      >
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Reload Data Button */}
            <button
              onClick={loadData}
              disabled={loading}
              className={`flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-650 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer ${loading ? 'opacity-80' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
              <span>{loading ? 'Reloading...' : 'Reload Data'}</span>
            </button>
          </div>
        </div>
        
        {/* ========================================== */}
        {/* MODULE 1 DASHBOARD HOME (OVERVIEW)         */}
        {/* ========================================== */}
        {activeSidebarTab === 'overview' && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-5 custom-scrollbar min-h-0">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between shadow-sm shrink-0 text-left">
              <div className="space-y-1">
                <span className="text-[9px] font-mono tracking-widest text-blue-600 font-bold uppercase">EVE Platform Administration</span>
                <h2 className="text-lg font-black text-slate-900 leading-none">Welcome back, Coordinator</h2>
                <p className="text-[10.5px] text-slate-400 font-medium">
                  Currently tracking <span className="font-bold text-slate-700">{totalStudents} registered students</span> across your sandbox database.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-right">
                <div>
                  <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Local Server Time</div>
                  <div className="text-xs font-mono font-bold text-slate-650 mt-0.5">{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}</div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 shrink-0">
              {[
                { title: 'Total Students', value: totalStudents, change: '+12.4%', color: 'var(--eve-accent)', spark: [5, 9, 15, 22, 28, 35, 45, 52] },
                { title: 'Active Students', value: activeStudents, change: '+8.3%', color: '#10B981', spark: [12, 10, 18, 15, 25, 20, 28, 32] },
                { title: 'Linked Parents', value: totalParents, change: '+15.2%', color: '#6366F1', spark: [2, 5, 8, 12, 11, 15, 18, 20] },
                { title: 'Setups Done', value: completedCourses, change: '+24.1%', color: '#F59E0B', spark: [0, 2, 5, 12, 18, 25, 32, 40] },
                { title: 'Avg Engagement', value: `${avgEngagement}%`, change: '+4.5%', color: '#EC4899', spark: [60, 62, 65, 68, 67, 72, 70, 75] },
                { title: 'Platform Growth', value: growthRate, change: 'Stable', color: '#8B5CF6', spark: [5, 8, 12, 14, 18, 22, 25, 28] }
              ].map((kpi, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200/80 p-3.5 flex flex-col justify-between shadow-sm relative text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block truncate">{kpi.title}</span>
                  <div className="flex items-baseline justify-between mt-2.5">
                    <span className="text-xl font-black text-slate-900 tracking-tight leading-none">{kpi.value}</span>
                    <span className="text-[9px] font-mono font-bold text-emerald-600 flex items-center gap-0.5">
                      <ArrowUpRight className="w-2.5 h-2.5" />
                      {kpi.change}
                    </span>
                  </div>
                  <div className="mt-3.5 self-end">
                    <Sparkline values={kpi.spark} color={kpi.color} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-12 gap-4 shrink-0">
              <div className="col-span-6 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm text-left">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Student Growth Trend</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Registration growth over last 6 months</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full">Cloud Database Live</span>
                </div>
                <GrowthChart />
              </div>
              
              <div className="col-span-6 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm text-left">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Learning Activity Trend</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Daily completion rate distribution</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">Weekly Average</span>
                </div>
                <ActivityChart />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 shrink-0">
              <div className="col-span-4 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col justify-between text-left">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Performance Metrics</h3>
                  
                  <div className="space-y-3 pt-1">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-700">
                        <span>Setup Completion Rate</span>
                        <span>{totalStudents > 0 ? Math.round((completedCourses / totalStudents) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${totalStudents > 0 ? (completedCourses / totalStudents) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-700">
                        <span>Active Retention Rate</span>
                        <span>{totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-700">
                        <span>Setup Completion Streak</span>
                        <span>5.2 Days Avg</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '68%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Platform Subjects</span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">Coding</span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">AI Studies</span>
                    <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">Web Dev</span>
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Science</span>
                  </div>
                </div>
              </div>

              <div className="col-span-8 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">AI Insights & Action Plan</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <div>
                      <span className="text-[9.5px] font-bold text-rose-700 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                        Students at Risk (Action Needed)
                      </span>
                      <div className="space-y-1">
                        {studentsAtRisk.length === 0 ? (
                          <div className="text-[10px] text-slate-400 font-medium py-1">No setup drops identified.</div>
                        ) : (
                          studentsAtRisk.map(p => (
                            <div key={p.id} className="flex items-center justify-between text-[10px] bg-slate-50 border border-slate-100 rounded-lg p-1.5">
                              <span className="font-bold text-slate-700 truncate max-w-[100px]">{p.fullName || 'Anonymous'}</span>
                              <span className="font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">Step {p.step || 1} Drop</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[9.5px] font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                        <Award className="w-3.5 h-3.5 text-emerald-500" />
                        High Potential Learners
                      </span>
                      <div className="space-y-1">
                        {highPotentialLearners.length === 0 ? (
                          <div className="text-[10px] text-slate-400 font-medium py-1">No completed profiles yet.</div>
                        ) : (
                          highPotentialLearners.map(p => (
                            <div key={p.id} className="flex items-center justify-between text-[10px] bg-slate-50 border border-slate-100 rounded-lg p-1.5">
                              <span className="font-bold text-slate-700 truncate max-w-[100px]">{p.fullName || 'Anonymous'}</span>
                              <span className="font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">High Streak</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 border border-slate-150 rounded-xl p-3 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wide">AI Agent Summary Report</div>
                      <p className="text-[10.5px] text-slate-500 leading-relaxed mt-1.5 font-medium">
                        "Platform engagement is healthy. Found {studentsAtRisk.length} active draft setups stalled before guardian linkage (Step 4). Recommended intervention: Dispatch SMS alerts with guardian explainer modules."
                      </p>
                    </div>
                    <div 
                      onClick={() => setIsAiDrawerOpen(true)}
                      className="text-[9px] font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1 border-t border-slate-100 pt-2.5 mt-2.5"
                    >
                      Open AI Actions Drawer
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm text-left shrink-0">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Live Platform Activity Timeline</h3>
              <div className="space-y-3.5">
                {getRecentActivities().map((act, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                    <div className="flex-1 text-[11px] leading-tight space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-800">{act.title}</span>
                        <span className="text-[9.5px] font-mono text-slate-400 font-bold">{act.time}</span>
                      </div>
                      <p className="text-slate-500 font-medium">{act.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* KPI OVERVIEW VIEW                          */}
        {/* ========================================== */}
        {activeSidebarTab === 'kpis' && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 custom-scrollbar text-left">
            <div className="space-y-1 border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900 font-display">Key Performance Indicators</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Monthly performance index metrics</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Setup Completion Distribution</h3>
                <div className="space-y-2.5">
                  {[
                    { label: 'Step 1-3 (Welcome & Identity)', pct: '45%' },
                    { label: 'Step 4-6 (Guardian & Goals)', pct: '28%' },
                    { label: 'Step 7-9 (Learning Styles & AI)', pct: '17%' },
                    { label: 'Step 10 (Completed)', pct: '10%' }
                  ].map((dist, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                      <span>{dist.label}</span>
                      <span className="font-mono text-slate-800 font-bold">{dist.pct}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Daily Commitment Levels</h3>
                <div className="space-y-2.5">
                  {[
                    { label: 'Casual (10m/day)', count: profiles.filter(p => p.dailyCommitment === 'casual').length },
                    { label: 'Regular (25m/day)', count: profiles.filter(p => p.dailyCommitment === 'regular').length },
                    { label: 'Serious (45m/day)', count: profiles.filter(p => p.dailyCommitment === 'serious').length },
                    { label: 'Intensive (60m+/day)', count: profiles.filter(p => p.dailyCommitment === 'intensive').length }
                  ].map((comm, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                      <span>{comm.label}</span>
                      <span className="font-mono text-slate-800 font-bold">{comm.count} Students</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ANALYTICS CENTER VIEW                      */}
        {/* ========================================== */}
        {activeSidebarTab === 'analytics' && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 custom-scrollbar text-left">
            <div className="space-y-1 border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900 font-display">Analytics & Growth Trend</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Deep-dive data metrics visualization</p>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Detailed Student Growth Curve</h3>
                <span className="text-[10px] font-mono text-slate-450 font-bold">January - June (All-Time)</span>
              </div>
              <GrowthChart />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Learning Preference Distribution</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Visual (Videos)', val: profiles.filter(p => p.learningPreference === 'visual').length },
                    { label: 'Interactive (Quizzes)', val: profiles.filter(p => p.learningPreference === 'interactive').length },
                    { label: 'Hands-on (Projects)', val: profiles.filter(p => p.learningPreference === 'hands-on').length },
                    { label: 'Reading (Text)', val: profiles.filter(p => p.learningPreference === 'reading').length }
                  ].map((pref, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                      <span>{pref.label}</span>
                      <span className="font-mono text-slate-800 font-bold">{pref.val} users</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Educational Level Breakdown</h3>
                <div className="space-y-2">
                  {[
                    { label: 'High School', val: profiles.filter(p => p.educationLevel === 'high-school').length },
                    { label: 'Undergraduate Degree', val: profiles.filter(p => p.educationLevel === 'undergraduate').length },
                    { label: 'Postgraduate Degree', val: profiles.filter(p => p.educationLevel === 'postgraduate').length }
                  ].map((edu, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                      <span>{edu.label}</span>
                      <span className="font-mono text-slate-800 font-bold">{edu.val} users</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* AI INSIGHTS VIEW                           */}
        {/* ========================================== */}
        {activeSidebarTab === 'insights' && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 custom-scrollbar text-left">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Brain className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900 font-display">AI Insights Report</h2>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recommended Action Plans</h3>
                <p className="text-[10.5px] text-slate-400 mt-0.5">Automated suggestions generated by sandbox agent</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                    <Activity className="w-4 h-4" />
                    Interactive Study Alerts
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Set up real-time push/weekly reminder digests specifically targeting students with "Casual" daily commitment targets.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                    <GraduationCap className="w-4 h-4" />
                    Adaptive Learning Pathways
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Send Concept Explainer modules to students with Visual preferences who have paused at identity setup fields.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STUDENTS MANAGEMENT VIEW                   */}
        {/* ========================================== */}
        {activeSidebarTab === 'students' && (
          <div className="flex-1 bg-white p-8 flex flex-col justify-between overflow-hidden relative text-left">
            <div className="space-y-4 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 font-display">Student Directory</h2>
                  <p className="text-sm text-slate-400 mt-1 font-semibold">{totalStudents} active learner profiles</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <div className="flex gap-6 text-sm font-bold text-slate-400">
                  <button onClick={() => { setActiveTab('all'); setCurrentPage(1); }} className={`pb-2.5 relative cursor-pointer ${activeTab === 'all' ? 'text-slate-900 font-extrabold' : 'hover:text-slate-650'}`}>
                    All Learners
                    {activeTab === 'all' && <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-blue-600 rounded-full" />}
                  </button>
                  <button onClick={() => { setActiveTab('in_progress'); setCurrentPage(1); }} className={`pb-2.5 relative cursor-pointer ${activeTab === 'in_progress' ? 'text-slate-900 font-extrabold' : 'hover:text-slate-650'}`}>
                    In Progress
                    {activeTab === 'in_progress' && <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-blue-600 rounded-full" />}
                  </button>
                  <button onClick={() => { setActiveTab('completed'); setCurrentPage(1); }} className={`pb-2.5 relative cursor-pointer ${activeTab === 'completed' ? 'text-slate-900 font-extrabold' : 'hover:text-slate-650'}`}>
                    Fully Onboarded
                    {activeTab === 'completed' && <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-blue-600 rounded-full" />}
                  </button>
                </div>

                {/* SEARCH BOX & BULK ACTIONS FOR STUDENTS */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {selectedIds.length > 0 && (
                    <button
                      onClick={() => setShowBulkDeleteModal(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-105 text-rose-750 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-rose-650" />
                      <span>Delete Selected ({selectedIds.length})</span>
                    </button>
                  )}
                  
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all font-semibold placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto py-4 space-y-3 custom-scrollbar min-h-0">
              <div className="grid grid-cols-12 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <div className="col-span-1 flex items-center justify-center">
                  <input
                    type="checkbox"
                    ref={masterCheckboxRef}
                    checked={isAllPageSelected}
                    onChange={handleToggleSelectAllPage}
                    className="rounded border-slate-350 text-blue-600 w-4.5 h-4.5 cursor-pointer"
                  />
                </div>
                <div className="col-span-3">Student Name</div>
                <div className="col-span-2">Engagement</div>
                <div className="col-span-2">Study Field / Goal</div>
                <div className="col-span-3">Status Progress</div>
                <div className="col-span-1 text-center">Profile</div>
              </div>

              {currentItems.map((p, idx) => {
                const stepLocation = p.step || 1;
                const score = stepLocation * 10;
                return (
                  <div 
                    key={p.id} 
                    className={`grid grid-cols-12 items-center px-4 py-3.5 rounded-2xl border transition-all ${
                      selectedIds.includes(p.id || '')
                        ? 'border-blue-300 bg-blue-50/10'
                        : 'border-slate-100 bg-slate-50/20 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="col-span-1 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id || '')}
                        onChange={() => handleToggleSelect(p.id || '')}
                        className="rounded border-slate-350 text-blue-600 w-4.5 h-4.5 cursor-pointer"
                      />
                    </div>
                    
                    <div className="col-span-3 flex items-center gap-3 truncate">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="truncate text-left">
                        <div className="text-sm font-bold text-slate-900 leading-tight">{p.fullName || 'Anonymous'}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {p.id?.slice(0, 8)}...</div>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                      <span className="text-xs font-extrabold text-slate-700">{score}% Score</span>
                    </div>

                    <div className="col-span-2 text-xs font-bold text-slate-700 truncate pr-3 text-left">
                      <div>{p.fieldOfStudy || '—'}</div>
                      <div className="text-xs text-slate-400 truncate font-sans mt-0.5">Goals: {p.learningGoals?.join(', ') || '—'}</div>
                    </div>

                    <div className="col-span-3 pr-4 text-left">
                      <div className="flex justify-between text-xs text-slate-400 font-bold mb-1.5">
                        <span>Wizard Step {stepLocation}</span>
                        <span>{p.completed ? 'Finished' : `${stepLocation}0% Done`}</span>
                      </div>
                      <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stepLocation * 10}%` }} />
                      </div>
                    </div>

                    <div className="col-span-1 flex justify-center">
                      <button 
                        onClick={() => setSelectedStudentDetail(p)}
                        className="p-1.5 border border-slate-200 rounded-xl hover:bg-slate-100 hover:text-blue-600 text-slate-500 transition-colors cursor-pointer"
                        title="View Full Profile"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 shrink-0 select-none">
              <span className="text-xs text-slate-400 font-mono font-bold">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} profiles
              </span>
              <div className="flex items-center gap-2">
                <button disabled={activePage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className="text-slate-400 hover:text-slate-700 disabled:opacity-40 font-bold text-xs cursor-pointer">&lt;</button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-5 h-5 text-xs font-bold rounded-full cursor-pointer ${activePage === i + 1 ? 'text-blue-600 font-black' : 'text-slate-400'}`}>{i + 1}</button>
                ))}
                <button disabled={activePage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className="text-slate-400 hover:text-slate-700 disabled:opacity-40 font-bold text-xs cursor-pointer">&gt;</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* PARENTS MANAGEMENT VIEW                    */}
        {/* ========================================== */}
        {activeSidebarTab === 'parents' && (() => {
          // Filter parents by search query
          const allParentsAndIndependent = profiles.filter(p => p.parentName);
          const independentAdults = profiles.filter(p => p.parentName === 'SKIPPED');
          const filteredParentsList = allParentsAndIndependent.filter(p => {
            const q = parentSearchQuery.toLowerCase().trim();
            if (!q) return true;
            return (
              (p.parentName && p.parentName.toLowerCase().includes(q)) ||
              (p.fullName && p.fullName.toLowerCase().includes(q)) ||
              (p.parentEmail && p.parentEmail.toLowerCase().includes(q)) ||
              (p.parentPhone && p.parentPhone.toLowerCase().includes(q))
            );
          });

          return (
            <div className="flex-1 bg-white p-8 flex flex-col overflow-hidden relative text-left">
              <div className="space-y-4 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 font-display">Parents Directory</h2>
                    <p className="text-sm text-slate-400 mt-1 font-semibold">{parentsList.length} linked parent profiles · {independentAdults.length} independent adults</p>
                  </div>
                </div>

                {/* Search + Filter Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="text-sm font-bold text-slate-400">
                    <span className="text-xs font-mono font-bold text-slate-400">{filteredParentsList.length} records found</span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {parentSearchQuery && (
                      <button
                        onClick={() => setParentSearchQuery('')}
                        className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search parents..."
                        value={parentSearchQuery}
                        onChange={(e) => setParentSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all font-semibold placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto py-4 space-y-3 custom-scrollbar min-h-0">
                <div className="grid grid-cols-12 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <div className="col-span-3">Parent Name</div>
                  <div className="col-span-3">Linked Learner</div>
                  <div className="col-span-3">Contact Email</div>
                  <div className="col-span-3">Relationship</div>
                </div>

                {filteredParentsList.length === 0 ? (
                  <div className="text-center py-20 text-slate-450 text-sm font-semibold">
                    {parentSearchQuery ? `No results for "${parentSearchQuery}"` : 'No linked parents found in database profiles.'}
                  </div>
                ) : (
                  filteredParentsList.map(p => {
                    const isIndependent = p.parentName === 'SKIPPED';
                    return (
                      <div key={p.id} className={`grid grid-cols-12 items-center px-4 py-3.5 rounded-2xl border transition-all ${
                        isIndependent
                          ? 'border-amber-100 bg-amber-50/20 hover:border-amber-200'
                          : 'border-slate-100 bg-slate-50/20 hover:border-slate-350 hover:shadow-sm'
                      }`}>
                        <div className="col-span-3 flex items-center gap-3 truncate text-left">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                            isIndependent ? 'bg-amber-50 border-amber-200' : 'bg-slate-100 border-slate-200'
                          }`}>
                            {isIndependent
                              ? <User className="w-5 h-5 text-amber-600" />
                              : <UserCheck className="w-5 h-5 text-blue-600" />
                            }
                          </div>
                          <div className="truncate">
                            {isIndependent ? (
                              <>
                                <div className="text-sm font-bold text-amber-700 leading-tight">Independent Adult</div>
                                <div className="text-xs text-amber-500 font-semibold mt-0.5">No guardian linked</div>
                              </>
                            ) : (
                              <>
                                <div className="text-sm font-bold text-slate-900 leading-tight">{p.parentName}</div>
                                <div className="text-xs text-slate-400 font-mono mt-0.5">{p.parentPhone || 'No phone'}</div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="col-span-3 text-sm font-bold text-slate-750 truncate text-left">
                          {p.fullName || 'Anonymous Student'}
                        </div>

                        <div className="col-span-3 text-xs font-semibold text-slate-650 truncate font-mono text-left">
                          {isIndependent ? <span className="text-amber-500 font-semibold">—</span> : (p.parentEmail || '—')}
                        </div>

                        <div className="col-span-3 capitalize text-xs font-bold text-slate-700 text-left">
                          {isIndependent ? (
                            <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-[10px] uppercase font-black tracking-wider">Independent</span>
                          ) : (
                            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] uppercase font-black tracking-wider">{p.parentRelationship || 'guardian'}</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })()}

        {/* ========================================== */}
        {/* COURSE MANAGEMENT VIEW                     */}
        {/* ========================================== */}
        {activeSidebarTab === 'courses' && (
          <div className="flex-1 bg-white p-6 flex flex-col justify-between overflow-hidden relative text-left">
            <div className="space-y-1 shrink-0 border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900 font-display">Course Management</h2>
              <p className="text-xs text-slate-400 font-medium">Design and structure courses in the learning catalog</p>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-hidden">
              <div className="col-span-7 flex flex-col justify-between overflow-hidden">
                <div className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase mb-2">COURSE LIBRARY ({coursesList.length})</div>
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                  {coursesList.map(c => (
                    <div key={c.id} className="bg-slate-50/50 border border-slate-150 rounded-xl p-3 flex items-center justify-between hover:border-slate-350">
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-950">{c.title}</h4>
                          <span className={`text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${c.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {c.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-450 font-semibold font-sans">
                          <span className="bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded-md">{c.category}</span>
                          <span>Level: {c.difficulty}</span>
                          <span>•</span>
                          <span>{c.lessonsCount} lessons</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-5 bg-slate-50/40 border border-slate-200/80 rounded-2xl p-4 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="text-[10px] font-mono tracking-widest text-blue-600 font-bold uppercase mb-3 flex items-center gap-1">
                  <PlusCircle className="w-4 h-4" />
                  Add New Course
                </div>
                
                <form onSubmit={handleCreateCourse} className="space-y-3.5 flex-1">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Course Title *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Intro to JavaScript"
                      value={newCourseTitle}
                      onChange={e => setNewCourseTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Category</label>
                      <select 
                        value={newCourseCategory}
                        onChange={e => setNewCourseCategory(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="Coding">Coding</option>
                        <option value="AI Studies">AI Studies</option>
                        <option value="Web Dev">Web Dev</option>
                        <option value="Science">Science</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Difficulty</label>
                      <select 
                        value={newCourseDifficulty}
                        onChange={e => setNewCourseDifficulty(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Lessons Builder ({newCourseLessons.length})</label>
                    <div className="flex items-center gap-1">
                      <input 
                        type="text" 
                        placeholder="Add lesson topic..."
                        value={lessonInput}
                        onChange={e => setLessonInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                      <button 
                        type="button" 
                        onClick={handleAddLesson}
                        className="p-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                    {newCourseLessons.length > 0 && (
                      <div className="mt-1.5 p-2 bg-slate-100 rounded-lg text-[9.5px] font-semibold text-slate-650 max-h-20 overflow-y-auto custom-scrollbar font-mono list-decimal pl-5">
                        {newCourseLessons.map((les, i) => (
                          <div key={i}>{les}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Status</label>
                    <div className="flex gap-4 text-xs font-semibold text-slate-700">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" checked={newCourseStatus === 'draft'} onChange={() => setNewCourseStatus('draft')} />
                        Save Draft
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" checked={newCourseStatus === 'published'} onChange={() => setNewCourseStatus('published')} />
                        Publish Now
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs uppercase shadow-sm cursor-pointer"
                  >
                    Create Course Record
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ASSESSMENTS VIEW                           */}
        {/* ========================================== */}
        {activeSidebarTab === 'assessments' && (
          <div className="flex-1 bg-white p-6 flex flex-col justify-between overflow-hidden relative text-left">
            <div className="space-y-1 shrink-0 border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900 font-display">Assessments & Quizzes</h2>
              <p className="text-xs text-slate-400 font-medium">Build and schedule student quizzes, assignments, and mock tests</p>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-hidden">
              <div className="col-span-7 flex flex-col justify-between overflow-hidden">
                <div className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase mb-2">QUIZ DIRECTORY ({quizzesList.length})</div>
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                  {quizzesList.map(q => (
                    <div key={q.id} className="bg-slate-50/50 border border-slate-150 rounded-xl p-3 text-left space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-950">{q.title}</h4>
                      <p className="text-[10.5px] text-slate-600 font-medium leading-normal">{q.question}</p>
                      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[9.5px] font-mono text-slate-450 font-bold">
                        {q.options.map((opt, i) => (
                          <div key={i} className={`px-2 py-0.5 rounded ${i === q.answerIndex ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100'}`}>
                            {i + 1}. {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-5 bg-slate-50/40 border border-slate-200/80 rounded-2xl p-4 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="text-[10px] font-mono tracking-widest text-blue-600 font-bold uppercase mb-3 flex items-center gap-1">
                  <PlusCircle className="w-4 h-4" />
                  Quiz Builder
                </div>

                <form onSubmit={handleCreateQuiz} className="space-y-3 flex-1">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Quiz Topic/Title *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Loops & Lists Quiz"
                      value={newQuizTitle}
                      onChange={e => setNewQuizTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Question Text *</label>
                    <textarea 
                      required
                      placeholder="Type question here..."
                      value={newQuizQuestion}
                      onChange={e => setNewQuizQuestion(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white max-h-12"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Answer Choices</label>
                    <input type="text" required placeholder="Option 1" value={quizOpt0} onChange={e => setQuizOpt0(e.target.value)} className="w-full px-3 py-1 text-xs rounded-lg border border-slate-200 bg-white" />
                    <input type="text" required placeholder="Option 2" value={quizOpt1} onChange={e => setQuizOpt1(e.target.value)} className="w-full px-3 py-1 text-xs rounded-lg border border-slate-200 bg-white" />
                    <input type="text" required placeholder="Option 3" value={quizOpt2} onChange={e => setQuizOpt2(e.target.value)} className="w-full px-3 py-1 text-xs rounded-lg border border-slate-200 bg-white" />
                    <input type="text" required placeholder="Option 4" value={quizOpt3} onChange={e => setQuizOpt3(e.target.value)} className="w-full px-3 py-1 text-xs rounded-lg border border-slate-200 bg-white" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Correct Option Index</label>
                    <select 
                      value={newQuizAnswerIndex}
                      onChange={e => setNewQuizAnswerIndex(parseInt(e.target.value, 10))}
                      className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="0">Option 1</option>
                      <option value="1">Option 2</option>
                      <option value="2">Option 3</option>
                      <option value="3">Option 4</option>
                    </select>
                  </div>

                  <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs uppercase cursor-pointer">
                    Save Quiz Question
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* CERTIFICATES VIEW                          */}
        {/* ========================================== */}
        {activeSidebarTab === 'certificates' && (
          <div className="flex-1 bg-white p-6 flex flex-col justify-between overflow-hidden relative text-left">
            <div className="space-y-1 shrink-0 border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900 font-display">Certificates Management</h2>
              <p className="text-xs text-slate-400 font-medium">Configure templates, issue credentials, and run validation searches</p>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-hidden">
              <div className="col-span-7 flex flex-col justify-between overflow-hidden">
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase mb-2">CERTIFICATE TEMPLATES</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="border border-blue-100 bg-blue-50/20 rounded-xl p-3 text-left space-y-1.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <Award className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-950">Foundations of Coding</h4>
                        <p className="text-[9.5px] text-slate-450 font-medium">Standard onboarding completion certificate</p>
                      </div>
                      <div className="border border-slate-200 bg-slate-50/10 rounded-xl p-3 text-left space-y-1.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                          <Award className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-950">AI & Tech Explorers</h4>
                        <p className="text-[9.5px] text-slate-450 font-medium">Offered for students choosing AI tracks</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase mb-2">DOWNLOAD LOGS</div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-lg p-2">
                        <span className="font-bold">karthik_onboarding_cert.pdf</span>
                        <span className="text-[9px] font-mono text-slate-400 font-bold">128 KB • Downloaded</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-5 bg-slate-50/40 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-blue-600 font-bold uppercase mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Credential Verification
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-3">
                    Paste a student's database UUID to verify whether they have successfully finished all onboarding setup steps.
                  </p>

                  <form onSubmit={handleVerifyCertificate} className="space-y-3">
                    <input 
                      type="text" 
                      required
                      placeholder="Paste Student UUID here..."
                      value={certVerifyInput}
                      onChange={e => setCertVerifyInput(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                    />
                    <button type="submit" className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs uppercase cursor-pointer">
                      Verify Credential ID
                    </button>
                  </form>
                </div>

                <div className="border-t border-slate-150 pt-4 mt-4">
                  {certVerifySearched ? (
                    certVerifyResult ? (
                      <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-3 flex flex-col items-center text-center space-y-1.5 animate-fadeIn">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        <div>
                          <div className="text-[10px] font-bold text-emerald-800 uppercase">VALID CERTIFICATE FOUND</div>
                          <div className="text-xs font-bold text-slate-900 mt-1">{certVerifyResult.fullName}</div>
                          <div className="text-[9px] font-mono text-slate-500">Issued on {formatDateDisplay(getProfileDate(certVerifyResult))}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-rose-50 border border-rose-150 rounded-xl p-3 flex flex-col items-center text-center space-y-1.5 animate-fadeIn">
                        <XCircle className="w-6 h-6 text-rose-600" />
                        <div>
                          <div className="text-[10px] font-bold text-rose-800 uppercase">INVALID OR UNFINISHED CREDENTIAL</div>
                          <p className="text-[9.5px] text-slate-500 font-medium leading-tight mt-1">
                            We could not locate a completed onboarding profile associated with this ID.
                          </p>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-4 text-[10.5px] text-slate-400 font-medium select-none">
                      Awaiting credential search verification query...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MODULE 3: CONTENT LIBRARY VIEW             */}
        {/* ========================================== */}
        {activeSidebarTab === 'content' && (
          <div className="flex-1 bg-white p-6 flex flex-col justify-between overflow-hidden relative text-left">
            <div className="space-y-1 shrink-0 border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900 font-display">Content & Media Library</h2>
              <p className="text-xs text-slate-400 font-medium">Manage orientation guides, lecture slides, and media resources</p>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-hidden">
              <div className="col-span-7 flex flex-col justify-between overflow-hidden">
                <div className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase mb-2">RESOURCES DIRECTORY ({contentList.length})</div>
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                  {contentList.map(item => (
                    <div key={item.id} className="bg-slate-50/50 border border-slate-150 rounded-xl p-3 flex items-center justify-between">
                      <div className="text-left space-y-1">
                        <h4 className="text-xs font-bold text-slate-950">{item.title}</h4>
                        <div className="flex items-center gap-3 text-[9.5px] text-slate-450 font-bold uppercase font-mono">
                          <span className="bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded-md">{item.type}</span>
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>{item.size}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-5 bg-slate-50/40 border border-slate-200/80 rounded-2xl p-4 flex flex-col">
                <div className="text-[10px] font-mono tracking-widest text-blue-600 font-bold uppercase mb-3 flex items-center gap-1">
                  <PlusCircle className="w-4 h-4" />
                  Upload Resource
                </div>

                <form onSubmit={handleUploadContent} className="space-y-3.5 flex-1">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Resource Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Python Cheat Sheet"
                      value={newContentTitle}
                      onChange={e => setNewContentTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Media Type</label>
                    <select 
                      value={newContentType}
                      onChange={e => setNewContentType(e.target.value as any)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="video">Orientation Video</option>
                      <option value="document">PDF Document</option>
                      <option value="slide">Lecture Slides</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Category</label>
                      <input 
                        type="text" 
                        placeholder="Coding"
                        value={newContentCategory}
                        onChange={e => setNewContentCategory(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">File Size</label>
                      <input 
                        type="text" 
                        placeholder="2.4 MB"
                        value={newContentSize}
                        onChange={e => setNewContentSize(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs uppercase shadow-sm cursor-pointer">
                    Save Resource to Library
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MODULE 3: NOTIFICATIONS CENTER VIEW        */}
        {/* ========================================== */}
        {activeSidebarTab === 'notifications' && (
          <div className="flex-1 bg-white p-6 flex flex-col justify-between overflow-hidden relative text-left">
            <div className="space-y-1 shrink-0 border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900 font-display">Notifications & Campaigns</h2>
              <p className="text-xs text-slate-400 font-medium">Compose email campaigns, push alerts, and review delivery history</p>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-hidden">
              <div className="col-span-7 flex flex-col justify-between overflow-hidden">
                <div className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase mb-2">DELIVERY STATUS LOGS ({deliveryReports.length})</div>
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                  {deliveryReports.map(rep => (
                    <div key={rep.id} className="bg-slate-50/50 border border-slate-150 rounded-xl p-3 flex items-center justify-between">
                      <div className="text-left space-y-1">
                        <h4 className="text-xs font-bold text-slate-950">{rep.title}</h4>
                        <div className="text-[10px] text-slate-450 font-bold font-mono">Recipient target: {rep.recipient}</div>
                      </div>
                      <span className="text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        {rep.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-5 bg-slate-50/40 border border-slate-200/80 rounded-2xl p-4 flex flex-col">
                <div className="text-[10px] font-mono tracking-widest text-blue-600 font-bold uppercase mb-3 flex items-center gap-1">
                  <PlusCircle className="w-4 h-4" />
                  Dispatch Alert Campaign
                </div>

                <form onSubmit={handleSendNotification} className="space-y-3.5 flex-1">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Campaign Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Guardian Verification Reminder"
                      value={newNotificationTitle}
                      onChange={e => setNewNotificationTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Recipient Target</label>
                    <select 
                      value={newNotificationRecipient}
                      onChange={e => setNewNotificationRecipient(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="All Students">All Registered Learners</option>
                      <option value="Step 4 Stalled">Step 4 (Guardian Stalled) Drafts</option>
                      <option value="Linked Parents">Linked Parent Guardians</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Alert Message Body *</label>
                    <textarea 
                      required
                      placeholder="Compose notification text..."
                      value={newNotificationBody}
                      onChange={e => setNewNotificationBody(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white max-h-16"
                    />
                  </div>

                  <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs uppercase cursor-pointer">
                    Send Campaign Alerts
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MODULE 3: REPORTS & ANALYTICS VIEW         */}
        {/* ========================================== */}
        {activeSidebarTab === 'reports' && (
          <div className="flex-1 bg-white p-6 flex flex-col justify-between overflow-hidden relative text-left">
            <div className="space-y-1 shrink-0 border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900 font-display">Exportable Reports & Statistics</h2>
              <p className="text-xs text-slate-400 font-medium">Export custom summaries of your sandbox student onboarding records</p>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-hidden">
              <div className="col-span-7 bg-slate-50/50 border border-slate-150 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Available Reports Templates</h3>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4">
                    The platform provides custom downloads for administrative compliance. Exporting outputs the current profiles array in standard CSV format.
                  </p>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 border-b border-slate-100 pb-2">
                      <span>Onboarding Completions Report</span>
                      <span className="text-slate-450">{completedCourses} Records</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 border-b border-slate-100 pb-2">
                      <span>Daily Study Intent Distributions</span>
                      <span className="text-slate-450">{totalStudents} Records</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleExportCSVReport}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs uppercase shadow-sm cursor-pointer flex items-center justify-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Export Onboarding CSV Report
                </button>
              </div>

              <div className="col-span-5 bg-slate-50/20 border border-slate-150 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase mb-3">SYSTEM DOWNLOAD LOG</div>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3 text-[10.5px] leading-tight">
                      <History className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-800">CSV Export Initiated</div>
                        <p className="text-[9.5px] text-slate-450 mt-0.5">Generated package with current registered student data.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MODULE 3: REVENUE VIEW                     */}
        {/* ========================================== */}
        {activeSidebarTab === 'revenue' && (
          <div className="flex-1 bg-white p-6 flex flex-col justify-between overflow-hidden relative text-left font-sans">
            <div className="space-y-1 shrink-0 border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900 font-display">Revenue & Conversion</h2>
              <p className="text-xs text-slate-400 font-medium">Monthly subscription conversions and financial stats</p>
            </div>

            <div className="grid grid-cols-4 gap-3.5 shrink-0 mb-4 select-none">
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5">
                <div className="text-[9.5px] font-mono tracking-widest text-slate-400 font-bold uppercase">MONTHLY MRR</div>
                <div className="text-lg font-black text-slate-950 mt-1.5">$12,450</div>
                <span className="text-[9px] font-mono font-bold text-emerald-600 mt-1 block">+15.8% Growth</span>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5">
                <div className="text-[9.5px] font-mono tracking-widest text-slate-400 font-bold uppercase">ACTIVE SUBS</div>
                <div className="text-lg font-black text-slate-950 mt-1.5">1,245</div>
                <span className="text-[9px] font-mono font-bold text-emerald-600 mt-1 block">94.8% Retention</span>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5">
                <div className="text-[9.5px] font-mono tracking-widest text-slate-400 font-bold uppercase">RENEWAL RATE</div>
                <div className="text-lg font-black text-slate-950 mt-1.5">92.4%</div>
                <span className="text-[9px] font-mono font-bold text-emerald-600 mt-1 block">MoM Target met</span>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5">
                <div className="text-[9.5px] font-mono tracking-widest text-slate-400 font-bold uppercase">CONVERSION</div>
                <div className="text-lg font-black text-slate-950 mt-1.5">12.4%</div>
                <span className="text-[9px] font-mono font-bold text-emerald-600 mt-1 block">Traffic-to-wizard</span>
              </div>
            </div>

            {/* Revenue Area Chart */}
            <div className="flex-grow bg-slate-50/30 border border-slate-150 rounded-2xl p-4 min-h-0 flex flex-col justify-between">
              <div className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase mb-2">REVENUE RECURRING GROWTH</div>
              <div className="flex-1 min-h-0">
                <svg viewBox="0 0 520 160" className="w-full h-[150px] overflow-visible">
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <line x1="30" y1="135" x2="500" y2="135" stroke="#E2E8F0" strokeWidth="1" />
                  <line x1="30" y1="85" x2="500" y2="85" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="30" y1="35" x2="500" y2="35" stroke="#F1F5F9" strokeWidth="1" />

                  {/* Curve Path */}
                  <path d="M 30 115 C 100 110, 150 95, 220 85 C 290 75, 350 45, 420 35 L 500 25 L 500 135 L 30 135 Z" fill="url(#revGrad)" />
                  <path d="M 30 115 C 100 110, 150 95, 220 85 C 290 75, 350 45, 420 35 L 500 25" fill="none" stroke="#4F46E5" strokeWidth="2.5" />

                  {/* Dots */}
                  <circle cx="30" cy="115" r="3.5" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="1.5" />
                  <circle cx="220" cy="85" r="3.5" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="1.5" />
                  <circle cx="420" cy="35" r="3.5" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="1.5" />
                  <circle cx="500" cy="25" r="3.5" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="1.5" />

                  <text x="30" y="152" textAnchor="middle" className="text-[9px] fill-slate-400 font-mono font-bold">Jan</text>
                  <text x="220" y="152" textAnchor="middle" className="text-[9px] fill-slate-400 font-mono font-bold">Mar</text>
                  <text x="420" y="152" textAnchor="middle" className="text-[9px] fill-slate-400 font-mono font-bold">May</text>
                  <text x="500" y="152" textAnchor="middle" className="text-[9px] fill-slate-400 font-mono font-bold">Jun</text>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MODULE 3: SETTINGS & PLATFORM CONTROL VIEW */}
        {/* ========================================== */}
        {activeSidebarTab === 'settings' && (
          <div className="flex-1 bg-white p-6 flex flex-col justify-between overflow-hidden relative text-left">
            <div className="space-y-1 shrink-0 border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900 font-display">Settings & System Controls</h2>
              <p className="text-xs text-slate-400 font-medium">Configure organization details, AI settings parameters, and audit system actions</p>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-hidden">
              <div className="col-span-7 overflow-y-auto pr-1 custom-scrollbar space-y-4">
                {/* Organization configuration */}
                <div className="bg-slate-50/50 border border-slate-150 rounded-2xl p-4 space-y-3">
                  <div className="text-[10px] font-mono tracking-widest text-blue-600 font-bold uppercase">ORGANIZATION PROFILE</div>
                  <div className="space-y-2.5 text-xs font-semibold text-slate-700">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Academy / Name</label>
                      <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Primary Contact Email</label>
                      <input type="email" value={orgEmail} onChange={e => setOrgEmail(e.target.value)} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white" />
                    </div>
                  </div>
                </div>

                {/* AI Configuration */}
                <div className="bg-slate-50/50 border border-slate-150 rounded-2xl p-4 space-y-3">
                  <div className="text-[10px] font-mono tracking-widest text-blue-600 font-bold uppercase flex items-center gap-1">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    AI AGENT CONFIGURATION
                  </div>
                  <div className="space-y-2.5 text-xs font-semibold text-slate-700">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                        <span>AI Engine Temperature (Randomness)</span>
                        <span>{aiTemperature}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.1" 
                        max="1.0" 
                        step="0.1"
                        value={aiTemperature} 
                        onChange={e => setAiTemperature(parseFloat(e.target.value))}
                        className="w-full mt-1.5 accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit System Log */}
              <div className="col-span-5 bg-slate-50/20 border border-slate-150 rounded-2xl p-4 flex flex-col justify-between overflow-hidden">
                <div className="space-y-3 overflow-hidden flex-1 flex flex-col">
                  <div className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase shrink-0">SYSTEM AUDIT LOG ({auditLogs.length})</div>
                  <div className="flex-grow overflow-y-auto space-y-3.5 pr-1 custom-scrollbar mt-2">
                    {auditLogs.map((log, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-[10.5px] leading-tight">
                        <History className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-slate-800">{log.action}</div>
                          <p className="text-[9.5px] text-slate-450 mt-0.5 font-mono">By {log.user} at {log.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MODULE 3: ADMIN MANAGEMENT VIEW            */}
        {/* ========================================== */}
        {activeSidebarTab === 'admins' && (
          <div className="flex-1 bg-white p-6 flex flex-col justify-between overflow-hidden relative text-left">
            <div className="space-y-1 shrink-0 border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900 font-display">Administrator Accounts & Access</h2>
              <p className="text-xs text-slate-400 font-medium">Control permissions for other coordinator accounts</p>
            </div>

            <div className="flex-grow overflow-y-auto space-y-2.5 pr-1 custom-scrollbar min-h-0">
              <div className="grid grid-cols-12 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                <div className="col-span-4">Administrator Name</div>
                <div className="col-span-3">Assigned Role</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-3">System Actions</div>
              </div>

              {adminsList.map(adm => (
                <div key={adm.id} className="grid grid-cols-12 items-center px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50/40">
                  <div className="col-span-4 flex items-center gap-2 truncate font-bold text-slate-950 text-xs">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    {adm.name}
                  </div>
                  
                  <div className="col-span-3 text-[11px] font-semibold text-slate-655">
                    {adm.role}
                  </div>

                  <div className="col-span-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md max-w-[60px] text-center">
                    {adm.status}
                  </div>

                  <div className="col-span-3 flex items-center gap-4 text-[10px] font-semibold text-slate-700 select-none">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" defaultChecked />
                      Read
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" defaultChecked={adm.role !== 'Teacher Manager'} />
                      Write
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 3. STUDENT PROFILE OVERLAY PANEL (Module 2 Drawer)       */}
      {/* ======================================================== */}
      {selectedStudentDetail && (
        <div 
          className="absolute inset-0 bg-slate-950/60 z-40 flex justify-end pointer-events-auto cursor-pointer animate-fadeIn"
          onClick={() => setSelectedStudentDetail(null)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-[340px] h-full bg-white border-l border-slate-200 p-5 overflow-y-auto custom-scrollbar flex flex-col justify-between text-left cursor-default"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 shrink-0">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-display">
                  <User className="w-4 h-4 text-blue-600" />
                  Student Portfolio
                </h3>
                <button 
                  onClick={() => setSelectedStudentDetail(null)}
                  className="text-[11px] font-bold text-slate-450 hover:text-slate-650 cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Profile Card Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-950 leading-tight">{selectedStudentDetail.fullName || 'Anonymous student'}</h4>
                    <span className="text-[10px] font-mono text-slate-450 block truncate max-w-[180px]">ID: {selectedStudentDetail.id}</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-700 border-b border-slate-100 pb-1.5">
                    <span>Onboarding Wizard Progress</span>
                    <span className="font-mono text-blue-600">Step {selectedStudentDetail.step || 1} of 10</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1.5 flex-1 rounded-full ${
                          (i + 1) <= (selectedStudentDetail.step || 1) 
                            ? 'bg-blue-600' 
                            : 'bg-slate-200'
                        }`} 
                      />
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-center text-slate-800">
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-2.5">
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Engagement Index</div>
                    <div className="text-lg font-black text-slate-900 mt-1">{(selectedStudentDetail.step || 1) * 10}%</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-2.5">
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Commitment</div>
                    <div className="text-xs font-bold text-slate-800 capitalize mt-1.5">{selectedStudentDetail.dailyCommitment || 'none'}</div>
                  </div>
                </div>

                {/* Study & Preference details */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 text-slate-700">
                  <span className="text-[9px] font-mono tracking-widest text-blue-600 font-bold uppercase block">Academic Setup</span>
                  <div className="text-[11px] leading-tight space-y-1.5 font-medium">
                    <div><span className="text-slate-400">School Level:</span> <span className="capitalize">{selectedStudentDetail.educationLevel?.replace('-', ' ') || 'Not specified'}</span></div>
                    <div><span className="text-slate-400">Study Field:</span> <span>{selectedStudentDetail.fieldOfStudy || '—'}</span></div>
                    <div><span className="text-slate-400">Institution:</span> <span>{selectedStudentDetail.institution || '—'}</span></div>
                    <div><span className="text-slate-400">Learning Pref:</span> <span className="capitalize">{selectedStudentDetail.learningPreference || 'Not specified'}</span></div>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[9px] font-mono tracking-widest text-blue-600 font-bold uppercase block">AI Agent Recommendation</span>
                  <div className="bg-blue-50/40 border border-blue-100/50 rounded-xl p-3 flex gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-650 font-medium leading-relaxed">
                      {selectedStudentDetail.completed ? (
                        "Student completed all setup steps successfully. Recommend enrolling in introductory Python modules."
                      ) : (
                        `Wizard setup stalled at Step ${selectedStudentDetail.step || 1}. We suggest triggering a quick notification reminder.`
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom options */}
            <div className="pt-4 mt-4 border-t border-slate-100 shrink-0">
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setEditingProfile(selectedStudentDetail);
                    setSelectedStudentDetail(null);
                  }}
                  className="flex-1 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-xs font-bold text-slate-700 text-center cursor-pointer"
                >
                  Edit Student
                </button>
                <button 
                  onClick={() => {
                    setDeletingId(selectedStudentDetail.id || null);
                    setSelectedStudentDetail(null);
                  }}
                  className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. MODIFY DRAWER (For editing profile)                  */}
      {/* ======================================================== */}
      {editingProfile && (
        <div 
          className="absolute inset-0 bg-slate-950/60 z-40 flex justify-end pointer-events-auto cursor-pointer animate-fadeIn" 
          onClick={() => setEditingProfile(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[360px] h-full bg-white border-l border-slate-200 p-5 overflow-y-auto custom-scrollbar flex flex-col justify-between text-left cursor-default"
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2 shrink-0">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-display">
                <Edit className="w-4 h-4 text-blue-600" />
                Modify User Details
              </h3>
              <button 
                onClick={() => setEditingProfile(null)}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 flex-1">
              
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

              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <span className="text-[9px] font-mono tracking-widest text-[#2563EB] uppercase font-bold block">
                  AI & Learning Profile
                </span>
                
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Learning Style</label>
                    <select
                      value={editingProfile.learningPreference || ''}
                      onChange={(e: any) => setEditingProfile(prev => prev ? ({ ...prev, learningPreference: e.target.value }) : null)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="">None</option>
                      <option value="visual">Visual & Video</option>
                      <option value="hands-on">Hands-on Projects</option>
                      <option value="reading">Reading & Text</option>
                      <option value="audio">Audio & Podcasts</option>
                      <option value="interactive">Gamified Quizzes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Daily Commitment</label>
                    <select
                      value={editingProfile.dailyCommitment || ''}
                      onChange={(e: any) => setEditingProfile(prev => prev ? ({ ...prev, dailyCommitment: e.target.value }) : null)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="">None</option>
                      <option value="casual">Casual (10m/day)</option>
                      <option value="regular">Regular (25m/day)</option>
                      <option value="serious">Serious (45m/day)</option>
                      <option value="intensive">Intensive (60m+/day)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-700 select-none pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProfile.aiAdaptiveDifficulty}
                      onChange={(e) => setEditingProfile(prev => prev ? ({ ...prev, aiAdaptiveDifficulty: e.target.checked }) : null)}
                      className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5"
                    />
                    Adaptive Diff.
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProfile.aiStudyReminders}
                      onChange={(e) => setEditingProfile(prev => prev ? ({ ...prev, aiStudyReminders: e.target.checked }) : null)}
                      className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5"
                    />
                    AI Reminders
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProfile.aiCareerInsights}
                      onChange={(e) => setEditingProfile(prev => prev ? ({ ...prev, aiCareerInsights: e.target.checked }) : null)}
                      className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5"
                    />
                    Career Insights
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProfile.aiConceptExplainer}
                      onChange={(e) => setEditingProfile(prev => prev ? ({ ...prev, aiConceptExplainer: e.target.checked }) : null)}
                      className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5"
                    />
                    Concept Explainer
                  </label>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <span className="text-[9px] font-mono tracking-widest text-[#2563EB] uppercase font-bold block">
                  Notification Prefs
                </span>
                <div className="grid grid-cols-1 gap-1.5 text-[10px] font-semibold text-slate-700 select-none font-sans">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProfile.notifyEmailDigest}
                      onChange={(e) => setEditingProfile(prev => prev ? ({ ...prev, notifyEmailDigest: e.target.checked }) : null)}
                      className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5"
                    />
                    Weekly email digest reports
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProfile.notifyPush}
                      onChange={(e) => setEditingProfile(prev => prev ? ({ ...prev, notifyPush: e.target.checked }) : null)}
                      className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5"
                    />
                    Real-time push alerts
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProfile.notifyWeeklyAchievements}
                      onChange={(e) => setEditingProfile(prev => prev ? ({ ...prev, notifyWeeklyAchievements: e.target.checked }) : null)}
                      className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5"
                    />
                    Milestone alerts & badges
                  </label>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <span className="text-[9px] font-mono tracking-widest text-[#2563EB] uppercase font-bold block">
                  App Progress Status
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Step Location</label>
                    <select
                      value={(editingProfile as any).step || 10}
                      onChange={(e: any) => setEditingProfile(prev => prev ? ({ ...prev, step: parseInt(e.target.value, 10) }) : null)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="1">Step 1: Welcome</option>
                      <option value="2">Step 2: Personal</option>
                      <option value="3">Step 3: Academic</option>
                      <option value="4">Step 4: Guardian</option>
                      <option value="5">Step 5: Goals</option>
                      <option value="6">Step 6: Interests</option>
                      <option value="7">Step 7: Learning Style</option>
                      <option value="8">Step 8: Commitment</option>
                      <option value="9">Step 9: AI Settings</option>
                      <option value="10">Step 10: Notifications</option>
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
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs uppercase transition-colors shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
      {/* 5. DELETE CONFIRMATION MODAL                             */}
      {/* ======================================================== */}
      {deletingId && (
        <div className="absolute inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 pointer-events-auto cursor-pointer animate-fadeIn" onClick={() => setDeletingId(null)}>
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[280px] bg-white rounded-2xl border border-slate-150 p-4 text-center cursor-default space-y-3 shadow-2xl animate-fadeIn"
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
      {/* 6. BULK DELETE CONFIRMATION MODAL                        */}
      {/* ======================================================== */}
      {showBulkDeleteModal && (
        <div className="absolute inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 pointer-events-auto cursor-pointer animate-fadeIn" onClick={() => setShowBulkDeleteModal(false)}>
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[280px] bg-white rounded-2xl border border-slate-150 p-4 text-center cursor-default space-y-3 shadow-2xl animate-fadeIn"
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

      {/* ======================================================== */}
      {/* 7. AI ACTIONS DRAWER PANEL                               */}
      {/* ======================================================== */}
      {isAiDrawerOpen && (
        <div 
          className="absolute inset-0 bg-slate-950/60 z-50 flex justify-end pointer-events-auto cursor-pointer animate-fadeIn"
          onClick={() => setIsAiDrawerOpen(false)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-[360px] h-full bg-white border-l border-slate-200 p-6 overflow-y-auto custom-scrollbar flex flex-col justify-between text-left cursor-default"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-display">
                  <Sparkles className="w-4.5 h-4.5 text-blue-600 animate-pulse" />
                  AI Agent Actions Desk
                </h3>
                <button 
                  onClick={() => setIsAiDrawerOpen(false)}
                  className="text-xs font-bold text-slate-450 hover:text-slate-650 cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Summary and Recommendations */}
              <div className="space-y-4 font-sans">
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide">Automated Diagnostic</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    Our AI models monitor learner progression. Here are priority tasks proposed for system optimization based on live registration data.
                  </p>
                </div>

                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Interventions</span>

                <div className="space-y-3">
                  {/* Action 1 */}
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Dispatch Guardian Notifications</div>
                      <p className="text-xs text-slate-500 mt-1">
                        Trigger automated email reminders and explainer guides to guardians.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        showToast('Guardian notification sequence successfully launched!');
                        addAuditLog('Triggered guardian notification campaign via AI Action Desk');
                        setIsAiDrawerOpen(false);
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                    >
                      Run Campaign
                    </button>
                  </div>

                  {/* Action 2 */}
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Prune Stalled Registrations</div>
                      <p className="text-xs text-slate-500 mt-1">
                        Identify and notify students stalled at setup stages 1-3 for more than 48 hours.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        showToast('Stalled registrations identified. Follow-up sequence sent.');
                        addAuditLog('Executed stalled registrations prune & re-engagement filter');
                        setIsAiDrawerOpen(false);
                      }}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                    >
                      Prune & Re-engage
                    </button>
                  </div>

                  {/* Action 3 */}
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Optimize Learning Paths</div>
                      <p className="text-xs text-slate-500 mt-1">
                        Dynamically adjust AI conceptual explainer prompts for current student cohort.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        showToast('AI Conceptual path parameters updated successfully.');
                        addAuditLog('Re-calibrated AI conceptual pathways for cohorts');
                        setIsAiDrawerOpen(false);
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                    >
                      Optimize Pathways
                    </button>
                  </div>

                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono text-center pt-4 border-t border-slate-100 shrink-0">
              AI Desk Sandbox v1.0
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
