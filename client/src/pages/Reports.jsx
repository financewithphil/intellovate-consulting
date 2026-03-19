import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';

const TYPE_LABELS = { audit: 'Audit Report', weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly', grant_app: 'Grant Application', proposal: 'Proposal' };

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([api('/api/reports'), api('/api/clients')]).then(([r, c]) => {
      setReports(r);
      const map = {};
      c.forEach(cl => map[cl.id] = cl);
      setClients(map);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /> Loading reports...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Reports</h1>
      </div>

      {reports.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No reports generated yet. Run an AI audit to generate your first report.</p>
        </div>
      ) : (
        <div className="grid-2">
          <div className="card">
            <table>
              <thead>
                <tr><th>Title</th><th>Type</th><th>Client</th><th>Date</th></tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id} style={{ cursor: 'pointer', background: selected?.id === r.id ? 'var(--bg-hover)' : undefined }} onClick={() => setSelected(r)}>
                    <td style={{ fontWeight: 500 }}>{r.title}</td>
                    <td><span className="badge badge-pending">{TYPE_LABELS[r.type] || r.type}</span></td>
                    <td>{clients[r.client_id]?.name || `#${r.client_id}`}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card">
            {selected ? (
              <div>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{selected.title}</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  {TYPE_LABELS[selected.type]} · {clients[selected.client_id]?.name} · {selected.generated_by === 'ai' ? 'AI Generated' : 'Manual'}
                </div>
                <div className="ai-report" style={{ background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius)', whiteSpace: 'pre-wrap', maxHeight: '70vh', overflow: 'auto' }}>
                  {selected.content || 'No content.'}
                </div>
              </div>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Select a report to view
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
