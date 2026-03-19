import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';

const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'];

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ client_id: '', name: '', email: '', phone: '', source: 'manual', notes: '' });

  async function load() {
    try {
      const [l, c] = await Promise.all([api('/api/leads'), api('/api/clients')]);
      setLeads(l);
      setClients(c);
      if (c.length > 0 && !form.client_id) setForm(f => ({ ...f, client_id: c[0].id }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api('/api/leads', { method: 'POST', body: JSON.stringify({ ...form, client_id: Number(form.client_id) }) });
      setShowModal(false);
      setForm({ client_id: clients[0]?.id || '', name: '', email: '', phone: '', source: 'manual', notes: '' });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function updateStage(id, stage) {
    try {
      await api(`/api/leads/${id}`, { method: 'PUT', body: JSON.stringify({ stage }) });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /> Loading leads...</div>;

  const clientMap = {};
  clients.forEach(c => clientMap[c.id] = c);

  return (
    <div>
      <div className="page-header">
        <h1>Lead Pipeline</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)} disabled={clients.length === 0}>+ Add Lead</button>
      </div>

      {leads.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No leads yet. Add leads to track your client's sales pipeline.</p>
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Client</th><th>Source</th><th>Score</th><th>Stage</th><th></th></tr>
            </thead>
            <tbody>
              {leads.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 500 }}>{l.name}</td>
                  <td style={{ fontSize: '0.8rem' }}>{l.email || '—'}</td>
                  <td>{clientMap[l.client_id]?.name || `#${l.client_id}`}</td>
                  <td><span className="badge badge-pending">{l.source}</span></td>
                  <td>{l.score || '—'}</td>
                  <td>
                    <select value={l.stage} onChange={e => updateStage(l.id, e.target.value)} style={{ width: 'auto', padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}>
                      {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <button className="btn-danger" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }} onClick={async () => { await api(`/api/leads/${l.id}`, { method: 'DELETE' }); load(); }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Lead</h2>
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <label>For Client *</label>
                <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.vertical})</option>)}
                </select>
              </div>
              <div className="form-row">
                <label>Lead Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
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
                <label>Source</label>
                <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
                  <option value="manual">Manual</option>
                  <option value="referral">Referral</option>
                  <option value="ad">Ad Campaign</option>
                  <option value="organic">Organic</option>
                  <option value="website">Website</option>
                </select>
              </div>
              <div className="form-row">
                <label>Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
