import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

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
        backgroundColor: '#161618'
      }}>
        
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

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ 
            width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 600
          }}>
            A
          </span>
          <button 
            onClick={handleLogout} 
            style={{
              background: 'none', border: 'none', color: 'var(--text-variant)', cursor: 'pointer', fontSize: '12px', fontWeight: 600
            }}
          >
            LOGOUT
          </button>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, padding: '2rem 4rem', overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
