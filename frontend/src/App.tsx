import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TicketDetailModal } from './components/TicketDetailModal';
import { Dashboard } from './pages/Dashboard';
import { Tickets } from './pages/Tickets';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { Settings } from './pages/Settings';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { api } from './services/api';
import { signalRService } from './services/signalr';
import type { Ticket, TicketPriority, TicketStatus, User } from './types';
import { AlertTriangle, X } from 'lucide-react';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('app_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'register'>('landing');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tickets' | 'kb' | 'settings'>('dashboard');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newTicketAlert, setNewTicketAlert] = useState<Ticket | null>(null);
  const [criticalToast, setCriticalToast] = useState<{ message: string; ticket: any } | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    if (user) {
      signalRService.startConnection(
        user.tenantId,
        (ticket: Ticket) => {
          setNewTicketAlert(ticket);
        },
        (criticalData: any) => {
          setCriticalToast({
            message: criticalData.message,
            ticket: criticalData,
          });
        }
      );

      const existing = document.querySelector('pqrs-widget');
      if (existing) existing.remove();

      const script = document.createElement('script');
      script.src = 'http://localhost:5050/widget/pqrs-widget.js';
      script.setAttribute('data-tenant', user.tenantId);
      script.setAttribute('data-api', 'http://localhost:5050');
      document.body.appendChild(script);

      return () => {
        signalRService.stopConnection(user.tenantId);
        const w = document.querySelector('pqrs-widget');
        if (w) w.remove();
        script.remove();
      };
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    const w = document.querySelector('pqrs-widget');
    if (w) w.remove();
    setUser(null);
    setAuthMode('landing');
  };

  const handleUpdateTicketStatus = async (id: string, status: TicketStatus, priority: TicketPriority) => {
    const updated = await api.updateTicketStatus(id, status, priority);
    setSelectedTicket(updated);
    setNewTicketAlert(updated);
  };

  if (!user) {
    if (authMode === 'login' || authMode === 'register') {
      return (
        <Login
          initialMode={authMode}
          onLoginSuccess={(u) => setUser(u)}
          onBackToLanding={() => setAuthMode('landing')}
        />
      );
    }

    return (
      <LandingPage
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenAuth={(mode) => setAuthMode(mode)}
      />
    );
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      <div className="main-content">
        <Navbar
          user={user}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
        />

        {criticalToast && (
          <div style={{ margin: '16px 32px 0', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '12px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f87171' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={20} />
              <span style={{ fontSize: '13.5px', fontWeight: '600' }}>{criticalToast.message}</span>
            </div>
            <button onClick={() => setCriticalToast(null)} className="btn btn-secondary" style={{ padding: '4px 8px' }}>
              <X size={16} />
            </button>
          </div>
        )}

        <main className="page-body">
          {activeTab === 'dashboard' && <Dashboard onSelectTicket={(t) => setSelectedTicket(t)} newTicketAlert={newTicketAlert} />}
          {activeTab === 'tickets' && <Tickets onSelectTicket={(t) => setSelectedTicket(t)} newTicketAlert={newTicketAlert} />}
          {activeTab === 'kb' && <KnowledgeBase />}
          {activeTab === 'settings' && <Settings user={user} />}
        </main>
      </div>

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdateStatus={handleUpdateTicketStatus}
        />
      )}
    </div>
  );
};

export default App;
