'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon, Plus, Search, Edit2, Trash2, Star, StarOff,
  Loader2, X, CheckCircle, AlertCircle, Upload, Eye, EyeOff,
  Grid3X3, List, Filter, Camera,
} from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { archiveApi, ArchiveItem, api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

// ── Config ──────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = ['Events', 'Fashion', 'Community', 'Action', 'Behind the Scenes', 'Other'];

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  published: { label: 'Published', color: 'bg-green-500/10 text-green-400 border-green-500/20', dot: 'bg-green-400' },
  draft:     { label: 'Draft',     color: 'bg-white/5 text-white/50 border-white/10',            dot: 'bg-white/30' },
};

const EMPTY_FORM: Partial<ArchiveItem> = {
  title: '', url: '', publicId: '', type: 'photo',
  category: 'Events', date: new Date().toISOString().split('T')[0],
  photographer: '@ballandboujee', caption: '', featured: false,
  status: 'published', tags: [],
};

// ── Toast ───────────────────────────────────────────────────────────

function Toast({ message, type, onDismiss }: { message: string; type: 'success' | 'error'; onDismiss: () => void }) {
  useEffect(() => { const t = setTimeout(onDismiss, 4000); return () => clearTimeout(t); }, [onDismiss]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl animate-fade-in ${
      type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
    }`}>
      {type === 'success' ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
      <span className="text-sm">{message}</span>
      <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
    </div>
  );
}

// ── Modal ───────────────────────────────────────────────────────────

function ArchiveModal({
  item, onClose, onSave,
}: {
  item: Partial<ArchiveItem> | null;
  onClose: () => void;
  onSave: (data: Partial<ArchiveItem>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<ArchiveItem>>(item ?? EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof ArchiveItem, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await api.upload.image(file);
      set('url', result.url);
      set('publicId', result.publicId);
    } catch {
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags?.includes(t)) {
      set('tags', [...(form.tags ?? []), t]);
    }
    setTagInput('');
  };

  const removeTag = (t: string) =>
    set('tags', (form.tags ?? []).filter(x => x !== t));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const isEdit = !!item?._id;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-white/8 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#111111] border-b border-white/8 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{isEdit ? 'Edit Photo' : 'Add to Archive'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/8 text-white/50 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Image upload */}
          <div>
            <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Photo / Video</label>
            <div className="flex gap-3 items-start">
              <div
                className="w-32 h-24 rounded-xl border border-white/8 bg-white/4 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:border-[#C9A84C]/40 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {form.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.url} alt="preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-white/30">
                    {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
                    <span className="text-[10px]">{uploading ? 'Uploading…' : 'Upload'}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-3 py-2 bg-white/4 hover:bg-white/8 border border-white/8 rounded-lg text-sm text-white/70 hover:text-white transition-colors disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading…' : 'Choose File'}
                </button>
                <input
                  type="url"
                  value={form.url ?? ''}
                  onChange={e => set('url', e.target.value)}
                  placeholder="Or paste a URL"
                  className="w-full px-3 py-2 bg-white/4 border border-white/8 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#C9A84C]/50"
                />
              </div>
              <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleImageUpload} />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Title <span className="text-red-400">*</span></label>
            <input
              required
              value={form.title ?? ''}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Boujee Fashion Night — Runway Moment"
              className="w-full px-4 py-2.5 bg-white/4 border border-white/8 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#C9A84C]/50"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Caption</label>
            <textarea
              rows={2}
              value={form.caption ?? ''}
              onChange={e => set('caption', e.target.value)}
              placeholder="Short description shown in the lightbox"
              className="w-full px-4 py-2.5 bg-white/4 border border-white/8 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#C9A84C]/50 resize-none"
            />
          </div>

          {/* Category / Type / Status row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Category</label>
              <select
                value={form.category ?? 'Events'}
                onChange={e => set('category', e.target.value)}
                className="w-full px-3 py-2.5 bg-white/4 border border-white/8 rounded-xl text-sm text-white focus:outline-none focus:border-[#C9A84C]/50"
              >
                {DEFAULT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Type</label>
              <select
                value={form.type ?? 'photo'}
                onChange={e => set('type', e.target.value as 'photo' | 'video')}
                className="w-full px-3 py-2.5 bg-white/4 border border-white/8 rounded-xl text-sm text-white focus:outline-none focus:border-[#C9A84C]/50"
              >
                <option value="photo">Photo</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Status</label>
              <select
                value={form.status ?? 'published'}
                onChange={e => set('status', e.target.value as 'published' | 'draft')}
                className="w-full px-3 py-2.5 bg-white/4 border border-white/8 rounded-xl text-sm text-white focus:outline-none focus:border-[#C9A84C]/50"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Date / Photographer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Date</label>
              <input
                type="date"
                value={form.date ? form.date.toString().split('T')[0] : ''}
                onChange={e => set('date', e.target.value)}
                className="w-full px-4 py-2.5 bg-white/4 border border-white/8 rounded-xl text-sm text-white focus:outline-none focus:border-[#C9A84C]/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Photographer Credit</label>
              <input
                value={form.photographer ?? ''}
                onChange={e => set('photographer', e.target.value)}
                placeholder="@ballandboujee"
                className="w-full px-4 py-2.5 bg-white/4 border border-white/8 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#C9A84C]/50"
              />
            </div>
          </div>

          {/* Featured toggle */}
          <div className="flex items-center gap-3 p-4 bg-white/3 rounded-xl border border-white/6">
            <button
              type="button"
              onClick={() => set('featured', !form.featured)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.featured ? 'bg-[#C9A84C]' : 'bg-white/15'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${form.featured ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
            </button>
            <div>
              <p className="text-sm font-medium text-white">Featured</p>
              <p className="text-xs text-white/40">Shown prominently in the gallery hero</p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Tags</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {(form.tags ?? []).map(t => (
                <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-[#C9A84C]/10 text-[#C9A84C] rounded-full text-xs border border-[#C9A84C]/20">
                  {t}
                  <button type="button" onClick={() => removeTag(t)} className="hover:text-red-400 transition-colors"><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add tag and press Enter"
                className="flex-1 px-4 py-2 bg-white/4 border border-white/8 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#C9A84C]/50"
              />
              <button type="button" onClick={addTag} className="px-4 py-2 bg-white/8 hover:bg-white/12 border border-white/8 rounded-xl text-sm text-white/70 hover:text-white transition-colors">
                Add
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-white/4 hover:bg-white/8 border border-white/8 rounded-xl text-sm text-white/70 hover:text-white transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.url || !form.title}
              className="flex-1 px-4 py-2.5 bg-[#C9A84C] hover:bg-[#B8953F] rounded-xl text-sm font-semibold text-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Add to Archive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm ───────────────────────────────────────────────────

function DeleteConfirm({ title, onConfirm, onCancel, loading }: { title: string; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-white/8 rounded-2xl p-6 max-w-sm w-full">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="h-6 w-6 text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-white text-center mb-2">Delete Photo?</h3>
        <p className="text-sm text-white/50 text-center mb-6">
          "<span className="text-white/70">{title}</span>" will be removed from the archive.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 bg-white/4 hover:bg-white/8 border border-white/8 rounded-xl text-sm text-white/70 hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

export default function ArchivePage() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [modalItem, setModalItem] = useState<Partial<ArchiveItem> | null | false>(false);
  const [deleteTarget, setDeleteTarget] = useState<ArchiveItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  async function load() {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const res = await archiveApi.getAll(params);
      setItems(res.items);
      setTotal(res.total);
      const allCats = Array.from(new Set([...DEFAULT_CATEGORIES, ...(res.categories ?? [])]));
      setCategories(allCats);
    } catch {
      showToast('Failed to load archive', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [search, statusFilter, categoryFilter]);

  async function handleSave(data: Partial<ArchiveItem>) {
    try {
      if (modalItem && (modalItem as ArchiveItem)._id) {
        await archiveApi.update((modalItem as ArchiveItem)._id, data);
        showToast('Photo updated');
      } else {
        await archiveApi.create(data);
        showToast('Photo added to archive');
      }
      setModalItem(false);
      load();
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
      throw err;
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget._id);
    try {
      await archiveApi.delete(deleteTarget._id);
      showToast('Photo deleted');
      setDeleteTarget(null);
      load();
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleFeatured(item: ArchiveItem) {
    try {
      await archiveApi.update(item._id, { featured: !item.featured });
      showToast(item.featured ? 'Removed from featured' : 'Marked as featured');
      load();
    } catch {
      showToast('Update failed', 'error');
    }
  }

  async function toggleStatus(item: ArchiveItem) {
    const next = item.status === 'published' ? 'draft' : 'published';
    try {
      await archiveApi.update(item._id, { status: next });
      showToast(`Set to ${next}`);
      load();
    } catch {
      showToast('Update failed', 'error');
    }
  }

  const publishedCount = items.filter(i => i.status === 'published').length;
  const featuredCount  = items.filter(i => i.featured).length;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Archive</h1>
            <p className="text-sm text-white/40 mt-0.5">Manage gallery photos & videos for the storefront</p>
          </div>
          <button
            onClick={() => setModalItem({})}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#C9A84C] hover:bg-[#B8953F] rounded-xl text-sm font-semibold text-black transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Photo
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: total, icon: ImageIcon, color: 'text-white' },
            { label: 'Published', value: publishedCount, icon: Eye, color: 'text-green-400' },
            { label: 'Drafts', value: total - publishedCount, icon: EyeOff, color: 'text-white/40' },
            { label: 'Featured', value: featuredCount, icon: Star, color: 'text-[#C9A84C]' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white/3 border border-white/8 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-xs text-white/40">{label}</span>
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              type="text"
              placeholder="Search photos…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/4 border border-white/8 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#C9A84C]/50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white/4 border border-white/8 rounded-xl text-sm text-white focus:outline-none focus:border-[#C9A84C]/50"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white/4 border border-white/8 rounded-xl text-sm text-white focus:outline-none focus:border-[#C9A84C]/50"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <div className="flex items-center gap-1 bg-white/4 border border-white/8 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#C9A84C] text-black' : 'text-white/50 hover:text-white'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#C9A84C] text-black' : 'text-white/50 hover:text-white'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#C9A84C]" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mb-4">
              <ImageIcon className="h-8 w-8 text-white/20" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">No photos yet</h3>
            <p className="text-sm text-white/40 mb-4">Add photos to build the gallery archive</p>
            <button onClick={() => setModalItem({})} className="px-4 py-2.5 bg-[#C9A84C] hover:bg-[#B8953F] rounded-xl text-sm font-semibold text-black transition-colors">
              Add First Photo
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map(item => (
              <div key={item._id} className="group relative bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                {/* Thumbnail */}
                <div className="aspect-square relative">
                  {item.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/4">
                      <ImageIcon className="h-8 w-8 text-white/20" />
                    </div>
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setModalItem(item)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleFeatured(item)}
                      className={`p-2 rounded-lg transition-colors ${item.featured ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    >
                      <Star className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Badges */}
                  {item.featured && (
                    <div className="absolute top-2 left-2">
                      <Star className="h-4 w-4 text-[#C9A84C] fill-[#C9A84C]" />
                    </div>
                  )}
                  {item.status === 'draft' && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-[10px] text-white/50">Draft</div>
                  )}
                </div>
                {/* Caption bar */}
                <div className="p-2">
                  <p className="text-xs text-white font-medium truncate">{item.title}</p>
                  <p className="text-[10px] text-white/40 mt-0.5 flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-white/6 text-white/50">{item.category}</span>
                    <span>{new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List view */
          <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Photo</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {items.map(item => (
                  <tr key={item._id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-12 h-10 rounded-lg overflow-hidden bg-white/4 flex-shrink-0">
                        {item.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-white/20" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{item.title}</span>
                        {item.featured && <Star className="h-3.5 w-3.5 text-[#C9A84C] fill-[#C9A84C] flex-shrink-0" />}
                      </div>
                      {item.caption && <p className="text-xs text-white/40 mt-0.5 truncate max-w-xs">{item.caption}</p>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="px-2 py-1 rounded-md bg-white/6 text-white/60 text-xs">{item.category}</span>
                    </td>
                    <td className="px-4 py-3 text-white/50 text-xs hidden lg:table-cell">
                      {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${STATUS_CONFIG[item.status].color}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[item.status].dot}`} />
                        {STATUS_CONFIG[item.status].label}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => toggleFeatured(item)} className={`p-1.5 rounded-lg transition-colors ${item.featured ? 'text-[#C9A84C]' : 'text-white/30 hover:text-white'}`}>
                          <Star className="h-4 w-4" />
                        </button>
                        <button onClick={() => setModalItem(item)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalItem !== false && (
        <ArchiveModal item={modalItem} onClose={() => setModalItem(false)} onSave={handleSave} />
      )}

      {deleteTarget && (
        <DeleteConfirm
          title={deleteTarget.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deletingId === deleteTarget._id}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </AdminLayout>
  );
}
