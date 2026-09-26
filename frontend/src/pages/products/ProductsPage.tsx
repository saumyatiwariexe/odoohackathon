import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const fetchProducts = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get('http://localhost:8000/api/products', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const filteredProducts = products?.filter((p: any) => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      uom: formData.get('uom') as string,
      initial_stock: parseFloat(formData.get('initial_stock') as string) || 0,
    };
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/api/products', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product created successfully');
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create product');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="flex justify-between items-center" style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0, textTransform: 'uppercase', color: '#fff' }}>Product Master</h1>
          <p className="mono text-xs text-variant" style={{ marginTop: '4px' }}>MANAGE INVENTORY CATALOG & SKUs</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>NEW PRODUCT</span>
        </button>
      </header>

      <div style={{ backgroundColor: 'var(--card-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-default)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-variant)' }} />
            <input 
              type="text" 
              placeholder="Search by SKU or Name..." 
              className="form-input" 
              style={{ paddingLeft: '36px', width: '300px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem' }}>
            <Filter size={16} />
            <span>FILTER</span>
          </button>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr className="mono text-xs text-variant" style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>SKU</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>PRODUCT NAME</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>UOM</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>COST</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>REORDER MIN/MAX</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-variant)' }} className="mono text-sm">
                    LOADING CATALOG...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--error)' }} className="mono text-sm">
                    FAILED TO LOAD CATALOG
                  </td>
                </tr>
              ) : filteredProducts?.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-variant)' }} className="mono text-sm">
                    NO PRODUCTS FOUND
                  </td>
                </tr>
              ) : (
                filteredProducts?.map((p: any) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-default)', transition: 'background-color 0.2s' }} className="hover-row">
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-primary)' }} className="mono text-sm">{p.sku}</td>
                    <td style={{ padding: '12px 16px', color: '#fff' }}>{p.name}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-variant)' }} className="mono text-sm uppercase">{p.uom}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--success)' }} className="mono text-sm">{p.total_stock} in stock</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-variant)' }} className="mono text-sm">{p.reorder_min} / {p.reorder_max}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Product Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'var(--surface-container-high)', padding: '2rem', borderRadius: '12px', width: '400px', border: '1px solid var(--border-default)' }} className="animate-fade-in">
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#fff', fontSize: '18px' }}>Create New Product</h2>
            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input type="text" className="form-input" name="name" required />
              </div>
              <div className="form-group">
                <label className="form-label">SKU / Code</label>
                <input type="text" className="form-input mono" name="sku" required />
              </div>
              <div className="form-group">
                <label className="form-label">Unit of Measure</label>
                <input type="text" className="form-input" name="uom" defaultValue="pcs" required />
              </div>
              <div className="form-group">
                <label className="form-label">Initial Stock (Optional)</label>
                <input type="number" className="form-input mono" name="initial_stock" defaultValue="0" min="0" />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary flex-1" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary flex-1" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
