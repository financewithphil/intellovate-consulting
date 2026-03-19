import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';

export default function Workflows() {
  const [workflows, setWorkflows] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [w, c] = await Promise.all([api('/api/workflows'), api('/api/clients')]);
      setWorkflows(w);
      const map = {};
      c.forEach(cl => map[cl.id] = cl);
      setClients(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function advancePhase(id) {
    try {
      await api(`/api/workflows/${id}/advance`, { method: 'POST' });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /> Loading workflows...</div>;

  // Group by client
  const grouped = {};
  workflows.forEach(w => {
    if (!grouped[w.client_id]) grouped[w.client_id] = [];
    grouped[w.client_id].push(w);
  });

  return (
    <div>
      <div className="page-header">
        <h1>Workflow Phases</h1>
      </div>
      {Object.keys(grouped).length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No active workflows. Start an audit for a client to initialize their workflow.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([clientId, phases]) => {
          const client = clients[clientId];
          return (
            <div key={clientId} className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                {client?.name || `Client #${clientId}`}
                {client && <span className={`badge badge-${client.vertical}`} style={{ marginLeft: '0.5rem' }}>{client.vertical}</span>}
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {phases.sort((a, b) => a.phase - b.phase).map(w => (
                  <div key={w.id} style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: w.status === 'active' ? 'rgba(99,102,241,0.1)' : w.status === 'completed' ? 'rgba(34,197,94,0.05)' : 'var(--bg)',
                    border: `1px solid ${w.status === 'active' ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Phase {w.phase}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0.15rem 0' }}>{w.phase_name}</div>
                    <span className={`badge badge-${w.status}`}>{w.status}</span>
                    {w.status === 'active' && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <button className="btn-primary" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }} onClick={() => advancePhase(w.id)}>
                          Complete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
