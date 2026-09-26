import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, ArrowRightLeft, ArrowDownToLine, ArrowUpFromLine, Settings2, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const fetchOperations = async (type: string) => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`http://localhost:8000/api/operations?move_type=${type}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export default function OperationsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'receipt');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOp, setNewOp] = useState({
    source_location_id: '',
    dest_location_id: '',
    contact: '',
    notes: '',
    lines: [{ product_id: '', expected_qty: 1 }]
  });

  const { data: locationsData } = useQuery({ queryKey: ['locations'], queryFn: async () => (await axios.get('http://localhost:8000/api/locations', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })).data });
  const { data: productsData } = useQuery({ queryKey: ['products'], queryFn: async () => (await axios.get('http://localhost:8000/api/products', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })).data });

  const createOpMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      const payload = { ...newOp, move_type: activeTab };
      await axios.post('http://localhost:8000/api/operations', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      toast.success('Operation created successfully');
      setIsModalOpen(false);
      setNewOp({ source_location_id: '', dest_location_id: '', contact: '', notes: '', lines: [{ product_id: '', expected_qty: 1 }] });
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to create operation');
    }
  });

  // Update tab if location state changes
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);

  const { data: operations, isLoading } = useQuery({
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
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsModalOpen(true)}>
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
      {/* New Operation Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--surface-container-high)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-default)' }} className="animate-fade-in">
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#fff', fontSize: '18px', textTransform: 'uppercase' }}>Create {activeTab}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Source Location</label>
                <select className="form-input" value={newOp.source_location_id} onChange={e => setNewOp({...newOp, source_location_id: e.target.value})}>
                  <option value="">Select...</option>
                  {locationsData?.map((l:any) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Destination Location</label>
                <select className="form-input" value={newOp.dest_location_id} onChange={e => setNewOp({...newOp, dest_location_id: e.target.value})}>
                  <option value="">Select...</option>
                  {locationsData?.map((l:any) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
                <label className="form-label">Contact / Vendor</label>
                <input type="text" className="form-input" value={newOp.contact} onChange={e => setNewOp({...newOp, contact: e.target.value})} />
            </div>

            <div style={{ marginTop: '1.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="form-label" style={{ margin: 0 }}>Lines</h3>
              <button type="button" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => setNewOp({...newOp, lines: [...newOp.lines, {product_id: '', expected_qty: 1}]})}>+ Add Line</button>
            </div>

            {newOp.lines.map((line, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                  <label className="form-label">Product</label>
                  <select className="form-input" value={line.product_id} onChange={e => {
                    const newLines = [...newOp.lines];
                    newLines[idx].product_id = e.target.value;
                    setNewOp({...newOp, lines: newLines});
                  }}>
                    <option value="">Select...</option>
                    {productsData?.map((p:any) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Qty</label>
                  <input type="number" className="form-input mono" min="1" value={line.expected_qty} onChange={e => {
                    const newLines = [...newOp.lines];
                    newLines[idx].expected_qty = parseFloat(e.target.value) || 0;
                    setNewOp({...newOp, lines: newLines});
                  }} />
                </div>
                <button type="button" className="btn-secondary" style={{ padding: '10px' }} onClick={() => {
                  const newLines = newOp.lines.filter((_, i) => i !== idx);
                  setNewOp({...newOp, lines: newLines});
                }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="button" className="btn-secondary flex-1" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="button" className="btn-primary flex-1" onClick={() => createOpMutation.mutate()} disabled={createOpMutation.isPending || newOp.lines.length === 0 || !newOp.source_location_id || !newOp.dest_location_id}>
                {createOpMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
