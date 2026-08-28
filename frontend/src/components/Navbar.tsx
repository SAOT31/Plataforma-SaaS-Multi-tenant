import React from 'react';
import { Bot, Sun, Moon, LogOut } from 'lucide-react';
import type { User } from '../types';

interface NavbarProps {
  user: User | null;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, theme, onToggleTheme, onLogout }) => {
  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ padding: '6px', background: 'var(--primary-gradient)', borderRadius: '8px', color: '#fff', display: 'flex' }}>
            <Bot size={20} />
          </div>
          <div>
            <div className="brand-title" style={{ fontSize: '15px' }}>PQRS AI Engine</div>
          </div>
        </div>

        {user && (
          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', padding: '5px 12px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Tenant:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{user.tenantName}</strong>
            <span style={{ opacity: 0.3, margin: '0 2px' }}>|</span>
            <span>Role:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{user.role}</strong>
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleTheme}
          className="btn btn-secondary"
          style={{ padding: '8px 12px', borderRadius: '10px' }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>{user.fullName}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{user.email}</div>
            </div>
            <button onClick={onLogout} className="btn btn-secondary" style={{ padding: '8px 12px' }} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
