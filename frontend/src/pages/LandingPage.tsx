import React from 'react';
import { Bot, Sparkles, ShieldCheck, Zap, ArrowRight, Sun, Moon, CheckCircle2, MessageSquare } from 'lucide-react';

interface LandingPageProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ theme, onToggleTheme, onOpenAuth }) => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <header className="navbar" style={{ padding: '0 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', background: 'var(--primary-gradient)', borderRadius: '10px', color: '#fff', display: 'flex' }}>
            <Bot size={22} />
          </div>
          <div>
            <div className="brand-title">PQRS AI Engine</div>
            <div className="brand-subtitle">Multi-Tenant Support Platform</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onToggleTheme}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', borderRadius: '50%' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button onClick={() => onOpenAuth('login')} className="btn btn-secondary">
            Sign In
          </button>

          <button onClick={() => onOpenAuth('register')} className="btn btn-primary">
            <span>Register Company</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <section className="landing-hero">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '30px', fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>
            <Sparkles size={16} />
            <span>Next-Gen Multi-Tenant AI Support Infrastructure</span>
          </div>

          <h1 className="hero-title">
            Automate PQRS Inquiries with <span className="hero-gradient-text">RAG & Intelligent AI Triage</span>
          </h1>

          <p style={{ fontSize: '17px', lineHeight: '1.6', color: 'var(--text-secondary)', maxWidth: '720px' }}>
            Cut manual support overhead by over 40%. Deploy our ultra-fast embeddable widget to deflect repetitive FAQs using pgvector cosine similarity, and automatically categorize incoming tickets with real-time sentiment analysis.
          </p>

          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => onOpenAuth('register')} className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }}>
              <span>Start Free - Create Tenant</span>
              <ArrowRight size={18} />
            </button>
            <button onClick={() => onOpenAuth('login')} className="btn btn-secondary" style={{ padding: '14px 24px', fontSize: '15px' }}>
              <span>Agent Portal Login</span>
            </button>
          </div>
        </section>

        <section style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)' }}>Enterprise Architecture Capabilities</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px' }}>Engineered with Clean Architecture in .NET 10 & PostgreSQL pgvector</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                <Sparkles size={22} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '600' }}>Pre-Filing RAG Auto-Deflection</h3>
              <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                Generates 768-dimensional vector embeddings to query knowledge base articles in real-time, synthesizing answers before human ticket escalation.
              </p>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <Zap size={22} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '600' }}>Automated AI Triage</h3>
              <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                Extracts type (Petition, Complaint, Claim, Suggestion), suggested priority, sentiment score, and executive summary for rapid agent review.
              </p>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <MessageSquare size={22} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '600' }}>Real-Time SignalR WebSockets</h3>
              <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                Instant broadcast to agent dashboards when critical, high-priority, or negative sentiment tickets are created.
              </p>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '600' }}>Strict Multi-Tenant Isolation</h3>
              <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                TenantId filtering on headers and JWT claims, per-tenant dynamic CORS validation, and isolated database schemas.
              </p>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: '1200px', margin: '40px auto 80px', padding: '0 24px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
              <div>
                <span className="badge badge-petition" style={{ marginBottom: '12px' }}>Embeddable Widget</span>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Inject on Any Website in 10 Seconds
                </h3>
                <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Our Shadow DOM widget isolates styles completely. Simply paste the script tag and connect your customer touchpoints to the AI triage engine.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                    <span>Shadow DOM encapsulated styling</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                    <span>Dual-phase RAG + Formal Filing workflow</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                    <span>Live radicado tracking (#RAD-2026-XXXX)</span>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', fontFamily: 'monospace', fontSize: '13px', overflowX: 'auto', color: '#60a5fa' }}>
                <code>
                  &lt;script<br />
                  &nbsp;&nbsp;src="http://localhost:5050/widget/pqrs-widget.js"<br />
                  &nbsp;&nbsp;data-tenant="YOUR_TENANT_ID"&gt;<br />
                  &lt;/script&gt;
                </code>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '28px 40px', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
        <div>PQRS AI Engine &copy; 2026. Developed by Sergio Ospina.</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>PostgreSQL + pgvector</span>
          <span>ASP.NET Core .NET 10</span>
          <span>Google Gemini RAG</span>
        </div>
      </footer>
    </div>
  );
};
