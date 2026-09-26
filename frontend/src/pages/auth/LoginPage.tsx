import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const signupSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors: loginErrors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const { register: registerSignup, handleSubmit: handleSubmitSignup, formState: { errors: signupErrors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/auth/login', data);
      localStorage.setItem('token', res.data.access_token);
      toast.success('System accessed successfully');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const payload = { ...data, role: 'manager' };
      await axios.post('http://localhost:8000/api/auth/register', payload);
      toast.success('Terminal operator registered');
      setIsLogin(true);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <header className="auth-header">
        <div className="flex items-center gap-sm">
          <span className="mono text-sm uppercase" style={{ fontWeight: 'bold' }}>STOCKSENSE</span>
          <span className="mono text-xs text-variant">// SYS.AUTH</span>
        </div>
        <div className="flex items-center gap-sm mono text-xs text-variant">
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>lock</span>
          <span>TLS 1.3 / E2EE</span>
        </div>
      </header>

      <main className="auth-main">
        <div className="auth-card">
          <div>
            <div className="flex justify-between" style={{ marginBottom: '8px' }}>
              <span className="mono text-xs text-variant">[ {isLogin ? 'AUTH SESSION' : 'PROVISIONING SESSION'}: #8920-INIT ]</span>
              <span className="mono text-xs uppercase" style={{ color: 'var(--success)' }}>STATUS: ONLINE</span>
            </div>
            <h1 className="auth-title">{isLogin ? 'Terminal Authentication' : 'Register Terminal Operator'}</h1>
            <p className="auth-subtitle">
              {isLogin ? 'Provide operator credentials to access the logistics platform.' : 'Create authorized warehouse credentials and assign security clearance.'}
            </p>
          </div>

          {isLogin ? (
            <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={handleSubmitLogin(onLoginSubmit)}>
              <div className="form-group">
                <label className="form-label">
                  <span>Operator Email</span>
                  <span className="text-variant">SSO FEDERATED</span>
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="operator@stocksense.internal"
                  {...registerLogin('email')}
                />
                {loginErrors.email && <span className="form-error">{loginErrors.email.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Access Key</span>
                </label>
                <input
                  type="password"
                  className="form-input mono"
                  placeholder="••••••••••••"
                  {...registerLogin('password')}
                />
                {loginErrors.password && <span className="form-error">{loginErrors.password.message}</span>}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isLoading}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    {isLoading ? 'refresh' : 'login'}
                  </span>
                  {isLoading ? 'AUTHENTICATING...' : 'ACCESS TERMINAL'}
                </button>
              </div>
            </form>
          ) : (
            <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={handleSubmitSignup(onSignupSubmit)}>
              <div className="form-group">
                <label className="form-label">
                  <span>Operator Full Name</span>
                  <span className="text-variant">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Vance"
                  {...registerSignup('full_name')}
                />
                {signupErrors.full_name && <span className="form-error">{signupErrors.full_name.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Work Email Address</span>
                  <span className="text-variant">SSO FEDERATED</span>
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="a.vance@stocksense.internal"
                  {...registerSignup('email')}
                />
                {signupErrors.email && <span className="form-error">{signupErrors.email.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Master Access Key</span>
                </label>
                <input
                  type="password"
                  className="form-input mono"
                  placeholder="••••••••••••"
                  {...registerSignup('password')}
                />
                {signupErrors.password && <span className="form-error">{signupErrors.password.message}</span>}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isLoading}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    {isLoading ? 'refresh' : 'arrow_forward'}
                  </span>
                  {isLoading ? 'COMMITTING...' : 'COMPLETE REGISTRATION'}
                </button>
                <button type="button" className="btn-secondary" style={{ padding: '0 20px' }} onClick={() => setIsLogin(true)}>
                  CANCEL
                </button>
              </div>
            </form>
          )}

          <div className="mono text-xs flex justify-between" style={{ borderTop: '1px solid var(--border-default)', paddingTop: '16px' }}>
            <span className="text-variant">{isLogin ? 'NEW OPERATOR?' : 'EXISTING CREDENTIALS?'}</span>
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)} 
              style={{ background: 'none', border: 'none', color: 'var(--on-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {isLogin ? 'REQUEST PROVISIONING' : 'SIGN IN TO TERMINAL'} 
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_right_alt</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
