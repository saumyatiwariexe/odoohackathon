import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Search, AlertTriangle, ArrowUpDown, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  const location = useLocation();

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const { data: categoriesData } = useQuery({ 
    queryKey: ['categories'], 
    queryFn: async () => (await axios.get('http://localhost:8000/api/categories', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })).data 
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stockFilter, setStockFilter] = useState<'all' | 'low_stock'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'name'>('asc');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (location.state?.openModal) {
      setIsModalOpen(true);
    }
    if (location.state?.filter) {
      setStockFilter(location.state.filter);
    }
  }, [location.state]);

  // Compute counts
  const totalProductsCount = products?.length || 0;
  const lowOrOutStockCount = products?.filter((p: any) => {
    const stock = parseFloat(p.total_stock || 0);
    const min = parseFloat(p.reorder_min || 0);
    return stock === 0 || (stock <= min && min > 0);
  }).length || 0;

  // Filter products
  const processedProducts = products
    ?.filter((p: any) => {
      // 1. Search term
      const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // 2. Category filter
      if (selectedCategory !== 'all' && p.category_id !== selectedCategory) {
        return false;
      }

      // 3. Low/Out of stock filter
      if (stockFilter === 'low_stock') {
        const stock = parseFloat(p.total_stock || 0);
        const min = parseFloat(p.reorder_min || 0);
        return stock === 0 || (stock <= min && min > 0);
      }

      return true;
    })
    .sort((a: any, b: any) => {
      const stockA = parseFloat(a.total_stock || 0);
      const stockB = parseFloat(b.total_stock || 0);

      if (stockFilter === 'low_stock' || sortOrder === 'asc') {
        // Ascending stock order: lowest stock (0) first!
        return stockA - stockB;
      } else if (sortOrder === 'desc') {
        return stockB - stockA;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      category_id: formData.get('category_id') as string || null,
      uom: formData.get('uom') as string,
      cost_per_unit: parseFloat(formData.get('cost_per_unit') as string) || 0,
      reorder_min: parseFloat(formData.get('reorder_min') as string) || 0,
      reorder_max: parseFloat(formData.get('reorder_max') as string) || 0,
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

  const getStockBadge = (totalStock: number, reorderMin: number) => {
    if (totalStock === 0) {
      return (
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '4px',
          padding: '4px 10px', 
          borderRadius: '12px', 
          fontSize: '12px', 
          fontWeight: 600,
          backgroundColor: 'rgba(239, 68, 68, 0.15)', 
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          Out of Stock (0)
        </span>
      );
    } else if (totalStock <= reorderMin && reorderMin > 0) {
      return (
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '4px',
          padding: '4px 10px', 
          borderRadius: '12px', 
          fontSize: '12px', 
          fontWeight: 600,
          backgroundColor: 'rgba(245, 158, 11, 0.15)', 
          color: '#f59e0b',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        }}>
          Low Stock ({totalStock})
        </span>
      );
    } else {
      return (
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '4px',
          padding: '4px 10px', 
          borderRadius: '12px', 
          fontSize: '12px', 
          fontWeight: 600,
          backgroundColor: 'rgba(34, 197, 94, 0.15)', 
          color: '#22c55e',
          border: '1px solid rgba(34, 197, 94, 0.3)'
        }}>
          In Stock ({totalStock})
        </span>
      );
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="flex justify-between items-center" style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-default)', paddingBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0, textTransform: 'uppercase', color: '#fff' }}>Product Master</h1>
          <p className="mono text-xs text-variant" style={{ marginTop: '4px' }}>MANAGE INVENTORY CATALOG, SKUs & REORDER RULES</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>NEW PRODUCT</span>
        </button>
      </header>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setStockFilter('all')}
          style={{
            background: stockFilter === 'all' ? 'var(--interactive-surface, rgba(255,255,255,0.08))' : 'transparent',
            border: '1px solid',
            borderColor: stockFilter === 'all' ? 'var(--color-primary, #6366f1)' : 'var(--border-default)',
            color: stockFilter === 'all' ? '#fff' : 'var(--text-variant)',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          <Package size={16} />
          <span>ALL PRODUCTS ({totalProductsCount})</span>
        </button>
        <button 
          onClick={() => setStockFilter('low_stock')}
          style={{
            background: stockFilter === 'low_stock' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
            border: '1px solid',
            borderColor: stockFilter === 'low_stock' ? '#f59e0b' : 'var(--border-default)',
            color: stockFilter === 'low_stock' ? '#f59e0b' : 'var(--text-variant)',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          <AlertTriangle size={16} />
          <span>LOW / OUT OF STOCK ({lowOrOutStockCount})</span>
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--card-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-default)', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-variant)' }} />
            <input 
              type="text" 
              placeholder="Search by SKU, Name or Category..." 
              className="form-input" 
              style={{ paddingLeft: '36px', width: '100%' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select 
            className="form-input" 
            style={{ width: '200px' }} 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categoriesData?.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Sort Order */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpDown size={16} style={{ color: 'var(--text-variant)' }} />
            <select 
              className="form-input" 
              style={{ width: '180px' }} 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value as any)}
            >
              <option value="asc">Stock: Low to High (Asc)</option>
              <option value="desc">Stock: High to Low (Desc)</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr className="mono text-xs text-variant" style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>SKU</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>PRODUCT NAME</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>CATEGORY</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>UOM</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>UNIT COST</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>ON HAND STOCK</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>REORDER MIN/MAX</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-variant)' }} className="mono text-sm">
                    LOADING CATALOG...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--error)' }} className="mono text-sm">
                    FAILED TO LOAD CATALOG
                  </td>
                </tr>
              ) : processedProducts?.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-variant)' }} className="mono text-sm">
                    {stockFilter === 'low_stock' ? 'NO LOW OR OUT OF STOCK PRODUCTS FOUND' : 'NO PRODUCTS MATCH CRITERIA'}
                  </td>
                </tr>
              ) : (
                processedProducts?.map((p: any) => {
                  const totalStock = parseFloat(p.total_stock || 0);
                  const reorderMin = parseFloat(p.reorder_min || 0);
                  const reorderMax = parseFloat(p.reorder_max || 0);
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-default)', transition: 'background-color 0.2s' }} className="hover-row">
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-primary, #6366f1)' }} className="mono text-sm">{p.sku}</td>
                      <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 500 }}>{p.name}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-variant)' }}>{p.category_name || 'Uncategorized'}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-variant)' }} className="mono text-sm uppercase">{p.uom}</td>
                      <td style={{ padding: '12px 16px', color: '#fff' }} className="mono text-sm">
                        {p.cost_per_unit ? `$${parseFloat(p.cost_per_unit).toFixed(2)}` : 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }} className="mono text-sm">
                        {totalStock} {p.uom}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-variant)' }} className="mono text-sm">
                        {reorderMin} / {reorderMax}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {getStockBadge(totalStock, reorderMin)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Product Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--surface-container-high, #1e1e24)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-default)' }} className="animate-fade-in">
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#fff', fontSize: '18px' }}>Create New Product</h2>
            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input type="text" className="form-input" name="name" required placeholder="e.g. Wireless Mouse Pro" />
              </div>
              <div className="form-group">
                <label className="form-label">SKU / Code</label>
                <input type="text" className="form-input mono" name="sku" required placeholder="e.g. ELE-999" />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" name="category_id">
                  <option value="">No Category</option>
                  {categoriesData?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Unit of Measure</label>
                <input type="text" className="form-input" name="uom" defaultValue="pcs" required />
              </div>
              <div className="form-group">
                <label className="form-label">Cost Per Unit ($)</label>
                <input type="number" step="0.01" className="form-input mono" name="cost_per_unit" defaultValue="0.00" min="0" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Reorder Min</label>
                  <input type="number" className="form-input mono" name="reorder_min" defaultValue="5" min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Reorder Max</label>
                  <input type="number" className="form-input mono" name="reorder_max" defaultValue="20" min="0" />
                </div>
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
