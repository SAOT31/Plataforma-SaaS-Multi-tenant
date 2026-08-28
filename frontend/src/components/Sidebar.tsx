import React from 'react';
import { LayoutDashboard, Inbox, BookOpen, Settings as SettingsIcon } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'tickets' | 'kb' | 'settings';
  onSelectTab: (tab: 'dashboard' | 'tickets' | 'kb' | 'settings') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onSelectTab('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard & Stats</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => onSelectTab('tickets')}
        >
          <Inbox size={18} />
          <span>Live PQRS Inbox</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'kb' ? 'active' : ''}`}
          onClick={() => onSelectTab('kb')}
        >
          <BookOpen size={18} />
          <span>Knowledge Base RAG</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => onSelectTab('settings')}
        >
          <SettingsIcon size={18} />
          <span>Tenant Settings</span>
        </button>
      </div>
    </aside>
  );
};
