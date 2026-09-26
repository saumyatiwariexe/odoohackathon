import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const fetchKPIs = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get('http://localhost:3000/api/dashboard/kpis', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: kpis, isLoading, isError } = useQuery({
    queryKey: ['dashboardKPIs'],
    queryFn: fetchKPIs,
    refetchInterval: 60000,
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="app-container">
      <aside style={{ width: '240px', borderRight: '1px solid var(--border-default)', backgroundColor: 'var(--card-surface)', padding: 'var(--space-lg)', position: 'relative' }}>
        <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-xl)' }}>
          <span className="mono text-sm uppercase" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>STOCKSENSE</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <a href="#" style={{ color: 'var(--on-surface)', textDecoration: 'none', padding: 'var(--space-sm)', backgroundColor: 'var(--interactive-surface)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '2px solid var(--primary)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>dashboard</span>
            <span className="mono text-xs">DASHBOARD</span>
          </a>
        </nav>
        
        <div style={{ position: 'absolute', bottom: 'var(--space-lg)' }}>
          <button onClick={handleLogout} className="btn-secondary" style={{ width: '200px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
            LOGOUT
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        <header className="flex justify-between items-center" style={{ marginBottom: 'var(--space-xl)', borderBottom: '1px solid var(--border-default)', paddingBottom: 'var(--space-lg)' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0, textTransform: 'uppercase' }}>Logistics Dashboard</h1>
            <p className="mono text-xs text-variant" style={{ marginTop: '4px' }}>LIVE TELEMETRY // LAST SYNC: {new Date().toLocaleTimeString()}</p>
          </div>
          <div className="flex items-center gap-sm mono text-xs">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)', boxShadow: '0 0 8px rgba(16, 185, 129, 0.35)' }}></span>
            <span style={{ color: 'var(--success)' }}>SYSTEM OPTIMAL</span>
          </div>
        </header>

        {isLoading ? (
          <div className="mono text-sm text-variant" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>refresh</span>
            LOADING TELEMETRY...
          </div>
        ) : isError ? (
          <div className="mono text-sm" style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
            ERROR LOADING KPI DATA
          </div>
        ) : (
          <div className="dashboard-grid">
            <div className="kpi-card">
              <span className="kpi-title mono uppercase">Total Products</span>
              <span className="kpi-value">{kpis?.total_products || 0}</span>
            </div>
            <div className="kpi-card" style={{ borderColor: 'rgba(245, 158, 11, 0.4)', backgroundColor: 'rgba(245, 158, 11, 0.05)' }}>
              <span className="kpi-title mono uppercase" style={{ color: 'var(--warning)' }}>Low Stock</span>
              <span className="kpi-value" style={{ color: 'var(--warning)' }}>{kpis?.low_stock || 0}</span>
            </div>
            <div className="kpi-card" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
              <span className="kpi-title mono uppercase" style={{ color: 'var(--error)' }}>Out of Stock</span>
              <span className="kpi-value" style={{ color: 'var(--error)' }}>{kpis?.out_of_stock || 0}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-title mono uppercase">Pending Receipts</span>
              <span className="kpi-value" style={{ color: 'var(--secondary)' }}>{kpis?.pending_receipts || 0}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-title mono uppercase">Pending Deliveries</span>
              <span className="kpi-value" style={{ color: 'var(--secondary)' }}>{kpis?.pending_deliveries || 0}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-title mono uppercase">Active Transfers</span>
              <span className="kpi-value" style={{ color: 'var(--secondary)' }}>{kpis?.scheduled_transfers || 0}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
