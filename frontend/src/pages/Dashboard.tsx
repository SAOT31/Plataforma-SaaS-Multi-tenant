import React, { useEffect, useState } from 'react';
import { Inbox, ShieldAlert, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { api } from '../services/api';
import type { Ticket, TicketStats } from '../types';

interface DashboardProps {
  onSelectTicket: (ticket: Ticket) => void;
  newTicketAlert?: Ticket | null;
}

function formatBadge(val: any): string {
  if (typeof val === 'string') return val.toLowerCase();
  const map: Record<number, string> = { 1: 'low', 2: 'medium', 3: 'high' };
  return map[val] || 'default';
}

function formatTypeBadge(val: any): string {
  if (typeof val === 'string') return val.toLowerCase();
  const map: Record<number, string> = { 1: 'petition', 2: 'complaint', 3: 'claim', 4: 'suggestion' };
  return map[val] || 'petition';
}

function formatSentimentBadge(val: any): string {
  if (typeof val === 'string') return val.toLowerCase();
  const map: Record<number, string> = { 1: 'positive', 2: 'neutral', 3: 'negative' };
  return map[val] || 'neutral';
}

function displayEnum(val: any, type: 'type' | 'priority' | 'sentiment'): string {
  if (typeof val === 'string') return val;
  if (type === 'type') {
    const map: Record<number, string> = { 1: 'Petition', 2: 'Complaint', 3: 'Claim', 4: 'Suggestion' };
    return map[val] || 'Petition';
  }
  if (type === 'priority') {
    const map: Record<number, string> = { 1: 'Low', 2: 'Medium', 3: 'High' };
    return map[val] || 'Medium';
  }
  const map: Record<number, string> = { 1: 'Positive', 2: 'Neutral', 3: 'Negative' };
  return map[val] || 'Neutral';
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectTicket, newTicketAlert }) => {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [s, t] = await Promise.all([
          api.getTicketStats(),
          api.getTickets(),
        ]);
        setStats(s);
        setRecentTickets(t.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [newTicketAlert]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Loading analytics dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>Overview & Metrics</h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>Real-time telemetry on AI auto-deflection, incoming PQRS, and triage.</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="TOTAL TICKETS"
          value={stats?.totalTickets || 0}
          subtitle={`${stats?.pendingTickets || 0} pending review`}
          icon={<Inbox size={20} style={{ color: '#6366f1' }} />}
          variant="primary"
        />

        <StatCard
          title="RAG DEFLECTION RATE"
          value={`${stats?.deflectionRatePercentage || 0}%`}
          subtitle={`${stats?.deflectedTicketsCount || 0} resolved by AI auto-response`}
          icon={<Sparkles size={20} style={{ color: '#10b981' }} />}
          variant="success"
        />

        <StatCard
          title="CRITICAL / HIGH PRIORITY"
          value={stats?.criticalOrHighPriorityTickets || 0}
          subtitle={`${stats?.negativeSentimentTickets || 0} negative sentiment tickets`}
          icon={<ShieldAlert size={20} style={{ color: '#ef4444' }} />}
          variant="danger"
        />

        <StatCard
          title="RESOLVED TICKETS"
          value={stats?.resolvedTickets || 0}
          subtitle="Closed successfully"
          icon={<CheckCircle2 size={20} style={{ color: '#3b82f6' }} />}
          variant="primary"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Recent PQRS Submissions</h3>
          </div>

          {recentTickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13.5px' }}>
              No tickets recorded yet. Submit inquiries via the Customer Portal widget to populate data.
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Radicado</th>
                    <th>Customer</th>
                    <th>Subject</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Sentiment</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map((t) => (
                    <tr key={t.id} onClick={() => onSelectTicket(t)} style={{ cursor: 'pointer' }}>
                      <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#60a5fa' }}>{t.radicadoNumber}</td>
                      <td>{t.customerName}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</td>
                      <td><span className={`badge badge-${formatTypeBadge(t.type)}`}>{displayEnum(t.type, 'type')}</span></td>
                      <td><span className={`badge badge-${formatBadge(t.priority)}`}>{displayEnum(t.priority, 'priority')}</span></td>
                      <td><span className={`badge badge-${formatSentimentBadge(t.sentiment)}`}>{displayEnum(t.sentiment, 'sentiment')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <TrendingUp size={18} style={{ color: '#6366f1' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>AI Performance</h3>
          </div>

          <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
            The Retrieval-Augmented Generation (RAG) assistant is deflecting repetitive FAQ inquiries before human escalation.
          </p>

          <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Deflection Ratio</span>
              <strong style={{ color: '#10b981' }}>{stats?.deflectionRatePercentage || 0}%</strong>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--bg-card)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${stats?.deflectionRatePercentage || 0}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #10b981)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
