import React, { useState, useEffect } from 'react';
import { 
  ImageIcon, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Database, 
  Cloud, 
  Server, 
  FileCheck, 
  Check, 
  Sparkles,
  Search,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { SafeImage } from './SafeImage';
import { 
  uploadPermanentImage, 
  fetchMediaCatalog, 
  deleteMediaItem, 
  checkStorageIntegrity, 
  repairStorageIntegrity, 
  syncMediaToCloudFirestore 
} from '../lib/storageService';
import { MediaItem, StorageIntegrityReport, PortfolioData } from '../types';

interface MediaManagerDashboardProps {
  adminToken: string;
  portfolioData: PortfolioData;
  onUpdatePortfolio: (data: PortfolioData) => void;
  onSaveSection: (section: keyof PortfolioData, data: any) => Promise<void>;
}

export const MediaManagerDashboard: React.FC<MediaManagerDashboardProps> = ({
  adminToken,
  portfolioData,
  onUpdatePortfolio,
  onSaveSection,
}) => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSection, setFilterSection] = useState<string>('all');
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [selectedSection, setSelectedSection] = useState<'general' | 'profile' | 'gallery' | 'blog' | 'testimonial'>('general');
  
  // Integrity & Diagnostic State
  const [integrityReport, setIntegrityReport] = useState<StorageIntegrityReport | null>(null);
  const [isRunningIntegrity, setIsRunningIntegrity] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [toastNotice, setToastNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastNotice({ type, text });
    setTimeout(() => setToastNotice(null), 4500);
  };

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const items = await fetchMediaCatalog(adminToken);
      setMediaList(items);
    } catch (err) {
      showToast('error', 'Failed to load media catalog.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
    handleRunIntegrityCheck();
  }, []);

  const handleRunIntegrityCheck = async () => {
    setIsRunningIntegrity(true);
    try {
      const report = await checkStorageIntegrity(adminToken);
      setIntegrityReport(report);
    } catch (err) {
      showToast('error', 'Failed to run integrity check.');
    } finally {
      setIsRunningIntegrity(false);
    }
  };

  const handleRepairStorage = async () => {
    setIsRepairing(true);
    try {
      const res = await repairStorageIntegrity(adminToken);
      if (res.success) {
        showToast('success', res.message || 'Storage restored and repaired successfully!');
        await loadMedia();
        await handleRunIntegrityCheck();
      } else {
        showToast('error', res.message || 'Repair operation failed.');
      }
    } catch (err) {
      showToast('error', 'Error executing storage repair.');
    } finally {
      setIsRepairing(false);
    }
  };

  const handleSyncToFirestore = async () => {
    setIsSyncingCloud(true);
    try {
      const res = await syncMediaToCloudFirestore(adminToken);
      if (res.success) {
        showToast('success', res.message);
      } else {
        showToast('error', res.message);
      }
    } catch (err: any) {
      showToast('error', `Cloud sync failed: ${err?.message || err}`);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handleMigrateLegacyImages = async () => {
    try {
      const res = await fetch('/api/admin/media/migrate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message);
        await loadMedia();
        await handleRunIntegrityCheck();
      } else {
        showToast('error', 'Migration failed.');
      }
    } catch (err) {
      showToast('error', 'Error calling migration service.');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setIsUploading(true);
    setUploadPercent(10);
    setUploadStatus('Preparing upload...');

    try {
      const res = await uploadPermanentImage(
        file,
        adminToken,
        (percent, status) => {
          setUploadPercent(percent);
          setUploadStatus(status);
        },
        3,
        selectedSection
      );

      showToast('success', `Uploaded successfully! Permanent ID: ${res.id}`);
      await loadMedia();
      await handleRunIntegrityCheck();
    } catch (err: any) {
      showToast('error', err?.message || 'Upload failed. Please check network connection.');
    } finally {
      setIsUploading(false);
      setUploadPercent(0);
      setUploadStatus('');
    }
  };

  const handleDelete = async (id: string, filename: string) => {
    if (!window.confirm(`Permanently delete ${filename}? This removes it from cloud storage, disk, and database.`)) {
      return;
    }

    const success = await deleteMediaItem(id, adminToken);
    if (success) {
      showToast('success', `Deleted ${filename} permanently.`);
      setMediaList((prev) => prev.filter((m) => m.id !== id && m.filename !== filename));
      await handleRunIntegrityCheck();
    } else {
      showToast('error', 'Failed to delete media asset.');
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSetAsProfilePhoto = async (url: string) => {
    const updatedProfile = {
      ...portfolioData.profile,
      avatarUrl: url,
    };
    const updated = {
      ...portfolioData,
      profile: updatedProfile,
    };
    onUpdatePortfolio(updated);
    await onSaveSection('profile', updatedProfile);
    showToast('success', 'Profile photo updated & saved to database!');
  };

  const handleAddToGallery = async (item: MediaItem) => {
    const newGalleryItem = {
      id: `gallery_${Date.now()}`,
      title: item.filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
      caption: 'Authentic teaching practice & community engagement.',
      url: item.url,
      category: 'Teaching Practice' as const,
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };

    const updatedGallery = [newGalleryItem, ...portfolioData.gallery];
    const updated = {
      ...portfolioData,
      gallery: updatedGallery,
    };
    onUpdatePortfolio(updated);
    await onSaveSection('gallery', updatedGallery);
    showToast('success', 'Added photo to public gallery & saved to database!');
  };

  const filteredMedia = mediaList.filter((m) => {
    const matchesSearch = 
      m.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.associatedSection && m.associatedSection.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterSection === 'all') return matchesSearch;
    return matchesSearch && m.associatedSection === filterSection;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastNotice && (
        <div
          className={`p-3 rounded-lg flex items-center justify-between text-xs font-semibold shadow-md transition-all ${
            toastNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toastNotice.text}</span>
          </div>
        </div>
      )}

      {/* Header & Status Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#7A1C6D]/10 text-[#7A1C6D] dark:text-[#D8A0D0] rounded-lg">
                <Database className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                Image Storage & Synchronization Architecture
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              All images are assigned a permanent unique ID, verified with SHA-256 integrity, 
              stored persistently in the storage vault, and synchronized with the authoritative database.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunIntegrityCheck}
              disabled={isRunningIntegrity}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
            >
              <ShieldCheck className={`w-4 h-4 text-[#7A1C6D] dark:text-[#D8A0D0] ${isRunningIntegrity ? 'animate-spin' : ''}`} />
              <span>{isRunningIntegrity ? 'Checking...' : 'Run Integrity Diagnostic'}</span>
            </button>

            <button
              onClick={handleRepairStorage}
              disabled={isRepairing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRepairing ? 'animate-spin' : ''}`} />
              <span>{isRepairing ? 'Repairing...' : 'Disaster Recovery / Repair'}</span>
            </button>

            <button
              onClick={handleSyncToFirestore}
              disabled={isSyncingCloud}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[#7A1C6D] hover:bg-[#631458] text-white shadow-sm transition-colors disabled:opacity-50"
            >
              <Cloud className={`w-4 h-4 ${isSyncingCloud ? 'animate-pulse' : ''}`} />
              <span>{isSyncingCloud ? 'Syncing...' : 'Sync with Firestore'}</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800">
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Images in Catalog
            </span>
            <span className="text-xl font-bold font-serif text-slate-900 dark:text-white mt-1 block">
              {mediaList.length}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              Verified on Storage Vault
            </span>
            <span className="text-xl font-bold font-serif text-emerald-800 dark:text-emerald-300 mt-1 block">
              {integrityReport?.verifiedCount ?? mediaList.length}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Disaster Recovery Vault
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Auto-Rehydration Active
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
            <span className="text-[11px] font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] uppercase tracking-wider block">
              Global Synchronization
            </span>
            <span className="text-xs font-bold text-[#7A1C6D] dark:text-[#D8A0D0] mt-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#7A1C6D] animate-ping"></span>
              Real-time Polling & Live DB
            </span>
          </div>
        </div>

        {integrityReport && integrityReport.missingCount > 0 && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200 font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Detected {integrityReport.missingCount} missing image file(s). Click "Disaster Recovery / Repair" to automatically restore them from the persistent vault.</span>
            </div>
            <button
              onClick={handleRepairStorage}
              className="px-2.5 py-1 text-xs font-bold bg-amber-600 text-white rounded hover:bg-amber-700 shrink-0"
            >
              Restore Now
            </button>
          </div>
        )}
      </div>

      {/* Upload Box */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#7A1C6D] dark:text-[#D8A0D0]" />
          <span>Upload Image to Permanent Storage</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Select section association and upload. The image will be client-optimized, assigned a unique ID, and permanently stored.
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Associate with Section:
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#7A1C6D]"
            >
              <option value="general">General Media</option>
              <option value="profile">Profile & Bio</option>
              <option value="gallery">Teaching Practice Gallery</option>
              <option value="blog">Blog Articles</option>
              <option value="testimonial">Student / Colleague Testimonial</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex flex-col justify-end">
            <label className="relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#7A1C6D]/40 hover:border-[#7A1C6D] dark:border-zinc-700 dark:hover:border-[#7A1C6D] rounded-xl cursor-pointer bg-slate-50 dark:bg-zinc-800/40 hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-[#7A1C6D] dark:text-[#D8A0D0]" />
                <div>
                  <span className="text-xs font-bold text-[#7A1C6D] dark:text-[#D8A0D0]">
                    Click or drag photo here to upload
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Supports JPG, PNG, WebP up to 25MB (Auto-compressed to fast WebP)
                  </p>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={isUploading}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        {isUploading && (
          <div className="mt-4 p-3 bg-[#7A1C6D]/5 border border-[#7A1C6D]/20 rounded-lg">
            <div className="flex justify-between items-center text-xs font-semibold text-[#7A1C6D] dark:text-[#D8A0D0] mb-1">
              <span>{uploadStatus}</span>
              <span>{uploadPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#7A1C6D] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadPercent}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Catalog & Filter */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#7A1C6D] dark:text-[#D8A0D0]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Permanent Media Catalog ({filteredMedia.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#7A1C6D]"
              />
            </div>

            {/* Filter Dropdown */}
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#7A1C6D]"
            >
              <option value="all">All Sections</option>
              <option value="profile">Profile</option>
              <option value="gallery">Gallery</option>
              <option value="blog">Blog</option>
              <option value="testimonial">Testimonial</option>
              <option value="general">General</option>
            </select>

            <button
              onClick={handleMigrateLegacyImages}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Scan & Migrate
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#7A1C6D]" />
            <span>Loading permanent media catalog...</span>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-zinc-600" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No media assets found</p>
            <p className="text-slate-400 mt-1">Upload photos using the form above to add them to permanent storage.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between group hover:border-[#7A1C6D]/50 transition-all"
              >
                {/* Image Preview */}
                <div className="relative aspect-video bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                  <SafeImage
                    src={item.url}
                    alt={item.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    {item.size ? `${(item.size / 1024).toFixed(0)} KB` : 'Cloud'}
                  </div>
                  {item.associatedSection && (
                    <div className="absolute top-2 left-2 bg-[#7A1C6D]/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded capitalize">
                      {item.associatedSection}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3.5 space-y-2 flex-1">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate" title={item.filename}>
                      {item.filename}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5" title={item.id}>
                      ID: {item.id}
                    </p>
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-zinc-700/60">
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">● Synced</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-2.5 bg-slate-100 dark:bg-zinc-800 border-t border-slate-200 dark:border-zinc-700/80 flex items-center justify-between gap-1">
                  <button
                    onClick={() => handleCopyUrl(item.url, item.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-semibold rounded bg-white dark:bg-zinc-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                    title="Copy Permanent URL"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleSetAsProfilePhoto(item.url)}
                    className="py-1.5 px-2 text-[11px] font-semibold rounded bg-white dark:bg-zinc-700 text-[#7A1C6D] dark:text-[#D8A0D0] hover:bg-slate-200 transition-colors"
                    title="Set as Profile Photo"
                  >
                    Set Avatar
                  </button>

                  <button
                    onClick={() => handleAddToGallery(item)}
                    className="py-1.5 px-2 text-[11px] font-semibold rounded bg-white dark:bg-zinc-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                    title="Add to Gallery"
                  >
                    + Gallery
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.filename)}
                    className="p-1.5 rounded text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
