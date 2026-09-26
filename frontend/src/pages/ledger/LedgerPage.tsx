import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';

const fetchLedger = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get('http://localhost:3000/api/ledger', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export default function LedgerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: ledger, isLoading } = useQuery({ 
    queryKey: ['ledger'], 
    queryFn: fetchLedger 
  });

  const filteredLedger = ledger?.filter((entry: any) => 
    entry.operation_ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <header className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 500, margin: 0, color: '#e5e7eb', fontFamily: 'system-ui' }}>Move History</h1>
          <p className="mono text-xs text-variant" style={{ marginTop: '4px' }}>COMPREHENSIVE LEDGER OF ALL INVENTORY MOVEMENTS</p>
        </div>
        <div>
           <input 
              type="text" 
              placeholder="Search reference or product..." 
              className="form-input" 
              style={{ width: '250px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </header>

      <div style={{ backgroundColor: 'var(--card-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr className="mono text-xs text-variant" style={{ borderBottom: '1px solid var(--border-default)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>DATE</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>REFERENCE</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>PRODUCT</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>LOCATION</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>DELTA</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>BALANCE</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-variant)' }} className="mono text-sm">LOADING HISTORY...</td>
                </tr>
              ) : filteredLedger?.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-variant)' }} className="mono text-sm">NO MOVEMENTS FOUND</td>
                </tr>
              ) : (
                filteredLedger?.map((entry: any) => {
                  const isPositive = entry.quantity_delta > 0;
                  const deltaColor = isPositive ? 'var(--success)' : 'var(--danger)';
                  return (
                    <tr key={entry.id} style={{ borderBottom: '1px solid var(--border-default)' }} className="hover-row">
                      <td style={{ padding: '12px 16px', color: 'var(--text-variant)' }} className="mono text-sm">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-primary)' }} className="mono text-sm">
                        {entry.operation_ref}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#fff' }} className="text-sm">
                        {entry.product_name}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-variant)' }} className="text-sm">
                        {entry.location}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: deltaColor }} className="mono text-sm">
                        {isPositive ? '+' : ''}{entry.quantity_delta}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#fff' }} className="mono text-sm">
                        {entry.balance_after}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
