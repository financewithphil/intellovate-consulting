import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import { Users, ClipboardCheck, Heart, TrendingUp, DollarSign } from 'lucide-react';

const VERTICAL_LABELS = {
  finance: 'Finance',
  real_estate: 'Real Estate',
  ai_implementation: 'AI Implementation',
  nonprofit: 'Nonprofit'
};

export default function Dashboard({ onNavigate, onClientClick }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/dashboard').then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /> Loading dashboard...</div>;
  if (!data) return <div className="loading">No data available. Add your first client to get started.</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <button className="btn-primary" onClick={() => onNavigate('clients')}>+ New Client</button>
      </div>

      {/* Top stats */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Users size={16} style={{ color: 'var(--primary)' }} />
            <span className="stat-label">Total Clients</span>
          </div>
          <div className="stat-value">{data.clients.total}</div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ClipboardCheck size={16} style={{ color: 'var(--warning)' }} />
            <span className="stat-label">Pending Audits</span>
          </div>
          <div className="stat-value">{data.audits.pending}</div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Heart size={16} style={{ color: 'var(--nonprofit)' }} />
            <span className="stat-label">Grants Pipeline</span>
          </div>
          <div className="stat-value">{data.grants.total}</div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <TrendingUp size={16} style={{ color: 'var(--success)' }} />
            <span className="stat-label">Active Leads</span>
          </div>
          <div className="stat-value">{data.leads.total}</div>
        </div>
      </div>

      {/* Verticals breakdown */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>Clients by Vertical</h3>
          {Object.entries(data.clients.by_vertical).map(([key, count]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
              <span className={`badge badge-${key}`}>{VERTICAL_LABELS[key]}</span>
              <span style={{ fontWeight: 600 }}>{count}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>Pipeline Status</h3>
          {Object.entries(data.clients.by_status).map(([key, count]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
              <span className={`badge badge-${key}`}>{key}</span>
              <span style={{ fontWeight: 600 }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grant & Lead stats */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>Grant Pipeline</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div><div className="stat-value" style={{ fontSize: '1.25rem' }}>{data.grants.identified}</div><div className="stat-label">Identified</div></div>
            <div><div className="stat-value" style={{ fontSize: '1.25rem' }}>{data.grants.applying}</div><div className="stat-label">Applying</div></div>
            <div><div className="stat-value" style={{ fontSize: '1.25rem' }}>{data.grants.submitted}</div><div className="stat-label">Submitted</div></div>
            <div><div className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--success)' }}>{data.grants.won}</div><div className="stat-label">Won</div></div>
          </div>
          {data.grants.total_value > 0 && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Total pipeline value: <strong style={{ color: 'var(--success)' }}>${data.grants.total_value.toLocaleString()}</strong>
            </div>
          )}
        </div>
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>Lead Pipeline</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div><div className="stat-value" style={{ fontSize: '1.25rem' }}>{data.leads.new}</div><div className="stat-label">New</div></div>
            <div><div className="stat-value" style={{ fontSize: '1.25rem' }}>{data.leads.qualified}</div><div className="stat-label">Qualified</div></div>
            <div><div className="stat-value" style={{ fontSize: '1.25rem' }}>{data.leads.proposal}</div><div className="stat-label">Proposal</div></div>
            <div><div className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--success)' }}>{data.leads.closed}</div><div className="stat-label">Closed</div></div>
          </div>
        </div>
      </div>

      {/* Recent clients */}
      {data.recent_clients.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>Recent Clients</h3>
          <table>
            <thead>
              <tr><th>Name</th><th>Company</th><th>Vertical</th><th>Status</th><th>Phase</th></tr>
            </thead>
            <tbody>
              {data.recent_clients.map(c => (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => onClientClick(c.id)}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>{c.company || '—'}</td>
                  <td><span className={`badge badge-${c.vertical}`}>{VERTICAL_LABELS[c.vertical]}</span></td>
                  <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                  <td>Phase {c.phase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
