import React, { useState, useEffect } from 'react';
import { isLoggedIn, getUserName, clearAuth, api, setAuth } from './utils/api.js';
import {
  LayoutDashboard, Users, ClipboardCheck, GitBranch,
  Heart, TrendingUp, FileText, LogOut, Brain,
  Sun, Moon
} from 'lucide-react';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Clients from './pages/Clients.jsx';
import ClientDetail from './pages/ClientDetail.jsx';
import Audits from './pages/Audits.jsx';
import Workflows from './pages/Workflows.jsx';
import Grants from './pages/Grants.jsx';
import Leads from './pages/Leads.jsx';
import Reports from './pages/Reports.jsx';
import AITools from './pages/AITools.jsx';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clients', label: 'Clients', icon: Users },
  { section: 'Workflow' },
  { id: 'audits', label: 'Audits', icon: ClipboardCheck },
  { id: 'workflows', label: 'Phases', icon: GitBranch },
  { id: 'ai-tools', label: 'AI Tools', icon: Brain },
  { id: 'reports', label: 'Reports', icon: FileText },
  { section: 'Verticals' },
  { id: 'grants', label: 'Grants (Nonprofit)', icon: Heart },
  { id: 'leads', label: 'Leads (Sales)', icon: TrendingUp },
];

function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ivt_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ivt_theme', theme);
  }, [theme]);

  function toggle() {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }

  return { theme, toggle };
}

export function ThemeToggle({ theme, onToggle, className }) {
  return (
    <button className={`theme-toggle ${className || ''}`} onClick={onToggle} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
      {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [page, setPage] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const { theme, toggle: toggleTheme } = useTheme();

  function handleLogin(token, name) {
    setAuth(token, name);
    setLoggedIn(true);
  }

  function handleLogout() {
    clearAuth();
    setLoggedIn(false);
  }

  function navigateToClient(id) {
    setSelectedClientId(id);
    setPage('client-detail');
  }

  if (!loggedIn) return <Login onLogin={handleLogin} theme={theme} onToggleTheme={toggleTheme} />;

  function renderPage() {
    switch (page) {
      case 'dashboard': return <Dashboard onNavigate={setPage} onClientClick={navigateToClient} />;
      case 'clients': return <Clients onClientClick={navigateToClient} />;
      case 'client-detail': return <ClientDetail clientId={selectedClientId} onBack={() => setPage('clients')} />;
      case 'audits': return <Audits onClientClick={navigateToClient} />;
      case 'workflows': return <Workflows />;
      case 'grants': return <Grants />;
      case 'leads': return <Leads />;
      case 'reports': return <Reports />;
      case 'ai-tools': return <AITools />;
      default: return <Dashboard onNavigate={setPage} onClientClick={navigateToClient} />;
    }
  }

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
            <circle cx="12" cy="6" r="2.5" stroke="currentColor" strokeWidth="2"/>
            <circle cx="6" cy="14" r="2" stroke="currentColor" strokeWidth="2"/>
            <circle cx="18" cy="14" r="2" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="20" r="1.5" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="8.5" x2="12" y2="18.5" stroke="currentColor" strokeWidth="2"/>
            <line x1="10.5" y1="7.5" x2="7.5" y2="12" stroke="currentColor" strokeWidth="2"/>
            <line x1="13.5" y1="7.5" x2="16.5" y2="12" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Intellovate
          <span>Consulting Platform</span>
        </div>
        {NAV.map((item, i) => {
          if (item.section) {
            return <div key={i} className="nav-section">{item.section}</div>;
          }
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.5rem 0.75rem', marginTop: '0.25rem' }}>
          Signed in as {getUserName()}
        </div>
        <button className="nav-item" onClick={handleLogout}>
          <LogOut size={16} /> Sign Out
        </button>
      </nav>
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
