import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, LayoutDashboard, Package, ArrowRightLeft, 
  History, Settings, LogOut, Plus, ArrowDownToLine, 
  ArrowUpFromLine, Scale, AlertTriangle, Building2, User
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const mainNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Stock / Catalog', path: '/products', icon: Package },
    { name: 'Operations', path: '/operations', icon: ArrowRightLeft },
    { name: 'Move History', path: '/ledger', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const activeTab = location.state?.tab || 'receipt';
  const activeStockFilter = location.state?.filter || 'all';

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0f0f11' }}>
      
      {/* Horizontal Top Navigation Bar */}
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        height: '64px',
        borderBottom: '1px solid var(--border-default)',
        backgroundColor: '#161618',
        flexShrink: 0
      }}>
        {/* Brand / Logo & Toggle */}
        <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title="Toggle Sidebar"
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#fff', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center',
              padding: '6px',
              borderRadius: '4px',
              transition: 'background-color 0.2s'
            }}
          >
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ flexShrink: 0 }}
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="var(--color-primary, #6366f1)" fillOpacity="0.2" stroke="var(--color-primary, #6366f1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="var(--color-primary, #6366f1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="22.08" x2="12" y2="12" stroke="var(--color-primary, #6366f1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 14L12 16.5L7 14" stroke="var(--color-primary, #6366f1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontFamily: 'system-ui', letterSpacing: '0.02em' }}>StockSense</span>
          </div>
        </div>

        {/* Top Header Navigation Links */}
        <nav style={{ display: 'flex', gap: '1.5rem', height: '100%' }}>
          {mainNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--color-primary, #6366f1)' : '2px solid transparent',
                  color: isActive ? '#fff' : 'var(--text-variant)',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '14px',
                  padding: '0 8px',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={16} />
                {item.name}
              </button>
            );
          })}
        </nav>
        
        {/* User Info / Quick Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-variant)', fontSize: '13px' }}>
            <User size={16} />
            <span className="mono">Active User</span>
          </div>
        </div>
      </header>
      
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Vertical Left Sidebar */}
        <aside style={{ 
          width: isSidebarOpen ? '260px' : '0px', 
          opacity: isSidebarOpen ? 1 : 0,
          backgroundColor: '#161618', 
          borderRight: isSidebarOpen ? '1px solid var(--border-default)' : 'none', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.25s ease',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          
          <div style={{ padding: '1.5rem 1rem', width: '260px', overflowY: 'auto', flex: 1 }}>
            
            {/* Main Navigation Section */}
            <div style={{ color: 'var(--text-variant)', fontSize: '11px', fontWeight: 700, marginBottom: '0.75rem', paddingLeft: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Main Menu
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.5rem' }}>
              {mainNavItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.path)}
                    style={sidebarBtnStyle(isActive)}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Contextual Actions / Sub-Menu Section */}
            <div style={{ color: 'var(--text-variant)', fontSize: '11px', fontWeight: 700, marginBottom: '0.75rem', paddingLeft: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Actions
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {location.pathname.startsWith('/products') && (
                <>
                  <button 
                    onClick={() => navigate('/products', { state: { filter: 'all' } })} 
                    style={sidebarSubBtnStyle(activeStockFilter === 'all')}
                  >
                    <Package size={15} />
                    <span>All Products</span>
                  </button>
                  <button 
                    onClick={() => navigate('/products', { state: { openModal: true } })} 
                    style={sidebarSubBtnStyle(false)}
                  >
                    <Plus size={15} />
                    <span>Create New Product</span>
                  </button>
                  <button 
                    onClick={() => navigate('/products', { state: { filter: 'low_stock' } })} 
                    style={sidebarSubBtnStyle(activeStockFilter === 'low_stock')}
                  >
                    <AlertTriangle size={15} style={{ color: 'var(--warning, #f59e0b)' }} />
                    <span>Low / Out of Stock</span>
                  </button>
                </>
              )}

              {location.pathname.startsWith('/operations') && (
                <>
                  <button 
                    onClick={() => navigate('/operations', { state: { tab: 'receipt' } })} 
                    style={sidebarSubBtnStyle(activeTab === 'receipt')}
                  >
                    <ArrowDownToLine size={15} />
                    <span>Receipts (Incoming)</span>
                  </button>
                  <button 
                    onClick={() => navigate('/operations', { state: { tab: 'delivery' } })} 
                    style={sidebarSubBtnStyle(activeTab === 'delivery')}
                  >
                    <ArrowUpFromLine size={15} />
                    <span>Delivery Orders (Outgoing)</span>
                  </button>
                  <button 
                    onClick={() => navigate('/operations', { state: { tab: 'internal' } })} 
                    style={sidebarSubBtnStyle(activeTab === 'internal')}
                  >
                    <ArrowRightLeft size={15} />
                    <span>Internal Transfers</span>
                  </button>
                  <button 
                    onClick={() => navigate('/operations', { state: { tab: 'adjustment' } })} 
                    style={sidebarSubBtnStyle(activeTab === 'adjustment')}
                  >
                    <Scale size={15} />
                    <span>Inventory Adjustments</span>
                  </button>
                </>
              )}

              {location.pathname.startsWith('/ledger') && (
                <>
                  <button 
                    onClick={() => navigate('/ledger')} 
                    style={sidebarSubBtnStyle(true)}
                  >
                    <History size={15} />
                    <span>Audit Move History</span>
                  </button>
                </>
              )}

              {location.pathname.startsWith('/settings') && (
                <>
                  <button 
                    onClick={() => navigate('/settings')} 
                    style={sidebarSubBtnStyle(true)}
                  >
                    <Building2 size={15} />
                    <span>Warehouse Config</span>
                  </button>
                </>
              )}

              {location.pathname.startsWith('/dashboard') && (
                <>
                  <button 
                    onClick={() => navigate('/dashboard')} 
                    style={sidebarSubBtnStyle(true)}
                  >
                    <LayoutDashboard size={15} />
                    <span>Telemetry Overview</span>
                  </button>
                </>
              )}
            </div>

          </div>

          {/* Profile & Logout Section */}
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border-default)', width: '260px' }}>
            <div style={{ color: 'var(--text-variant)', fontSize: '11px', fontWeight: 700, marginBottom: '0.5rem', paddingLeft: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Account
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <button 
                onClick={handleLogout} 
                style={{ 
                  ...sidebarBtnStyle(false), 
                  color: 'var(--danger, #ef4444)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)'
                }}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

const sidebarBtnStyle = (isActive: boolean) => ({
  background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
  border: isActive ? '1px solid var(--border-default)' : '1px solid transparent',
  color: isActive ? '#fff' : 'var(--text-variant)',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: isActive ? 600 : 400,
  textAlign: 'left' as const,
  padding: '0.65rem 0.85rem',
  borderRadius: '6px',
  transition: 'all 0.2s ease',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
});

const sidebarSubBtnStyle = (isActive: boolean) => ({
  background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
  border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
  color: isActive ? '#fff' : 'var(--text-variant)',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: isActive ? 600 : 400,
  textAlign: 'left' as const,
  padding: '0.55rem 0.85rem',
  borderRadius: '6px',
  transition: 'all 0.2s ease',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
});
