import React, { useEffect, useState } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import type { Ticket } from '../types';

interface TicketsProps {
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

function displayEnum(val: any, type: 'type' | 'priority' | 'sentiment' | 'status'): string {
  if (typeof val === 'string') return val;
  if (type === 'type') {
    const map: Record<number, string> = { 1: 'Petition', 2: 'Complaint', 3: 'Claim', 4: 'Suggestion' };
    return map[val] || 'Petition';
  }
  if (type === 'priority') {
    const map: Record<number, string> = { 1: 'Low', 2: 'Medium', 3: 'High' };
    return map[val] || 'Medium';
  }
  if (type === 'status') {
    const map: Record<number, string> = { 1: 'Pending', 2: 'InProgress', 3: 'Resolved' };
    return map[val] || 'Pending';
  }
  const map: Record<number, string> = { 1: 'Positive', 2: 'Neutral', 3: 'Negative' };
  return map[val] || 'Neutral';
}

export const Tickets: React.FC<TicketsProps> = ({ onSelectTicket, newTicketAlert }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await api.getTickets({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        type: typeFilter || undefined,
        searchQuery: search || undefined,
      });
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter, typeFilter]);

  useEffect(() => {
    if (newTicketAlert) {
      setTickets((prev) => [newTicketAlert, ...prev.filter((t) => t.id !== newTicketAlert.id)]);
    }
  }, [newTicketAlert]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadTickets();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>PQRS Ticket Inbox</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Live triage inbox with automated classification and sentiment analysis.
          </p>
        </div>
        <button onClick={loadTickets} className="btn btn-secondary" style={{ padding: '8px 14px' }}>
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="card" style={{ padding: '16px 20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <input
              type="text"
              placeholder="Search by radicado, customer, email, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 38px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '10px 14px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="InProgress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ padding: '10px 14px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ padding: '10px 14px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
            >
              <option value="">All Types</option>
              <option value="Petition">Petition</option>
              <option value="Complaint">Complaint</option>
              <option value="Claim">Claim</option>
              <option value="Suggestion">Suggestion</option>
            </select>

            <button type="submit" className="btn btn-primary">
              <Filter size={16} />
              <span>Apply</span>
            </button>
          </div>
        </form>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Radicado</th>
              <th>Customer</th>
              <th>Subject</th>
              <th>Type</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Sentiment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  Loading tickets...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No tickets match the selected filters.
                </td>
              </tr>
            ) : (
              tickets.map((t) => (
                <tr key={t.id} onClick={() => onSelectTicket(t)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#60a5fa' }}>{t.radicadoNumber}</td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{t.customerName}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{t.customerEmail}</div>
                  </td>
                  <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: '500' }}>{t.subject}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.executiveSummary || t.description}</div>
                  </td>
                  <td><span className={`badge badge-${formatTypeBadge(t.type)}`}>{displayEnum(t.type, 'type')}</span></td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: displayEnum(t.status, 'status') === 'Resolved' ? '#10b981' : displayEnum(t.status, 'status') === 'InProgress' ? '#f59e0b' : '#94a3b8' }}>
                      ● {displayEnum(t.status, 'status')}
                    </span>
                  </td>
                  <td><span className={`badge badge-${formatBadge(t.priority)}`}>{displayEnum(t.priority, 'priority')}</span></td>
                  <td><span className={`badge badge-${formatSentimentBadge(t.sentiment)}`}>{displayEnum(t.sentiment, 'sentiment')}</span></td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(t.createdAtUtc).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
