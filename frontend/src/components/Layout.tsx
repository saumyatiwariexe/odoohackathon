import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const NAV = [
  { path: '/dashboard', icon: 'dashboard', label: 'DASHBOARD' },
  { path: '/catalog', icon: 'inventory_2', label: 'CATALOG' },
  { path: '/operations', icon: 'swap_horiz', label: 'OPERATIONS' },
  { path: '/locations', icon: 'warehouse', label: 'LOCATIONS' },
  { path: '/ledger', icon: 'receipt_long', label: 'LEDGER' },
];

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Layout({ children, title, subtitle, actions }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [time] = useState(() => new Date().toLocaleTimeString());

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Session terminated');
    navigate('/login');
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div>
            <div className="flex items-center gap-xs">
              <span className="mono" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>STOCKSENSE</span>
            </div>
            <div className="flex items-center gap-xs" style={{ marginTop: 3 }}>
              <div className="live-dot" style={{ width: 5, height: 5 }} />
              <span className="mono text-xs text-neutral" style={{ letterSpacing: '0.04em' }}>WMS v2.4 ONLINE</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">NAVIGATION</div>
          {NAV.map(item => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="material-symbols-outlined nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="mono text-xs text-neutral" style={{ marginBottom: 'var(--space-sm)', letterSpacing: '0.04em' }}>
            SESSION: ACTIVE
          </div>
          <button className="btn btn-ghost w-full" style={{ justifyContent: 'flex-start', gap: 'var(--space-sm)' }} onClick={handleLogout}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
            LOGOUT
          </button>
        </div>
      </aside>

      {/* Main panel */}
      <div className="main-panel">
        {/* Top bar */}
        <div className="top-bar">
          <div>
            <h1 className="page-title">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-lg">
            {actions}
            <div className="flex items-center gap-sm mono text-xs">
              <div className="live-dot" />
              <span style={{ color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>SYSTEM OPTIMAL</span>
            </div>
            <span className="mono text-xs text-neutral">SYNC: {time}</span>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}
