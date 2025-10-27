import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { theme } from '../styles/theme';

const DashboardScreen = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>Quran Hifdh</h1>
          <div style={styles.headerRight}>
            <span style={styles.userEmail}>{currentUser?.email}</span>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.welcomeSection}>
          <h2 style={styles.welcomeTitle}>As-salamu alaykum! 👋</h2>
          <p style={styles.welcomeSubtitle}>Welcome to your Quran memorization journey</p>
        </div>

        {/* Hero Card */}
        <div style={styles.heroCard}>
          <div style={styles.heroContent}>
            <div style={styles.heroIcon}>📖</div>
            <h3 style={styles.heroTitle}>Start Your Journey</h3>
            <p style={styles.heroText}>
              Begin memorizing the Holy Quran with our structured learning system
            </p>
            <button style={styles.primaryButton}>
              Start Memorizing
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>✨</div>
            <h4 style={styles.statNumber}>0</h4>
            <p style={styles.statLabel}>Ayahs Memorized</p>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🔥</div>
            <h4 style={styles.statNumber}>0</h4>
            <p style={styles.statLabel}>Day Streak</p>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🎯</div>
            <h4 style={styles.statNumber}>0/10</h4>
            <p style={styles.statLabel}>Daily Goal</p>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🏆</div>
            <h4 style={styles.statNumber}>0</h4>
            <p style={styles.statLabel}>Achievements</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Quick Actions</h3>
          <div style={styles.actionsGrid}>
            <div style={styles.actionCard}>
              <div style={styles.actionIcon}>📚</div>
              <h4 style={styles.actionTitle}>Browse Surahs</h4>
              <p style={styles.actionText}>Choose a surah to start memorizing</p>
            </div>
            
            <div style={styles.actionCard}>
              <div style={styles.actionIcon}>📊</div>
              <h4 style={styles.actionTitle}>View Progress</h4>
              <p style={styles.actionText}>Track your memorization journey</p>
            </div>
            
            <div style={styles.actionCard}>
              <div style={styles.actionIcon}>⚙️</div>
              <h4 style={styles.actionTitle}>Settings</h4>
              <p style={styles.actionText}>Customize your experience</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: theme.colors.backgroundLight,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    background: theme.gradients.primary,
    padding: '16px 0',
    boxShadow: theme.shadows.md,
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '24px',
    fontWeight: '700',
    color: theme.colors.white,
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userEmail: {
    color: theme.colors.white,
    fontSize: '14px',
  },
  logoutButton: {
    padding: '8px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  welcomeSection: {
    marginBottom: '32px',
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: theme.colors.textPrimary,
    margin: '0 0 8px 0',
  },
  welcomeSubtitle: {
    fontSize: '18px',
    color: theme.colors.textSecondary,
    margin: 0,
  },
  heroCard: {
    background: theme.gradients.primary,
    borderRadius: theme.borderRadius.xl,
    padding: '48px',
    marginBottom: '40px',
    boxShadow: theme.shadows.lg,
  },
  heroContent: {
    textAlign: 'center',
    color: theme.colors.white,
  },
  heroIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  heroTitle: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 12px 0',
  },
  heroText: {
    fontSize: '16px',
    opacity: 0.9,
    marginBottom: '24px',
  },
  primaryButton: {
    padding: '14px 32px',
    backgroundColor: theme.colors.white,
    color: theme.colors.primary,
    border: 'none',
    borderRadius: theme.borderRadius.full,
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: theme.shadows.md,
    transition: 'transform 0.2s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    backgroundColor: theme.colors.white,
    padding: '24px',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.sm,
    textAlign: 'center',
  },
  statIcon: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: '700',
    color: theme.colors.primary,
    margin: '0 0 8px 0',
  },
  statLabel: {
    fontSize: '14px',
    color: theme.colors.textSecondary,
    margin: 0,
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: '20px',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  actionCard: {
    backgroundColor: theme.colors.white,
    padding: '32px',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.sm,
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  actionIcon: {
    fontSize: '40px',
    marginBottom: '16px',
  },
  actionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: theme.colors.textPrimary,
    margin: '0 0 8px 0',
  },
  actionText: {
    fontSize: '14px',
    color: theme.colors.textSecondary,
    margin: 0,
  },
};

export default DashboardScreen;