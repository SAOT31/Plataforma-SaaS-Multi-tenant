import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { TenantInfo } from '../types';
import { Bot, Sparkles, Building, CheckCircle2 } from 'lucide-react';

export const CustomerPortal: React.FC = () => {
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>('');

  useEffect(() => {
    api.getTenants().then((list) => {
      setTenants(list);
      if (list.length > 0) {
        setSelectedTenant(list[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedTenant) return;

    const existingWidget = document.querySelector('pqrs-widget');
    if (existingWidget) {
      existingWidget.remove();
    }

    const script = document.createElement('script');
    script.src = 'http://localhost:5050/widget/pqrs-widget.js';
    script.setAttribute('data-tenant', selectedTenant);
    script.setAttribute('data-api', 'http://localhost:5050');
    document.body.appendChild(script);

    return () => {
      const w = document.querySelector('pqrs-widget');
      if (w) w.remove();
      script.remove();
    };
  }, [selectedTenant]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>Customer Support Portal</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Live customer support interface powered by pgvector RAG AI and instant automated triage.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Building size={18} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Active Tenant:</span>
          <select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              fontSize: '13.5px',
              fontWeight: '500',
            }}
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className="card"
        style={{
          minHeight: '440px',
          background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '48px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '20px',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
          }}
        >
          <Bot size={36} />
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '10px' }}>
          Live Support Widget Active
        </h2>
        <p style={{ maxWidth: '580px', fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
          The PQRS support widget is loaded at the bottom right corner of this screen. Customers can interact with the RAG knowledge base or file formal tickets with automated triage.
        </p>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <CheckCircle2 size={16} style={{ color: '#10b981' }} />
            <span>Encapsulated Shadow DOM</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <Sparkles size={16} style={{ color: '#6366f1' }} />
            <span>Cosine Similarity RAG</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <CheckCircle2 size={16} style={{ color: '#10b981' }} />
            <span>Formal Radicado Generation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
