import React, { useState } from 'react';
import { Bot, Lock, Mail, ArrowRight, Building, UserCheck, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import type { User } from '../types';

interface LoginProps {
  initialMode?: 'login' | 'register';
  onLoginSuccess: (user: User) => void;
  onBackToLanding?: () => void;
}

export const Login: React.FC<LoginProps> = ({ initialMode = 'login', onLoginSuccess, onBackToLanding }) => {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register({
          companyName,
          allowedDomain: '*',
          fullName,
          email,
          password,
        });

        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('auth_user', JSON.stringify({
          id: res.userId,
          tenantId: res.tenantId,
          fullName: res.fullName,
          email: res.email,
          role: res.role,
          tenantName: res.tenantName,
        }));

        onLoginSuccess({
          id: res.userId,
          tenantId: res.tenantId,
          fullName: res.fullName,
          email: res.email,
          role: res.role,
          tenantName: res.tenantName,
        });
      } else {
        const res = await api.login(email, password);
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('auth_user', JSON.stringify({
          id: res.userId,
          tenantId: res.tenantId,
          fullName: res.fullName,
          email: res.email,
          role: res.role,
          tenantName: res.tenantName,
        }));

        onLoginSuccess({
          id: res.userId,
          tenantId: res.tenantId,
          fullName: res.fullName,
          email: res.email,
          role: res.role,
          tenantName: res.tenantName,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '20px' }}>
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="btn btn-secondary"
          style={{ position: 'absolute', top: '24px', left: '24px', gap: '6px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>
      )}

      <div className="card" style={{ maxWidth: isRegister ? '500px' : '440px', width: '100%', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '16px', color: '#6366f1', marginBottom: '14px' }}>
            <Bot size={32} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {isRegister ? 'Register New Tenant' : 'PQRS AI Portal'}
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {isRegister ? 'Create your company account and deploy the AI widget' : 'Agent & Admin Portal Authentication'}
          </p>
        </div>

        <div style={{ display: 'flex', background: 'var(--bg-input)', padding: '4px', borderRadius: '10px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`btn ${!isRegister ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '8px 12px', fontSize: '13px', borderRadius: '8px' }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`btn ${isRegister ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '8px 12px', fontSize: '13px', borderRadius: '8px' }}
          >
            Register Tenant
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#f87171', fontSize: '13px', marginBottom: '18px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isRegister && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>COMPANY / TENANT NAME</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px 11px 40px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '10px' }}
                  />
                  <Building size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>ADMIN FULL NAME</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    placeholder="John Administrator"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px 11px 40px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '10px' }}
                  />
                  <UserCheck size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>EMAIL ADDRESS</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="admin@yourcompany.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '11px 14px 11px 40px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '10px' }}
              />
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '11px 14px 11px 40px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '10px' }}
              />
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '13px', marginTop: '6px' }}>
            <span>{loading ? 'Processing...' : isRegister ? 'Create Tenant & Launch Portal' : 'Sign In to Dashboard'}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
