import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, Users, Calendar, TrendingUp, Plus, Trash2,
  BarChart3, Clock, ArrowRight, Globe, Phone, Mail,
  MapPin, CheckCircle, X, Save, RefreshCw, AlertCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const API = 'http://localhost:5001/api';

function getToken() {
  return localStorage.getItem('her2her_token');
}

function apiFetch(path, options = {}) {
  return fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  }).then(r => r.json());
}

// ─── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ label, val, gain, icon: Icon, loading }) {
  return (
    <div className="glass-card" style={{ padding: '20px', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '60px', height: '60px', borderRadius: '0 20px 0 60px', background: 'var(--primary-pink-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color="var(--primary-pink)" />
      </div>
      {loading ? (
        <div style={{ height: '60px', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '80px', height: '28px', borderRadius: '8px', background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.2s infinite' }} />
        </div>
      ) : (
        <>
          <h3 style={{ margin: '0 0 4px', fontSize: '1.8rem', fontWeight: 900 }}>{val}</h3>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-gray)' }}>{label}</p>
          <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>{gain} this month</span>
        </>
      )}
    </div>
  );
}

// ─── Toast ──────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const bg = type === 'error' ? '#fee2e2' : '#d1fae5';
  const col = type === 'error' ? '#b91c1c' : '#065f46';
  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, background: bg, color: col, padding: '14px 20px', borderRadius: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', animation: 'fadeIn 0.3s ease' }}>
      {type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
      {msg}
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '6px' }}><X size={14} /></button>
    </div>
  );
}

