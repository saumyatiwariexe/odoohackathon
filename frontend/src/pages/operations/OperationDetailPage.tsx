import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Printer } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function OperationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [doneQtys, setDoneQtys] = useState<Record<string, number>>({});

  const { data: op, isLoading, isError } = useQuery({
    queryKey: ['operation', id],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8000/api/operations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
  });

  // Initialize done_qty inputs when data loads
  useEffect(() => {
    if (op?.lines && op.status === 'draft') {
      const initialQtys: Record<string, number> = {};
      op.lines.forEach((line: any) => {
        initialQtys[line.product_id] = line.expected_qty; // default to expected
      });
      setDoneQtys(initialQtys);
    }
  }, [op]);

  const validateMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      const payload = {
        lines: Object.entries(doneQtys).map(([product_id, done_qty]) => ({
          product_id,
          done_qty: Number(done_qty)
        }))
      };
      const res = await axios.post(`http://localhost:8000/api/operations/${id}/validate`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Operation validated successfully!');
      queryClient.invalidateQueries({ queryKey: ['operation', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardKPIs'] });
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Validation failed');
    }
  });

  if (isLoading) return <div className="p-8 mono text-variant">LOADING OPERATION DETAILS...</div>;
  if (isError) return <div className="p-8 mono text-error">FAILED TO LOAD OPERATION</div>;

  const isDone = op.status === 'done';

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => navigate('/operations')}
          style={{ background: 'none', border: 'none', color: 'var(--text-variant)', cursor: 'pointer', display: 'flex' }}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0, color: '#fff', textTransform: 'uppercase' }}>
              {op.reference}
            </h1>
            <span className="mono text-xs uppercase" style={{ 
              color: isDone ? 'var(--success)' : 'var(--warning)', 
              border: `1px solid ${isDone ? 'var(--success)' : 'var(--warning)'}`,
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.05)'
            }}>
              {op.status}
            </span>
          </div>
          <p className="mono text-xs text-variant" style={{ marginTop: '4px' }}>
            {op.move_type.toUpperCase()} // FROM: {op.source_location} ➔ TO: {op.dest_location}
          </p>
        </div>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={16} /> PRINT
          </button>
          {!isDone && (
            <button 
              className="btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => validateMutation.mutate()}
              disabled={validateMutation.isPending}
            >
              <CheckCircle2 size={16} /> 
              {validateMutation.isPending ? 'VALIDATING...' : 'VALIDATE'}
            </button>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--card-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          <div>
            <label className="mono text-xs text-variant block" style={{ marginBottom: '4px' }}>Contact / Vendor</label>
            <div style={{ color: '#fff', fontSize: '14px' }}>{op.contact || 'N/A'}</div>
          </div>
          <div>
            <label className="mono text-xs text-variant block" style={{ marginBottom: '4px' }}>Scheduled Date</label>
            <div style={{ color: '#fff', fontSize: '14px' }}>{op.scheduled_date ? new Date(op.scheduled_date).toLocaleString() : 'N/A'}</div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--card-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-default)' }}>
          <h2 className="mono text-sm" style={{ margin: 0, color: 'var(--text-variant)' }}>OPERATIONS LINES</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr className="mono text-xs text-variant" style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>PRODUCT</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>DEMAND (EXPECTED)</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>DONE QTY</th>
              </tr>
            </thead>
            <tbody>
              {op.lines?.map((line: any) => (
                <tr key={line.id} style={{ borderBottom: '1px solid var(--border-default)' }} className="hover-row">
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ color: '#fff' }}>{line.product_name}</div>
                    <div className="mono text-xs text-variant">{line.sku}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-variant)' }} className="mono text-sm">
                    {line.expected_qty}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {isDone ? (
                      <span className="mono text-sm" style={{ color: 'var(--success)' }}>{line.done_qty}</span>
                    ) : (
                      <input 
                        type="number"
                        className="form-input mono"
                        style={{ width: '100px', padding: '4px 8px' }}
                        value={doneQtys[line.product_id] !== undefined ? doneQtys[line.product_id] : ''}
                        onChange={(e) => setDoneQtys({ ...doneQtys, [line.product_id]: e.target.valueAsNumber })}
                        min={0}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
