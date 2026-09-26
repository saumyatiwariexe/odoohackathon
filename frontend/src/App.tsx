import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProductsPage from './pages/products/ProductsPage';
import OperationsPage from './pages/operations/OperationsPage';
import OperationDetailPage from './pages/operations/OperationDetailPage';
import AppLayout from './components/layout/AppLayout';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: 'var(--surface-container-high)',
            color: 'var(--on-surface)',
            border: '1px solid var(--border-default)',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px'
          }
        }} />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/operations" element={<OperationsPage />} />
            <Route path="/operations/:id" element={<OperationDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