// ─── Overview Tab ───────────────────────────────────────────────────────────
function OverviewTab({ referrals, events, onTabChange }) {
  const now = new Date();
  const upcoming = events.filter(e => new Date(e.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 3);
  const recentRefs = [...referrals].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '30px' }}>
      {/* Recent Referrals */}
      <div className="glass-card" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontWeight: 800 }}>Recent Referrals</h3>
          <button className="btn-ghost" style={{ fontSize: '0.85rem' }} onClick={() => onTabChange('referrals')}>
            View All <ArrowRight size={14} />
          </button>
        </div>
        {recentRefs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-gray)' }}>
            <Users size={36} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <p style={{ margin: 0 }}>No referrals yet. Add your first referral!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentRefs.map((ref, i) => (
              <div key={ref._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderRadius: '14px', background: 'rgba(0,0,0,0.02)' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700 }}>{ref.userName}</p>
                  {ref.goal && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-gray)' }}>Goal: {ref.goal}</p>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px', background: 'var(--primary-pink-light)', color: 'var(--primary-pink)', fontWeight: 700 }}>{ref.status || 'Interested'}</span>
                  <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: 'var(--text-gray)' }}>{new Date(ref.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button className="btn-primary" style={{ padding: '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }} onClick={() => onTabChange('events')}>
          <Calendar size={24} />
          <span style={{ fontWeight: 800 }}>Host a Workshop</span>
        </button>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '20px' }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', fontWeight: 800 }}>Upcoming Events</h4>
          {upcoming.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', margin: 0 }}>No upcoming events. Create one!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcoming.map((ev, i) => (
                <div key={ev._id || i} style={{ borderLeft: `3px solid ${i === 0 ? 'var(--primary-pink)' : '#6366f1'}`, paddingLeft: '12px' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700 }}>{ev.title}</p>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-gray)' }}>{new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  {ev.location && <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-gray)' }}><MapPin size={10} style={{ marginRight: 3 }} />{ev.location}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Referrals Tab ──────────────────────────────────────────────────────────
function ReferralsTab({ referrals, onAdd, onDelete, loading }) {
  const [form, setForm] = useState({ userName: '', goal: '' });
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleAdd = async () => {
    if (!form.userName.trim()) return;
    setAdding(true);
    await onAdd(form);
    setForm({ userName: '', goal: '' });
    setShowForm(false);
    setAdding(false);
  };

  return (
    <div className="glass-card" style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ margin: 0, fontWeight: 800 }}>All Referrals</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-gray)' }}>{referrals.length} total referrals</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '14px' }}>
          <Plus size={16} /> Add Referral
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--primary-pink-light)', borderRadius: '16px', padding: '20px', marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>Name *</label>
            <input value={form.userName} onChange={e => setForm(f => ({ ...f, userName: e.target.value }))} placeholder="e.g. Priya S." style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border-color)', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>Health Goal</label>
            <input value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} placeholder="e.g. PCOS Management" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border-color)', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <button onClick={handleAdd} disabled={adding || !form.userName} className="btn-primary" style={{ padding: '10px 20px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
            {adding ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}

      {referrals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-gray)' }}>
          <Users size={48} style={{ marginBottom: '16px', opacity: 0.25 }} />
          <p style={{ margin: 0, fontWeight: 600 }}>No referrals yet</p>
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>Click "Add Referral" to get started</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[...referrals].sort((a, b) => new Date(b.date) - new Date(a.date)).map((ref, i) => (
            <div key={ref._id || i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '16px', alignItems: 'center', padding: '15px 18px', borderRadius: '14px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700 }}>{ref.userName}</p>
                {ref.goal && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-gray)' }}>{ref.goal}</p>}
              </div>
              <span style={{ fontSize: '0.72rem', padding: '4px 12px', borderRadius: '20px', background: 'var(--primary-pink-light)', color: 'var(--primary-pink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{ref.status || 'Interested'}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-gray)', whiteSpace: 'nowrap' }}>{new Date(ref.date).toLocaleDateString()}</span>
              <button onClick={() => onDelete(ref._id)} style={{ background: '#fee2e2', border: 'none', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer', color: '#b91c1c', display: 'flex', alignItems: 'center' }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Workshops/Events Tab ────────────────────────────────────────────────────
function WorkshopsTab({ events, onAdd, onDelete }) {
  const [form, setForm] = useState({ title: '', date: '', description: '', location: '' });
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const now = new Date();

  const handleAdd = async () => {
    if (!form.title.trim() || !form.date) return;
    setAdding(true);
    await onAdd(form);
    setForm({ title: '', date: '', description: '', location: '' });
    setShowForm(false);
    setAdding(false);
  };

  const upcoming = events.filter(e => new Date(e.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = events.filter(e => new Date(e.date) < now).sort((a, b) => new Date(b.date) - new Date(a.date));

  const EventRow = ({ ev }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '16px', alignItems: 'center', padding: '18px', borderRadius: '14px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', marginBottom: '10px' }}>
      <div>
        <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '1rem' }}>{ev.title}</p>
        {ev.description && <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: 'var(--text-gray)' }}>{ev.description}</p>}
        <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>📅 {new Date(ev.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
          {ev.location && <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>📍 {ev.location}</span>}
        </div>
      </div>
      <span style={{ fontSize: '0.72rem', padding: '4px 12px', borderRadius: '20px', fontWeight: 700, whiteSpace: 'nowrap', background: new Date(ev.date) >= now ? 'var(--primary-pink-light)' : 'rgba(0,0,0,0.06)', color: new Date(ev.date) >= now ? 'var(--primary-pink)' : 'var(--text-gray)' }}>
        {new Date(ev.date) >= now ? 'Upcoming' : 'Past'}
      </span>
      <button onClick={() => onDelete(ev._id)} style={{ background: '#fee2e2', border: 'none', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', color: '#b91c1c', display: 'flex', alignItems: 'center' }}>
        <Trash2 size={14} />
      </button>
    </div>
  );

  return (
    <div className="glass-card" style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ margin: 0, fontWeight: 800 }}>Workshops & Events</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-gray)' }}>{upcoming.length} upcoming · {past.length} past</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '14px' }}>
          <Plus size={16} /> Create Workshop
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--primary-pink-light)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 16px', fontWeight: 800 }}>New Workshop</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Wellness Seminar" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border-color)', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>Date & Time *</label>
              <input type="datetime-local" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border-color)', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>Location</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Conference Hall A" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border-color)', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border-color)', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleAdd} disabled={adding || !form.title || !form.date} className="btn-primary" style={{ padding: '10px 24px', borderRadius: '10px' }}>
              {adding ? 'Saving…' : '✓ Save Workshop'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost" style={{ padding: '10px 20px', borderRadius: '10px' }}>Cancel</button>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-gray)' }}>
          <Calendar size={48} style={{ marginBottom: '16px', opacity: 0.25 }} />
          <p style={{ margin: 0, fontWeight: 600 }}>No workshops yet</p>
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>Click "Create Workshop" to schedule one</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-gray)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>Upcoming</h4>
              {upcoming.map(ev => <EventRow key={ev._id} ev={ev} />)}
            </>
          )}
          {past.length > 0 && (
            <>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-gray)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '20px 0 12px' }}>Past</h4>
              {past.map(ev => <EventRow key={ev._id} ev={ev} />)}
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── Analytics Tab ───────────────────────────────────────────────────────────
function AnalyticsTab({ analytics, referrals }) {
  const COLORS = ['#f472b6', '#c084fc', '#818cf8', '#34d399', '#fb923c', '#38bdf8'];
  if (!analytics) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-gray)' }}>Loading analytics…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {[
          { label: 'Total Referrals', val: analytics.totalReferrals, color: '#f472b6' },
          { label: 'Total Events', val: analytics.totalEvents, color: '#818cf8' },
          { label: 'Engagement Rate', val: analytics.engagementRate, color: '#34d399' },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: '24px', borderRadius: '18px', borderTop: `4px solid ${s.color}` }}>
            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: s.color }}>{s.val}</h2>
            <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'var(--text-gray)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '30px', borderRadius: '20px' }}>
        <h3 style={{ margin: '0 0 24px', fontWeight: 800 }}>Referrals — Last 6 Months</h3>
        {analytics.monthlyReferrals && analytics.monthlyReferrals.some(m => m.referrals > 0) ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics.monthlyReferrals} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 13, fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }} />
              <Bar dataKey="referrals" radius={[8, 8, 0, 0]}>
                {analytics.monthlyReferrals.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-gray)' }}>
            <BarChart3 size={40} style={{ marginBottom: '12px', opacity: 0.25 }} />
            <p style={{ margin: 0 }}>No referral data yet. Start adding referrals to see trends.</p>
          </div>
        )}
      </div>

      <div className="glass-card" style={{ padding: '30px', borderRadius: '20px' }}>
        <h3 style={{ margin: '0 0 16px', fontWeight: 800 }}>Impact Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ padding: '20px', borderRadius: '14px', background: 'linear-gradient(135deg, #fce7f3, #fff)' }}>
            <p style={{ margin: '0 0 6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-gray)' }}>Impact Reach</p>
            <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-pink)' }}>{analytics.impactReach}</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-gray)' }}>estimated women reached</p>
          </div>
          <div style={{ padding: '20px', borderRadius: '14px', background: 'linear-gradient(135deg, #ede9fe, #fff)' }}>
            <p style={{ margin: '0 0 6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-gray)' }}>Active Events</p>
            <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#6366f1' }}>{analytics.activeEvents}</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-gray)' }}>upcoming workshops</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Org Profile Tab ─────────────────────────────────────────────────────────
