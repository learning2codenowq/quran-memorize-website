import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../styles/theme';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftSection}>
        <div style={styles.contentWrapper}>
          <div style={styles.logoSection}>
            <h1 style={styles.logo}>Quran Hifdh</h1>
            <p style={styles.tagline}>Memorize the Holy Quran with ease</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <h2 style={styles.title}>Welcome Back</h2>
            <p style={styles.subtitle}>Sign in to continue your memorization journey</p>

            {error && (
              <div style={styles.errorBox}>
                {error}
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              style={loading ? styles.buttonDisabled : styles.button}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div style={styles.divider}>
              <span style={styles.dividerLine}></span>
              <span style={styles.dividerText}>OR</span>
              <span style={styles.dividerLine}></span>
            </div>

            <button 
              type="button"
              onClick={handleGoogleSignIn}
              style={loading ? styles.googleButtonDisabled : styles.googleButton}
              disabled={loading}
            >
              <span style={styles.googleIcon}>G</span>
              Continue with Google
            </button>

            <p style={styles.signupText}>
              Don't have an account?{' '}
              <Link to="/signup" style={styles.link}>
                Sign up here
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div style={styles.rightSection}>
        <div style={styles.quoteSection}>
          <div style={styles.quoteIcon}>📖</div>
          <h3 style={styles.quoteTitle}>
            "The best among you are those who learn the Quran and teach it."
          </h3>
          <p style={styles.quoteAuthor}>- Prophet Muhammad ﷺ</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  leftSection: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    backgroundColor: theme.colors.backgroundLight,
  },
  rightSection: {
    flex: 1,
    background: theme.gradients.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    '@media (max-width: 768px)': {
      display: 'none',
    }
  },
  contentWrapper: {
    width: '100%',
    maxWidth: '440px',
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '48px',
  },
  logo: {
    fontSize: '32px',
    fontWeight: '700',
    color: theme.colors.primary,
    margin: '0 0 8px 0',
  },
  tagline: {
    fontSize: '16px',
    color: theme.colors.textSecondary,
    margin: 0,
  },
  form: {
    backgroundColor: theme.colors.white,
    padding: '40px',
    borderRadius: theme.borderRadius.xl,
    boxShadow: theme.shadows.lg,
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: theme.colors.textPrimary,
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: theme.colors.textSecondary,
    margin: '0 0 32px 0',
  },
  errorBox: {
    backgroundColor: '#FEE',
    color: theme.colors.error,
    padding: '12px 16px',
    borderRadius: theme.borderRadius.md,
    marginBottom: '24px',
    fontSize: '14px',
    border: `1px solid ${theme.colors.error}`,
  },
  inputGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: `2px solid ${theme.colors.gray200}`,
    borderRadius: theme.borderRadius.md,
    outline: 'none',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: theme.colors.white,
    background: theme.gradients.primary,
    border: 'none',
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: theme.shadows.md,
    marginTop: '8px',
  },
  buttonDisabled: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: theme.colors.white,
    backgroundColor: theme.colors.gray400,
    border: 'none',
    borderRadius: theme.borderRadius.full,
    cursor: 'not-allowed',
    marginTop: '8px',
  },
  signupText: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: theme.colors.textSecondary,
  },
  link: {
    color: theme.colors.primary,
    fontWeight: '600',
    textDecoration: 'none',
  },
  quoteSection: {
    textAlign: 'center',
    maxWidth: '500px',
    color: theme.colors.white,
  },
  quoteIcon: {
    fontSize: '64px',
    marginBottom: '24px',
  },
  quoteTitle: {
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '1.5',
    marginBottom: '16px',
  },
  quoteAuthor: {
    fontSize: '16px',
    opacity: 0.9,
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: theme.colors.gray300,
  },
  dividerText: {
    padding: '0 16px',
    fontSize: '14px',
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  googleButton: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.white,
    border: `2px solid ${theme.colors.gray300}`,
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  googleButtonDisabled: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.gray100,
    border: `2px solid ${theme.colors.gray300}`,
    borderRadius: theme.borderRadius.full,
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  googleIcon: {
    fontSize: '18px',
    fontWeight: '700',
    background: theme.gradients.primary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
};

export default LoginScreen;