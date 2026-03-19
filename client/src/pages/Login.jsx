import React, { useState } from 'react';
import { api } from '../utils/api.js';
import { Sun, Moon } from 'lucide-react';

export default function Login({ onLogin, theme, onToggleTheme }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, name } = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ pin })
      });
      onLogin(token, name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      {/* Theme toggle in corner */}
      <button
        className="theme-toggle login-theme-toggle"
        onClick={onToggleTheme}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
      >
        {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        {theme === 'dark' ? ' Light' : ' Dark'}
      </button>

      <form className="login-box" onSubmit={handleSubmit}>
        {/* Intellovate node/network icon */}
        <div className="login-logo">
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="10" r="4.5" stroke="var(--primary)" strokeWidth="2.5" fill="none"/>
            <circle cx="12" cy="28" r="3.5" stroke="var(--primary)" strokeWidth="2.5" fill="none"/>
            <circle cx="36" cy="28" r="3.5" stroke="var(--primary)" strokeWidth="2.5" fill="none"/>
            <circle cx="24" cy="40" r="3" stroke="var(--primary)" strokeWidth="2.5" fill="none"/>
            <circle cx="6" cy="18" r="2" stroke="var(--primary)" strokeWidth="2" fill="none"/>
            <line x1="24" y1="14.5" x2="24" y2="37" stroke="var(--primary)" strokeWidth="2.5"/>
            <line x1="21" y1="12.5" x2="14" y2="25" stroke="var(--primary)" strokeWidth="2.5"/>
            <line x1="27" y1="12.5" x2="34" y2="25" stroke="var(--primary)" strokeWidth="2.5"/>
            <line x1="10" y1="13" x2="8" y2="16" stroke="var(--primary)" strokeWidth="2"/>
          </svg>
        </div>
        <h1>intellovate.ai</h1>
        <p>AI-Augmented Consulting Platform</p>
        <input
          type="password"
          placeholder="PIN"
          value={pin}
          onChange={e => setPin(e.target.value)}
          maxLength={8}
          autoFocus
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        {error && <div className="login-error">{error}</div>}
      </form>
    </div>
  );
}
