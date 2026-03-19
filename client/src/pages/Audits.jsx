import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';

export default function Audits({ onClientClick }) {
  const [audits, setAudits] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/api/audits'),
      api('/api/clients')
    ]).then(([a, c]) => {
      setAudits(a);
      const map = {};
      c.forEach(cl => map[cl.id] = cl);
      setClients(map);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /> Loading audits...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Audits</h1>
      </div>
      {audits.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No audits yet. Start an audit from a client's detail page.</p>
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr><th>Client</th><th>Status</th><th>AI Score</th><th>Tool Spend</th><th>Created</th></tr>
            </thead>
            <tbody>
              {audits.map(a => {
                const client = clients[a.client_id];
                return (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 500, cursor: 'pointer', color: 'var(--primary)' }} onClick={() => onClientClick(a.client_id)}>
                      {client?.name || `Client #${a.client_id}`}
                    </td>
                    <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                    <td>{a.ai_readiness_score ? `${a.ai_readiness_score}/10` : '—'}</td>
                    <td>{a.monthly_tool_spend ? `$${a.monthly_tool_spend}/mo` : '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
