import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';

export default function Grants() {
  const [grants, setGrants] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ client_id: '', foundation_name: '', grant_name: '', amount: '', deadline: '', status: 'identified' });

  async function load() {
    try {
      const [g, c] = await Promise.all([api('/api/grants'), api('/api/clients?vertical=nonprofit')]);
      setGrants(g);
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
      await api('/api/grants', {
        method: 'POST',
        body: JSON.stringify({ ...form, client_id: Number(form.client_id), amount: Number(form.amount) || 0 })
      });
      setShowModal(false);
      setForm({ client_id: clients[0]?.id || '', foundation_name: '', grant_name: '', amount: '', deadline: '', status: 'identified' });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function updateStatus(id, status) {
    try {
      await api(`/api/grants/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /> Loading grants...</div>;

  const statuses = ['identified', 'researching', 'applying', 'submitted', 'won', 'rejected'];
  const clientMap = {};
  clients.forEach(c => clientMap[c.id] = c);

  return (
    <div>
      <div className="page-header">
        <h1>Grant Pipeline</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)} disabled={clients.length === 0}>
          + Add Grant
        </button>
      </div>

      {clients.length === 0 && (
        <div className="card" style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(245,158,11,0.1)', borderColor: 'var(--warning)' }}>
          <p style={{ fontSize: '0.85rem' }}>Add a nonprofit client first to start tracking grants.</p>
        </div>
      )}

      {grants.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No grants in the pipeline yet.</p>
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr><th>Foundation</th><th>Grant</th><th>Client</th><th>Amount</th><th>Deadline</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {grants.map(g => (
                <tr key={g.id}>
                  <td style={{ fontWeight: 500 }}>{g.foundation_name}</td>
                  <td>{g.grant_name || '—'}</td>
                  <td>{clientMap[g.client_id]?.name || `#${g.client_id}`}</td>
                  <td>{g.amount ? `$${g.amount.toLocaleString()}` : '—'}</td>
                  <td style={{ fontSize: '0.8rem' }}>{g.deadline || '—'}</td>
                  <td>
                    <select value={g.status} onChange={e => updateStatus(g.id, e.target.value)} style={{ width: 'auto', padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}>
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <button className="btn-danger" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }} onClick={async () => { await api(`/api/grants/${g.id}`, { method: 'DELETE' }); load(); }}>
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
            <h2>Add Grant Opportunity</h2>
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <label>Nonprofit Client *</label>
                <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label>Foundation Name *</label>
                <input value={form.foundation_name} onChange={e => setForm({ ...form, foundation_name: e.target.value })} required />
              </div>
              <div className="form-row">
                <label>Grant Program Name</label>
                <input value={form.grant_name} onChange={e => setForm({ ...form, grant_name: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Amount ($)</label>
                <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Deadline</label>
                <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Grant</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
