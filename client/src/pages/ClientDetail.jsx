import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import { ArrowLeft, Brain, GitBranch } from 'lucide-react';

const VERTICAL_LABELS = { finance: 'Finance', real_estate: 'Real Estate', ai_implementation: 'AI Implementation', nonprofit: 'Nonprofit' };

export default function ClientDetail({ clientId, onBack }) {
  const [client, setClient] = useState(null);
  const [audits, setAudits] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function load() {
    try {
      const [c, a, w] = await Promise.all([
        api(`/api/clients/${clientId}`),
        api(`/api/audits?client_id=${clientId}`),
        api(`/api/workflows?client_id=${clientId}`)
      ]);
      setClient(c);
      setAudits(a);
      setWorkflows(w);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [clientId]);

  async function startAudit() {
    try {
      const audit = await api('/api/audits', {
        method: 'POST',
        body: JSON.stringify({ client_id: clientId, tech_stack: [], pain_points: [], current_processes: [] })
      });
      // Initialize workflows too
      await api('/api/workflows/initialize', {
        method: 'POST',
        body: JSON.stringify({ client_id: clientId })
      });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function generateAIReport(auditId) {
    setGenerating(true);
    try {
      await api('/api/ai/audit-report', {
        method: 'POST',
        body: JSON.stringify({ audit_id: auditId })
      });
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function advancePhase(workflowId) {
    try {
      await api(`/api/workflows/${workflowId}/advance`, { method: 'POST' });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /> Loading...</div>;
  if (!client) return <div className="loading">Client not found.</div>;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={onBack} style={{ padding: '0.4rem' }}><ArrowLeft size={16} /></button>
          <div>
            <h1>{client.name}</h1>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {client.company && `${client.company} · `}
              <span className={`badge badge-${client.vertical}`}>{VERTICAL_LABELS[client.vertical]}</span>
              {' · '}
              <span className={`badge badge-${client.status}`}>{client.status}</span>
              {client.ai_readiness_score && ` · AI Score: ${client.ai_readiness_score}/10`}
            </div>
          </div>
        </div>
        {audits.length === 0 && (
          <button className="btn-primary" onClick={startAudit}>Start Discovery Audit</button>
        )}
      </div>

      {/* Contact info */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem' }}>
          {client.email && <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> {client.email}</div>}
          {client.phone && <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> {client.phone}</div>}
        </div>
        {client.notes && <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{client.notes}</div>}
      </div>

      {/* Workflow phases */}
      {workflows.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GitBranch size={16} /> Workflow Phases
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {workflows.sort((a, b) => a.phase - b.phase).map(w => (
              <div key={w.id} style={{
                flex: 1,
                padding: '0.75rem',
                background: w.status === 'active' ? 'rgba(99,102,241,0.1)' : 'var(--bg)',
                border: `1px solid ${w.status === 'active' ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{w.duration}</div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', margin: '0.25rem 0' }}>Phase {w.phase}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{w.phase_name}</div>
                <span className={`badge badge-${w.status}`}>{w.status}</span>
                {w.status === 'active' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <button className="btn-primary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }} onClick={() => advancePhase(w.id)}>
                      Complete Phase
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audits */}
      {audits.map(audit => (
        <div key={audit.id} className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={16} /> Discovery Audit
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className={`badge badge-${audit.status}`}>{audit.status}</span>
              {audit.status === 'pending' && (
                <button className="btn-primary" style={{ fontSize: '0.75rem' }} onClick={() => generateAIReport(audit.id)} disabled={generating}>
                  {generating ? 'Generating...' : 'Generate AI Report'}
                </button>
              )}
            </div>
          </div>
          {audit.ai_readiness_score && (
            <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem' }}>
              AI Readiness Score: <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{audit.ai_readiness_score}/10</strong>
            </div>
          )}
          {audit.ai_report && (
            <div className="ai-report" style={{
              background: 'var(--bg)',
              padding: '1rem',
              borderRadius: 'var(--radius)',
              maxHeight: '500px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {audit.ai_report}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