function OrgProfileTab({ partnerData, onSave }) {
  const [form, setForm] = useState({
    organizationName: partnerData?.organizationName || '',
    contactPerson: partnerData?.contactPerson || '',
    mobileNumber: partnerData?.mobileNumber || '',
    email: partnerData?.email || '',
    address: partnerData?.address || '',
    website: partnerData?.website || '',
    description: partnerData?.description || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const Field = ({ label, name, type = 'text', multiline, icon: Icon }) => (
    <div>
      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-gray)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        {Icon && <Icon size={14} />} {label}
      </label>
      {multiline ? (
        <textarea value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))} rows={3} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--border-color)', fontFamily: 'inherit', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }} />
      ) : (
        <input type={type} value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--border-color)', fontFamily: 'inherit', fontSize: '0.9rem', boxSizing: 'border-box' }} readOnly={name === 'email'} />
      )}
    </div>
  );

  return (
    <div className="glass-card" style={{ padding: '36px', maxWidth: '700px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h3 style={{ margin: 0, fontWeight: 800 }}>Organization Profile</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-gray)' }}>Update your organization's information</p>
        </div>
        <span style={{ fontSize: '0.78rem', padding: '6px 14px', borderRadius: '20px', background: 'var(--primary-pink-light)', color: 'var(--primary-pink)', fontWeight: 700 }}>
          {partnerData?.organizationType} · Verified
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Organization Name" name="organizationName" icon={Building2} />
          <Field label="Contact Person" name="contactPerson" icon={Users} />
          <Field label="Mobile Number" name="mobileNumber" icon={Phone} />
          <Field label="Email" name="email" icon={Mail} />
          <Field label="Website" name="website" icon={Globe} />
          <Field label="Address" name="address" icon={MapPin} />
        </div>
        <Field label="Description" name="description" multiline />
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ marginTop: '24px', padding: '14px 32px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}>
        <Save size={18} /> {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  );
}

