import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Filter } from 'lucide-react';

const fetchKPIs = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get('http://localhost:3000/api/dashboard/kpis', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

const fetchRecentActivity = async (filters: any) => {
  const token = localStorage.getItem('token');
  let url = 'http://localhost:3000/api/operations?';
  if (filters.type && filters.type !== 'all') url += `move_type=${filters.type}&`;
  if (filters.status && filters.status !== 'all') url += `status=${filters.status}&`;
  if (filters.location_id && filters.location_id !== 'all') url += `location_id=${filters.location_id}&`;
  if (filters.category_id && filters.category_id !== 'all') url += `category_id=${filters.category_id}&`;
  
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

const fetchLocations = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get('http://localhost:3000/api/locations', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

const fetchCategories = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get('http://localhost:3000/api/categories', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ type: 'all', status: 'all', location_id: 'all', category_id: 'all' });

  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: fetchLocations });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboardKPIs'],
    queryFn: fetchKPIs,
    refetchInterval: 60000,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['recentActivity', filters],
    queryFn: () => fetchRecentActivity(filters),
    refetchInterval: 60000,
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'done': return 'var(--success)';
      case 'draft': return 'var(--text-variant)';
      case 'ready': return 'var(--warning)';
      default: return '#fff';
    }
  };

  return (
    <div>
      <header className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 500, margin: 0, color: '#e5e7eb', fontFamily: 'system-ui' }}>Dashboard</h1>
          <p className="mono text-xs text-variant" style={{ marginTop: '4px' }}>LIVE SNAPSHOT OF INVENTORY OPERATIONS</p>
        </div>
      </header>

      {kpisLoading ? (
        <div className="mono text-sm text-variant" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>refresh</span>
          LOADING TELEMETRY...
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="kpi-card">
              <span className="kpi-title mono uppercase">Total Products</span>
              <span className="kpi-value">{kpis?.total_products || 0}</span>
            </div>
            <div className="kpi-card" style={{ borderColor: 'rgba(245, 158, 11, 0.4)', backgroundColor: 'rgba(245, 158, 11, 0.05)' }}>
              <span className="kpi-title mono uppercase" style={{ color: 'var(--warning)' }}>Low / Out of Stock</span>
              <span className="kpi-value" style={{ color: 'var(--warning)' }}>{(kpis?.low_stock || 0) + (kpis?.out_of_stock || 0)}</span>
            </div>
            <div className="kpi-card" style={{ borderColor: 'rgba(59, 130, 246, 0.4)', backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
              <span className="kpi-title mono uppercase" style={{ color: '#3b82f6' }}>Pending Receipts</span>
              <span className="kpi-value" style={{ color: '#3b82f6' }}>{kpis?.receipts?.to_receive || 0}</span>
            </div>
            <div className="kpi-card" style={{ borderColor: 'rgba(168, 85, 247, 0.4)', backgroundColor: 'rgba(168, 85, 247, 0.05)' }}>
              <span className="kpi-title mono uppercase" style={{ color: '#a855f7' }}>Pending Deliveries</span>
              <span className="kpi-value" style={{ color: '#a855f7' }}>{kpis?.deliveries?.to_deliver || 0}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-title mono uppercase">Scheduled Transfers</span>
              <span className="kpi-value" style={{ color: 'var(--text-variant)' }}>{kpis?.scheduled_transfers || 0}</span>
            </div>
          </div>

          {/* Dynamic Filters & Activity Feed */}
          <div style={{ backgroundColor: 'var(--card-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', overflow: 'hidden' }}>
            
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-default)', display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <Filter size={18} color="var(--text-variant)" />
              <span className="mono text-sm" style={{ fontWeight: 600, color: 'var(--text-variant)' }}>DYNAMIC FILTERS:</span>
              
              <select className="form-input" style={{ width: '180px', padding: '6px 12px' }} value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
                <option value="all">All Document Types</option>
                <option value="receipt">Receipts</option>
                <option value="delivery">Deliveries</option>
                <option value="internal">Internal Transfers</option>
                <option value="adjustment">Adjustments</option>
              </select>

              <select className="form-input" style={{ width: '180px', padding: '6px 12px' }} value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="waiting">Waiting</option>
                <option value="ready">Ready</option>
                <option value="done">Done</option>
                <option value="canceled">Canceled</option>
              </select>

              <select className="form-input" style={{ width: '180px', padding: '6px 12px' }} value={filters.location_id} onChange={e => setFilters({...filters, location_id: e.target.value})}>
                <option value="all">All Locations</option>
                {locations?.map((loc: any) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>

              <select className="form-input" style={{ width: '180px', padding: '6px 12px' }} value={filters.category_id} onChange={e => setFilters({...filters, category_id: e.target.value})}>
                <option value="all">All Categories</option>
                {categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr className="mono text-xs text-variant" style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>REFERENCE</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>TYPE</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>SOURCE ➔ DEST</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {activitiesLoading ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-variant)' }} className="mono text-sm">LOADING ACTIVITY...</td>
                    </tr>
                  ) : activities?.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-variant)' }} className="mono text-sm">NO ACTIVITY FOUND</td>
                    </tr>
                  ) : (
                    activities?.slice(0, 10).map((op: any) => (
                      <tr key={op.id} style={{ borderBottom: '1px solid var(--border-default)', cursor: 'pointer' }} className="hover-row" onClick={() => navigate(`/operations/${op.id}`)}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-primary)' }} className="mono text-sm">{op.reference}</td>
                        <td style={{ padding: '12px 16px', color: '#fff' }} className="mono text-sm uppercase">{op.move_type}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-variant)' }} className="mono text-sm uppercase">{op.source_location} ➔ {op.dest_location}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className="mono text-xs uppercase" style={{ color: getStatusColor(op.status), border: `1px solid ${getStatusColor(op.status)}`, padding: '2px 8px', borderRadius: '12px' }}>
                            {op.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
