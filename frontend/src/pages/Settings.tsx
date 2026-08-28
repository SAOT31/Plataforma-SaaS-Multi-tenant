import React, { useState, useEffect } from 'react';
import { Copy, Check, ShieldCheck, Code, Globe, Sparkles, Activity, Users, UserPlus } from 'lucide-react';
import type { User } from '../types';
import { api } from '../services/api';
import { NewAgentModal } from '../components/NewAgentModal';

interface SettingsProps {
  user: User;
}

export const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [copied, setCopied] = useState(false);
  const [agents, setAgents] = useState<User[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [allowedDomain, setAllowedDomain] = useState('*');
  const [savingDomain, setSavingDomain] = useState(false);

  const loadAgents = async () => {
    if (user.role !== 'Admin') return;
    setLoadingAgents(true);
    try {
      const data = await api.getAgents();
      setAgents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAgents(false);
    }
  };

  const loadTenantData = async () => {
    try {
      const tenant = await api.getTenant();
      setAllowedDomain(tenant.allowedDomain || '*');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAgents();
    loadTenantData();
  }, [user.role]);

  const handleSaveDomain = async () => {
    setSavingDomain(true);
    try {
      await api.updateTenantDomain(allowedDomain);
      alert('Allowed Domain updated successfully!');
    } catch (err) {
      alert('Failed to update domain');
    } finally {
      setSavingDomain(false);
    }
  };

  const embedScript = `<!-- PQRS AI Support Widget -->
<script 
  src="http://localhost:5050/widget/pqrs-widget.js" 
  data-tenant="${user.tenantId}"
  data-api="http://localhost:5050">
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>Tenant Settings & Integration</h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Configure widget integration code, multi-tenant CORS domains, and view telemetry health.
        </p>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
          <Code size={20} />
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Embeddable Widget Integration Code</h3>
        </div>

        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          Paste this script tag into the HTML of your company website or e-commerce store before the closing <code>&lt;/body&gt;</code> tag:
        </p>

        <div style={{ position: 'relative', background: 'var(--bg-primary)', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', fontFamily: 'monospace', fontSize: '13px', color: '#60a5fa' }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{embedScript}</pre>
          <button
            onClick={handleCopy}
            className="btn btn-secondary"
            style={{ position: 'absolute', top: '12px', right: '12px', padding: '6px 12px', fontSize: '12px', gap: '6px' }}
          >
            {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
            <Globe size={20} style={{ color: '#6366f1' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Tenant & Security Metadata</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '13.5px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Company Name:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{user.tenantName}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '13.5px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Tenant UUID:</span>
              <code style={{ fontSize: '12px', color: '#60a5fa' }}>{user.tenantId}</code>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '13.5px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Your Role:</span>
              <span className="badge badge-petition">{user.role}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px' }}>
              <label style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>Allowed CORS Domain:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={allowedDomain}
                  onChange={(e) => setAllowedDomain(e.target.value)}
                  disabled={user.role !== 'Admin'}
                  placeholder="e.g. mi-tienda.com or * for all"
                  style={{
                    flex: 1,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                />
                {user.role === 'Admin' && (
                  <button 
                    onClick={handleSaveDomain} 
                    disabled={savingDomain}
                    className="btn btn-primary" 
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    {savingDomain ? 'Saving...' : 'Save'}
                  </button>
                )}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Restrict widget requests to this specific domain for security. Use * to allow any domain.
              </span>
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
            <Activity size={20} style={{ color: '#10b981' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>System Health & Infrastructure</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} style={{ color: '#10b981' }} />
                <span>PostgreSQL + pgvector (768d HNSW)</span>
              </div>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>Active & Indexed</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ color: '#6366f1' }} />
                <span>Google Gemini AI (RAG & Triage)</span>
              </div>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>Connected (Free Tier)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="live-dot" />
                <span>SignalR WebSocket Engine</span>
              </div>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>Listening to tenant_{user.tenantId.substring(0, 8)}</span>
            </div>
          </div>
        </div>
      </div>

      {user.role === 'Admin' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
              <Users size={20} style={{ color: '#8b5cf6' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Team Management</h3>
            </div>
            <button 
              onClick={() => setIsAgentModalOpen(true)}
              className="btn btn-primary" 
              style={{ padding: '6px 12px', fontSize: '13px', gap: '6px' }}
            >
              <UserPlus size={14} />
              <span>Add Agent</span>
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {agents.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                      {loadingAgents ? 'Loading team...' : 'No agents found.'}
                    </td>
                  </tr>
                ) : (
                  agents.map(agent => (
                    <tr key={agent.id}>
                      <td style={{ fontWeight: '500' }}>{agent.fullName}</td>
                      <td>{agent.email}</td>
                      <td><span className="badge badge-petition">{agent.role}</span></td>
                      <td><span className="badge badge-success">Active</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAgentModalOpen && (
        <NewAgentModal 
          onClose={() => setIsAgentModalOpen(false)} 
          onSuccess={() => {
            setIsAgentModalOpen(false);
            loadAgents();
          }} 
        />
      )}
    </div>
  );
};