// ─── Main PartnerPortal Component ────────────────────────────────────────────
export default function PartnerPortal({ partnerData: initialData }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(initialData || null);
  const [analytics, setAnalytics] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const fetchAll = useCallback(async () => {
    try {
      setStatsLoading(true);
      const [profileData, analyticsData] = await Promise.all([
        apiFetch('/partners/profile'),
        apiFetch('/partners/analytics'),
      ]);
      if (!profileData.message) setProfile(profileData);
      if (!analyticsData.message) setAnalytics(analyticsData);
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // Use initialData as fallback while loading
  const data = profile || initialData;

  if (data?.status === 'Pending') {
    return (
      <div className="page-container">
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
          <div style={{ marginBottom: '30px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-pink-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Clock size={40} color="var(--primary-pink)" />
            </div>
            <h2 style={{ fontWeight: 900, marginBottom: '15px' }}>Organization Verification Pending</h2>
            <p style={{ color: 'var(--text-gray)', lineHeight: 1.6 }}>
              Welcome to the HER2HER Partner Network! Our team is currently verifying the credentials for <strong>{data.organizationName}</strong>.
            </p>
          </div>
          <div className="status-banner" style={{ background: 'rgba(255, 183, 0, 0.1)', color: '#b45309', padding: '15px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
            Standard verification takes 1-3 business days.
          </div>
        </div>
      </div>
    );
  }

  const getGreeting = () => {
    switch (data?.organizationType) {
      case 'NGO': return 'NGO Impact Dashboard';
      case 'Hospital':
      case 'Clinic': return 'Clinical Excellence Portal';
      case 'Corporate': return 'Corporate Wellness Hub';
      default: return 'Partner Management Center';
    }
  };

  const handleAddEvent = async (form) => {
    const result = await apiFetch('/partners/events', { method: 'POST', body: JSON.stringify(form) });
    if (result.message && !Array.isArray(result)) { showToast(result.message, 'error'); return; }
    setProfile(p => ({ ...p, events: result }));
    await fetchAll();
    showToast('Workshop created! ✓');
  };

  const handleDeleteEvent = async (id) => {
    const result = await apiFetch(`/partners/events/${id}`, { method: 'DELETE' });
    if (result.events) {
      setProfile(p => ({ ...p, events: result.events }));
      await fetchAll();
      showToast('Workshop removed.');
    }
  };

  const handleAddReferral = async (form) => {
    const result = await apiFetch('/partners/referrals', { method: 'POST', body: JSON.stringify(form) });
    if (result.message && !Array.isArray(result)) { showToast(result.message, 'error'); return; }
    setProfile(p => ({ ...p, referrals: result }));
    await fetchAll();
    showToast('Referral added! ✓');
  };

  const handleDeleteReferral = async (id) => {
    const result = await apiFetch(`/partners/referrals/${id}`, { method: 'DELETE' });
    if (result.referrals) {
      setProfile(p => ({ ...p, referrals: result.referrals }));
      await fetchAll();
      showToast('Referral removed.');
    }
  };

  const handleSaveProfile = async (form) => {
    const result = await apiFetch('/partners/profile', { method: 'PUT', body: JSON.stringify(form) });
    if (result.message && !result._id) { showToast(result.message, 'error'); return; }
    setProfile(result);
    showToast('Profile saved! ✓');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'referrals', label: 'Referrals', icon: Users },
    { id: 'events', label: 'Workshops', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Org Profile', icon: Building2 },
  ];

  return (
    <div className="page-container" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="dashboard-grid">
        {/* Sidebar */}
        <aside className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', alignSelf: 'start', position: 'sticky', top: '20px' }}>
          <div style={{ padding: '20px 10px', textAlign: 'center', borderBottom: '1px solid var(--border-color)', marginBottom: '10px' }}>
            <Building2 size={40} color="var(--primary-pink)" style={{ marginBottom: '10px' }} />
            <h4 style={{ fontWeight: 800, margin: '0 0 6px' }}>{data?.organizationName}</h4>
            <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: 'var(--primary-pink-light)', color: 'var(--primary-pink)', fontWeight: 700 }}>
              {data?.organizationType} Verified
            </span>
          </div>
          {tabs.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-nav-btn ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon size={18} /> {item.label}
              {item.id === 'referrals' && (data?.referrals?.length > 0) && (
                <span style={{ marginLeft: 'auto', background: 'var(--primary-pink)', color: '#fff', borderRadius: '20px', padding: '1px 8px', fontSize: '0.7rem', fontWeight: 800 }}>
                  {data.referrals.length}
                </span>
              )}
            </button>
          ))}

          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <button onClick={fetchAll} className="btn-ghost" style={{ width: '100%', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <RefreshCw size={13} /> Refresh Data
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="dashboard-main">
          {/* Welcome Banner */}
          <div className="page-banner-card glass-card" style={{ marginBottom: '30px', background: 'linear-gradient(135deg, var(--primary-pink-light) 0%, #fff 100%)' }}>
            <h2 className="page-banner-title">{getGreeting()}</h2>
            <p className="page-banner-desc">Welcome back, {data?.contactPerson}. Here's what's happening with HER2HER today.</p>
          </div>

          {/* Stats Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
            <StatCard label="Total Referrals" val={analytics?.totalReferrals ?? '—'} gain={`+${data?.referrals?.length || 0}`} icon={Users} loading={statsLoading} />
            <StatCard label="Active Events" val={analytics?.activeEvents ?? '—'} gain={`+${analytics?.activeEvents ?? 0}`} icon={Calendar} loading={statsLoading} />
            <StatCard label="Impact Reach" val={analytics?.impactReach ?? '—'} gain={`+${analytics?.totalReferrals ? Math.floor(analytics.totalReferrals * 1.5) : 0}`} icon={BarChart3} loading={statsLoading} />
            <StatCard label="Engagement" val={analytics?.engagementRate ?? '—'} gain={analytics?.engagementRate ? '+' + analytics.engagementRate : '+0%'} icon={TrendingUp} loading={statsLoading} />
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <OverviewTab referrals={data?.referrals || []} events={data?.events || []} onTabChange={setActiveTab} />
          )}
          {activeTab === 'referrals' && (
            <ReferralsTab referrals={data?.referrals || []} onAdd={handleAddReferral} onDelete={handleDeleteReferral} loading={statsLoading} />
          )}
          {activeTab === 'events' && (
            <WorkshopsTab events={data?.events || []} onAdd={handleAddEvent} onDelete={handleDeleteEvent} />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsTab analytics={analytics} referrals={data?.referrals || []} />
          )}
          {activeTab === 'profile' && (
            <OrgProfileTab partnerData={data} onSave={handleSaveProfile} />
          )}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-grid { display: grid; grid-template-columns: 260px 1fr; gap: 30px; min-height: 80vh; align-items: start; }
        @media (max-width: 992px) { .dashboard-grid { grid-template-columns: 1fr; } }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .p-nav-btn { display:flex; align-items:center; gap:10px; padding:12px 16px; border-radius:12px; border:none; background:transparent; cursor:pointer; font-weight:600; font-size:0.9rem; text-align:left; width:100%; transition:background 0.2s; }
        .p-nav-btn:hover { background: var(--primary-pink-light); }
        .p-nav-btn.active { background: var(--primary-pink-light); color: var(--primary-pink); font-weight:800; }
      `}} />
    </div>
  );
}
