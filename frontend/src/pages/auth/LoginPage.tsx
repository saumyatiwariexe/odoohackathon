import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const signupSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const signupForm = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  const onLogin = async (data: LoginValues) => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/auth/login', data);
      localStorage.setItem('token', res.data.access_token);
      toast.success('System access granted');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const onSignup = async (data: SignupValues) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/auth/register', { ...data, role: 'manager' });
      toast.success('Operator registered — sign in to continue');
      setMode('login');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally { setLoading(false); }
  };

  const isLogin = mode === 'login';

  return (
    <div className="auth-container">
      {/* Left side - Auth Form */}
      <div className="auth-left">
        <div className="auth-card animate-fade-in">
          <div className="auth-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="var(--color-primary, #6366f1)" fillOpacity="0.2" stroke="var(--color-primary, #6366f1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="var(--color-primary, #6366f1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="22.08" x2="12" y2="12" stroke="var(--color-primary, #6366f1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 14L12 16.5L7 14" stroke="var(--color-primary, #6366f1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="auth-title">{isLogin ? 'Sign In' : 'Create Account'}</h1>
            <p className="auth-subtitle">
              {isLogin ? 'Welcome back! Please enter your details.' : 'Join StockSense to manage your inventory.'}
            </p>
          </div>

          {isLogin ? (
            /* LOGIN FORM */
            <form onSubmit={loginForm.handleSubmit(onLogin)}>
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="name@company.com"
                    className={`form-input ${loginForm.formState.errors.email ? 'error' : ''}`}
                    {...loginForm.register('email')}
                  />
                </div>
                {loginForm.formState.errors.email && <span className="form-error">{loginForm.formState.errors.email.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-password">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className={`form-input ${loginForm.formState.errors.password ? 'error' : ''}`}
                    {...loginForm.register('password')}
                  />
                </div>
                {loginForm.formState.errors.password && <span className="form-error">{loginForm.formState.errors.password.message}</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                <a href="/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
              </button>
            </form>
          ) : (
            /* SIGNUP FORM */
            <form onSubmit={signupForm.handleSubmit(onSignup)}>
              <div className="form-group">
                <label className="form-label" htmlFor="full_name">Full Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    id="full_name"
                    type="text"
                    placeholder="John Doe"
                    className={`form-input ${signupForm.formState.errors.full_name ? 'error' : ''}`}
                    {...signupForm.register('full_name')}
                  />
                </div>
                {signupForm.formState.errors.full_name && <span className="form-error">{signupForm.formState.errors.full_name.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-email">Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="name@company.com"
                    className={`form-input ${signupForm.formState.errors.email ? 'error' : ''}`}
                    {...signupForm.register('email')}
                  />
                </div>
                {signupForm.formState.errors.email && <span className="form-error">{signupForm.formState.errors.email.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-password">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    className={`form-input ${signupForm.formState.errors.password ? 'error' : ''}`}
                    {...signupForm.register('password')}
                  />
                </div>
                {signupForm.formState.errors.password && <span className="form-error">{signupForm.formState.errors.password.message}</span>}
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign Up'}
              </button>
            </form>
          )}

          <div className="auth-footer">
            {isLogin ? (
              <>Don't have an account? <button type="button" onClick={() => setMode('signup')} style={{ color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Sign up</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => setMode('login')} style={{ color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
