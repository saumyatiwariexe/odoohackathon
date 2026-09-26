import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, ArrowRightLeft, ArrowDownToLine, ArrowUpFromLine, Settings2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const fetchOperations = async (type: string) => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`http://localhost:3000/api/operations?move_type=${type}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export default function OperationsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('receipt');

  const { data: operations, isLoading, refetch } = useQuery({
    queryKey: ['operations', activeTab],
    queryFn: () => fetchOperations(activeTab),
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
    <div className="animate-fade-in">
      <header className="flex justify-between items-center" style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0, textTransform: 'uppercase', color: '#fff' }}>Operations Hub</h1>
          <p className="mono text-xs text-variant" style={{ marginTop: '4px' }}>MANAGE RECEIPTS, DELIVERIES & TRANSFERS</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} />
          <span>NEW {activeTab.toUpperCase()}</span>
        </button>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setActiveTab('receipt')}
          style={{
            background: activeTab === 'receipt' ? 'var(--interactive-surface)' : 'transparent',
            border: '1px solid',
            borderColor: activeTab === 'receipt' ? 'var(--color-primary)' : 'var(--border-default)',
            color: activeTab === 'receipt' ? 'var(--color-primary)' : 'var(--text-variant)',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          <ArrowDownToLine size={18} />
          RECEIPTS
        </button>
        <button 
          onClick={() => setActiveTab('delivery')}
          style={{
            background: activeTab === 'delivery' ? 'var(--interactive-surface)' : 'transparent',
            border: '1px solid',
            borderColor: activeTab === 'delivery' ? 'var(--color-primary)' : 'var(--border-default)',
            color: activeTab === 'delivery' ? 'var(--color-primary)' : 'var(--text-variant)',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          <ArrowUpFromLine size={18} />
          DELIVERIES
        </button>
        <button 
          onClick={() => setActiveTab('internal')}
          style={{
            background: activeTab === 'internal' ? 'var(--interactive-surface)' : 'transparent',
            border: '1px solid',
            borderColor: activeTab === 'internal' ? 'var(--color-primary)' : 'var(--border-default)',
            color: activeTab === 'internal' ? 'var(--color-primary)' : 'var(--text-variant)',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          <ArrowRightLeft size={18} />
          INTERNAL TRANSFERS
        </button>
        <button 
          onClick={() => setActiveTab('adjustment')}
          style={{
            background: activeTab === 'adjustment' ? 'var(--interactive-surface)' : 'transparent',
            border: '1px solid',
            borderColor: activeTab === 'adjustment' ? 'var(--color-primary)' : 'var(--border-default)',
            color: activeTab === 'adjustment' ? 'var(--color-primary)' : 'var(--text-variant)',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          <Settings2 size={18} />
          ADJUSTMENTS
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--card-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', overflow: 'hidden' }}>
        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr className="mono text-xs text-variant" style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>REFERENCE</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>CONTACT / VENDOR</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>SOURCE LOC</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>DEST LOC</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-variant)' }} className="mono text-sm">
                    LOADING OPERATIONS...
                  </td>
                </tr>
              ) : operations?.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-variant)' }} className="mono text-sm">
                    NO {activeTab.toUpperCase()}S FOUND
                  </td>
                </tr>
              ) : (
                operations?.map((op: any) => (
                  <tr key={op.id} style={{ borderBottom: '1px solid var(--border-default)', transition: 'background-color 0.2s' }} className="hover-row">
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-primary)' }} className="mono text-sm">{op.reference}</td>
                    <td style={{ padding: '12px 16px', color: '#fff' }}>{op.contact || '-'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-variant)' }} className="mono text-sm uppercase">{op.source_location}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-variant)' }} className="mono text-sm uppercase">{op.dest_location}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="mono text-xs uppercase" style={{ 
                        color: getStatusColor(op.status), 
                        border: `1px solid ${getStatusColor(op.status)}`,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255,255,255,0.05)'
                      }}>
                        {op.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => navigate(`/operations/${op.id}`)}>
                        VIEW
                      </button>
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
