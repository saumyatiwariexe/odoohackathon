import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, Loader2, PackageSearch } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // Pointing to local backend
      const res = await axios.post('http://localhost:3000/api/auth/login', data);
      toast.success('Welcome back to StockSense!');
      console.log('Login success:', res.data);
      // NOTE: Here you would normally set user state and redirect
      // window.location.href = '/dashboard';
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left side - Login Form */}
      <div className="auth-left">
        <div className="auth-card animate-fade-in">
          <div className="auth-header">
            <h1 className="auth-title">Sign In</h1>
            <p className="auth-subtitle">Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email
              </label>
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
              {errors.email && (
                <span className="form-error">{errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <span className="form-error">{errors.password.message}</span>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account? <a href="#">Sign up</a>
          </div>
        </div>
      </div>

      {/* Right side - Branding / Graphic (Hidden on mobile) */}
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
