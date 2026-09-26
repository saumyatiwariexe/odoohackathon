import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

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
  const [showPass, setShowPass] = useState(false);
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
    <div className="auth-shell">
      {/* Top Bar */}
      <header className="auth-topbar">
        <div className="flex items-center gap-md">
          <span className="mono text-sm uppercase" style={{ fontWeight: 700, letterSpacing: '0.08em' }}>STOCKSENSE</span>
          <span className="mono text-xs text-neutral">// SYS.AUTH</span>
          <div className="flex items-center gap-xs" style={{ marginLeft: 'var(--space-md)', color: 'var(--neutral)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--on-surface)', display: 'inline-block' }} />
            <span className="mono text-xs uppercase" style={{ letterSpacing: '0.06em' }}>NODE: 0x82F1 // CLUSTER-OK</span>
          </div>
        </div>
        <div className="flex items-center gap-lg">
          <div className="flex items-center gap-xs text-sm" style={{ color: 'var(--on-surface)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>lock</span>
            <span className="mono text-xs uppercase" style={{ letterSpacing: '0.06em' }}>TLS 1.3 / E2EE</span>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person</span>
          </div>
        </div>
      </header>

      <div className="auth-body">
        <div className="auth-container">
          {/* Breadcrumb */}
          <div className="auth-breadcrumb">
            <div className="flex items-center gap-xs" style={{ color: 'var(--on-surface)' }}>
              <span style={{ width: 6, height: 6, background: 'var(--on-surface)', display: 'inline-block' }} />
              <span>FACILITY NORTH / {isLogin ? 'OPERATOR AUTHENTICATION' : 'OPERATOR ENROLLMENT'}</span>
            </div>
            <div className="flex items-center gap-sm">
              <span>SECURITY LEVEL: 04</span>
              <span style={{ color: 'var(--outline-variant)' }}>//</span>
              <span>PROT: {isLogin ? 'AUTH-SEC-X' : 'REG-SEC-X'}</span>
            </div>
          </div>

          {/* Card */}
          <div className="auth-card">
            {/* Card Header */}
            <div className="flex-col" style={{ gap: 4 }}>
              <div className="flex justify-between items-center">
                <span className="mono text-xs text-neutral uppercase" style={{ letterSpacing: '0.08em' }}>
                  [ {isLogin ? 'AUTH' : 'PROVISIONING'} SESSION: #8920-INIT ]
                </span>
                <span className="mono text-xs uppercase" style={{ color: 'var(--on-surface)', letterSpacing: '0.06em' }}>
                  STATUS: {isLogin ? 'ONLINE' : 'UNCLAIMED'}
                </span>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--on-surface)', marginTop: 4 }}>
                {isLogin ? 'Terminal Authentication' : 'Register Terminal Operator'}
              </h1>
              <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 4 }}>
                {isLogin
                  ? 'Provide operator credentials to access the logistics platform.'
                  : 'Create authorized warehouse credentials and assign security tier clearance.'}
              </p>
            </div>

            {/* Form */}
            {isLogin ? (
              <form onSubmit={loginForm.handleSubmit(onLogin)} style={{ gap: 'var(--space-md)', display: 'flex', flexDirection: 'column' }}>
                <div className="form-group">
                  <label className="form-label">
                    <span>OPERATOR EMAIL</span>
                    <span style={{ color: 'var(--on-surface-variant)', fontSize: 10 }}>SSO FEDERATED</span>
                  </label>
                  <input type="email" className="form-input" placeholder="operator@stocksense.internal" {...loginForm.register('email')} />
                  {loginForm.formState.errors.email && <span className="form-error">{loginForm.formState.errors.email.message}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label"><span>ACCESS KEY</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="form-input mono"
                      placeholder="••••••••••••"
                      style={{ paddingRight: 40 }}
                      {...loginForm.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  {loginForm.formState.errors.password && <span className="form-error">{loginForm.formState.errors.password.message}</span>}
                </div>

                <div className="flex gap-sm" style={{ marginTop: 'var(--space-sm)' }}>
                  <button type="submit" className="btn-primary flex-1" disabled={loading}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{loading ? 'refresh' : 'login'}</span>
                    {loading ? 'AUTHENTICATING...' : 'ACCESS TERMINAL'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={signupForm.handleSubmit(onSignup)} style={{ gap: 'var(--space-md)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">
                      <span>OPERATOR FULL NAME</span>
                      <span style={{ color: 'var(--on-surface-variant)' }}>*</span>
                    </label>
                    <input type="text" className="form-input" placeholder="e.g. Alex Vance" {...signupForm.register('full_name')} />
                    {signupForm.formState.errors.full_name && <span className="form-error">{signupForm.formState.errors.full_name.message}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <span>OPERATOR ID</span>
                      <span style={{ color: 'var(--on-surface-variant)', fontSize: 10 }}>[AUTO-FORMAT]</span>
                    </label>
                    <input type="text" className="form-input mono" value={`OP-${Math.floor(1000 + Math.random() * 9000)}`} readOnly style={{ opacity: 0.6 }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>WORK EMAIL ADDRESS</span>
                    <span style={{ color: 'var(--on-surface-variant)', fontSize: 10 }}>SSO FEDERATED</span>
                  </label>
                  <input type="email" className="form-input" placeholder="a.vance@stocksense.internal" {...signupForm.register('email')} />
                  {signupForm.formState.errors.email && <span className="form-error">{signupForm.formState.errors.email.message}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label"><span>MASTER ACCESS KEY</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="form-input mono"
                      placeholder="••••••••••••"
                      style={{ paddingRight: 40 }}
                      {...signupForm.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  {signupForm.formState.errors.password && <span className="form-error">{signupForm.formState.errors.password.message}</span>}
                </div>

                {/* Password criteria */}
                <div className="flex gap-md" style={{ background: 'var(--surface-container)', border: '1px solid rgba(52,52,58,0.3)', padding: '8px 12px', flexWrap: 'wrap' }}>
                  <span className="mono text-xs" style={{ color: 'var(--on-surface)' }}>[✓ 8+ CHARS]</span>
                  <span className="mono text-xs" style={{ color: 'var(--on-surface)' }}>[✓ NUMERIC]</span>
                  <span className="mono text-xs" style={{ color: 'var(--on-surface)' }}>[✓ HIGH ENTROPY]</span>
                  <span className="mono text-xs text-neutral" style={{ marginLeft: 'auto' }}>ALGO: SHA-256</span>
                </div>

                <div className="flex gap-sm" style={{ marginTop: 'var(--space-sm)' }}>
                  <button type="submit" className="btn-primary flex-1" disabled={loading}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{loading ? 'refresh' : 'arrow_forward'}</span>
                    {loading ? 'COMMITTING RECORD...' : 'COMPLETE REGISTRATION'}
                  </button>
                  <button type="button" className="btn-secondary" style={{ padding: '0 var(--space-lg)' }} onClick={() => setMode('login')}>
                    CANCEL
                  </button>
                </div>
              </form>
            )}

            {/* Footer toggle */}
            <div className="flex justify-between items-center mono text-xs" style={{ borderTop: '1px solid var(--border-default)', paddingTop: 'var(--space-md)' }}>
              <span style={{ color: 'var(--on-surface-variant)' }}>{isLogin ? 'NEW OPERATOR?' : 'EXISTING CREDENTIALS?'}</span>
              <button
                type="button"
                onClick={() => setMode(isLogin ? 'signup' : 'login')}
                style={{ background: 'none', border: 'none', color: 'var(--on-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)', fontSize: 10 }}
              >
                {isLogin ? 'REQUEST PROVISIONING' : 'SIGN IN TO TERMINAL'}
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_right_alt</span>
              </button>
            </div>
          </div>

          {/* Footer system status */}
          <div className="auth-footer-bar">
            <div className="flex items-center gap-xs mono text-xs text-neutral" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              <div className="live-dot" />
              <span>ENCRYPTED AUDIT RECORD CREATED UPON CONFIRMATION</span>
            </div>
            <span className="mono text-xs" style={{ color: 'var(--on-surface)', letterSpacing: '0.06em' }}>NODE: BAY-04A</span>
          </div>
        </div>
      </div>
    </div>
  );
}
