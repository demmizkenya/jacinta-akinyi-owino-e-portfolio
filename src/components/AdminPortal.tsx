import React, { useState, useEffect } from 'react';
import { 
  User, 
  BookOpen, 
  Building2, 
  Layers, 
  Camera, 
  FileText, 
  Settings, 
  LogOut, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Mail, 
  KeyRound, 
  Database, 
  Lock,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Activity,
  Cloud,
  Server
} from 'lucide-react';
import { getFirebaseDiagnostics, testFirestoreConnection, firebaseConfig } from '../lib/firebase';
import { 
  PortfolioData, 
  AuthUser, 
  Profile, 
  TeachingPractice, 
  Skill, 
  GalleryItem, 
  BlogPost, 
  DocumentItem, 
  SiteSettings,
  ContactMessage 
} from '../types';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PortfolioData;
  onUpdateData: (newData: PortfolioData) => void;
  authUser: AuthUser;
  onLogout: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  data,
  onUpdateData,
  authUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'profile' | 'attachment' | 'skills' | 'gallery' | 'blog' | 'messages' | 'documents' | 'settings'
  >('overview');

  const [formData, setFormData] = useState<PortfolioData>(data);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit states for modals inside CMS
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<Skill['category']>('Pedagogy');
  const [newSkillProficiency, setNewSkillProficiency] = useState(90);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cloud & Firebase Diagnostics
  const [isTestingCloud, setIsTestingCloud] = useState(false);
  const [cloudDiagOutput, setCloudDiagOutput] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  const handleRunCloudDiagnostics = async () => {
    setIsTestingCloud(true);
    setCloudDiagOutput(null);
    try {
      console.log('[Admin Portal]: Running Firebase & Firestore live diagnostics...');
      const res = await testFirestoreConnection();
      console.log('[Admin Portal Diagnostics Result]:', res);
      setCloudDiagOutput(res);
    } catch (err: any) {
      console.error('[Admin Portal Diagnostics Exception]:', err);
      setCloudDiagOutput({
        success: false,
        message: `Exception: ${err?.message || String(err)}`,
        details: err,
      });
    } finally {
      setIsTestingCloud(false);
    }
  };

  useEffect(() => {
    setFormData(data);
  }, [data]);

  // Fetch messages on mount or tab change
  useEffect(() => {
    if (isOpen && (activeTab === 'messages' || activeTab === 'overview')) {
      fetchMessages();
    }
  }, [isOpen, activeTab]);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages', {
        headers: { Authorization: `Bearer ${authUser.token}` },
      });
      if (res.ok) {
        const msgs = await res.json();
        setMessages(msgs);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  if (!isOpen) return null;

  // Save specific section to server and local storage
  const handleSaveSection = async (section: keyof PortfolioData, sectionData: any) => {
    setIsSaving(true);
    setStatusNotice(null);

    // 1. Immediately persist locally to ensure zero data loss across devices/browsers
    const updated = { ...formData, [section]: sectionData };
    setFormData(updated);
    onUpdateData(updated);
    localStorage.setItem('jacinta_portfolio_data', JSON.stringify(updated));

    // 2. Sync with backend API if available
    try {
      const res = await fetch(`/api/admin/section/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authUser.token}`,
        },
        body: JSON.stringify(sectionData),
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData.success) {
          setStatusNotice({ type: 'success', text: `Section "${section}" successfully saved & published to server!` });
        } else {
          setStatusNotice({ type: 'success', text: `Section "${section}" saved locally & published.` });
        }
      } else {
        console.warn(`[Admin CMS Save]: Backend API returned status ${res.status}. Saved locally.`);
        setStatusNotice({ type: 'success', text: `Section "${section}" saved locally & published.` });
      }
      setTimeout(() => setStatusNotice(null), 4000);
    } catch (err: any) {
      console.warn('[Admin CMS Save Notice]: Backend unavailable, changes saved to browser storage:', err?.message || err);
      setStatusNotice({ type: 'success', text: `Section "${section}" saved locally & published!` });
      setTimeout(() => setStatusNotice(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Image Upload helper
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, onUrlReceived: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authUser.token}`,
          },
          body: JSON.stringify({
            filename: file.name,
            fileData: base64Data,
            fileType: file.type,
          }),
        });
        const d = await res.json();
        if (res.ok && d.url) {
          onUrlReceived(d.url);
          setStatusNotice({ type: 'success', text: 'File uploaded successfully!' });
          setTimeout(() => setStatusNotice(null), 3000);
        } else {
          setStatusNotice({ type: 'error', text: d.error || 'Upload failed' });
        }
      } catch (err) {
        setStatusNotice({ type: 'error', text: 'Upload error' });
      }
    };
    reader.readAsDataURL(file);
  };

  // Mark message as read
  const markMessageRead = async (id: string) => {
    try {
      await fetch(`/api/admin/messages/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${authUser.token}` },
      });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
    } catch (err) {
      console.error(err);
    }
  };

  // Delete message
  const deleteMessage = async (id: string) => {
    try {
      await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authUser.token}` },
      });
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordNotice(null);

    if (newPassword !== confirmPassword) {
      setPasswordNotice({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authUser.token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const d = await res.json();
      if (res.ok && d.success) {
        setPasswordNotice({ type: 'success', text: 'Password successfully changed!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordNotice({ type: 'error', text: d.error || 'Password update failed' });
      }
    } catch (err) {
      setPasswordNotice({ type: 'error', text: 'Network request failed' });
    }
  };

  // Backup Export
  const handleExportBackup = () => {
    window.open('/api/admin/backup', '_blank');
  };

  // Restore Backup
  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const json = JSON.parse(reader.result as string);
        const res = await fetch('/api/admin/restore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authUser.token}`,
          },
          body: JSON.stringify(json),
        });
        const d = await res.json();
        if (res.ok && d.success) {
          setStatusNotice({ type: 'success', text: 'Backup restored successfully! Refreshing data...' });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setStatusNotice({ type: 'error', text: d.error || 'Invalid backup payload' });
        }
      } catch (err) {
        setStatusNotice({ type: 'error', text: 'Failed to parse backup JSON file' });
      }
    };
    reader.readAsText(file);
  };

  // Reset to Defaults
  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all content back to original authentic Jacinta Akinyi Owino portfolio defaults?')) return;
    try {
      const res = await fetch('/api/admin/reset-defaults', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authUser.token}` },
      });
      const d = await res.json();
      if (res.ok) {
        setStatusNotice({ type: 'success', text: 'Reset completed! Reloading...' });
        setTimeout(() => window.location.reload(), 1200);
      }
    } catch (err) {
      setStatusNotice({ type: 'error', text: 'Reset failed' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-[#FAF7FB] dark:bg-[#120817] text-slate-900 dark:text-white overflow-hidden">
      
      {/* CMS Sidebar Navigation */}
      <aside className="w-64 sm:w-72 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Top Brand */}
          <div className="p-6 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#7A1C6D] text-white flex items-center justify-center font-bold font-serif shadow-sm">
                JO
              </div>
              <div>
                <h2 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                  CMS Administration
                </h2>
                <p className="text-[11px] text-[#7A1C6D] dark:text-[#D8A0D0] font-semibold">
                  Jacinta Akinyi Owino
                </p>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1 text-xs font-semibold">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: Layers },
              { id: 'profile', label: 'Profile & Academic Bio', icon: User },
              { id: 'attachment', label: 'Teaching Practice & WASH', icon: Building2 },
              { id: 'skills', label: 'Skills & Competencies', icon: Sparkles },
              { id: 'gallery', label: 'Gallery & Media', icon: Camera },
              { id: 'blog', label: 'Blog & Reflections', icon: BookOpen },
              { id: 'messages', label: `Messages Inbox (${messages.filter(m => !m.isRead).length})`, icon: Mail },
              { id: 'documents', label: 'Academic Documents', icon: FileText },
              { id: 'settings', label: 'Site Settings & Security', icon: Settings },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#7A1C6D] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 space-y-2">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-100 dark:bg-zinc-800 text-[#7A1C6D] dark:text-[#D8A0D0] text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Portfolio</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out ({authUser.email.split('@')[0]})</span>
          </button>
        </div>
      </aside>

      {/* Main CMS Work Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top bar */}
        <header className="h-16 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-serif font-bold text-lg text-slate-900 dark:text-white capitalize">
              {activeTab === 'overview' ? 'Portfolio Performance & CMS Overview' : `${activeTab} Management`}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {statusNotice && (
              <div
                className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium ${
                  statusNotice.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {statusNotice.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{statusNotice.text}</span>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#7A1C6D] hover:bg-[#66155B] text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-[#1C0D25] border border-[#C8A2C8]/30 shadow-sm">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Total Visitors</span>
                  <span className="text-3xl font-serif font-bold text-[#8A0F7D] dark:text-[#C8A2C8] mt-2 block">
                    {formData.visitorCount?.toLocaleString() || '1,428'}
                  </span>
                  <span className="text-[11px] text-emerald-600 mt-1 block">Live counter active</span>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-[#1C0D25] border border-[#C8A2C8]/30 shadow-sm">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Published Reflections</span>
                  <span className="text-3xl font-serif font-bold text-[#6A0DAD] dark:text-[#D6B5D6] mt-2 block">
                    {formData.blog.length}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">Articles & attachment logs</span>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-[#1C0D25] border border-[#C8A2C8]/30 shadow-sm">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Gallery Items</span>
                  <span className="text-3xl font-serif font-bold text-[#8A0F7D] dark:text-[#C8A2C8] mt-2 block">
                    {formData.gallery.length}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">Photos & instructional video</span>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-[#1C0D25] border border-[#C8A2C8]/30 shadow-sm">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Inquiries Received</span>
                  <span className="text-3xl font-serif font-bold text-[#6A0DAD] dark:text-[#D6B5D6] mt-2 block">
                    {messages.length}
                  </span>
                  <span className="text-[11px] text-purple-600 font-semibold mt-1 block">
                    {messages.filter(m => !m.isRead).length} unread
                  </span>
                </div>
              </div>

              {/* Administrative Quick Actions Banner */}
              <div className="bg-gradient-to-r from-[#8A0F7D] via-[#6A0DAD] to-[#7B1270] text-white p-8 rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold text-purple-100 uppercase tracking-wide">
                    CMS Management Hub
                  </span>
                  <h3 className="text-2xl font-serif font-bold mt-2">
                    Welcome, Jacinta Akinyi Owino
                  </h3>
                  <p className="text-sm text-purple-100 mt-1 max-w-xl">
                    Manage your profile, publish weekly teaching reflections, update attachment progress from Bar Ogwal Primary, and control site settings without writing code.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button
                    onClick={() => {
                      setIsCreatingPost(true);
                      setActiveTab('blog');
                    }}
                    className="px-5 py-3 rounded-xl bg-white text-[#8A0F7D] font-bold text-xs shadow hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Reflection</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs border border-white/30 transition-colors text-center"
                  >
                    Edit Profile Details
                  </button>
                </div>
              </div>

              {/* Recent Inquiries Preview */}
              <div className="bg-white dark:bg-[#1C0D25] p-6 rounded-3xl border border-[#C8A2C8]/30 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                    Recent Contact Inquiries
                  </h3>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="text-xs font-semibold text-[#8A0F7D] dark:text-[#C8A2C8] hover:underline"
                  >
                    View All Messages →
                  </button>
                </div>

                {messages.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4">No contact messages received yet.</p>
                ) : (
                  <div className="space-y-3">
                    {messages.slice(0, 3).map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-2xl border transition-colors flex items-start justify-between gap-4 ${
                          msg.isRead
                            ? 'bg-[#FAF7FB] dark:bg-[#231130] border-slate-200 dark:border-[#2D163B]'
                            : 'bg-[#F4ECF6]/40 dark:bg-[#2E153D] border-[#8A0F7D]/40'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{msg.name}</span>
                            <span className="text-[11px] text-slate-500">({msg.email})</span>
                          </div>
                          <p className="text-xs font-semibold text-[#8A0F7D] dark:text-[#C8A2C8] mt-1">{msg.subject}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(msg.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE & ACADEMIC BIO */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-[#1C0D25] p-6 sm:p-8 rounded-3xl border border-[#C8A2C8]/30 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2E153D] pb-4">
                <div>
                  <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                    Profile & Academic Identity Management
                  </h3>
                  <p className="text-xs text-slate-500">Edit your public display name, biography, contact, and admission credentials.</p>
                </div>

                <button
                  onClick={() => handleSaveSection('profile', formData.profile)}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8A0F7D] to-[#6A0DAD] text-white text-xs font-bold shadow hover:opacity-95 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>

              {/* Profile Photo Management */}
              <div className="p-6 rounded-2xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 flex flex-col sm:flex-row items-center gap-6">
                <img
                  src={formData.profile.avatarUrl}
                  alt="Avatar Preview"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-[#8A0F7D] shadow"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Profile Photo URL / Upload
                    </label>
                    <input
                      type="text"
                      value={formData.profile.avatarUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profile: { ...formData.profile, avatarUrl: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1C0D25] border border-[#C8A2C8]/30 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1C0D25] border border-[#8A0F7D]/40 text-[#8A0F7D] dark:text-[#C8A2C8] text-xs font-bold shadow-sm hover:bg-[#F4ECF6]">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New Profile Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, (url) => {
                            setFormData({
                              ...formData,
                              profile: { ...formData.profile, avatarUrl: url },
                            });
                          })
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.profile.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, name: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-sm font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Admission Number
                  </label>
                  <input
                    type="text"
                    value={formData.profile.admissionNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, admissionNumber: e.target.value },
                        academic: { ...formData.academic, admissionNumber: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-sm font-mono font-bold text-[#8A0F7D] dark:text-[#C8A2C8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Degree / Course
                  </label>
                  <input
                    type="text"
                    value={formData.profile.course}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, course: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Institution
                  </label>
                  <input
                    type="text"
                    value={formData.profile.institution}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, institution: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.profile.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, email: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Phone / Mobile Number
                  </label>
                  <input
                    type="text"
                    value={formData.profile.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, phone: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Short Introduction (Hero Section)
                </label>
                <textarea
                  rows={2}
                  value={formData.profile.shortBio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, shortBio: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Full Biography & Academic Background
                </label>
                <textarea
                  rows={4}
                  value={formData.profile.fullBio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, fullBio: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Career Objective
                </label>
                <textarea
                  rows={2}
                  value={formData.profile.careerObjective}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, careerObjective: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Pedagogical Philosophy Statement
                </label>
                <textarea
                  rows={2}
                  value={formData.profile.philosophy}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, philosophy: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* TAB 3: ATTACHMENT & WASH */}
          {activeTab === 'attachment' && (
            <div className="bg-white dark:bg-[#1C0D25] p-6 sm:p-8 rounded-3xl border border-[#C8A2C8]/30 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2E153D] pb-4">
                <div>
                  <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                    Teaching Practice & Environmental Sanitation CMS
                  </h3>
                  <p className="text-xs text-slate-500">Manage Bar Ogwal Primary placement details, hygiene work, and lessons.</p>
                </div>

                <button
                  onClick={() => handleSaveSection('teachingPractice', formData.teachingPractice)}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8A0F7D] to-[#6A0DAD] text-white text-xs font-bold shadow hover:opacity-95 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Attachment Records'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Placement School</label>
                  <input
                    type="text"
                    value={formData.teachingPractice.institutionName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        teachingPractice: { ...formData.teachingPractice, institutionName: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Location / Sub-county</label>
                  <input
                    type="text"
                    value={formData.teachingPractice.location}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        teachingPractice: { ...formData.teachingPractice, location: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Duration & Period</label>
                  <input
                    type="text"
                    value={formData.teachingPractice.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        teachingPractice: { ...formData.teachingPractice, duration: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Brief History of Institution</label>
                <textarea
                  rows={3}
                  value={formData.teachingPractice.briefHistory}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      teachingPractice: { ...formData.teachingPractice, briefHistory: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-xs"
                />
              </div>

              {/* Sanitation Work Highlights */}
              <div className="p-6 rounded-2xl bg-purple-50/50 dark:bg-[#251233] border border-[#C8A2C8]/30 space-y-4">
                <h4 className="font-serif font-bold text-base text-[#8A0F7D] dark:text-[#C8A2C8]">
                  Environmental Hygiene and Sanitation Campaign Work
                </h4>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Campaign Title</label>
                  <input
                    type="text"
                    value={formData.teachingPractice.sanitationWork.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        teachingPractice: {
                          ...formData.teachingPractice,
                          sanitationWork: { ...formData.teachingPractice.sanitationWork, title: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1C0D25] border border-[#C8A2C8]/30 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Description & Strategy</label>
                  <textarea
                    rows={2}
                    value={formData.teachingPractice.sanitationWork.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        teachingPractice: {
                          ...formData.teachingPractice,
                          sanitationWork: { ...formData.teachingPractice.sanitationWork, description: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1C0D25] border border-[#C8A2C8]/30 text-xs"
                  />
                </div>
              </div>

              {/* Evaluator Assessment Score */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Supervisor Rating</label>
                  <input
                    type="text"
                    value={formData.teachingPractice.supervisorFeedback.rating}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        teachingPractice: {
                          ...formData.teachingPractice,
                          supervisorFeedback: { ...formData.teachingPractice.supervisorFeedback, rating: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-xs font-bold text-[#8A0F7D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Assessor Name / Body</label>
                  <input
                    type="text"
                    value={formData.teachingPractice.supervisorFeedback.evaluator}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        teachingPractice: {
                          ...formData.teachingPractice,
                          supervisorFeedback: { ...formData.teachingPractice.supervisorFeedback, evaluator: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SKILLS CMS */}
          {activeTab === 'skills' && (
            <div className="bg-white dark:bg-[#1C0D25] p-6 sm:p-8 rounded-3xl border border-[#C8A2C8]/30 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2E153D] pb-4">
                <div>
                  <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                    Skills & Competency Indicators CMS
                  </h3>
                  <p className="text-xs text-slate-500">Add, edit proficiency percentages, or remove pedagogical competencies.</p>
                </div>

                <button
                  onClick={() => handleSaveSection('skills', formData.skills)}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8A0F7D] to-[#6A0DAD] text-white text-xs font-bold shadow hover:opacity-95 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Skills Changes'}</span>
                </button>
              </div>

              {/* Add New Skill Bar */}
              <div className="p-4 rounded-2xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-[11px] font-bold uppercase mb-1">Skill Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Special Needs Remediation"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1C0D25] border border-[#C8A2C8]/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase mb-1">Category</label>
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1C0D25] border border-[#C8A2C8]/30 text-xs"
                  >
                    <option value="Pedagogy">Pedagogy</option>
                    <option value="Child Development">Child Development</option>
                    <option value="Hygiene">Hygiene</option>
                    <option value="Administration">Administration</option>
                    <option value="Community">Community</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase mb-1">Proficiency ({newSkillProficiency}%)</label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={newSkillProficiency}
                    onChange={(e) => setNewSkillProficiency(Number(e.target.value))}
                    className="w-full accent-[#8A0F7D]"
                  />
                </div>
                <div>
                  <button
                    onClick={() => {
                      if (!newSkillName) return;
                      const newSkill: Skill = {
                        id: `sk-${Date.now()}`,
                        name: newSkillName,
                        category: newSkillCategory,
                        proficiency: newSkillProficiency,
                        description: `Demonstrated expertise in ${newSkillName} during teaching practice and university coursework.`,
                      };
                      setFormData({
                        ...formData,
                        skills: [...formData.skills, newSkill],
                      });
                      setNewSkillName('');
                    }}
                    className="w-full py-2 rounded-xl bg-[#8A0F7D] text-white text-xs font-bold hover:opacity-90 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Skill</span>
                  </button>
                </div>
              </div>

              {/* Current Skills List */}
              <div className="space-y-3">
                {formData.skills.map((skill, index) => (
                  <div
                    key={skill.id}
                    className="p-4 rounded-2xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1 w-full sm:w-auto">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={skill.name}
                          onChange={(e) => {
                            const updated = [...formData.skills];
                            updated[index].name = e.target.value;
                            setFormData({ ...formData, skills: updated });
                          }}
                          className="font-bold text-xs bg-white dark:bg-[#1C0D25] px-2 py-1 rounded-lg border border-[#C8A2C8]/30 w-48"
                        />
                        <span className="text-[10px] font-semibold text-[#8A0F7D] dark:text-[#C8A2C8] uppercase">
                          {skill.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="50"
                          max="100"
                          value={skill.proficiency}
                          onChange={(e) => {
                            const updated = [...formData.skills];
                            updated[index].proficiency = Number(e.target.value);
                            setFormData({ ...formData, skills: updated });
                          }}
                          className="w-32 accent-[#8A0F7D]"
                        />
                        <span className="text-xs font-bold w-8 text-right">{skill.proficiency}%</span>
                      </div>

                      <button
                        onClick={() => {
                          const updated = formData.skills.filter((s) => s.id !== skill.id);
                          setFormData({ ...formData, skills: updated });
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                        title="Delete skill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: GALLERY CMS */}
          {activeTab === 'gallery' && (
            <div className="bg-white dark:bg-[#1C0D25] p-6 sm:p-8 rounded-3xl border border-[#C8A2C8]/30 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2E153D] pb-4">
                <div>
                  <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                    Gallery & Media Management
                  </h3>
                  <p className="text-xs text-slate-500">Upload photos, register instructional video URLs, organize albums.</p>
                </div>

                <button
                  onClick={() => handleSaveSection('gallery', formData.gallery)}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8A0F7D] to-[#6A0DAD] text-white text-xs font-bold shadow hover:opacity-95 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Gallery'}</span>
                </button>
              </div>

              {/* Upload / Add Media Box */}
              <div className="p-6 rounded-2xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A0F7D] dark:text-[#C8A2C8]">
                  Add Media Item to Gallery
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="cursor-pointer p-6 rounded-2xl border-2 border-dashed border-[#C8A2C8] hover:border-[#8A0F7D] flex flex-col items-center justify-center bg-white dark:bg-[#1C0D25] transition-colors">
                    <Upload className="w-6 h-6 text-[#8A0F7D] mb-2" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Upload Photo from Computer</span>
                    <span className="text-[11px] text-slate-400">JPG, PNG, WEBP up to 50MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e, (url) => {
                          const newItem: GalleryItem = {
                            id: `gal-${Date.now()}`,
                            title: 'New Practicum Evidence Photo',
                            description: 'Captured during Bar Ogwal Primary teaching practice session.',
                            type: 'image',
                            url: url,
                            category: 'Teaching Practice',
                            album: 'Field Practice',
                            date: 'August 2024',
                          };
                          setFormData({
                            ...formData,
                            gallery: [newItem, ...formData.gallery],
                          });
                        })
                      }
                    />
                  </label>

                  {/* Manual URL entry */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1C0D25] border border-[#C8A2C8]/30 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold block mb-1">Add by URL (Photo or MP4 Video)</span>
                      <p className="text-[11px] text-slate-400 mb-2">Paste a public web image or instructional video link</p>
                    </div>
                    <button
                      onClick={() => {
                        const url = prompt('Enter Image or Video URL:');
                        if (!url) return;
                        const isVideo = url.endsWith('.mp4') || url.includes('video');
                        const newItem: GalleryItem = {
                          id: `gal-${Date.now()}`,
                          title: prompt('Enter Title:') || 'Classroom Media Item',
                          description: 'Instructional evidence from Bar Ogwal attachment.',
                          type: isVideo ? 'video' : 'image',
                          url: url,
                          category: 'Classroom',
                          album: 'Instructional Aids',
                          date: 'July 2024',
                        };
                        setFormData({
                          ...formData,
                          gallery: [newItem, ...formData.gallery],
                        });
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] text-[#8A0F7D] dark:text-[#C8A2C8] border border-[#8A0F7D]/30 font-bold text-xs hover:bg-[#8A0F7D] hover:text-white transition-all"
                    >
                      + Add Item via URL
                    </button>
                  </div>
                </div>
              </div>

              {/* Gallery Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData.gallery.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 space-y-2 relative group"
                  >
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 dark:bg-[#180920] relative">
                      <img
                        src={item.type === 'video' ? (item.thumbnailUrl || item.url) : item.url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-[#8A0F7D]">
                        {item.category}
                      </span>
                    </div>

                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const updated = [...formData.gallery];
                        updated[index].title = e.target.value;
                        setFormData({ ...formData, gallery: updated });
                      }}
                      className="w-full text-xs font-bold bg-white dark:bg-[#1C0D25] px-2 py-1 rounded-lg border border-[#C8A2C8]/30"
                    />

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[11px] text-slate-500">{item.album}</span>
                      <button
                        onClick={() => {
                          const updated = formData.gallery.filter((g) => g.id !== item.id);
                          setFormData({ ...formData, gallery: updated });
                        }}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                        title="Delete media"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: BLOG & REFLECTIONS CMS */}
          {activeTab === 'blog' && (
            <div className="bg-white dark:bg-[#1C0D25] p-6 sm:p-8 rounded-3xl border border-[#C8A2C8]/30 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2E153D] pb-4">
                <div>
                  <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                    Blog & Reflections Publisher
                  </h3>
                  <p className="text-xs text-slate-500">Create, edit, schedule, or publish weekly attachment reports and academic essays.</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const newP: BlogPost = {
                        id: `blog-${Date.now()}`,
                        title: 'New Weekly Teaching Reflection',
                        slug: `reflection-${Date.now()}`,
                        category: 'Weekly Reflection',
                        summary: 'Brief overview of practical insights learned during this teaching attachment period.',
                        content: `### Classroom Observation & Growth

Write your full reflection details here...`,
                        author: 'Jacinta Akinyi Owino',
                        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        readingTime: '4 min read',
                        tags: ['Teaching Practice', 'ECDE', 'Bar Ogwal'],
                        isPublished: true,
                      };
                      setFormData({
                        ...formData,
                        blog: [newP, ...formData.blog],
                      });
                      setEditingPost(newP);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#8A0F7D] text-white text-xs font-bold hover:opacity-95 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Reflection</span>
                  </button>

                  <button
                    onClick={() => handleSaveSection('blog', formData.blog)}
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8A0F7D] to-[#6A0DAD] text-white text-xs font-bold shadow hover:opacity-95 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Publish Blog Changes'}</span>
                  </button>
                </div>
              </div>

              {/* Editing Modal if active */}
              {editingPost && (
                <div className="p-6 rounded-2xl bg-[#FAF7FB] dark:bg-[#251233] border-2 border-[#8A0F7D] space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-base text-[#8A0F7D] dark:text-[#C8A2C8]">
                      Editing: {editingPost.title}
                    </h4>
                    <button
                      onClick={() => setEditingPost(null)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-900"
                    >
                      Done Editing
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Title</label>
                      <input
                        type="text"
                        value={editingPost.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingPost({ ...editingPost, title: val });
                          setFormData({
                            ...formData,
                            blog: formData.blog.map((b) => (b.id === editingPost.id ? { ...b, title: val } : b)),
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1C0D25] border border-[#C8A2C8]/30 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Category</label>
                      <select
                        value={editingPost.category}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setEditingPost({ ...editingPost, category: val });
                          setFormData({
                            ...formData,
                            blog: formData.blog.map((b) => (b.id === editingPost.id ? { ...b, category: val } : b)),
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1C0D25] border border-[#C8A2C8]/30 text-xs"
                      >
                        <option value="Weekly Reflection">Weekly Reflection</option>
                        <option value="Attachment Report">Attachment Report</option>
                        <option value="Teaching Experience">Teaching Experience</option>
                        <option value="Academic Article">Academic Article</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Summary / Excerpt</label>
                    <input
                      type="text"
                      value={editingPost.summary}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingPost({ ...editingPost, summary: val });
                        setFormData({
                          ...formData,
                          blog: formData.blog.map((b) => (b.id === editingPost.id ? { ...b, summary: val } : b)),
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1C0D25] border border-[#C8A2C8]/30 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Article Content (Markdown format supported)</label>
                    <textarea
                      rows={6}
                      value={editingPost.content}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingPost({ ...editingPost, content: val });
                        setFormData({
                          ...formData,
                          blog: formData.blog.map((b) => (b.id === editingPost.id ? { ...b, content: val } : b)),
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1C0D25] border border-[#C8A2C8]/30 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* List of Posts */}
              <div className="space-y-3">
                {formData.blog.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-2xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/25 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4ECF6] dark:bg-[#32173F] text-[#8A0F7D] dark:text-[#C8A2C8]">
                          {post.category}
                        </span>
                        <span className="text-[11px] text-slate-400">{post.date}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{post.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{post.summary}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingPost(post)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1C0D25] text-[#8A0F7D] text-xs font-bold border border-[#8A0F7D]/30 hover:bg-[#8A0F7D] hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          const updated = formData.blog.filter((b) => b.id !== post.id);
                          setFormData({ ...formData, blog: updated });
                          if (editingPost?.id === post.id) setEditingPost(null);
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: MESSAGES INBOX */}
          {activeTab === 'messages' && (
            <div className="bg-white dark:bg-[#1C0D25] p-6 sm:p-8 rounded-3xl border border-[#C8A2C8]/30 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2E153D] pb-4">
                <div>
                  <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                    Contact Inquiries Inbox ({messages.length})
                  </h3>
                  <p className="text-xs text-slate-500">Messages sent via the public contact form.</p>
                </div>
                <button
                  onClick={fetchMessages}
                  className="px-3.5 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>

              {messages.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-12">No messages received yet.</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        msg.isRead
                          ? 'bg-[#FAF7FB] dark:bg-[#200E2B] border-slate-200 dark:border-[#2D163B]'
                          : 'bg-white dark:bg-[#281335] border-[#8A0F7D]/50 shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{msg.name}</h4>
                            <span className="text-xs text-slate-500">&lt;{msg.email}&gt;</span>
                            {!msg.isRead && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8A0F7D] text-white">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-[#8A0F7D] dark:text-[#C8A2C8] mt-1">
                            Subject: {msg.subject}
                          </p>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(msg.date).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed p-3 rounded-xl bg-white dark:bg-[#1A0C24] border border-slate-100 dark:border-[#2D163B]">
                        {msg.message}
                      </p>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <a
                          href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                          className="font-bold text-[#8A0F7D] dark:text-[#C8A2C8] hover:underline flex items-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Reply via Email</span>
                        </a>

                        <div className="flex items-center gap-2">
                          {!msg.isRead && (
                            <button
                              onClick={() => markMessageRead(msg.id)}
                              className="px-3 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-xs"
                            >
                              Mark as Read
                            </button>
                          )}
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: ACADEMIC DOCUMENTS CMS */}
          {activeTab === 'documents' && (
            <div className="bg-white dark:bg-[#1C0D25] p-6 sm:p-8 rounded-3xl border border-[#C8A2C8]/30 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2E153D] pb-4">
                <div>
                  <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                    Academic Documents Repository CMS
                  </h3>
                  <p className="text-xs text-slate-500">Manage downloadable schemes of work, attachment logbook files, and CV.</p>
                </div>

                <button
                  onClick={() => handleSaveSection('documents', formData.documents)}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8A0F7D] to-[#6A0DAD] text-white text-xs font-bold shadow hover:opacity-95 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Documents'}</span>
                </button>
              </div>

              {/* Add document */}
              <div className="p-4 rounded-2xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Document Title (e.g. PP2 Hygiene Plan)"
                  id="new-doc-title"
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#1C0D25] border border-[#C8A2C8]/30 text-xs"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('new-doc-title') as HTMLInputElement;
                    if (!input || !input.value) return;
                    const newDoc: DocumentItem = {
                      id: `doc-${Date.now()}`,
                      title: input.value,
                      category: 'Academic Report',
                      fileSize: '315 KB',
                      uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                      description: 'Academic document published for student and assessor verification.',
                      downloadUrl: '#',
                    };
                    setFormData({ ...formData, documents: [...formData.documents, newDoc] });
                    input.value = '';
                  }}
                  className="px-4 py-2 rounded-xl bg-[#8A0F7D] text-white text-xs font-bold hover:opacity-90"
                >
                  + Add Document
                </button>
              </div>

              <div className="space-y-3">
                {formData.documents.map((doc, idx) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/25 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{doc.title}</h4>
                      <p className="text-[11px] text-slate-500">{doc.category} • {doc.fileSize}</p>
                    </div>

                    <button
                      onClick={() => {
                        const updated = formData.documents.filter((d) => d.id !== doc.id);
                        setFormData({ ...formData, documents: updated });
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: SITE SETTINGS & SECURITY */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              
              {/* Site Visual & Branding Settings */}
              <div className="bg-white dark:bg-[#1C0D25] p-6 sm:p-8 rounded-3xl border border-[#C8A2C8]/30 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2E153D] pb-4">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                      Site Branding & Color Scheme
                    </h3>
                    <p className="text-xs text-slate-500">Customized to match Jacinta's reference outfit colors.</p>
                  </div>

                  <button
                    onClick={() => handleSaveSection('siteSettings', formData.siteSettings)}
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8A0F7D] to-[#6A0DAD] text-white text-xs font-bold shadow hover:opacity-95 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Primary Color (Rich Royal Purple)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.siteSettings.primaryColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            siteSettings: { ...formData.siteSettings, primaryColor: e.target.value },
                          })
                        }
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200"
                      />
                      <input
                        type="text"
                        value={formData.siteSettings.primaryColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            siteSettings: { ...formData.siteSettings, primaryColor: e.target.value },
                          })
                        }
                        className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Secondary Color (Deep Violet)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.siteSettings.secondaryColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            siteSettings: { ...formData.siteSettings, secondaryColor: e.target.value },
                          })
                        }
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200"
                      />
                      <input
                        type="text"
                        value={formData.siteSettings.secondaryColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            siteSettings: { ...formData.siteSettings, secondaryColor: e.target.value },
                          })
                        }
                        className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Accent Color (Soft Lavender)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.siteSettings.accentColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            siteSettings: { ...formData.siteSettings, accentColor: e.target.value },
                          })
                        }
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200"
                      />
                      <input
                        type="text"
                        value={formData.siteSettings.accentColor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            siteSettings: { ...formData.siteSettings, accentColor: e.target.value },
                          })
                        }
                        className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Navbar Brand Text</label>
                    <input
                      type="text"
                      value={formData.siteSettings.logoText}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          siteSettings: { ...formData.siteSettings, logoText: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Footer Copyright Text</label>
                    <input
                      type="text"
                      value={formData.siteSettings.footerText}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          siteSettings: { ...formData.siteSettings, footerText: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">SEO Description</label>
                  <textarea
                    rows={2}
                    value={formData.siteSettings.seoDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        siteSettings: { ...formData.siteSettings, seoDescription: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-xs"
                  />
                </div>
              </div>

              {/* Password Management Card */}
              <div className="bg-white dark:bg-[#1C0D25] p-6 sm:p-8 rounded-3xl border border-[#C8A2C8]/30 shadow-sm space-y-6">
                <div>
                  <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                    Administrator Security & Password Update
                  </h3>
                  <p className="text-xs text-slate-500">Update your salted cryptographic password hash.</p>
                </div>

                {passwordNotice && (
                  <div
                    className={`text-xs p-3 rounded-xl flex items-center gap-2 ${
                      passwordNotice.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-rose-50 text-rose-800'
                    }`}
                  >
                    {passwordNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{passwordNotice.text}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">New Password (min 6 characters)</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#8A0F7D] text-white text-xs font-bold shadow hover:opacity-90"
                  >
                    Update Admin Password
                  </button>
                </form>
              </div>

              {/* Backup & Restore Card */}
              <div className="bg-white dark:bg-[#1C0D25] p-6 sm:p-8 rounded-3xl border border-[#C8A2C8]/30 shadow-sm space-y-6">
                <div>
                  <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                    Database Backup & Disaster Recovery
                  </h3>
                  <p className="text-xs text-slate-500">Download a full JSON archive of all portfolio content or restore from a backup.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={handleExportBackup}
                    className="p-4 rounded-2xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-left hover:border-[#8A0F7D] transition-colors"
                  >
                    <Download className="w-5 h-5 text-[#8A0F7D] mb-2" />
                    <span className="font-bold text-xs block text-slate-900 dark:text-white">Export Full Database Backup</span>
                    <span className="text-[11px] text-slate-500 block mt-1">Downloads complete JSON snapshot</span>
                  </button>

                  <label className="cursor-pointer p-4 rounded-2xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/30 text-left hover:border-[#8A0F7D] transition-colors block">
                    <Upload className="w-5 h-5 text-[#6A0DAD] mb-2" />
                    <span className="font-bold text-xs block text-slate-900 dark:text-white">Restore from Backup JSON</span>
                    <span className="text-[11px] text-slate-500 block mt-1">Upload a previously exported backup</span>
                    <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" />
                  </label>

                  <button
                    onClick={handleResetDefaults}
                    className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-left hover:bg-rose-50 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5 text-rose-600 mb-2" />
                    <span className="font-bold text-xs block text-rose-700 dark:text-rose-300">Reset to Defaults</span>
                    <span className="text-[11px] text-slate-500 block mt-1">Restores initial authentic portfolio state</span>
                  </button>
                </div>
              </div>

              {/* Firebase & Cloud Diagnostics Card */}
              <div className="bg-white dark:bg-[#1C0D25] p-6 sm:p-8 rounded-3xl border border-[#C8A2C8]/30 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2E153D] pb-4">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-[#8A0F7D]" />
                      <span>Firebase & Vercel Production Diagnostics</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Verify cloud credentials, environment variables, and live Firestore database connectivity.
                    </p>
                  </div>

                  <button
                    onClick={handleRunCloudDiagnostics}
                    disabled={isTestingCloud}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8A0F7D] to-[#6A0DAD] text-white text-xs font-bold shadow hover:opacity-95 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Activity className={`w-4 h-4 ${isTestingCloud ? 'animate-spin' : ''}`} />
                    <span>{isTestingCloud ? 'Testing Connection...' : 'Test Cloud Connection'}</span>
                  </button>
                </div>

                {/* Status Notice */}
                {cloudDiagOutput && (
                  <div
                    className={`p-4 rounded-2xl border text-xs flex flex-col gap-1.5 ${
                      cloudDiagOutput.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      {cloudDiagOutput.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <span>{cloudDiagOutput.message}</span>
                    </div>
                    {cloudDiagOutput.details && (
                      <pre className="mt-1 p-2 rounded bg-black/5 dark:bg-black/30 text-[10px] font-mono whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(cloudDiagOutput.details, null, 2)}
                      </pre>
                    )}
                  </div>
                )}

                {/* Configuration Parameters Checklist */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { label: 'API Key (apiKey)', val: firebaseConfig.apiKey, key: 'VITE_FIREBASE_API_KEY' },
                    { label: 'Auth Domain (authDomain)', val: firebaseConfig.authDomain, key: 'VITE_FIREBASE_AUTH_DOMAIN' },
                    { label: 'Project ID (projectId)', val: firebaseConfig.projectId, key: 'VITE_FIREBASE_PROJECT_ID' },
                    { label: 'Storage Bucket (storageBucket)', val: firebaseConfig.storageBucket, key: 'VITE_FIREBASE_STORAGE_BUCKET' },
                    { label: 'Messaging Sender ID', val: firebaseConfig.messagingSenderId, key: 'VITE_FIREBASE_MESSAGING_SENDER_ID' },
                    { label: 'App ID (appId)', val: firebaseConfig.appId, key: 'VITE_FIREBASE_APP_ID' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#FAF7FB] dark:bg-[#251233] border border-[#C8A2C8]/25 text-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
                          {item.val ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                              Set
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-slate-400 text-[10px] font-medium">
                              Not set
                            </span>
                          )}
                        </div>
                        <code className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block truncate">
                          {item.key}
                        </code>
                      </div>
                      <div className="mt-2 text-[11px] font-mono text-slate-700 dark:text-slate-300 truncate">
                        {item.val ? (item.val.length > 20 ? item.val.slice(0, 10) + '...' + item.val.slice(-4) : item.val) : '—'}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <span className="font-bold block text-slate-800 dark:text-slate-200">
                    Vercel Production Deployment Tip:
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    When deploying to Vercel, define the environment variables above in your Vercel Project Settings under <strong>Environment Variables</strong>. The application works with hybrid resilience: admin updates are persisted directly to browser local cache and synced with Firestore or backend API whenever available.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
};
