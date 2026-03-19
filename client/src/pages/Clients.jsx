import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';

const VERTICALS = [
  { value: 'finance', label: 'Finance Consulting' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'ai_implementation', label: 'AI Implementation' },
  { value: 'nonprofit', label: 'Nonprofit' }
];

const VERTICAL_LABELS = Object.fromEntries(VERTICALS.map(v => [v.value, v.label]));

export default function Clients({ onClientClick }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', vertical: 'finance', notes: '' });

  async function loadClients() {
    try {
      const url = filter ? `/api/clients?vertical=${filter}` : '/api/clients';
      const data = await api(url);
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadClients(); }, [filter]);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api('/api/clients', { method: 'POST', body: JSON.stringify(form) });
      setShowModal(false);
      setForm({ name: '', email: '', phone: '', company: '', vertical: 'finance', notes: '' });
      loadClients();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this client?')) return;
    try {
      await api(`/api/clients/${id}`, { method: 'DELETE' });
      loadClients();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /> Loading clients...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Clients</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="">All Verticals</option>
            {VERTICALS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
          </select>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Client</button>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No clients yet. Add your first client to get started.</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Client</button>
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr><th>Name</th><th>Company</th><th>Vertical</th><th>Status</th><th>Phase</th><th>AI Score</th><th></th></tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500, cursor: 'pointer', color: 'var(--primary)' }} onClick={() => onClientClick(c.id)}>{c.name}</td>
                  <td>{c.company || '—'}</td>
                  <td><span className={`badge badge-${c.vertical}`}>{VERTICAL_LABELS[c.vertical]}</span></td>
                  <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                  <td>Phase {c.phase}</td>
                  <td>{c.ai_readiness_score ? `${c.ai_readiness_score}/10` : '—'}</td>
                  <td>
                    <button className="btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleDelete(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Client Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add New Client</h2>
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <label>Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-row">
                <label>Company</label>
                <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Vertical *</label>
                <select value={form.vertical} onChange={e => setForm({ ...form, vertical: e.target.value })}>
                  {VERTICALS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label>Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
