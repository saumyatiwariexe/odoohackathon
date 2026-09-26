import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, Loader2, PackageSearch, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const signupSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter')
    .regex(/[0-9]/, 'Must contain at least 1 number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least 1 special character'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
    reset: resetLogin
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    formState: { errors: signupErrors },
    reset: resetSignup
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/auth/login', data);
      toast.success('Welcome back to StockSense!');
      console.log('Login success:', res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const payload = { ...data, role: 'staff' };
      const res = await axios.post('http://localhost:8000/api/auth/register', payload);
      toast.success('Account created successfully!');
      console.log('Signup success:', res.data);
      // Auto-switch to login
      setIsLogin(true);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetLogin();
    resetSignup();
  };

  return (
    <div className="auth-container">
      {/* Left side - Auth Form */}
      <div className="auth-left">
        <div className="auth-card animate-fade-in">
          <div className="auth-header">
            <h1 className="auth-title">{isLogin ? 'Sign In' : 'Create Account'}</h1>
            <p className="auth-subtitle">
              {isLogin ? 'Welcome back! Please enter your details.' : 'Join StockSense to manage your inventory.'}
            </p>
          </div>

          {isLogin ? (
            /* LOGIN FORM */
            <form onSubmit={handleSubmitLogin(onLoginSubmit)}>
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="name@company.com"
                    className={`form-input ${loginErrors.email ? 'error' : ''}`}
                    {...registerLogin('email')}
                  />
                </div>
                {loginErrors.email && <span className="form-error">{loginErrors.email.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-password">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className={`form-input ${loginErrors.password ? 'error' : ''}`}
                    {...registerLogin('password')}
                  />
                </div>
                {loginErrors.password && <span className="form-error">{loginErrors.password.message}</span>}
              </div>

              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
              </button>
            </form>
          ) : (
            /* SIGNUP FORM */
            <form onSubmit={handleSubmitSignup(onSignupSubmit, (errs) => {
              if (errs.full_name) toast.error(errs.full_name.message);
              else if (errs.email) toast.error(errs.email.message);
              else if (errs.password) toast.error(errs.password.message);
            })}>
              <div className="form-group">
                <label className="form-label" htmlFor="full_name">Full Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    id="full_name"
                    type="text"
                    placeholder="John Doe"
                    className={`form-input ${signupErrors.full_name ? 'error' : ''}`}
                    {...registerSignup('full_name')}
                  />
                </div>
                {signupErrors.full_name && <span className="form-error">{signupErrors.full_name.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-email">Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="name@company.com"
                    className={`form-input ${signupErrors.email ? 'error' : ''}`}
                    {...registerSignup('email')}
                  />
                </div>
                {signupErrors.email && <span className="form-error">{signupErrors.email.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-password">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    className={`form-input ${signupErrors.password ? 'error' : ''}`}
                    {...registerSignup('password')}
                  />
                </div>
                {signupErrors.password && <span className="form-error">{signupErrors.password.message}</span>}
              </div>

              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Sign Up'}
              </button>
            </form>
          )}

          <div className="auth-footer">
            {isLogin ? (
              <>Don't have an account? <button type="button" onClick={toggleMode} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign up</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={toggleMode} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</button></>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Branding */}
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
