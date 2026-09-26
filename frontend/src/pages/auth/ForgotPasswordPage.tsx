import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Loader2, PackageSearch, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setIsLoading(true);
    try {
      await axios.post('http://localhost:8000/api/auth/forgot-password', data);
      setIsSent(true);
      toast.success('Reset link sent if email exists!');
    } catch (err: any) {
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-card animate-fade-in">
          <div className="auth-header">
            <h1 className="auth-title">Reset Password</h1>
            <p className="auth-subtitle">
              {isSent 
                ? 'Check your email for the OTP.'
                : 'Enter your email to receive an OTP.'}
            </p>
          </div>

          {!isSent ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    {...register('email')}
                  />
                </div>
                {errors.email && <span className="form-error">{errors.email.message}</span>}
              </div>

              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Send OTP'}
              </button>
            </form>
          ) : (
             <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Link to="/reset-password" style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'inline-block', marginBottom: '1rem', textDecoration: 'none' }}>
                    Enter OTP to Reset Password →
                </Link>
             </div>
          )}

          <div className="auth-footer" style={{ marginTop: '2rem' }}>
             <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                <ArrowLeft size={16} /> Back to log in
             </Link>
          </div>
        </div>
      </div>
      
      <div className="auth-right">
        <div style={{ position: 'relative', zIndex: 10 }}>
          <PackageSearch size={80} color="#F1F3F9" style={{ marginBottom: '2rem' }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
            StockSense
          </h2>
          <p style={{ color: '#EEF1FE', fontSize: '1.125rem', opacity: 0.9, maxWidth: '400px' }}>
            The smart, real-time inventory management system built for speed and precision.
          </p>
        </div>
      </div>
    </div>
  );
}
