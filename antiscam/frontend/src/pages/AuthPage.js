import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowLeft, Moon, Sun, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { signup, login, getCurrentUser } from '../services/auth';

/**
 * Sign in / sign up. One centred column on paper — no decorative background,
 * because the only thing on this screen worth looking at is the form.
 */
const AuthPage = ({ onLogin, darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  // Handle OAuth callback from backend
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (error) {
      toast.error(`Google authentication failed: ${error}`);
      window.history.replaceState({}, document.title, '/auth');
      return;
    }

    if (token && success === 'true') {
      localStorage.setItem('figment_token', token);
      handleOAuthCallback(token);
    }
  }, []);

  const handleOAuthCallback = async () => {
    try {
      setIsLoading(true);
      const result = await getCurrentUser();

      if (result) {
        localStorage.setItem('figment_user', JSON.stringify(result));
        toast.success('Signed in with Google');
        onLogin();
        navigate('/dashboard');
      } else {
        toast.error('Could not read your Google profile');
      }
    } catch (err) {
      toast.error('Could not complete Google sign-in');
    } finally {
      setIsLoading(false);
      window.history.replaceState({}, document.title, '/auth');
    }
  };

  const handleGoogleSignIn = () => {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    window.location.href = `${API_BASE_URL}/api/auth/google/redirect`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const result = await signup(formData.name, formData.email, formData.password);
        if (result.success) {
          toast.success('Account created');
          onLogin();
          navigate('/dashboard');
        }
      } else {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          toast.success('Signed in');
          onLogin();
          navigate('/dashboard');
        }
      }
    } catch (error) {
      const errorMessage = error.error || error.message || (isSignUp ? 'Could not create the account' : 'Could not sign in');
      toast.error(errorMessage);
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      {/* Quiet header: back, and the theme toggle. */}
      <header className="chrome border-b">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="btn btn-ghost -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={toggleDarkMode}
            className="btn btn-ghost px-2 -mr-2"
            aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            data-testid="dark-mode-toggle"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-md bg-ink flex items-center justify-center">
              <Shield className="w-4 h-4 text-surface" strokeWidth={2.25} />
            </div>
            <span className="text-base font-semibold tracking-tight">Figment</span>
          </div>

          <h1 className="t-section mb-1.5">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="t-secondary mb-8">
            {isSignUp
              ? 'A co-pilot for your UPI transfers.'
              : 'Sign in to pick up where you left off.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="auth-form">
            {isSignUp && (
              <div>
                <label htmlFor="name" className="t-label block mb-1.5">Full name</label>
                <Input
                  id="name"
                  data-testid="name-input"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-10"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="t-label block mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" strokeWidth={1.8} />
                <Input
                  id="email"
                  data-testid="email-input"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-10 pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="t-label block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" strokeWidth={1.8} />
                <Input
                  id="password"
                  data-testid="password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-10 pl-9 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              data-testid="submit-btn"
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full h-10"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 spin" />
                  {isSignUp ? 'Creating account…' : 'Signing in…'}
                </>
              ) : (
                isSignUp ? 'Create account' : 'Sign in'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-bg text-xs text-ink-faint">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="btn btn-secondary w-full h-10"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p className="t-secondary text-center mt-6">
            {isSignUp ? 'Already have an account?' : 'No account yet?'}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-1.5 font-medium text-blue hover:underline"
              data-testid="toggle-auth-btn"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>

          <p className="text-xs text-ink-faint text-center mt-8 leading-relaxed">
            By continuing you agree to Figment's Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default AuthPage;
