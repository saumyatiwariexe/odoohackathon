import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, KeyRound, Loader2, PackageSearch, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const resetSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter')
    .regex(/[0-9]/, 'Must contain at least 1 number')
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormValues) => {
    setIsLoading(true);
    try {
      await axios.post('http://localhost:8000/api/auth/reset-password', data);
      toast.success('Password successfully reset!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-card animate-fade-in">
          <div className="auth-header">
            <h1 className="auth-title">Complete Reset</h1>
            <p className="auth-subtitle">
              Enter your email, the OTP we sent you, and your new password.
            </p>
          </div>

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
            
            <div className="form-group">
              <label className="form-label" htmlFor="otp">6-Digit OTP</label>
              <div className="input-wrapper">
                <KeyRound className="input-icon" size={18} />
                <input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  className={`form-input ${errors.otp ? 'error' : ''}`}
                  {...register('otp')}
                />
              </div>
              {errors.otp && <span className="form-error">{errors.otp.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new_password">New Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  id="new_password"
                  type="password"
                  placeholder="••••••••"
                  className={`form-input ${errors.new_password ? 'error' : ''}`}
                  {...register('new_password')}
                />
              </div>
              {errors.new_password && <span className="form-error">{errors.new_password.message}</span>}
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Reset Password'}
            </button>
          </form>

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
