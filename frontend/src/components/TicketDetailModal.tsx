import React, { useState } from 'react';
import { X, Sparkles, User, Mail, Calendar, CheckCircle2 } from 'lucide-react';
import type { Ticket, TicketPriority, TicketStatus } from '../types';

interface TicketDetailModalProps {
  ticket: Ticket;
  onClose: () => void;
  onUpdateStatus: (id: string, status: TicketStatus, priority: TicketPriority) => Promise<void>;
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

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ ticket, onClose, onUpdateStatus }) => {
  const [status, setStatus] = useState<TicketStatus>(displayEnum(ticket.status, 'status') as TicketStatus);
  const [priority, setPriority] = useState<TicketPriority>(displayEnum(ticket.priority, 'priority') as TicketPriority);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdateStatus(ticket.id, status, priority);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ticket Radicado</span>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>{ticket.radicadoNumber}</h2>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--primary)' }}>
            <Sparkles size={18} />
            <strong style={{ fontSize: '14px' }}>AI Triage & Intelligence Analysis</strong>
          </div>
          <p style={{ fontSize: '13.5px', lineHeight: '1.5', color: 'var(--text-primary)', marginBottom: '12px' }}>
            {ticket.executiveSummary || 'AI analysis completed upon submission.'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span className={`badge badge-${formatTypeBadge(ticket.type)}`}>Type: {displayEnum(ticket.type, 'type')}</span>
            <span className={`badge badge-${formatBadge(ticket.priority)}`}>Priority: {displayEnum(ticket.priority, 'priority')}</span>
            <span className={`badge badge-${formatSentimentBadge(ticket.sentiment)}`}>Sentiment: {displayEnum(ticket.sentiment, 'sentiment')}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <User size={16} />
            <span><strong>Customer:</strong> {ticket.customerName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <Mail size={16} />
            <span><strong>Email:</strong> {ticket.customerEmail}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <Calendar size={16} />
            <span><strong>Date:</strong> {new Date(ticket.createdAtUtc).toLocaleString()}</span>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>SUBJECT</div>
          <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '14px' }}>{ticket.subject}</div>

          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>DESCRIPTION</div>
          <div style={{ fontSize: '13.5px', lineHeight: '1.6', background: 'var(--bg-card)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
            {ticket.description}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>STATUS</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TicketStatus)}
              style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
            >
              <option value="Pending">Pending</option>
              <option value="InProgress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>PRIORITY OVERRIDE</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="btn btn-primary">
            <CheckCircle2 size={16} />
            <span>{loading ? 'Saving...' : 'Update Ticket'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
