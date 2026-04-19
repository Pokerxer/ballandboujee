'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Calendar, Plus, Search, Edit2, Trash2, Eye,
  MapPin, Users, Clock, Globe, Star, Loader2, X, CheckCircle,
  AlertCircle, ChevronDown, Upload, ImageIcon,
} from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { eventApi, Event, api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

// ── Config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  'fashion-show': { label: 'Fashion Show',  color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  'sale':         { label: 'Sale',          color: 'bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/20' },
  'launch':       { label: 'Launch',        color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'workshop':     { label: 'Workshop',      color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  'pop-up':       { label: 'Pop-up',        color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  'other':        { label: 'Other',         color: 'bg-white/5 text-white/60 border-white/10' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  draft:     { label: 'Draft',     color: 'bg-white/5 text-white/50 border-white/10',            dot: 'bg-white/30' },
  published: { label: 'Published', color: 'bg-green-500/10 text-green-400 border-green-500/20',  dot: 'bg-green-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-400 border-red-500/20',        dot: 'bg-red-400' },
  completed: { label: 'Completed', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',     dot: 'bg-blue-400' },
};

const EMPTY_FORM: Partial<Event> = {
  title: '', description: '', date: '', endDate: '', time: '',
  location: '', address: '', isOnline: false, onlineLink: '',
  category: 'other', status: 'draft', isFeatured: false,
  capacity: undefined, price: 0, tags: [],
};

// ── Modal ───────────────────────────────────────────────────────────

function EventModal({
  event, onClose, onSave,
}: {
  event: Partial<Event> | null;
  onClose: () => void;
  onSave: (data: Partial<Event>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Event>>(event ?? EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof Event, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await api.upload.image(file);
      set('image', { url: result.url, publicId: result.publicId });
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    set('image', undefined);
    if (fileRef.current) fileRef.current.value = '';
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags?.includes(t)) set('tags', [...(form.tags ?? []), t]);
    setTagInput('');
  };

  const removeTag = (tag: string) =>
    set('tags', form.tags?.filter(t => t !== tag) ?? []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C]/50 transition-colors';
  const labelClass = 'block text-xs text-white/50 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4">
      <div className="relative bg-[#111111] border border-white/8 rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <h2 className="text-lg font-semibold text-white">
            {event?._id ? 'Edit Event' : 'New Event'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className={labelClass}>Title *</label>
            <input className={inputClass} placeholder="e.g. Ball & Boujee Fashion Show 2025" value={form.title ?? ''} onChange={e => set('title', e.target.value)} required />
          </div>

          {/* Image */}
          <div>
            <label className={labelClass}>Event Image</label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            {form.image?.url ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10 group">
                <img src={form.image.url} alt="Event" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/10 rounded-lg text-white text-xs hover:bg-white/20 transition-colors"
                  >
                    <Upload size={12} /> Replace
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-500/20 rounded-lg text-red-400 text-xs hover:bg-red-500/30 transition-colors"
                  >
                    <X size={12} /> Remove
                  </button>
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-[#C9A84C]" />
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full h-40 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/5 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 size={24} className="animate-spin text-[#C9A84C]" />
                ) : (
                  <>
                    <ImageIcon size={28} className="text-white/20" />
                    <span className="text-sm text-white/40">Click to upload image</span>
                    <span className="text-xs text-white/20">PNG, JPG, WEBP up to 10MB</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea className={`${inputClass} resize-none`} rows={3} placeholder="Event details..." value={form.description ?? ''} onChange={e => set('description', e.target.value)} />
          </div>

          {/* Date & Time row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date *</label>
              <input type="date" className={inputClass} value={form.date ? form.date.substring(0, 10) : ''} onChange={e => set('date', e.target.value)} required />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input type="date" className={inputClass} value={form.endDate ? form.endDate.substring(0, 10) : ''} onChange={e => set('endDate', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Time</label>
              <input className={inputClass} placeholder="e.g. 6:00 PM" value={form.time ?? ''} onChange={e => set('time', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Ticket Price (₦)</label>
              <input type="number" min={0} className={inputClass} placeholder="0 = Free" value={form.price ?? 0} onChange={e => set('price', Number(e.target.value))} />
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 py-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-[#C9A84C]" checked={!!form.isOnline} onChange={e => set('isOnline', e.target.checked)} />
              <span className="text-sm text-white/70">Online event</span>
            </label>
          </div>

          {form.isOnline ? (
            <div>
              <label className={labelClass}>Online Link</label>
              <input className={inputClass} placeholder="https://..." value={form.onlineLink ?? ''} onChange={e => set('onlineLink', e.target.value)} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Venue Name</label>
                <input className={inputClass} placeholder="e.g. Lagos Convention Centre" value={form.location ?? ''} onChange={e => set('location', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input className={inputClass} placeholder="Street address" value={form.address ?? ''} onChange={e => set('address', e.target.value)} />
              </div>
            </div>
          )}

          {/* Category, Status, Capacity */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <select className={`${inputClass} bg-[#1A1A1A]`} value={form.category ?? 'other'} onChange={e => set('category', e.target.value)}>
                {Object.entries(CATEGORY_CONFIG).map(([v, c]) => (
                  <option key={v} value={v}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={`${inputClass} bg-[#1A1A1A]`} value={form.status ?? 'draft'} onChange={e => set('status', e.target.value)}>
                {Object.entries(STATUS_CONFIG).map(([v, s]) => (
                  <option key={v} value={v}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Capacity</label>
              <input type="number" min={0} className={inputClass} placeholder="Unlimited" value={form.capacity ?? ''} onChange={e => set('capacity', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
          </div>

          {/* Featured */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-[#C9A84C]" checked={!!form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} />
            <span className="text-sm text-white/70">Feature this event on the storefront</span>
          </label>

          {/* Tags */}
          <div>
            <label className={labelClass}>Tags</label>
            <div className="flex gap-2">
              <input className={inputClass} placeholder="Add tag and press Enter" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}} />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm">Add</button>
            </div>
            {(form.tags ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags!.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded text-xs text-[#C9A84C]">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-white transition-colors"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/8">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-[#C9A84C] text-black text-sm font-medium rounded-lg hover:bg-[#C9A84C]/90 disabled:opacity-50 transition-colors">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              {saving ? 'Saving…' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm ───────────────────────────────────────────────────

function DeleteConfirm({ title, onConfirm, onCancel }: { title: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#111111] border border-white/8 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-red-400" />
        </div>
        <h3 className="text-white font-semibold text-center mb-1">Delete Event</h3>
        <p className="text-white/50 text-sm text-center mb-6">Are you sure you want to delete <span className="text-white">"{title}"</span>? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 border border-white/10 rounded-lg text-white/60 hover:text-white text-sm transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalEvent, setModalEvent] = useState<Partial<Event> | null | 'new'>(null);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { fetchEvents(); }, [statusFilter, categoryFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      const data = await eventApi.getAll(params);
      setEvents(data.events ?? []);
    } catch (e) {
      showToast('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (data: Partial<Event>) => {
    try {
      if ((modalEvent as Event)?._id) {
        await eventApi.update((modalEvent as Event)._id, data);
        showToast('Event updated', 'success');
      } else {
        await eventApi.create(data);
        showToast('Event created', 'success');
      }
      setModalEvent(null);
      fetchEvents();
    } catch (e: any) {
      showToast(e.message ?? 'Failed to save event', 'error');
      throw e;
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await eventApi.delete(deleteTarget._id);
      setEvents(prev => prev.filter(e => e._id !== deleteTarget._id));
      showToast('Event deleted', 'success');
    } catch {
      showToast('Failed to delete event', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleQuickStatus = async (event: Event, status: string) => {
    try {
      await eventApi.update(event._id, { status: status as Event['status'] });
      setEvents(prev => prev.map(e => e._id === event._id ? { ...e, status: status as Event['status'] } : e));
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const filtered = events.filter(e =>
    !search || e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.location?.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const total = events.length;
  const published = events.filter(e => e.status === 'published').length;
  const upcoming = events.filter(e => e.status === 'published' && new Date(e.date) >= new Date()).length;
  const totalRegistrations = events.reduce((s, e) => s + (e.registrations ?? 0), 0);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Events</h1>
            <p className="text-white/40 text-sm mt-0.5">Manage fashion shows, sales, pop-ups & more</p>
          </div>
          <button
            onClick={() => setModalEvent('new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#C9A84C] text-black text-sm font-medium rounded-lg hover:bg-[#C9A84C]/90 transition-colors"
          >
            <Plus size={16} />
            New Event
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Events', value: total, icon: Calendar, color: 'text-white' },
            { label: 'Published', value: published, icon: Eye, color: 'text-green-400' },
            { label: 'Upcoming', value: upcoming, icon: Clock, color: 'text-[#C9A84C]' },
            { label: 'Registrations', value: totalRegistrations, icon: Users, color: 'text-blue-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#111111] border border-white/8 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/40 text-xs">{label}</span>
                <Icon size={16} className={color} />
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
              placeholder="Search events…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([v, s]) => (
              <option key={v} value={v}>{s.label}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
          >
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_CONFIG).map(([v, c]) => (
              <option key={v} value={v}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Events List */}
        <div className="bg-[#111111] border border-white/8 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-[#C9A84C]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Calendar size={40} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No events found</p>
              <button onClick={() => setModalEvent('new')} className="mt-4 px-4 py-2 bg-[#C9A84C] text-black text-sm font-medium rounded-lg hover:bg-[#C9A84C]/90 transition-colors">
                Create your first event
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map(event => {
                const cat = CATEGORY_CONFIG[event.category] ?? CATEGORY_CONFIG.other;
                const stat = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.draft;
                const isPast = new Date(event.date) < new Date();
                const spotsLeft = event.capacity ? event.capacity - (event.registrations ?? 0) : null;

                return (
                  <div key={event._id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors group">
                    {/* Thumbnail */}
                    {event.image?.url ? (
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-white/5">
                        <img src={event.image.url} alt={event.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                    /* Date block */
                    <div className="flex-shrink-0 w-14 text-center bg-white/5 rounded-xl p-2.5">
                      <p className="text-[#C9A84C] text-xs font-medium uppercase tracking-wide">
                        {new Date(event.date).toLocaleDateString('en', { month: 'short' })}
                      </p>
                      <p className="text-white text-xl font-bold leading-none mt-0.5">
                        {new Date(event.date).getDate()}
                      </p>
                    </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-medium text-sm truncate">{event.title}</h3>
                        {event.isFeatured && <Star size={12} className="text-[#C9A84C] flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {event.isOnline ? (
                          <span className="flex items-center gap-1 text-xs text-white/40"><Globe size={11} />Online</span>
                        ) : event.location ? (
                          <span className="flex items-center gap-1 text-xs text-white/40"><MapPin size={11} />{event.location}</span>
                        ) : null}
                        {event.time && <span className="flex items-center gap-1 text-xs text-white/40"><Clock size={11} />{event.time}</span>}
                        {event.price > 0 ? (
                          <span className="text-xs text-[#C9A84C]">₦{event.price.toLocaleString()}</span>
                        ) : (
                          <span className="text-xs text-green-400">Free</span>
                        )}
                      </div>
                    </div>

                    {/* Category badge */}
                    <span className={`hidden md:inline-flex px-2.5 py-1 rounded-md text-[11px] border font-medium ${cat.color}`}>
                      {cat.label}
                    </span>

                    {/* Registrations */}
                    <div className="hidden lg:block text-center w-20 flex-shrink-0">
                      <p className="text-white text-sm font-medium">{event.registrations ?? 0}</p>
                      {spotsLeft !== null && (
                        <p className={`text-xs ${spotsLeft <= 5 ? 'text-red-400' : 'text-white/40'}`}>
                          {spotsLeft} left
                        </p>
                      )}
                    </div>

                    {/* Status dropdown */}
                    <div className="relative group/status flex-shrink-0">
                      <button className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] border font-medium ${stat.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stat.dot}`} />
                        {stat.label}
                        <ChevronDown size={10} />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-36 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-10 hidden group-hover/status:block">
                        {Object.entries(STATUS_CONFIG).map(([v, s]) => (
                          <button
                            key={v}
                            onClick={() => handleQuickStatus(event, v)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-white/5 transition-colors ${event.status === v ? 'text-[#C9A84C]' : 'text-white/60'}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => setModalEvent(event)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(event)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modalEvent !== null && (
        <EventModal
          event={modalEvent === 'new' ? null : modalEvent}
          onClose={() => setModalEvent(null)}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          title={deleteTarget.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border ${
          toast.type === 'success'
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}
    </AdminLayout>
  );
}
