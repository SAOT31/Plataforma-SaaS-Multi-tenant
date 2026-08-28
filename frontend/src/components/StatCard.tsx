import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, variant = 'primary' }) => {
  const getGlowColor = () => {
    switch (variant) {
      case 'success': return 'rgba(16, 185, 129, 0.15)';
      case 'warning': return 'rgba(245, 158, 11, 0.15)';
      case 'danger': return 'rgba(239, 68, 68, 0.15)';
      default: return 'rgba(99, 102, 241, 0.15)';
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>{title}</span>
        <div style={{ padding: '8px', borderRadius: '10px', background: getGlowColor() }}>
          {icon}
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {subtitle && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subtitle}</div>}
    </div>
  );
};
