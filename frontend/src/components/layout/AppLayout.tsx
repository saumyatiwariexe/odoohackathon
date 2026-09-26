import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto-open sidebar when navigating to a section with sub-menus
  useEffect(() => {
    const hasSubMenus = location.pathname.startsWith('/products') || 
                        location.pathname.startsWith('/operations') || 
                        location.pathname.startsWith('/settings');
    if (hasSubMenus) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Operations', path: '/operations' },
    { name: 'Stock', path: '/products' },
    { name: 'Move History', path: '/ledger' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0f0f11' }}>
      
      {/* Horizontal Top Navigation Bar */}
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 2rem',
        height: '64px',
        borderBottom: '1px solid var(--border-default)',
        backgroundColor: '#161618',
        flexShrink: 0
      }}>
        {/* Brand / Logo */}
        <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', backgroundColor: 'var(--color-primary)', borderRadius: '4px' }}></div>
            StockSense
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', gap: '2rem', height: '100%' }}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                  color: isActive ? '#fff' : 'var(--text-variant)',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '14px',
                  padding: '0 8px',
                  height: '100%',
                  transition: 'all 0.2s ease',
                }}
              >
                {item.name}
              </button>
            );
          })}
        </nav>
        
        {/* Empty placeholder to balance the flex-between */}
        <div style={{ width: '100px' }}></div>
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
          transition: 'all 0.3s ease',
          overflow: 'hidden'
        }}>
          
          {/* Contextual Sub-Menu */}
          <div style={{ padding: '2rem 1rem', width: '260px' }}>
            {location.pathname.startsWith('/products') && (
              <>
                <div style={{ color: 'var(--text-variant)', fontSize: '12px', fontWeight: 600, marginBottom: '1rem', paddingLeft: '1rem', textTransform: 'uppercase' }}>Products</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button className="sidebar-link active" onClick={() => navigate('/products')} style={sidebarBtnStyle(true)}>Create/update products</button>
                  <button className="sidebar-link" onClick={() => navigate('/products')} style={sidebarBtnStyle(false)}>Stock availability</button>
                  <button className="sidebar-link" onClick={() => navigate('/products')} style={sidebarBtnStyle(false)}>Product categories</button>
                  <button className="sidebar-link" onClick={() => navigate('/products')} style={sidebarBtnStyle(false)}>Reordering rules</button>
                </div>
              </>
            )}
            {location.pathname.startsWith('/operations') && (
              <>
                <div style={{ color: 'var(--text-variant)', fontSize: '12px', fontWeight: 600, marginBottom: '1rem', paddingLeft: '1rem', textTransform: 'uppercase' }}>Operations</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button className="sidebar-link active" onClick={() => navigate('/operations', { state: { tab: 'receipt' }})} style={sidebarBtnStyle(location.state?.tab !== 'delivery' && location.state?.tab !== 'adjustment')}>Receipts (Incoming)</button>
                  <button className="sidebar-link" onClick={() => navigate('/operations', { state: { tab: 'delivery' }})} style={sidebarBtnStyle(location.state?.tab === 'delivery')}>Delivery Orders (Outgoing)</button>
                  <button className="sidebar-link" onClick={() => navigate('/operations', { state: { tab: 'adjustment' }})} style={sidebarBtnStyle(location.state?.tab === 'adjustment')}>Inventory Adjustment</button>
                </div>
              </>
            )}
            {location.pathname.startsWith('/settings') && (
              <>
                <div style={{ color: 'var(--text-variant)', fontSize: '12px', fontWeight: 600, marginBottom: '1rem', paddingLeft: '1rem', textTransform: 'uppercase' }}>Settings</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button className="sidebar-link active" onClick={() => navigate('/settings')} style={sidebarBtnStyle(true)}>Warehouse</button>
                </div>
              </>
            )}
            {!location.pathname.startsWith('/products') && !location.pathname.startsWith('/operations') && !location.pathname.startsWith('/settings') && (
              <div style={{ color: 'var(--text-variant)', fontSize: '12px', textAlign: 'center', marginTop: '2rem' }}>
                No contextual options
              </div>
            )}
          </div>

          {/* Profile Menu (Left Sidebar) */}
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border-default)', width: '260px' }}>
            <div style={{ color: 'var(--text-variant)', fontSize: '12px', fontWeight: 600, marginBottom: '1rem', paddingLeft: '0.5rem', textTransform: 'uppercase' }}>Profile Menu</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <button style={sidebarBtnStyle(false)}>My Profile</button>
               <button onClick={handleLogout} style={{ ...sidebarBtnStyle(false), color: 'var(--danger)' }}>Logout</button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, padding: '2rem 4rem', overflowY: 'auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

const sidebarBtnStyle = (isActive: boolean) => ({
  background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'none',
  border: 'none',
  color: isActive ? '#fff' : 'var(--text-variant)',
  cursor: 'pointer',
  fontSize: '14px',
  textAlign: 'left' as const,
  padding: '0.75rem 1rem',
  borderRadius: '6px',
  transition: 'all 0.2s ease',
  width: '100%'
});
