import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchLocations = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get('http://localhost:8000/api/locations', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export default function SettingsPage() {
  const { data: locations, isLoading } = useQuery({ 
    queryKey: ['settings_locations'], 
    queryFn: fetchLocations 
  });

  return (
    <div>
      <header className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 500, margin: 0, color: '#e5e7eb', fontFamily: 'system-ui' }}>Settings</h1>
          <p className="mono text-xs text-variant" style={{ marginTop: '4px' }}>MANAGE WAREHOUSES AND LOCATIONS</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Locations Section */}
        <div style={{ backgroundColor: 'var(--card-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '2rem' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 1rem 0', color: '#e5e7eb', fontFamily: 'system-ui' }}>Locations</h2>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr className="mono text-xs text-variant" style={{ borderBottom: '1px solid var(--border-default)' }}>
                <th style={{ padding: '12px 0', fontWeight: 600 }}>NAME / WAREHOUSE</th>
                <th style={{ padding: '12px 0', fontWeight: 600 }}>SHORT CODE</th>
                <th style={{ padding: '12px 0', fontWeight: 600 }}>USAGE</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-variant)' }} className="mono text-sm">LOADING LOCATIONS...</td>
                </tr>
              ) : locations?.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-variant)' }} className="mono text-sm">NO LOCATIONS FOUND</td>
                </tr>
              ) : (
                locations?.map((loc: any) => (
                  <tr key={loc.id} style={{ borderBottom: '1px solid var(--border-default)' }} className="hover-row">
                    <td style={{ padding: '12px 0', fontWeight: 600, color: '#fff' }} className="text-sm">
                      {loc.name}
                    </td>
                    <td style={{ padding: '12px 0', color: 'var(--text-variant)' }} className="mono text-sm uppercase">
                      {loc.short_code || '-'}
                    </td>
                    <td style={{ padding: '12px 0' }}>
                      <span className="mono text-xs uppercase" style={{ color: 'var(--text-variant)', border: '1px solid var(--border-default)', padding: '2px 8px', borderRadius: '12px' }}>
                        {loc.usage}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
