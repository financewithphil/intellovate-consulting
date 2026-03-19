import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import { Brain, Search, BarChart3 } from 'lucide-react';

export default function AITools() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('grant-research');
  const [result, setResult] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Grant research form
  const [grantForm, setGrantForm] = useState({ client_id: '', mission: '', focus_areas: '', budget_range: '' });
  // Process analysis form
  const [processForm, setProcessForm] = useState({ client_id: '', processes: '', team_size: '', current_tools: '' });

  useEffect(() => {
    api('/api/clients').then(c => {
      setClients(c);
      if (c.length > 0) {
        setGrantForm(f => ({ ...f, client_id: c[0].id }));
        setProcessForm(f => ({ ...f, client_id: c[0].id }));
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function runGrantResearch(e) {
    e.preventDefault();
    setGenerating(true);
    setResult(null);
    try {
      const data = await api('/api/ai/grant-research', {
        method: 'POST',
        body: JSON.stringify({
          client_id: Number(grantForm.client_id),
          mission: grantForm.mission,
          focus_areas: grantForm.focus_areas.split(',').map(s => s.trim()).filter(Boolean),
          budget_range: grantForm.budget_range
        })
      });
      setResult(data.research);
    } catch (err) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function runProcessAnalysis(e) {
    e.preventDefault();
    setGenerating(true);
    setResult(null);
    try {
      const data = await api('/api/ai/process-analysis', {
        method: 'POST',
        body: JSON.stringify({
          client_id: Number(processForm.client_id),
          processes: processForm.processes.split(',').map(s => s.trim()).filter(Boolean),
          team_size: processForm.team_size,
          current_tools: processForm.current_tools.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      setResult(data.analysis);
    } catch (err) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /> Loading...</div>;

  const tabs = [
    { id: 'grant-research', label: 'Grant Research', icon: Search, description: 'AI-powered grant discovery for nonprofit clients' },
    { id: 'process-analysis', label: 'Process Analysis', icon: BarChart3, description: 'AI workflow analysis for AI implementation clients' }
  ];

  const nonprofitClients = clients.filter(c => c.vertical === 'nonprofit');

  return (
    <div>
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Brain size={24} /> AI Tools
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}
              onClick={() => { setActiveTab(tab.id); setResult(null); }}
            >
              <Icon size={14} style={{ marginRight: '0.25rem' }} /> {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid-2">
        {/* Form */}
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
            {tabs.find(t => t.id === activeTab)?.label}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            {tabs.find(t => t.id === activeTab)?.description}
          </p>

          {activeTab === 'grant-research' && (
            <form onSubmit={runGrantResearch}>
              <div className="form-row">
                <label>Nonprofit Client *</label>
                <select value={grantForm.client_id} onChange={e => setGrantForm({ ...grantForm, client_id: e.target.value })}>
                  {nonprofitClients.length > 0 ? (
                    nonprofitClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                  ) : (
                    clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.vertical})</option>)
                  )}
                </select>
              </div>
              <div className="form-row">
                <label>Organization Mission</label>
                <textarea value={grantForm.mission} onChange={e => setGrantForm({ ...grantForm, mission: e.target.value })} placeholder="Describe the nonprofit's mission..." />
              </div>
              <div className="form-row">
                <label>Focus Areas (comma-separated)</label>
                <input value={grantForm.focus_areas} onChange={e => setGrantForm({ ...grantForm, focus_areas: e.target.value })} placeholder="education, youth development, workforce" />
              </div>
              <div className="form-row">
                <label>Budget Range Needed</label>
                <input value={grantForm.budget_range} onChange={e => setGrantForm({ ...grantForm, budget_range: e.target.value })} placeholder="$10,000 - $50,000" />
              </div>
              <button type="submit" className="btn-primary" disabled={generating} style={{ width: '100%', marginTop: '0.5rem' }}>
                {generating ? 'Researching...' : 'Run Grant Research'}
              </button>
            </form>
          )}

          {activeTab === 'process-analysis' && (
            <form onSubmit={runProcessAnalysis}>
              <div className="form-row">
                <label>Client *</label>
                <select value={processForm.client_id} onChange={e => setProcessForm({ ...processForm, client_id: e.target.value })}>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.vertical})</option>)}
                </select>
              </div>
              <div className="form-row">
                <label>Processes to Analyze (comma-separated)</label>
                <textarea value={processForm.processes} onChange={e => setProcessForm({ ...processForm, processes: e.target.value })} placeholder="invoice processing, client onboarding, report generation" />
              </div>
              <div className="form-row">
                <label>Team Size</label>
                <input value={processForm.team_size} onChange={e => setProcessForm({ ...processForm, team_size: e.target.value })} placeholder="15" />
              </div>
              <div className="form-row">
                <label>Current Tools (comma-separated)</label>
                <input value={processForm.current_tools} onChange={e => setProcessForm({ ...processForm, current_tools: e.target.value })} placeholder="QuickBooks, Google Workspace, Slack" />
              </div>
              <button type="submit" className="btn-primary" disabled={generating} style={{ width: '100%', marginTop: '0.5rem' }}>
                {generating ? 'Analyzing...' : 'Run Process Analysis'}
              </button>
            </form>
          )}
        </div>

        {/* Results */}
        <div className="card">
          {generating && (
            <div className="loading"><div className="spinner" /> AI is working...</div>
          )}
          {result && (
            <div className="ai-report" style={{ whiteSpace: 'pre-wrap' }}>
              {result}
            </div>
          )}
          {!generating && !result && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Run an AI tool to see results here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
